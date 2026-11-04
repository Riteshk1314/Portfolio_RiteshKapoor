// Park layout, ground painting and object placement. All coordinates in the layout
// tables are in tiles (16px); everything returned is in native pixels.
import { SKILLS, SKILL_CATEGORIES } from "@/data/content";
import { hash, vnoise, fbm, dither, rgba, rng } from "./art";

export const T = 16;
export const MW = 72;
export const MH = 48;
export const W = MW * T;
export const H = MH * T;

export const G = { GRASS: 0, PATH: 1, STONE: 2, DEEP: 3, WATER: 4, SHALLOW: 5, SAND: 6, WOOD: 7, SOIL: 8 };
export const isWater = (g) => g >= G.DEEP && g <= G.SHALLOW;

const px = (v) => v * T;

// ---------- layout ----------
function polyline(pts, width) {
    const p = pts.map(([x, y]) => [px(x), px(y)]);
    const hw = px(width) / 2;
    const xs = p.map((q) => q[0]);
    const ys = p.map((q) => q[1]);
    const pad = hw + 6;
    return { p, hw, x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, y0: Math.min(...ys) - pad, y1: Math.max(...ys) + pad };
}

function distPoly(l, x, y) {
    let best = Infinity;
    const p = l.p;
    for (let i = 0; i < p.length - 1; i++) {
        const [ax, ay] = p[i];
        const [bx, by] = p[i + 1];
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
        const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
        if (d < best) best = d;
    }
    return best;
}

const PATHS = [
    polyline([[36, 48.5], [36, 29]], 2.2), // main avenue from the gate
    polyline([[31.5, 24], [24, 23.5], [18.5, 18.5], [15, 15.5]], 1.8), // to the gallery
    polyline([[40.5, 23.5], [44.5, 21], [45, 15]], 1.8), // to the pavilion
    polyline([[45, 17.5], [50, 18.8], [54.8, 18.6]], 1.4), // pond spur
    polyline([[36, 19.5], [35, 13], [31, 8]], 1.6), // north into the woods
    polyline([[29, 7], [25, 8.5], [23, 10.5]], 1.3),
    polyline([[32.5, 7], [38, 6.5], [42, 8.5]], 1.3),
    polyline([[36, 33], [26, 35], [19.5, 35.5]], 1.6), // to the garden
    polyline([[19.5, 35.5], [6.5, 35.5]], 1.2), // garden aisle
    polyline([[36, 33], [46, 34], [54, 34.3], [58.5, 34.3], [64, 35.9]], 1.6), // to the cabin
];
const CLEARINGS = [[30.2, 6.8, 2.5]]; // campfire clearing (dirt)

const STREAM = polyline([[60, 15.5], [61, 22], [59, 28], [56, 34], [58, 40], [62, 49]], 1.3);
const POND = { cx: px(56.5), cy: px(11.5), rx: px(7.5), ry: px(5.3) };

const PLAZA_CIRCLES = [[36, 24, 5]];
const PLAZA_RECTS = [
    [7, 9.5, 23.5, 15.8], // project gallery
    [30, 40.5, 42, 47.4], // gate square
];
const WOOD_RECTS = [
    { r: [54.3, 12.6, 55.9, 17.9], dir: "v" }, // pier
    { r: [54.4, 33.4, 58.4, 35.2], dir: "h" }, // bridge
];
export const BEDS = [];
SKILL_CATEGORIES.filter((c) => c !== "All").forEach((cat, i) => {
    const x0 = [6.5, 11, 15.5][i % 3];
    const y0 = i < 3 ? 31.8 : 36.8;
    BEDS.push({ cat, r: [x0, y0, x0 + 3.5, y0 + 2.4], color: ["#f472b6", "#a78bfa", "#fbbf24", "#60a5fa", "#fb7185", "#f8fafc"][i] });
});
const SANDBOX = [43.5, 38.5, 51.5, 43.8];

const inRect = (r, x, y) => x >= px(r[0]) && x < px(r[2]) && y >= px(r[1]) && y < px(r[3]);
const rectMargin = (r, x, y) => Math.min(x - px(r[0]), px(r[2]) - x, y - px(r[1]), px(r[3]) - y);

function waterDist(x, y) {
    const dx = (x - POND.cx) / POND.rx;
    const dy = (y - POND.cy) / POND.ry;
    let d = (Math.sqrt(dx * dx + dy * dy) - 1) * POND.ry + (vnoise(x / 24, y / 24, 7) - 0.5) * 16;
    if (x > STREAM.x0 && x < STREAM.x1 && y > STREAM.y0 - 20 && y < STREAM.y1)
        d = Math.min(d, distPoly(STREAM, x, y) - STREAM.hw + (vnoise(x / 14, y / 14, 8) - 0.5) * 5);
    return d;
}

