// Procedural pixel art. Every sprite is painted pixel-by-pixel into a Uint32 buffer,
// outlined, then turned into a canvas the engine blits at integer zoom.

const colorCache = new Map();
export function rgba(hex, a = 255) {
    const key = hex + a;
    let v = colorCache.get(key);
    if (v === undefined) {
        const n = parseInt(hex.slice(1), 16);
        v = ((a << 24) | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255)) >>> 0;
        colorCache.set(key, v);
    }
    return v;
}

export function hash(x, y, s = 0) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function vnoise(x, y, s = 0) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s);
    const b = hash(xi + 1, yi, s);
    const c = hash(xi, yi + 1, s);
    const d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, y, s = 0) {
    return vnoise(x, y, s) * 0.5 + vnoise(x * 2, y * 2, s + 1) * 0.3 + vnoise(x * 4, y * 4, s + 2) * 0.2;
}

export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
export const dither = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

export function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

export class Px {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.d = new Uint32Array(w * h);
    }
    set(x, y, c) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
        this.d[y * this.w + x] = typeof c === "string" ? rgba(c) : c;
    }
    get(x, y) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
        return this.d[y * this.w + x];
    }
    rect(x, y, w, h, c) {
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    }
    hline(x, y, w, c) {
        this.rect(x, y, w, 1, c);
    }
    vline(x, y, h, c) {
        this.rect(x, y, 1, h, c);
    }
    ellipse(cx, cy, rx, ry, c) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
            for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                const dx = (x + 0.5 - cx) / rx;
                const dy = (y + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1) this.set(x, y, c);
            }
    }
    // Shade every pixel `inside` returns true for, lit from (lx, ly), with ordered dithering.
    shade(inside, pal, { lx, ly, rad, seed = 1, bumps = 0.45, grain = 0.15 }) {
        const n = pal.length;
        const cols = pal.map((p) => rgba(p));
        for (let y = 0; y < this.h; y++)
            for (let x = 0; x < this.w; x++) {
                if (!inside(x, y)) continue;
                let l = 1 - Math.hypot(x - lx, y - ly) / rad;
                l += (vnoise(x * 0.32, y * 0.32, seed) - 0.5) * bumps;
                l += (hash(x, y, seed) - 0.5) * grain;
                const i = Math.max(0, Math.min(n - 1, Math.floor(l * n + dither(x, y) - 0.5)));
                this.d[y * this.w + x] = cols[i];
            }
    }
    outline(c) {
        const col = rgba(c);
        const src = this.d.slice();
        const op = (x, y) => x >= 0 && y >= 0 && x < this.w && y < this.h && src[y * this.w + x] >>> 24 > 0;
        for (let y = 0; y < this.h; y++)
            for (let x = 0; x < this.w; x++) {
                if (op(x, y)) continue;
                if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) this.d[y * this.w + x] = col;
            }
        return this;
    }
    mirror() {
        const m = new Px(this.w, this.h);
        for (let y = 0; y < this.h; y++)
            for (let x = 0; x < this.w; x++) m.d[y * this.w + x] = this.d[y * this.w + (this.w - 1 - x)];
        return m;
    }
    text(str, x, y, c) {
        let cx = x;
        for (const ch of str.toUpperCase()) {
            const g = FONT[ch];
            if (g) for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (g[r][k] === "#") this.set(cx + k, y + r, c);
            cx += 4;
        }
    }
    canvas() {
        const cv = document.createElement("canvas");
        cv.width = this.w;
        cv.height = this.h;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(this.w, this.h);
        new Uint32Array(img.data.buffer).set(this.d);
        ctx.putImageData(img, 0, 0);
        return cv;
    }
}

export const textWidth = (s) => s.length * 4 - 1;

// 3x5 bitmap font for in-world signage
const F = (s) => s.split(" ");
const FONT = {
    A: F(".#. #.# ### #.# #.#"),
    B: F("##. #.# ##. #.# ##."),
    C: F(".## #.. #.. #.. .##"),
    D: F("##. #.# #.# #.# ##."),
    E: F("### #.. ##. #.. ###"),
    F: F("### #.. ##. #.. #.."),
    G: F(".## #.. #.# #.# .##"),
    H: F("#.# #.# ### #.# #.#"),
    I: F("### .#. .#. .#. ###"),
    J: F("..# ..# ..# #.# .#."),
    K: F("#.# #.# ##. #.# #.#"),
    L: F("#.. #.. #.. #.. ###"),
    M: F("#.# ### ### #.# #.#"),
    N: F("##. #.# #.# #.# #.#"),
    O: F(".#. #.# #.# #.# .#."),
    P: F("##. #.# ##. #.. #.."),
    Q: F(".#. #.# #.# ##. .##"),
    R: F("##. #.# ##. #.# #.#"),
    S: F(".## #.. .#. ..# ##."),
    T: F("### .#. .#. .#. .#."),
    U: F("#.# #.# #.# #.# ###"),
    V: F("#.# #.# #.# #.# .#."),
    W: F("#.# #.# ### ### #.#"),
    X: F("#.# #.# .#. #.# #.#"),
    Y: F("#.# #.# .#. .#. .#."),
    Z: F("### ..# .#. #.. ###"),
    0: F(".#. #.# #.# #.# .#."),
    1: F(".#. ##. .#. .#. ###"),
    2: F("##. ..# .#. #.. ###"),
    3: F("##. ..# .#. ..# ##."),
    4: F("#.# #.# ### ..# ..#"),
    5: F("### #.. ##. ..# ##."),
    6: F(".## #.. ### #.# ###"),
    7: F("### ..# .#. .#. .#."),
    8: F("### #.# ### #.# ###"),
    9: F("### #.# ### ..# ##."),
    "'": F(".#. .#. ... ... ..."),
    ".": F("... ... ... ... .#."),
    "-": F("... ... ### ... ..."),
    "&": F(".#. #.# .#. #.# .##"),
    "?": F("##. ..# .#. ... .#."),
    "!": F(".#. .#. .#. ... .#."),
    ">": F("#.. .#. ..# .#. #.."),
};

// ---------- palettes ----------
export const PAL = {
    leaf: ["#1d3b27", "#2b5530", "#3c7236", "#559340", "#79b34e"],
    leaf2: ["#1b3626", "#285034", "#356b3d", "#4c8a46", "#6aa957"],
    pine: ["#132a26", "#1c3d33", "#26543f", "#35704c", "#4b8a58"],
    autumn: ["#5c2a12", "#8c4417", "#bd6420", "#e08c2c", "#f3b955"],
    blossom: ["#7c3654", "#a8507a", "#cf759a", "#eb9fbf", "#ffd0e2"],
    rock: ["#3b4250", "#545d6c", "#727c8c", "#939cab", "#b9c0cb"],
    bark: ["#3b2416", "#5a3820", "#7a4e2d"],
    wood: ["#4a2e1a", "#6e4527", "#8f5e35", "#b07b48"],
};

function tree(kind, seed) {
    const r = rng(seed);
    const W = 44;
    const H = 52;
    const trunk = new Px(W, H);
    const canopy = new Px(W, H);
    const bx = 22;
    const by = 50;
    // trunk
    const tw = 6;
    for (let y = 30; y <= by; y++) {
        const flare = y > by - 3 ? y - (by - 3) : 0;
        const x0 = bx - tw / 2 - flare;
        const w = tw + flare * 2;
        for (let i = 0; i < w; i++) {
            const t = i / (w - 1);
            const c = t < 0.3 ? PAL.bark[2] : t < 0.75 ? PAL.bark[1] : PAL.bark[0];
            trunk.set(x0 + i, y, hash(i, y, seed) < 0.12 ? PAL.bark[0] : c);
        }
    }
    trunk.outline("#1e130b");
    // canopy blobs
    const pal = PAL[kind] || PAL.leaf;
    const blobs = [];
    const cx = 22;
    const cy = 19;
    blobs.push([cx, cy, 14 + r() * 2]);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + r() * 0.6;
        blobs.push([cx + Math.cos(a) * (8 + r() * 3), cy + Math.sin(a) * (6 + r() * 3) + 2, 7 + r() * 3]);
    }
    const inside = (x, y) => blobs.some(([bx2, by2, br]) => (x + 0.5 - bx2) ** 2 + (y + 0.5 - by2) ** 2 <= br * br);
    canopy.shade(inside, pal, { lx: cx - 7, ly: cy - 9, rad: 30, seed, bumps: 0.7 });
    // a few highlight leaf clumps
    for (let i = 0; i < 14; i++) {
        const x = Math.floor(cx - 12 + r() * 18);
        const y = Math.floor(cy - 12 + r() * 14);
        if (inside(x, y) && inside(x + 1, y)) {
            canopy.set(x, y, pal[4]);
            canopy.set(x + 1, y, pal[4]);
        }
    }
    if (kind === "leaf2") {
        // fruit / berries
        for (let i = 0; i < 9; i++) {
            const x = Math.floor(cx - 12 + r() * 24);
            const y = Math.floor(cy - 8 + r() * 18);
            if (inside(x, y)) canopy.set(x, y, "#e2453b");
        }
    }
    canopy.outline(kind === "blossom" ? "#4d1f35" : kind === "autumn" ? "#3a1a0b" : "#11241a");
    return { trunk: trunk.canvas(), canopy: canopy.canvas(), ox: bx, oy: by, w: W, h: H, pal };
}

function pine(seed) {
    const r = rng(seed);
    const W = 32;
    const H = 58;
    const p = new Px(W, H);
    const bx = 16;
    const by = 56;
    for (let y = 44; y <= by; y++) for (let x = bx - 2; x <= bx + 1; x++) p.set(x, y, x < bx ? PAL.bark[2] : PAL.bark[1]);
    const tiers = [];
    for (let i = 0; i < 4; i++) tiers.push({ top: 2 + i * 9, h: 18, hw: 6 + i * 3.6 + r() * 1.5 });
    const inside = (x, y) =>
        tiers.some((t) => {
            if (y < t.top || y > t.top + t.h) return false;
            const jag = (hash(x, 0, seed) < 0.5 ? 1 : 0) + (y > t.top + t.h - 2 ? -1 : 0);
            return Math.abs(x + 0.5 - bx) <= ((y - t.top) / t.h) * t.hw + jag * 0.6;
        });
    p.shade(inside, PAL.pine, { lx: bx - 6, ly: 10, rad: 46, seed, bumps: 0.5 });
    p.outline("#0c1a16");
    return { body: p.canvas(), ox: bx, oy: by, w: W, h: H };
}

function bush(seed, deco) {
    const r = rng(seed);
    const p = new Px(24, 17);
    const blobs = [
        [8, 10, 6 + r()],
        [15, 9, 7 + r()],
        [11, 6, 5 + r()],
    ];
    const inside = (x, y) => y < 16 && blobs.some(([bx, by, br]) => (x + 0.5 - bx) ** 2 + (y + 0.5 - by) ** 2 <= br * br);
    p.shade(inside, PAL.leaf2, { lx: 7, ly: 3, rad: 18, seed, bumps: 0.6 });
    if (deco) {
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(3 + r() * 18);
            const y = Math.floor(3 + r() * 10);
            if (inside(x, y)) {
                p.set(x, y, deco);
                if (deco !== "#d9283b") p.set(x, y - 1, "#fff6d5");
            }
        }
    }
    p.outline("#13261a");
    return { body: p.canvas(), ox: 12, oy: 16, w: 24, h: 17 };
}