// Ground type at a pixel. Also reports a secondary value via `info` used for shading.
const info = { e: 0, wd: 0, dir: "" };
export function classify(x, y) {
    for (const w of WOOD_RECTS)
        if (inRect(w.r, x, y)) {
            info.e = rectMargin(w.r, x, y);
            info.dir = w.dir;
            return G.WOOD;
        }
    const wd = waterDist(x, y);
    info.wd = wd;
    if (wd < 0) return wd < -16 ? G.DEEP : wd < -6 ? G.WATER : G.SHALLOW;
    if (wd < 4) return G.SAND;
    for (const [cx, cy, r] of PLAZA_CIRCLES) {
        const d = px(r) - Math.hypot(x - px(cx), y - px(cy));
        if (d > 0) {
            info.e = d;
            return G.STONE;
        }
    }
    for (const r of PLAZA_RECTS)
        if (inRect(r, x, y)) {
            info.e = rectMargin(r, x, y);
            return G.STONE;
        }
    for (const b of BEDS)
        if (inRect(b.r, x, y)) {
            info.e = rectMargin(b.r, x, y);
            return G.SOIL;
        }
    if (inRect(SANDBOX, x, y)) {
        info.e = rectMargin(SANDBOX, x, y);
        return G.SAND;
    }
    for (const [cx, cy, r] of CLEARINGS) {
        const d = px(r) + (vnoise(x / 10, y / 10, 3) - 0.5) * 8 - Math.hypot(x - px(cx), y - px(cy));
        if (d > 0) {
            info.e = d;
            return G.PATH;
        }
    }
    for (const l of PATHS) {
        if (x < l.x0 || x > l.x1 || y < l.y0 || y > l.y1) continue;
        const d = l.hw + (vnoise(x / 9, y / 9, 5) - 0.5) * 5 - distPoly(l, x, y);
        if (d > 0) {
            info.e = d;
            return G.PATH;
        }
    }
    return G.GRASS;
}

// ---------- palettes ----------
const C = (arr) => arr.map((h) => rgba(h));
const GRASS = C(["#2f6630", "#3d7a36", "#4a8a3c", "#579a43", "#66a94b", "#78b752"]);
const DIRT = C(["#8a6a42", "#9c7a4c", "#ae8a59", "#bf9b66", "#cdaa74"]);
const DIRT_EDGE = rgba("#6f5434");
const STONE = C(["#878e9a", "#959ca8", "#a3aab5", "#b2b8c2"]);
const MORTAR = rgba("#686e79");
const STONE_EDGE = rgba("#727884");
const WATER_C = { [G.DEEP]: C(["#24568a", "#2a5f93"]), [G.WATER]: C(["#3070a8", "#347bb3"]), [G.SHALLOW]: C(["#4590c6", "#4b9bcf"]) };
const FOAM = rgba("#a9d9ef");
const SAND = C(["#c9b07a", "#d9c38c", "#e3cf9a", "#ecdcaa"]);
const WOOD = C(["#8f5e35", "#a26c3e", "#b47b48"]);
const WOOD_GAP = rgba("#4a2e1a");
const SOIL = C(["#4f331f", "#5c3d26", "#6b4a2e"]);

function edgeDist(x, y) {
    return Math.min(x, W - x, y, H - y) / T;
}
export function isWoods(x, y) {
    const n = (vnoise(x / 30, y / 30, 21) - 0.5) * 1.6;
    const tx = x / T + n;
    const ty = y / T + n;
    return edgeDist(x, y) + n < 3.4 || (ty < 9.5 && tx > 23.5 && tx < 44) || (ty < 5 && tx < 50);
}