function rock(seed, small) {
    const W = small ? 12 : 20;
    const H = small ? 9 : 14;
    const p = new Px(W, H);
    const cx = W / 2;
    const cy = H * 0.6;
    const inside = (x, y) => {
        if (y > H - 2) return false;
        const dx = (x + 0.5 - cx) / (W / 2 - 1);
        const dy = (y + 0.5 - cy) / (H * 0.55);
        return dx * dx + dy * dy + (hash(x, y, seed) - 0.5) * 0.15 <= 1;
    };
    p.shade(inside, PAL.rock, { lx: cx - 3, ly: 1, rad: W * 0.85, seed, bumps: 0.35 });
    for (let x = 0; x < W; x++)
        for (let y = 0; y < H; y++) if (inside(x, y) && !inside(x, y - 2) && hash(x, y, seed + 9) < 0.5) p.set(x, y, "#5f8a45");
    p.outline("#232831");
    return { body: p.canvas(), ox: W / 2, oy: H - 1, w: W, h: H };
}

function lamp() {
    const p = new Px(11, 36);
    p.rect(4, 9, 3, 24, "#2f3344");
    p.vline(4, 9, 24, "#4b5166");
    p.rect(2, 32, 7, 3, "#2f3344");
    p.hline(2, 32, 7, "#4b5166");
    p.rect(1, 1, 9, 2, "#2f3344");
    p.rect(2, 3, 7, 6, "#fff0b3");
    p.rect(2, 3, 2, 6, "#ffe08a");
    p.vline(5, 3, 6, "#3a3f52");
    p.rect(3, 8, 5, 1, "#2f3344");
    p.set(5, 0, "#2f3344");
    p.outline("#16182a");
    return { body: p.canvas(), ox: 5, oy: 34, w: 11, h: 36 };
}

function bench() {
    const p = new Px(28, 17);
    const [d, m, l, hi] = PAL.wood;
    p.rect(2, 1, 24, 3, m);
    p.hline(2, 1, 24, l);
    p.rect(2, 5, 24, 3, m);
    p.hline(2, 5, 24, l);
    p.rect(1, 9, 26, 3, l);
    p.hline(1, 9, 26, hi);
    p.hline(1, 11, 26, d);
    for (const x of [3, 23]) {
        p.rect(x, 1, 2, 15, "#2f3344");
    }
    p.outline("#24160c");
    return { body: p.canvas(), ox: 14, oy: 15, w: 28, h: 17 };
}

function signpost(label) {
    const p = new Px(26, 24);
    const [d, m, l, hi] = PAL.wood;
    p.rect(11, 8, 4, 15, m);
    p.vline(11, 8, 15, l);
    p.rect(1, 1, 24, 11, l);
    p.hline(1, 1, 24, hi);
    p.hline(1, 11, 24, d);
    if (label) p.text(label, 13 - Math.floor(textWidth(label) / 2), 4, "#3b2414");
    p.outline("#24160c");
    return { body: p.canvas(), ox: 13, oy: 22, w: 26, h: 24 };
}

function billboard(title, accent, motif) {
    const W = 56;
    const H = 46;
    const p = new Px(W, H);
    const [d, m] = PAL.wood;
    for (const x of [9, 44]) {
        p.rect(x, 26, 3, 19, m);
        p.vline(x, 26, 19, d);
    }
    p.rect(1, 1, 54, 30, "#3a2617");
    p.rect(3, 3, 50, 26, "#0f1420");
    // poster gradient-ish bands
    for (let y = 3; y < 29; y++)
        for (let x = 3; x < 53; x++) {
            const t = (y - 3) / 26 + dither(x, y) * 0.25;
            if (t > 0.78) p.set(x, y, accent);
        }
    motif(p);
    p.text(title, 28 - Math.floor(textWidth(title) / 2), 23, "#f8fafc");
    p.hline(3, 3, 50, accent);
    p.outline("#120b06");
    return { body: p.canvas(), ox: 28, oy: 44, w: W, h: H };
}

const MOTIFS = {
    agentstream: (p) => {
        const nodes = [
            [16, 10],
            [28, 7],
            [40, 10],
        ];
        for (const [x, y] of nodes) for (let i = 0; i < 6; i++) p.set(28 + ((x - 28) * i) / 6, 17 + ((y - 17) * i) / 6, "#64748b");
        for (const [x, y] of nodes) p.rect(x - 2, y - 2, 5, 5, "#38bdf8");
        p.rect(26, 15, 5, 5, "#f8fafc");
    },
    talkeys: (p) => {
        p.rect(17, 7, 22, 11, "#f59e0b");
        p.rect(17, 11, 1, 3, "#0f1420");
        p.rect(38, 11, 1, 3, "#0f1420");
        for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) if ((x + y) % 2 === 0 || (x === 1 && y === 1)) p.rect(20 + x * 2, 9 + y * 2, 2, 2, "#0f1420");
        p.hline(28, 10, 8, "#7c4a03");
        p.hline(28, 13, 6, "#7c4a03");
    },
    fooddle: (p) => {
        p.ellipse(28, 14, 9, 4, "#f8fafc");
        p.rect(19, 12, 19, 2, "#e2e8f0");
        p.ellipse(28, 11, 7, 3, "#fb923c");
        p.set(25, 9, "#22c55e");
        p.set(30, 9, "#22c55e");
        for (let i = 0; i < 3; i++) p.vline(24 + i * 4, 3 + (i % 2), 3, "#94a3b8");
    },
};

function gazebo() {
    const W = 76;
    const H = 72;
    const p = new Px(W, H);
    const roof = ["#6b300a", "#9a4a0e", "#c86d12", "#f59e0b", "#fcc34a"];
    // deck
    p.ellipse(38, 62, 35, 8, "#7d7f8a");
    p.ellipse(38, 61, 33, 7, PAL.wood[2]);
    for (let x = 6; x < 72; x += 5) for (let y = 54; y < 69; y++) if (p.get(x, y) === rgba(PAL.wood[2])) p.set(x, y, PAL.wood[1]);
    // shadowed interior
    p.rect(10, 30, 56, 26, "#3b2a1c");
    p.rect(10, 30, 56, 3, "#2a1d13");
    // back rail
    p.hline(10, 44, 56, PAL.wood[1]);
    // pillars
    for (const x of [8, 26, 47, 64]) {
        p.rect(x, 26, 4, 32, "#f2e6d0");
        p.vline(x + 3, 26, 32, "#c9b896");
        p.rect(x - 1, 56, 6, 2, "#c9b896");
    }
    // front rails between pillars (gap in the middle for the entrance)
    for (const [a, b] of [
        [12, 26],
        [51, 64],
    ]) {
        p.hline(a, 47, b - a, "#e6d8bd");
        p.hline(a, 51, b - a, "#e6d8bd");
        for (let x = a + 2; x < b; x += 3) p.vline(x, 47, 5, "#c9b896");
    }
    // roof
    const inside = (x, y) => {
        if (y < 4 || y > 31) return false;
        const t = (y - 4) / 27;
        const hw = 8 + t * 30;
        return Math.abs(x + 0.5 - 38) <= hw;
    };
    p.shade(inside, roof, { lx: 26, ly: 2, rad: 54, seed: 7, bumps: 0.15, grain: 0.05 });
    for (let y = 9; y < 31; y += 5) for (let x = 0; x < W; x++) if (inside(x, y)) p.set(x, y, roof[1]);
    p.rect(2, 29, 72, 5, "#7c3a0c");
    p.hline(2, 29, 72, "#fbbf24");
    p.text("EXPERIENCE", 38 - Math.floor(textWidth("EXPERIENCE") / 2), 30, "#fff7e0");
    p.rect(36, 0, 4, 5, "#fbbf24");
    p.set(37, 0, "#fff7e0");
    p.outline("#2a1305");
    return { body: p.canvas(), ox: 38, oy: 68, w: W, h: H };
}

function cabin() {
    const W = 88;
    const H = 82;
    const p = new Px(W, H);
    // chimney
    p.rect(62, 2, 10, 20, "#6b6f7a");
    for (let y = 2; y < 22; y += 4) for (let x = 62; x < 72; x += 5) p.rect(x + ((y / 4) % 2) * 2, y, 4, 3, "#858a96");
    p.rect(61, 1, 12, 3, "#4b4f5a");
    // roof
    const roof = ["#4a1d12", "#6d2b18", "#8f3b1f", "#b04e28", "#cf6a3a"];
    const inside = (x, y) => {
        if (y < 8 || y > 40) return false;
        const t = (y - 8) / 32;
        return Math.abs(x + 0.5 - 44) <= 30 + t * 13;
    };
    p.shade(inside, roof, { lx: 30, ly: 4, rad: 70, seed: 3, bumps: 0.2, grain: 0.05 });
    for (let y = 12; y < 40; y += 4) for (let x = 0; x < W; x++) if (inside(x, y) && (x + (y % 8 ? 3 : 0)) % 7) p.set(x, y, roof[1]);
    p.hline(14, 8, 60, roof[4]);
    // log walls
    for (let y = 40; y < 78; y++) {
        const row = (y - 40) % 5;
        const c = row === 4 ? "#3f2615" : row === 0 ? "#b07b48" : row === 1 ? "#9a6a3c" : "#845a32";
        for (let x = 5; x < 83; x++) p.set(x, y, hash(x, y, 5) < 0.05 ? "#6a4527" : c);
    }
    for (let y = 40; y < 78; y += 5) {
        p.ellipse(4, y + 2, 2.5, 2.5, "#c9945c");
        p.ellipse(84, y + 2, 2.5, 2.5, "#c9945c");
        p.set(4, y + 2, "#7a4e2d");
        p.set(84, y + 2, "#7a4e2d");
    }
    // windows
    for (const wx of [13, 59]) {
        p.rect(wx - 1, 49, 18, 14, "#3f2615");
        p.rect(wx, 50, 16, 12, "#ffd77a");
        p.rect(wx, 50, 16, 4, "#fff1c2");
        p.vline(wx + 8, 50, 12, "#3f2615");
        p.hline(wx, 56, 16, "#3f2615");
        p.rect(wx - 3, 50, 2, 12, "#10b981");
        p.rect(wx + 17, 50, 2, 12, "#10b981");
        // flower box
        p.rect(wx - 1, 63, 18, 3, "#6e4527");
        for (let i = 0; i < 8; i++) p.set(wx + i * 2, 62, ["#f472b6", "#fbbf24", "#f8fafc"][i % 3]);
    }
    // door
    p.rect(37, 52, 14, 26, "#3f2615");
    p.rect(38, 53, 12, 25, "#059669");
    p.rect(38, 53, 3, 25, "#10b981");
    p.set(47, 66, "#fbbf24");
    p.rect(40, 56, 8, 5, "#a7f3d0");
    // name plaque
    p.rect(30, 43, 28, 7, "#e9d4a8");
    p.text("RITESH", 44 - Math.floor(textWidth("RITESH") / 2), 44, "#3f2615");
    // step
    p.rect(34, 78, 20, 3, "#8a8f9a");
    p.hline(34, 78, 20, "#b3b8c2");
    p.outline("#1f120a");
    return { body: p.canvas(), ox: 44, oy: 80, w: W, h: H };
}