function groundColor(g, x, y) {
    const d = dither(x, y);
    switch (g) {
        case G.GRASS: {
            let v = fbm(x / 46, y / 46, 1) * 0.75 + vnoise(x / 6, y / 6, 2) * 0.25 + (hash(x, y, 3) - 0.5) * 0.16;
            let i = Math.floor(v * 6.4 + d - 1.6);
            if (isWoods(x, y)) i -= 2;
            return GRASS[Math.max(0, Math.min(5, i))];
        }
        case G.PATH: {
            if (info.e < 1.6) return DIRT_EDGE;
            const v = vnoise(x / 4, y / 4, 4) * 0.6 + hash(x, y, 9) * 0.4;
            return DIRT[Math.max(0, Math.min(4, Math.floor(v * 5 + d - 0.5) - (info.e < 3.5 ? 1 : 0)))];
        }
        case G.STONE: {
            if (info.e < 2) return STONE_EDGE;
            const row = Math.floor(y / 5);
            const off = (row % 2) * 3;
            if ((x + off) % 7 === 0 || y % 5 === 0) return MORTAR;
            const h = hash(Math.floor((x + off) / 7), row, 11);
            return STONE[Math.floor(h * 4)];
        }
        case G.DEEP:
        case G.WATER:
        case G.SHALLOW: {
            if (info.wd > -1.6) return FOAM;
            const c = WATER_C[g];
            return c[vnoise(x / 6, y / 3, 12) + d * 0.4 > 0.7 ? 1 : 0];
        }
        case G.SAND: {
            const v = vnoise(x / 5, y / 5, 13) * 0.5 + hash(x, y, 14) * 0.5;
            return SAND[Math.max(0, Math.min(3, Math.floor(v * 4 + d - 0.5)))];
        }
        case G.WOOD: {
            if (info.e < 1.5) return WOOD_GAP;
            const k = info.dir === "v" ? y : x;
            if (k % 4 === 0) return WOOD_GAP;
            return WOOD[Math.floor(hash(info.dir === "v" ? Math.floor(y / 4) : Math.floor(x / 4), 0, 15) * 3)];
        }
        case G.SOIL: {
            if (info.e < 2) return rgba("#7a5a3a");
            return y % 4 === 0 ? SOIL[0] : SOIL[1 + (hash(x, y, 16) < 0.3 ? 1 : 0)];
        }
        default:
            return GRASS[2];
    }
}

// ---------- object specs ----------
const SPEC = {
    oak: { col: [-4, -4, 8, 5], sh: [14, 5] },
    fruit: { col: [-4, -4, 8, 5], sh: [14, 5] },
    autumn: { col: [-4, -4, 8, 5], sh: [14, 5] },
    blossom: { col: [-4, -4, 8, 5], sh: [14, 5] },
    pine: { col: [-3, -4, 6, 5], sh: [10, 4] },
    bush: { col: [-9, -5, 18, 6], sh: [11, 3] },
    rock: { col: [-8, -5, 16, 6], sh: [9, 3] },
    rockS: { col: [-5, -3, 10, 4], sh: [6, 2] },
    lamp: { col: [-2, -3, 5, 4], sh: [5, 2] },
    bench: { col: [-12, -6, 24, 7], sh: [13, 3] },
    sign: { col: [-2, -3, 5, 4], sh: [6, 2] },
    billboard: { col: [-22, -4, 44, 5], sh: [24, 3] },
    gazebo: { col: [-35, -14, 70, 15], sh: [36, 6] },
    cabin: { col: [-43, -27, 86, 27], sh: [46, 5] },
    fountain: { col: [-30, -24, 60, 22], sh: [32, 5] },
    mailbox: { col: [-4, -3, 8, 4], sh: [5, 2] },
    notice: { col: [-13, -4, 26, 5], sh: [14, 3] },
    pillar: { col: [-6, -6, 12, 7], sh: [7, 3] },
    fence: { col: [-8, -3, 16, 4], sh: null },
    swing: { col: [-22, -4, 44, 5], sh: [22, 4] },
    slide: { col: [-14, -6, 28, 7], sh: [14, 4] },
    picnic: { col: [-16, -12, 32, 13], sh: [17, 4] },
    bin: { col: [-5, -4, 10, 5], sh: [5, 2] },
    cart: { col: [-16, -8, 32, 9], sh: [17, 4] },
    stump: { col: [-6, -4, 12, 5], sh: [7, 2] },
    log: { col: [-12, -4, 24, 5], sh: [13, 3] },
    campfire: { col: [-9, -6, 18, 7], sh: null },
    gardenSign: { col: [-2, -3, 5, 4], sh: [6, 2] },
    dirsign: { col: [-3, -3, 6, 4], sh: [8, 2] },
};