function fountain() {
    const W = 68;
    const H = 50;
    const p = new Px(W, H);
    p.ellipse(34, 34, 33, 14, "#8b929e");
    p.ellipse(34, 33, 31, 12.5, "#b7bdc7");
    p.ellipse(34, 34, 27, 10, "#3f8cc4");
    p.ellipse(34, 33, 25, 8.5, "#56a7d8");
    for (let i = 0; i < 26; i++) {
        const a = hash(i, 3, 4) * Math.PI * 2;
        p.set(34 + Math.cos(a) * 18 * hash(i, 5, 4), 33 + Math.sin(a) * 6 * hash(i, 7, 4), "#bfe6ff");
    }
    p.rect(30, 12, 8, 22, "#a0a7b2");
    p.vline(30, 12, 22, "#c9cfd8");
    p.vline(37, 12, 22, "#7d8490");
    p.ellipse(34, 12, 11, 4, "#8b929e");
    p.ellipse(34, 11, 10, 3, "#7fc4ea");
    p.rect(32, 3, 4, 8, "#b7bdc7");
    p.ellipse(34, 3, 3, 2, "#c9cfd8");
    p.outline("#2c313b");
    return { body: p.canvas(), ox: 34, oy: 48, w: W, h: H };
}

function mailbox() {
    const p = new Px(14, 22);
    p.rect(5, 11, 3, 10, PAL.wood[1]);
    p.rect(1, 3, 10, 9, "#dc2626");
    p.rect(2, 2, 8, 1, "#dc2626");
    p.rect(1, 3, 10, 2, "#ef4444");
    p.rect(1, 9, 10, 3, "#b91c1c");
    p.rect(3, 6, 6, 2, "#7f1d1d");
    p.rect(11, 1, 2, 5, "#fbbf24");
    p.vline(11, 1, 9, "#64748b");
    p.outline("#2a0b0b");
    return { body: p.canvas(), ox: 6, oy: 21, w: 14, h: 22 };
}

function noticeBoard() {
    const p = new Px(32, 32);
    for (const x of [4, 26]) p.rect(x, 18, 3, 13, PAL.wood[1]);
    p.rect(1, 1, 30, 21, PAL.wood[0]);
    p.rect(3, 3, 26, 17, "#c08a55");
    for (let i = 0; i < 40; i++) p.set(3 + hash(i, 1, 2) * 26, 3 + hash(i, 2, 2) * 17, "#a87445");
    p.rect(5, 9, 9, 10, "#f8fafc");
    for (let y = 11; y < 18; y += 2) p.hline(6, y, 7, "#94a3b8");
    p.rect(16, 9, 11, 7, "#fde68a");
    for (let y = 11; y < 15; y += 2) p.hline(17, y, 9, "#b45309");
    p.set(9, 9, "#ef4444");
    p.set(21, 9, "#38bdf8");
    p.rect(5, 3, 23, 6, "#3f2615");
    p.text("RESUME", 16 - Math.floor(textWidth("RESUME") / 2), 4, "#fde68a");
    p.outline("#1f120a");
    return { body: p.canvas(), ox: 16, oy: 30, w: 32, h: 32 };
}

function pillar() {
    const p = new Px(14, 44);
    p.rect(2, 8, 10, 34, "#8b929e");
    for (let y = 8; y < 42; y += 5) for (let x = 2; x < 12; x += 5) p.rect(x + ((y / 5) % 2) * 2, y, 4, 4, "#a5acb7");
    p.vline(2, 8, 34, "#c2c8d1");
    p.rect(1, 5, 12, 3, "#6b7280");
    p.rect(4, 1, 6, 4, "#fde68a");
    p.rect(3, 0, 8, 1, "#374151");
    p.outline("#23272f");
    return { body: p.canvas(), ox: 7, oy: 42, w: 14, h: 44 };
}

function gateBeam() {
    const W = 84;
    const p = new Px(W, 18);
    p.rect(0, 3, W, 12, PAL.wood[1]);
    p.hline(0, 3, W, PAL.wood[3]);
    p.hline(0, 14, W, PAL.wood[0]);
    p.rect(14, 5, 56, 8, "#f1e4c4");
    p.text("RITESH KAPOOR", 42 - Math.floor(textWidth("RITESH KAPOOR") / 2), 7, "#3b2414");
    p.outline("#1f120a");
    return { body: p.canvas(), ox: 42, oy: 17, w: W, h: 18 };
}

function fence() {
    const p = new Px(16, 14);
    const [d, m, l] = PAL.wood;
    for (const x of [1, 9]) {
        p.rect(x, 2, 3, 11, l);
        p.vline(x + 2, 2, 11, m);
        p.set(x + 1, 1, l);
    }
    p.rect(0, 5, 16, 2, m);
    p.rect(0, 9, 16, 2, m);
    p.hline(0, 5, 16, l);
    p.hline(0, 10, 16, d);
    p.outline("#24160c");
    return { body: p.canvas(), ox: 8, oy: 12, w: 16, h: 14 };
}

function swing() {
    const p = new Px(48, 36);
    const metal = "#c2410c";
    for (const [x0, x1] of [
        [2, 8],
        [40, 46],
    ]) {
        for (let y = 2; y < 35; y++) {
            const t = (y - 2) / 33;
            p.set(x0 + 3 - t * 3, y, metal);
            p.set(x1 - 3 + t * 3, y, metal);
        }
    }
    p.rect(4, 1, 40, 3, "#ea580c");
    for (const x of [15, 31]) {
        p.vline(x, 4, 22, "#94a3b8");
        p.vline(x + 5, 4, 22, "#94a3b8");
        p.rect(x - 1, 25, 8, 2, "#1e40af");
    }
    p.outline("#2a1305");
    return { body: p.canvas(), ox: 24, oy: 34, w: 48, h: 36 };
}

function slide() {
    const p = new Px(34, 36);
    for (let y = 6; y < 35; y++) {
        p.set(4, y, "#64748b");
        p.set(10, y, "#64748b");
        if (y % 4 === 0) p.hline(4, y, 7, "#94a3b8");
    }
    p.rect(3, 4, 10, 3, "#fbbf24");
    for (let i = 0; i < 26; i++) {
        const x = 12 + i * 0.8;
        const y = 6 + i;
        p.rect(x, y, 6, 3, i % 6 < 3 ? "#ef4444" : "#f87171");
    }
    p.outline("#2a0b0b");
    return { body: p.canvas(), ox: 16, oy: 34, w: 34, h: 36 };
}

function picnic() {
    const p = new Px(34, 22);
    const [d, m, l, hi] = PAL.wood;
    p.rect(2, 2, 30, 6, l);
    p.hline(2, 2, 30, hi);
    for (let x = 8; x < 32; x += 8) p.vline(x, 2, 6, m);
    p.rect(5, 8, 3, 8, m);
    p.rect(26, 8, 3, 8, m);
    p.rect(0, 15, 34, 3, l);
    p.hline(0, 17, 34, d);
    p.rect(9, 3, 6, 3, "#ef4444");
    p.rect(10, 3, 2, 1, "#fff");
    p.outline("#24160c");
    return { body: p.canvas(), ox: 17, oy: 20, w: 34, h: 22 };
}

function bin() {
    const p = new Px(12, 15);
    p.rect(1, 3, 10, 11, "#166534");
    p.vline(1, 3, 11, "#22a35a");
    for (let x = 3; x < 10; x += 3) p.vline(x, 4, 9, "#14532d");
    p.rect(0, 1, 12, 2, "#14532d");
    p.outline("#0b1f12");
    return { body: p.canvas(), ox: 6, oy: 14, w: 12, h: 15 };
}

function cart() {
    const p = new Px(38, 40);
    p.vline(18, 4, 20, "#64748b");
    for (let y = 1; y < 12; y++) {
        const hw = 3 + (y - 1) * 1.6;
        for (let x = 19 - hw; x <= 19 + hw; x++) p.set(x, y, Math.floor((x - 19 + 40) / 4) % 2 ? "#f9a8d4" : "#fdf2f8");
    }
    p.rect(4, 20, 30, 13, "#fdf2f8");
    p.rect(4, 20, 30, 3, "#f472b6");
    p.rect(4, 30, 30, 3, "#e5e7eb");
    p.text("ICE", 19 - Math.floor(textWidth("ICE") / 2), 24, "#db2777");
    for (const x of [9, 29]) {
        p.ellipse(x, 35, 3.5, 3.5, "#334155");
        p.set(x, 35, "#94a3b8");
    }
    p.outline("#3b0d24");
    return { body: p.canvas(), ox: 19, oy: 38, w: 38, h: 40 };
}

function stump() {
    const p = new Px(16, 12);
    p.rect(2, 4, 12, 7, PAL.bark[1]);
    p.vline(2, 4, 7, PAL.bark[2]);
    p.ellipse(8, 4, 6, 2.5, "#c99a64");
    p.ellipse(8, 4, 3, 1.2, "#a77a48");
    p.outline("#1e130b");
    return { body: p.canvas(), ox: 8, oy: 11, w: 16, h: 12 };
}

function log() {
    const p = new Px(28, 11);
    p.rect(3, 2, 22, 7, PAL.bark[1]);
    p.hline(3, 2, 22, PAL.bark[2]);
    p.hline(3, 8, 22, PAL.bark[0]);
    p.ellipse(25, 5.5, 3, 3.5, "#c99a64");
    p.set(25, 5, "#a77a48");
    for (let i = 0; i < 5; i++) p.set(6 + i * 4, 4 + (i % 2), "#5f8a45");
    p.outline("#1e130b");
    return { body: p.canvas(), ox: 14, oy: 10, w: 28, h: 11 };
}

function campfire() {
    const p = new Px(20, 12);
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        p.rect(10 + Math.cos(a) * 8 - 1, 7 + Math.sin(a) * 3.5 - 1, 3, 2, i % 2 ? "#6b7280" : "#9ca3af");
    }
    p.rect(5, 6, 10, 2, PAL.bark[1]);
    p.rect(7, 4, 6, 2, PAL.bark[2]);
    p.outline("#1e130b");
    return { body: p.canvas(), ox: 10, oy: 11, w: 20, h: 12 };
}

// Multi-board direction sign; each board is [label, "l" | "r"] and points that way.
function dirSign(boards) {
    const bw = Math.max(...boards.map(([t]) => textWidth(t))) + 10;
    const W = bw + 10;
    const H = 8 + boards.length * 10 + 16;
    const p = new Px(W, H);
    const [d, m, l, hi] = PAL.wood;
    const cx = Math.floor(W / 2);
    p.rect(cx - 2, 2, 4, H - 3, m);
    p.vline(cx - 2, 2, H - 3, l);
    p.rect(cx - 3, H - 3, 6, 2, d);
    boards.forEach(([text, dir], i) => {
        const y = 4 + i * 10;
        const x0 = 5 + (dir === "l" ? -2 : 2);
        p.rect(x0, y, bw, 8, l);
        p.hline(x0, y, bw, hi);
        p.hline(x0, y + 7, bw, d);
        // pointed end
        for (let k = 1; k <= 3; k++) {
            const x = dir === "l" ? x0 - k : x0 + bw - 1 + k;
            p.rect(x, y + k, 1, 8 - k * 2, k === 3 ? d : l);
        }
        p.text(text, x0 + Math.floor((bw - textWidth(text)) / 2), y + 2, "#3b2414");
    });
    p.outline("#24160c");
    return { body: p.canvas(), ox: cx, oy: H - 2, w: W, h: H };
}

function gardenSign() {
    return signpost("SKILLS");
}

// ---------- characters ----------
export function characterFrames(pal) {
    const out = { down: [], up: [], right: [], left: [] };
    for (const dir of ["down", "up", "right"]) {
        for (let f = 0; f < 4; f++) {
            const p = new Px(16, 23);
            drawCharacter(p, dir, f, pal);
            p.outline(pal.outline || "#1a1420");
            out[dir].push(p);
        }
    }
    out.left = out.right.map((p) => p.mirror());
    for (const k of Object.keys(out)) out[k] = out[k].map((p) => p.canvas());
    return out;
}