// The six sections a visitor is looking for, in the order the HUD lists them.
export const LANDMARKS = [
    { zone: "projects", label: "Project Gallery", hint: "Projects", color: "#38bdf8", target: "project-talkeys" },
    { zone: "experience", label: "Experience Pavilion", hint: "Experience", color: "#f59e0b", target: "experience" },
    { zone: "skills", label: "Skills Garden", hint: "Skills", color: "#a78bfa", target: "skills" },
    { zone: "about", label: "Ritesh's Cabin", hint: "About me", color: "#34d399", target: "about" },
    { zone: "contact", label: "Mailbox", hint: "Contact", color: "#f472b6", target: "contact" },
    { zone: "resume", label: "Résumé Board", hint: "Résumé", color: "#fde68a", target: "resume" },
];

const TREE_KINDS = new Set(["oak", "fruit", "autumn", "blossom", "pine"]);
export const isTree = (k) => TREE_KINDS.has(k);

// ---------- build ----------
export function buildMap() {
    const objects = [];
    const interact = [];
    const add = (kind, v, tx, ty, extra = {}) => {
        const o = { kind, v, x: Math.round(px(tx)), y: Math.round(px(ty)), phase: hash(tx * 7, ty * 7, 1) * 6.28, ...extra };
        objects.push(o);
        return o;
    };
    const act = (id, tx, ty, r, label, action, extra = {}) =>
        interact.push({ id, x: px(tx), y: px(ty), r, label, action, ...extra });

    // ----- landmarks -----
    const projects = [
        ["agentstream", 10.5, "AgentStream"],
        ["talkeys", 15, "Talkeys"],
        ["fooddle", 19.5, "Fooddle"],
    ];
    for (const [slug, tx, name] of projects) {
        add("billboard", slug, tx, 12.6);
        act(`project-${slug}`, tx, 13.4, 30, `Read about ${name}`, { panel: `project:${slug}`, zone: "projects" });
    }
    add("gazebo", 0, 45, 13.6);
    act("experience", 45, 14.4, 30, "Step into the Experience Pavilion", { panel: "experience", zone: "experience" });
    add("cabin", 0, 64, 34.6);
    act("about", 64, 35.4, 22, "Knock on Ritesh's cabin door", { panel: "about", zone: "about" });
    add("gardenSign", 0, 20.7, 34.2);
    act("skills", 20.7, 34.5, 22, "Read the Skills Garden sign", { panel: "skills", zone: "skills" });
    add("mailbox", 0, 40.4, 43);
    act("contact", 40.4, 43.4, 20, "Open the mailbox — contact Ritesh", { panel: "contact", zone: "contact" });
    add("notice", 0, 32, 43);
    act("resume", 32, 43.4, 22, "Read the résumé board", { panel: "resume", zone: "resume" });
    add("sign", 1, 29.4, 45.8);
    act("classic", 29.4, 46.1, 20, "Visit the classic website", { nav: "/site" });

    // skill beds — each one is a category
    for (const b of BEDS) {
        const names = SKILLS.filter((s) => s.cat === b.cat).map((s) => s.name);
        act(`bed-${b.cat}`, (b.r[0] + b.r[2]) / 2, (b.r[1] + b.r[3]) / 2, 30, `Look at the ${b.cat} bed`, {
            dialog: { name: `${b.cat} bed`, lines: [`Planted here: ${names.join(" · ")}.`] },
            zone: "skills",
        });
    }

    // gate
    add("pillar", 0, 33.6, 47.4);
    add("pillar", 0, 38.4, 47.4);
    const beam = { kind: "beam", v: 0, x: px(36), y: px(47.4) - 30 };

    // plaza
    add("fountain", 0, 36, 25.6);
    act("fountain", 36, 26.2, 34, "Toss a coin in the fountain", {
        dialog: { name: "Fountain", lines: ["You toss a coin into the fountain.", "You wish for a great hire. The water sparkles approvingly."] },
    });
    for (const [x, y] of [
        [32.6, 21.3],
        [39.4, 21.3],
        [32.6, 27.9],
        [39.4, 27.9],
    ])
        add("bench", 0, x, y);
    add("cart", 0, 41.6, 28.8);
    add("dirsign", 0, 39.3, 32.2);
    act("dirsign", 39.3, 32.5, 24, "Read the signpost — open the park map", { map: true });
    add("bin", 0, 34.2, 31.2);
    act("bin", 34.2, 31.5, 14, "Peek in the bin", { dialog: { name: "Bin", lines: ["Someone threw away a printout titled “works on my machine”."] } });

    // campfire clearing
    add("campfire", 0, 30.2, 7.2);
    add("log", 0, 27.9, 7.3);
    add("log", 0, 32.6, 7.6);
    add("log", 0, 30.2, 5.2);
    act("campfire", 30.2, 7.6, 38, "Warm up by the campfire", {
        dialog: {
            name: "Campfire",
            lines: ["A crackling campfire. It feels like a hackathon night.", "Ritesh organised HackTU 6.0 and 7.0 for 450+ participants as General Secretary of the Creative Computing Society."],
        },
        zone: "experience",
    });

    // pond
    act("pier", 55.1, 13.2, 18, "Look out over the pond", { dialog: { name: "Pier", lines: ["The water is calm. A duck eyes you suspiciously."] } });
    add("bench", 0, 52.4, 17.3);
    for (const [k, x, y] of [
        ["blossom", 49.5, 6.6],
        ["blossom", 63.4, 7.2],
        ["blossom", 66, 15.5],
        ["blossom", 50.4, 19.4],
    ])
        add(k, k === "blossom" ? Math.floor(x) % 2 : 0, x, y, { sway: true });

    // playground
    add("swing", 0, 46, 41.2);
    add("slide", 0, 49.6, 41.6);
    act("swing", 46, 41.6, 24, "Have a go on the swings", { dialog: { name: "Swings", lines: ["You take a quick swing. Wheee!"] } });

    // cabin yard
    add("picnic", 0, 66.2, 39.6);
    add("picnic", 0, 62.6, 42.4);
    add("bin", 0, 60.6, 38.8);

    // garden fences
    for (let x = 6; x < 20; x++) {
        add("fence", 0, x + 0.5, 31.4);
        add("fence", 0, x + 0.5, 40.8);
    }
    // park boundary fence
    for (let x = 2; x < 70; x++) {
        if (x >= 33 && x < 39) continue;
        add("fence", 0, x + 0.5, 47.5);
    }

    // lamps along the paths
    for (const [x, y] of [
        [34.4, 30.5], [37.6, 36], [34.4, 41.5], [37.6, 41.5],
        [31, 22.2], [41, 22.2], [31, 26.3], [41, 26.3],
        [22.6, 21.4], [17.4, 16.8], [43.3, 18.8], [46.7, 16],
        [27.5, 33.6], [43, 32.5], [52, 35.6], [60.4, 34], [37.4, 16],
        [8, 16.6], [22.4, 16.6],
    ])
        add("lamp", 0, x, y);
    for (const [x, y] of [
        [26, 21.9],
        [48.5, 32.4],
        [24.5, 36.9],
        [34.2, 36.6],
    ])
        add("bench", 0, x, y);

    // ----- keepouts & helpers for scattering -----
    const KEEP = [
        [6, 8.2, 24.5, 17], [41, 8, 49.5, 16], [5, 30.4, 21.5, 42], [43, 37.5, 53, 45],
        [59.5, 28.5, 69.5, 37.5], [60, 37, 69, 44], [29, 39.5, 43, 48], [27, 4, 33.6, 10],
        [53.5, 12, 57, 19.6], [53.5, 32.8, 59, 36], [39.5, 26.8, 43.5, 30],
    ];
    const kept = (x, y) => KEEP.some((r) => inRect(r, x, y)) || Math.hypot(x - px(36), y - px(24)) < px(5.8);
    const clearGround = (x, y, rad) => {
        for (const [dx, dy] of [[0, 0], [-rad, 0], [rad, 0], [0, -rad], [0, rad * 0.6]]) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
            if (classify(xx, yy) !== G.GRASS) return false;
        }
        return true;
    };
    const spaced = (x, y, d, filter) => !objects.some((o) => (!filter || filter(o)) && Math.hypot(o.x - x, o.y - y) < d);

    const R = rng(1314);
    const pick = (arr) => arr[Math.floor(R() * arr.length)];

    // dense forest belt + north woods
    for (let ty = 0.6; ty < MH; ty += 1.55)
        for (let tx = 0.4; tx < MW; tx += 1.6) {
            const x = px(tx + (R() - 0.5) * 1.2);
            const y = px(ty + (R() - 0.5) * 1.1);
            if (!isWoods(x, y) || y > px(46.6)) continue;
            if (R() > 0.86 || kept(x, y) || !clearGround(x, y, 10)) continue;
            if (!spaced(x, y, px(1.25), (o) => isTree(o.kind))) continue;
            if (!spaced(x, y, px(1.4), (o) => !isTree(o.kind))) continue;
            const r = R();
            const kind = r < 0.42 ? "pine" : r < 0.86 ? "oak" : r < 0.93 ? "fruit" : "autumn";
            add(kind, Math.floor(R() * (kind === "oak" ? 4 : kind === "pine" ? 3 : 2)), x / T, y / T, { sway: true });
        }
    // meadow trees
    for (let i = 0; i < 260; i++) {
        const x = px(4 + R() * (MW - 8));
        const y = px(4 + R() * (MH - 8));
        if (kept(x, y) || !clearGround(x, y, 18)) continue;
        if (!spaced(x, y, px(3.2), (o) => isTree(o.kind)) || !spaced(x, y, px(2), (o) => !isTree(o.kind))) continue;
        const r = R();
        const kind = r < 0.5 ? "oak" : r < 0.66 ? "fruit" : r < 0.8 ? "autumn" : r < 0.9 ? "blossom" : "pine";
        add(kind, Math.floor(R() * (kind === "oak" ? 4 : kind === "pine" ? 3 : 2)), x / T, y / T, { sway: true });
    }
    // bushes, rocks, stumps
    const scatter = (n, kind, variants, minD, nearWoodsOk = true) => {
        for (let i = 0; i < n * 6 && n > 0; i++) {
            const x = px(2.6 + R() * (MW - 5.2));
            const y = px(2.6 + R() * (MH - 4.4));
            if (y > px(46.8) || kept(x, y) || !clearGround(x, y, 8)) continue;
            if (!nearWoodsOk && isWoods(x, y)) continue;
            if (!spaced(x, y, minD)) continue;
            add(kind, typeof variants === "number" ? Math.floor(R() * variants) : variants, x / T, y / T);
            n--;
        }
    };
    scatter(85, "bush", 5, px(1.1));
    scatter(16, "rock", 2, px(1.4));
    scatter(22, "rockS", 2, px(1));
    scatter(6, "stump", 0, px(2));
    scatter(4, "log", 0, px(2.5));
    // rocks on the pond shore
    for (let i = 0; i < 60; i++) {
        const a = R() * Math.PI * 2;
        const x = POND.cx + Math.cos(a) * (POND.rx + 10);
        const y = POND.cy + Math.sin(a) * (POND.ry + 10);
        if (classify(x, y) !== G.GRASS || kept(x, y) || !spaced(x, y, px(1.6))) continue;
        add(R() < 0.5 ? "rockS" : "bush", R() < 0.5 ? 2 + Math.floor(R() * 2) : Math.floor(R() * 5), x / T, y / T);
    }

    // ----- paint ground -----
    const gtype = new Uint8Array(W * H);
    const buf = new Uint32Array(W * H);
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const g = classify(x, y);
            gtype[y * W + x] = g;
            buf[y * W + x] = groundColor(g, x, y);
        }
    const P = (x, y, c) => {
        x |= 0;
        y |= 0;
        if (x >= 0 && y >= 0 && x < W && y < H) buf[y * W + x] = typeof c === "string" ? rgba(c) : c;
    };
    const gAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : gtype[(y | 0) * W + (x | 0)]);
    const darken = (x, y, f) => {
        x |= 0;
        y |= 0;
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        const c = buf[y * W + x];
        const r = (c & 255) * f;
        const g = ((c >> 8) & 255) * f;
        const b = ((c >> 16) & 255) * f;
        buf[y * W + x] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
    };

    // grass tufts
    for (let i = 0; i < 9000; i++) {
        const x = Math.floor(R() * W);
        const y = Math.floor(R() * H);
        if (gAt(x, y) !== G.GRASS) continue;
        const dark = isWoods(x, y) || R() < 0.35;
        const c = dark ? GRASS[1] : GRASS[5];
        P(x, y, c);
        P(x - 1, y - 1, c);
        P(x + 1, y - 1, c);
        if (R() < 0.5) P(x, y - 2, c);
    }
    // flower meadows
    const FLOWERS = ["#f8fafc", "#fde047", "#f472b6", "#c4b5fd", "#fb7185", "#93c5fd", "#fdba74"];
    for (let i = 0; i < 70; i++) {
        const cx = R() * W;
        const cy = R() * H;
        if (isWoods(cx, cy) && R() < 0.7) continue;
        const col = pick(FLOWERS);
        const n = 10 + R() * 40;
        const rad = 8 + R() * 22;
        for (let k = 0; k < n; k++) {
            const a = R() * Math.PI * 2;
            const r = Math.sqrt(R()) * rad;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r * 0.75;
            if (gAt(x, y) !== G.GRASS) continue;
            P(x, y + 1, GRASS[1]);
            P(x, y, col);
            if (R() < 0.5) {
                P(x + 1, y, col);
                P(x, y - 1, col);
            }
        }
    }
    for (let i = 0; i < 1600; i++) {
        const x = R() * W;
        const y = R() * H;
        if (gAt(x, y) === G.GRASS && !isWoods(x, y)) P(x, y, pick(FLOWERS));
    }
    // mushrooms in the woods
    for (let i = 0; i < 160; i++) {
        const x = R() * W;
        const y = R() * H;
        if (gAt(x, y) !== G.GRASS || !isWoods(x, y)) continue;
        P(x, y, "#f1f5f9");
        P(x, y - 1, R() < 0.6 ? "#dc2626" : "#c2864a");
        P(x - 1, y - 1, R() < 0.6 ? "#dc2626" : "#c2864a");
        P(x + 1, y - 1, "#dc2626");
    }
    // pebbles on paths
    for (let i = 0; i < 2600; i++) {
        const x = R() * W;
        const y = R() * H;
        if (gAt(x, y) === G.PATH) P(x, y, R() < 0.5 ? "#7a5d3a" : "#d9bd8a");
    }
    // lily pads and reeds
    for (let i = 0; i < 46; i++) {
        const x = POND.cx + (R() - 0.5) * POND.rx * 1.7;
        const y = POND.cy + (R() - 0.5) * POND.ry * 1.7;
        if (gAt(x, y) !== G.WATER && gAt(x, y) !== G.DEEP) continue;
        const r = 2 + R() * 2.5;
        for (let yy = -r; yy <= r; yy++)
            for (let xx = -r * 1.3; xx <= r * 1.3; xx++)
                if ((xx / 1.3) ** 2 + yy * yy <= r * r && !(xx > 0 && Math.abs(yy) < 0.8)) P(x + xx, y + yy, xx + yy < -1 ? "#5aa04a" : "#3f8a3c");
        if (R() < 0.35) {
            P(x, y - 1, "#fbcfe8");
            P(x - 1, y - 1, "#f472b6");
            P(x, y - 2, "#fbcfe8");
        }
    }
    for (let i = 0; i < 4000; i++) {
        const x = Math.floor(R() * W);
        const y = Math.floor(R() * H);
        if (gAt(x, y) !== G.SAND && gAt(x, y) !== G.SHALLOW) continue;
        if (inRect(SANDBOX, x, y)) continue;
        if (classify(x, y) === G.WOOD || Math.abs(info.wd) > 5 || R() < 0.6) continue;
        const h = 3 + Math.floor(R() * 4);
        for (let k = 0; k < h; k++) P(x, y - k, k > h - 3 ? "#7c4a1e" : "#2f6b2a");
        P(x + 1, y, "#3f7a34");
    }
    // garden plantings
    for (const b of BEDS)
        for (let y = px(b.r[1]) + 4; y < px(b.r[3]) - 3; y += 6)
            for (let x = px(b.r[0]) + 4; x < px(b.r[2]) - 3; x += 5) {
                P(x, y + 1, "#2f6b2a");
                P(x, y + 2, "#2f6b2a");
                P(x - 1, y + 1, "#3f8a3c");
                P(x + 1, y + 2, "#3f8a3c");
                P(x, y, b.color);
                P(x + 1, y, b.color);
                P(x, y - 1, b.color);
                P(x + 1, y - 1, "#fef9c3");
            }
    // sandbox frame
    for (let x = px(SANDBOX[0]); x < px(SANDBOX[2]); x++) {
        P(x, px(SANDBOX[1]), PAL_WOOD);
        P(x, px(SANDBOX[1]) + 1, PAL_WOOD);
        P(x, px(SANDBOX[3]) - 1, PAL_WOOD_D);
        P(x, px(SANDBOX[3]) - 2, PAL_WOOD_D);
    }
    for (let y = px(SANDBOX[1]); y < px(SANDBOX[3]); y++) {
        P(px(SANDBOX[0]), y, PAL_WOOD);
        P(px(SANDBOX[0]) + 1, y, PAL_WOOD);
        P(px(SANDBOX[2]) - 1, y, PAL_WOOD_D);
        P(px(SANDBOX[2]) - 2, y, PAL_WOOD_D);
    }
    // bridge rails
    const br = WOOD_RECTS[1].r;
    for (let x = px(br[0]); x < px(br[2]); x++) {
        P(x, px(br[1]), "#4a2e1a");
        P(x, px(br[1]) + 1, "#6e4527");
        P(x, px(br[3]) - 1, "#4a2e1a");
        P(x, px(br[3]) - 2, "#6e4527");
    }
    // object shadows (dithered, baked into the ground)
    for (const o of objects) {
        const s = SPEC[o.kind]?.sh;
        if (!s) continue;
        const [rx, ry] = s;
        const cx = o.x + (isTree(o.kind) ? 3 : 1);
        const cy = o.y + 1;
        for (let y = -ry; y <= ry; y++)
            for (let x = -rx; x <= rx; x++) {
                const k = (x / rx) ** 2 + (y / ry) ** 2;
                if (k > 1) continue;
                if (k > 0.55 && dither(cx + x, cy + y) > 0.5) continue;
                darken(cx + x, cy + y, 0.72);
            }
    }
    // leaf litter under autumn / blossom trees
    for (const o of objects) {
        if (o.kind !== "autumn" && o.kind !== "blossom") continue;
        const col = o.kind === "autumn" ? ["#e08c2c", "#bd6420", "#f3b955"] : ["#f0a6c2", "#ffd0e2", "#cf759a"];
        for (let k = 0; k < 40; k++) {
            const x = o.x + (R() - 0.5) * 46;
            const y = o.y + (R() - 0.5) * 22;
            if (gAt(x, y) === G.GRASS || gAt(x, y) === G.PATH) P(x, y, pick(col));
        }
    }

    const ground = document.createElement("canvas");
    ground.width = W;
    ground.height = H;
    const gctx = ground.getContext("2d");
    const img = gctx.createImageData(W, H);
    new Uint32Array(img.data.buffer).set(buf);
    gctx.putImageData(img, 0, 0);

    // ----- collision grid (2px cells) -----
    const CW = W / 2;
    const CH = H / 2;
    const solid = new Uint8Array(CW * CH);
    for (let cy = 0; cy < CH; cy++)
        for (let cx = 0; cx < CW; cx++) {
            const x = cx * 2 + 1;
            const y = cy * 2 + 1;
            if (x < px(1.6) || x > W - px(1.6) || y < px(1.6) || y > H - 6) solid[cy * CW + cx] = 1;
            else if (isWater(gtype[y * W + x])) solid[cy * CW + cx] = 1;
        }
    for (const o of objects) {
        const c = SPEC[o.kind]?.col;
        if (!c) continue;
        const x0 = Math.floor((o.x + c[0]) / 2);
        const y0 = Math.floor((o.y + c[1]) / 2);
        const x1 = Math.ceil((o.x + c[0] + c[2]) / 2);
        const y1 = Math.ceil((o.y + c[1] + c[3]) / 2);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (x >= 0 && y >= 0 && x < CW && y < CH) solid[y * CW + x] = 1;
    }

    // water sparkle candidates
    const sparkles = [];
    for (let i = 0; i < 1400 && sparkles.length < 220; i++) {
        const x = Math.floor(R() * W);
        const y = Math.floor(R() * H);
        const g = gtype[y * W + x];
        if (g === G.DEEP || g === G.WATER) sparkles.push({ x, y, ph: R() * 6.28, sp: 1 + R() * 2 });
    }

    // landmark nameplates
    const plates = [
        { text: "PROJECT GALLERY", x: px(15), y: px(9.4), color: "#38bdf8" },
        { text: "EXPERIENCE PAVILION", x: px(45), y: px(9), color: "#f59e0b" },
        { text: "SKILLS GARDEN", x: px(13.2), y: px(30.6), color: "#a78bfa" },
        { text: "RITESH'S CABIN", x: px(64), y: px(29.6), color: "#34d399" },
        { text: "CONTACT", x: px(40.4), y: px(41.3), color: "#f472b6" },
        { text: "RESUME", x: px(32), y: px(40.9), color: "#fde68a" },
        { text: "CLASSIC SITE", x: px(29.4), y: px(44.2), color: "#e2e8f0" },
    ];

    return {
        ground,
        gtype,
        solid,
        CW,
        objects,
        beam,
        interact,
        sparkles,
        plates,
        pond: POND,
        spawn: { x: px(36), y: px(44) },
        fountainTop: { x: px(36), y: px(25.6) - 46 },
        basinY: px(25.6) - 12,
        chimney: { x: px(64) + 23, y: px(34.6) - 80 },
        campfire: { x: px(30.2), y: px(7.2) - 4 },
    };
}

const PAL_WOOD = rgba("#b07b48");
const PAL_WOOD_D = rgba("#6e4527");

export { SPEC };