function drawCharacter(p, dir, f, c) {
    const step = [0, 1, 0, -1][f];
    const bob = f % 2 ? 0 : 0;
    const Y = 1 + bob;
    if (dir === "right") {
        // legs
        p.rect(7 - step, Y + 14, 2, 5, c.pantsDark || c.pants);
        p.rect(7 + step, Y + 14, 2, 5, c.pants);
        p.rect(7 - step, Y + 19, 3, 1, c.shoes);
        p.rect(7 + step, Y + 19, 3, 1, c.shoes);
        // torso
        p.rect(5, Y + 9, 6, 6, c.shirt);
        p.vline(5, Y + 9, 6, c.shirtDark);
        p.hline(5, Y + 14, 6, c.shirtDark);
        // arm
        p.rect(7 + step, Y + 9, 2, 4, c.shirtDark);
        p.rect(7 + step, Y + 13, 2, 1, c.skin);
        // head
        p.rect(5, Y + 1, 7, 8, c.skin);
        p.rect(4, Y, 8, 3, c.hair);
        p.rect(4, Y + 3, 3, 5, c.hair);
        p.set(10, Y + 5, "#1b1b2a");
        p.set(12, Y + 6, c.skin);
        p.set(11, Y + 3, c.hair);
        if (c.cap) {
            p.rect(4, Y - 1, 8, 3, c.cap);
            p.rect(11, Y + 1, 3, 1, c.cap);
        }
        return;
    }
    // down / up
    const lLift = step === 1 ? 1 : 0;
    const rLift = step === -1 ? 1 : 0;
    p.rect(5, Y + 14, 2, 5 - lLift, c.pants);
    p.rect(9, Y + 14, 2, 5 - rLift, c.pants);
    p.rect(5, Y + 19 - lLift, 2, 1, c.shoes);
    p.rect(9, Y + 19 - rLift, 2, 1, c.shoes);
    p.rect(4, Y + 9, 8, 6, c.shirt);
    p.vline(11, Y + 9, 6, c.shirtDark);
    p.hline(4, Y + 14, 8, c.shirtDark);
    // arms swing
    p.rect(3, Y + 9 + rLift, 1, 3, c.shirtDark);
    p.rect(12, Y + 9 + lLift, 1, 3, c.shirtDark);
    p.set(3, Y + 12 + rLift, c.skin);
    p.set(12, Y + 12 + lLift, c.skin);
    // head
    p.rect(4, Y + 1, 8, 8, c.skin);
    if (dir === "down") {
        p.rect(4, Y, 8, 3, c.hair);
        p.rect(5, Y - 1, 6, 1, c.hair);
        p.vline(4, Y + 3, 3, c.hair);
        p.vline(11, Y + 3, 3, c.hair);
        p.rect(5, Y + 3, 3, 1, c.hair);
        p.set(6, Y + 5, "#1b1b2a");
        p.set(9, Y + 5, "#1b1b2a");
        p.set(5, Y + 6, c.blush || c.skin);
        p.set(10, Y + 6, c.blush || c.skin);
        if (c.beard) p.rect(5, Y + 7, 6, 2, c.beard);
    } else {
        p.rect(4, Y, 8, 8, c.hair);
        p.rect(5, Y - 1, 6, 1, c.hair);
    }
    if (c.cap) {
        p.rect(4, Y - 1, 8, 3, c.cap);
        if (dir === "down") p.rect(4, Y + 2, 8, 1, c.capDark || c.cap);
    }
}

export const PLAYER_PAL = {
    skin: "#e8b48a",
    hair: "#24170f",
    shirt: "#38bdf8",
    shirtDark: "#0284c7",
    pants: "#334155",
    pantsDark: "#1e293b",
    shoes: "#f8fafc",
    blush: "#f0a58a",
};

export const NPC_PALS = {
    guide: { skin: "#c98e66", hair: "#3b2416", shirt: "#22c55e", shirtDark: "#15803d", pants: "#78350f", shoes: "#1f2937", cap: "#15803d", capDark: "#14532d" },
    elder: { skin: "#e8bd98", hair: "#d1d5db", shirt: "#a16207", shirtDark: "#713f12", pants: "#44403c", shoes: "#1c1917", beard: "#e5e7eb" },
    jogger: { skin: "#a86f4c", hair: "#111827", shirt: "#f43f5e", shirtDark: "#be123c", pants: "#111827", shoes: "#fbbf24" },
    kid: { skin: "#f1c6a0", hair: "#e3a83b", shirt: "#a855f7", shirtDark: "#7e22ce", pants: "#1d4ed8", shoes: "#ef4444" },
    vendor: { skin: "#d9a07a", hair: "#3f2a1d", shirt: "#fdf2f8", shirtDark: "#f9a8d4", pants: "#475569", shoes: "#111827", cap: "#f472b6", capDark: "#db2777" },
    gardener: { skin: "#b97f5b", hair: "#57534e", shirt: "#84cc16", shirtDark: "#4d7c0f", pants: "#1e3a8a", shoes: "#3f2615", cap: "#ca8a04", capDark: "#a16207" },
};

// ---------- critters ----------
function duckFrames() {
    const frames = [];
    for (let f = 0; f < 2; f++) {
        const p = new Px(12, 9);
        p.ellipse(5, 6, 5, 2.5, "#a1795a");
        p.hline(1, 7, 9, "#7c5a40");
        p.rect(7, 1 + f, 3, 3, "#15803d");
        p.rect(7, 4, 2, 1, "#f8fafc");
        p.set(10, 2 + f, "#f59e0b");
        p.set(11, 2 + f, "#f59e0b");
        p.set(8, 2 + f, "#0b0b0b");
        p.rect(2, 4, 4, 1, "#e7d5c4");
        p.outline("#2a1d12");
        frames.push(p);
    }
    return { right: frames.map((p) => p.canvas()), left: frames.map((p) => p.mirror().canvas()) };
}

function pigeonFrames() {
    const frames = [];
    for (let f = 0; f < 3; f++) {
        const p = new Px(9, 8);
        if (f < 2) {
            p.ellipse(4, 5, 3, 2, "#9ca3af");
            p.rect(6, 2 + f, 2, 2, "#6b7280");
            p.set(8, 3 + f, "#f59e0b");
            p.set(2, 6, "#4b5563");
            p.set(4, 7, "#f97316");
        } else {
            p.ellipse(4, 5, 3, 1.5, "#9ca3af");
            p.rect(1, 1, 3, 3, "#d1d5db");
            p.rect(5, 1, 3, 3, "#d1d5db");
            p.set(8, 4, "#f59e0b");
        }
        p.outline("#1f2937");
        frames.push(p);
    }
    return { right: frames.map((p) => p.canvas()), left: frames.map((p) => p.mirror().canvas()) };
}

function dogFrames() {
    const frames = [];
    for (let f = 0; f < 2; f++) {
        const p = new Px(18, 13);
        p.rect(3, 4, 10, 5, "#b45309");
        p.rect(3, 7, 10, 2, "#92400e");
        p.rect(12, 1, 5, 5, "#b45309");
        p.set(16, 3, "#111827");
        p.set(17, 4, "#111827");
        p.rect(12, 1, 2, 3, "#78350f");
        p.rect(4, 4, 4, 2, "#fef3c7");
        p.set(1 + f, 2, "#b45309");
        p.set(2, 3, "#b45309");
        const legs = f ? [3, 6, 10, 12] : [4, 5, 11, 12];
        for (const x of legs) p.rect(x, 9, 1, 3, "#92400e");
        p.outline("#2a1305");
        frames.push(p);
    }
    return { right: frames.map((p) => p.canvas()), left: frames.map((p) => p.mirror().canvas()) };
}

function butterflyFrames(color) {
    const frames = [];
    for (let f = 0; f < 2; f++) {
        const p = new Px(7, 6);
        p.vline(3, 1, 4, "#1f2937");
        if (f === 0) {
            p.rect(0, 0, 3, 3, color);
            p.rect(4, 0, 3, 3, color);
            p.rect(1, 3, 2, 2, color);
            p.rect(4, 3, 2, 2, color);
        } else {
            p.rect(1, 1, 2, 3, color);
            p.rect(4, 1, 2, 3, color);
        }
        frames.push(p.canvas());
    }
    return frames;
}

function cloudShadow(seed) {
    const W = 220;
    const H = 120;
    const p = new Px(W, H);
    const blobs = [];
    const r = rng(seed);
    for (let i = 0; i < 6; i++) blobs.push([40 + r() * 140, 35 + r() * 50, 22 + r() * 26]);
    const col = rgba("#0b1a10", 28);
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            let v = 0;
            for (const [bx, by, br] of blobs) v = Math.max(v, 1 - Math.hypot(x - bx, (y - by) * 1.4) / br);
            v += (vnoise(x * 0.05, y * 0.05, seed) - 0.5) * 0.4;
            if (v > dither(x, y) * 0.5 + 0.1) p.d[y * W + x] = col;
        }
    return p.canvas();
}

export function buildSprites() {
    const S = {};
    S.oak = [0, 1, 2, 3].map((i) => tree("leaf", 11 + i * 7));
    S.fruit = [0, 1].map((i) => tree("leaf2", 91 + i * 5));
    S.autumn = [0, 1].map((i) => tree("autumn", 51 + i * 3));
    S.blossom = [0, 1].map((i) => tree("blossom", 71 + i * 9));
    S.pine = [0, 1, 2].map((i) => pine(31 + i * 13));
    S.bush = [bush(5), bush(6, "#d9283b"), bush(7, "#f9a8d4"), bush(8, "#fde047"), bush(9)];
    S.rock = [rock(3), rock(4), rock(5, true), rock(6, true)];
    S.lamp = [lamp()];
    S.bench = [bench()];
    S.sign = [signpost(), signpost("SITE >")];
    S.billboard = {
        agentstream: billboard("AGENTSTREAM", "#0369a1", MOTIFS.agentstream),
        talkeys: billboard("TALKEYS", "#b45309", MOTIFS.talkeys),
        fooddle: billboard("FOODDLE", "#15803d", MOTIFS.fooddle),
    };
    S.gazebo = [gazebo()];
    S.cabin = [cabin()];
    S.fountain = [fountain()];
    S.mailbox = [mailbox()];
    S.notice = [noticeBoard()];
    S.pillar = [pillar()];
    S.beam = [gateBeam()];
    S.fence = [fence()];
    S.swing = [swing()];
    S.slide = [slide()];
    S.picnic = [picnic()];
    S.bin = [bin()];
    S.cart = [cart()];
    S.stump = [stump()];
    S.log = [log()];
    S.campfire = [campfire()];
    S.gardenSign = [gardenSign()];
    S.dirsign = [
        dirSign([
            ["PARK MAP", "r"],
            ["PROJECTS", "l"],
            ["EXPERIENCE", "r"],
            ["SKILLS", "l"],
            ["ABOUT ME", "r"],
        ]),
    ];
    S.duck = duckFrames();
    S.pigeon = pigeonFrames();
    S.dog = dogFrames();
    S.butterfly = ["#fbbf24", "#f472b6", "#f8fafc", "#60a5fa", "#fb923c"].map(butterflyFrames);
    S.cloud = [1, 2, 3].map(cloudShadow);
    S.player = characterFrames(PLAYER_PAL);
    S.npc = Object.fromEntries(Object.entries(NPC_PALS).map(([k, v]) => [k, characterFrames(v)]));
    return S;
}
