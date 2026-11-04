import { buildSprites, rng } from "./art";
import { buildMap, W, H, T, G, isTree, LANDMARKS } from "./map";

const NPCS = [
    {
        id: "guide",
        pal: "guide",
        name: "Park Guide",
        x: 38.6,
        y: 44.4,
        mode: "static",
        dir: "left",
        lines: [
            "Welcome to the park! This whole place is Ritesh Kapoor's portfolio.",
            "Walk with WASD or the arrow keys, hold Shift to run, and press E near anything that catches your eye. You can also just click where you want to go.",
            "His projects are on the billboards up north-west, his experience is in the pavilion by the pond, and his skills grow in the garden to the west.",
        ],
    },
    {
        id: "elder",
        pal: "elder",
        name: "Old Mr. Bose",
        x: 51.2,
        y: 17.9,
        mode: "static",
        dir: "up",
        lines: ["Lovely morning for the ducks.", "If you want to know where Ritesh has worked, the pavilion just west of here tells the whole story."],
    },
    {
        id: "jogger",
        pal: "jogger",
        name: "Jogger",
        x: 36,
        y: 24.4,
        mode: "loop",
        rx: 3.5,
        ry: 2.9,
        speed: 46,
        lines: ["Can't stop! Training for peak load.", "Talkeys held 99.9% uptime at peak. I'm trying to match it."],
    },
    {
        id: "kid",
        pal: "kid",
        name: "Kid",
        x: 47.5,
        y: 43,
        mode: "wander",
        rad: 2.6,
        speed: 34,
        lines: ["The cabin past the bridge belongs to Ritesh! You can knock on the door.", "I'm going to build an app with 5,000 users too. Like Fooddle!"],
    },
    {
        id: "vendor",
        pal: "vendor",
        name: "Ice Cream Vendor",
        x: 41.6,
        y: 29.9,
        mode: "static",
        dir: "down",
        lines: ["Sorry, sold out today!", "Fooddle handled 10,000+ orders without running out. I should ask Ritesh for tips."],
    },
    {
        id: "gardener",
        pal: "gardener",
        name: "Gardener",
        x: 12.5,
        y: 35.6,
        mode: "wander",
        rad: 4.5,
        speed: 22,
        lines: ["Every bed in this garden is one of Ritesh's skill areas.", "Walk up to a bed and press E to see what's planted, or read the sign by the gate for the full list."],
    },
];

const ANIM = [1, 0, 3, 2];

export function createPark({ canvas, minimap, onPrompt, onAction, startPos }) {
    const S = buildSprites();
    const M = buildMap();
    const ctx = canvas.getContext("2d");
    const R = rng(Date.now() & 0xffff);
    const CH = H / 2;

    // resolve sprites
    for (const o of M.objects) {
        const list = o.kind === "rockS" ? null : S[o.kind];
        if (o.kind === "rockS") o.spr = S.rock[2 + (o.v % 2)];
        else if (o.kind === "billboard") o.spr = S.billboard[o.v];
        else o.spr = list[o.v % list.length];
    }
    M.beam.spr = S.beam[0];

    // ---------- collision ----------
    const solidAt = (x, y) => {
        const cx = Math.floor(x) >> 1;
        const cy = Math.floor(y) >> 1;
        if (cx < 0 || cy < 0 || cx >= M.CW || cy >= CH) return true;
        return M.solid[cy * M.CW + cx] === 1;
    };
    const blocked = (x, y) =>
        solidAt(x - 4, y - 3) || solidAt(x + 3, y - 3) || solidAt(x - 4, y) || solidAt(x + 3, y) || solidAt(x, y - 3) || solidAt(x, y);
    const move = (e, dx, dy) => {
        let moved = false;
        if (dx && !blocked(e.x + dx, e.y)) {
            e.x += dx;
            moved = true;
        } else if (dx && !dy) {
            for (const n of [-1, 1]) if (!blocked(e.x + dx, e.y + n)) {
                e.x += dx;
                e.y += n * 0.6;
                moved = true;
                break;
            }
        }
        if (dy && !blocked(e.x, e.y + dy)) {
            e.y += dy;
            moved = true;
        } else if (dy && !dx) {
            for (const n of [-1, 1]) if (!blocked(e.x + n, e.y + dy)) {
                e.y += dy;
                e.x += n * 0.6;
                moved = true;
                break;
            }
        }
        return moved;
    };
    const gAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : M.gtype[Math.floor(y) * W + Math.floor(x)]);

    // ---------- pathfinding (A* over 4px cells the player's feet fit in) ----------
    const GW = W >> 2;
    const GH = H >> 2;
    const walk = new Uint8Array(GW * GH);
    for (let cy = 0; cy < GH; cy++) for (let cx = 0; cx < GW; cx++) walk[cy * GW + cx] = blocked(cx * 4 + 2, cy * 4 + 2) ? 0 : 1;
    const nearestWalkable = (cx, cy) => {
        for (let r = 0; r < 14; r++)
            for (let dy = -r; dy <= r; dy++)
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                    const x = cx + dx;
                    const y = cy + dy;
                    if (x >= 0 && y >= 0 && x < GW && y < GH && walk[y * GW + x]) return y * GW + x;
                }
        return -1;
    };
    const lineClear = (ax, ay, bx, by) => {
        const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 2);
        for (let i = 1; i <= n; i++) if (blocked(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n)) return false;
        return true;
    };
    function findPath(sx, sy, tx, ty) {
        const s = nearestWalkable(Math.floor(sx / 4), Math.floor(sy / 4));
        const g = nearestWalkable(Math.floor(tx / 4), Math.floor(ty / 4));
        if (s < 0 || g < 0) return null;
        const N = GW * GH;
        const gs = new Float32Array(N).fill(Infinity);
        const came = new Int32Array(N).fill(-1);
        const closed = new Uint8Array(N);
        const heap = [];
        const push = (f, i) => {
            heap.push([f, i]);
            let k = heap.length - 1;
            while (k > 0) {
                const p = (k - 1) >> 1;
                if (heap[p][0] <= heap[k][0]) break;
                [heap[p], heap[k]] = [heap[k], heap[p]];
                k = p;
            }
        };
        const pop = () => {
            const top = heap[0];
            const last = heap.pop();
            if (heap.length) {
                heap[0] = last;
                let k = 0;
                for (;;) {
                    const l = 2 * k + 1;
                    const r = l + 1;
                    let m = k;
                    if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
                    if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
                    if (m === k) break;
                    [heap[m], heap[k]] = [heap[k], heap[m]];
                    k = m;
                }
            }
            return top;
        };
        const gx = g % GW;
        const gy = (g / GW) | 0;
        const h = (i) => {
            const dx = Math.abs((i % GW) - gx);
            const dy = Math.abs(((i / GW) | 0) - gy);
            return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
        };
        gs[s] = 0;
        push(h(s), s);
        let found = false;
        while (heap.length) {
            const cur = pop()[1];
            if (cur === g) {
                found = true;
                break;
            }
            if (closed[cur]) continue;
            closed[cur] = 1;
            const cx = cur % GW;
            const cy = (cur / GW) | 0;
            for (let dy = -1; dy <= 1; dy++)
                for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy) continue;
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
                    const ni = ny * GW + nx;
                    if (!walk[ni] || closed[ni]) continue;
                    if (dx && dy && (!walk[cy * GW + nx] || !walk[ny * GW + cx])) continue;
                    const ng = gs[cur] + (dx && dy ? Math.SQRT2 : 1);
                    if (ng < gs[ni]) {
                        gs[ni] = ng;
                        came[ni] = cur;
                        push(ng + h(ni), ni);
                    }
                }
        }
        if (!found) return null;
        const pts = [];
        for (let i = g; i !== -1; i = came[i]) pts.push({ x: (i % GW) * 4 + 2, y: ((i / GW) | 0) * 4 + 2 });
        pts.reverse();
        // string-pull: skip ahead to the furthest point in straight sight
        const out = [];
        let i = 0;
        while (i < pts.length - 1) {
            let j = Math.min(pts.length - 1, i + 60);
            while (j > i + 1 && !lineClear(pts[i].x, pts[i].y, pts[j].x, pts[j].y)) j--;
            out.push(pts[j]);
            i = j;
        }
        if (!out.length) out.push(pts[0]);
        return out;
    }

    // ---------- entities ----------
    const player = { x: M.spawn.x, y: M.spawn.y, dir: "up", dist: 0, moving: false, running: false };
    if (startPos && !blocked(startPos.x, startPos.y)) {
        player.x = startPos.x;
        player.y = startPos.y;
        player.dir = startPos.dir || "down";
    }

    const npcs = NPCS.map((n) => ({
        ...n,
        x: n.x * T,
        y: n.y * T,
        hx: n.x * T,
        hy: n.y * T,
        homeDir: n.dir || "down",
        dir: n.dir || "down",
        dist: 0,
        moving: false,
        t: R() * 2,
        ang: 0,
        frames: S.npc[n.pal],
    }));
    const dog = { x: 60 * T, y: 39 * T, dir: "left", t: 0, moving: false, dist: 0, tx: 0, ty: 0, id: "dog", name: "Biscuit the dog", lines: ["Woof!", "*Biscuit wags his tail and drops a stick at your feet.*"] };
    npcs.push(dog);

    const inPond = (x, y) => {
        const g = gAt(x, y);
        return (g === G.DEEP || g === G.WATER) && Math.hypot((x - M.pond.cx) / M.pond.rx, (y - M.pond.cy) / M.pond.ry) < 0.9;
    };
    const ducks = [];
    while (ducks.length < 6) {
        const x = M.pond.cx + (R() - 0.5) * M.pond.rx * 1.6;
        const y = M.pond.cy + (R() - 0.5) * M.pond.ry * 1.6;
        if (inPond(x, y)) ducks.push({ x, y, tx: x, ty: y, dir: R() < 0.5 ? "left" : "right", t: R() * 4 });
    }
    const plazaSpot = () => {
        for (;;) {
            const a = R() * Math.PI * 2;
            const r = (2.6 + R() * 2) * T;
            const x = 36 * T + Math.cos(a) * r;
            const y = 24 * T + Math.sin(a) * r;
            if (!blocked(x, y)) return [x, y];
        }
    };
    const pigeons = Array.from({ length: 9 }, () => {
        const [x, y] = plazaSpot();
        return { x, y, dir: R() < 0.5 ? "left" : "right", state: "ground", t: R() * 3, vx: 0, vy: 0, alt: 0, peck: 0 };
    });
    const butterflies = Array.from({ length: 18 }, (_, i) => {
        const homes = [
            [13, 36],
            [26, 40],
            [50, 27],
            [20, 27],
            [40, 37],
            [58, 22],
            [64, 41],
        ];
        const [hx, hy] = homes[i % homes.length];
        return { x: hx * T + (R() - 0.5) * 60, y: hy * T + (R() - 0.5) * 40, hx: hx * T, hy: hy * T, vx: 0, vy: 0, c: i % 5, ph: R() * 6, alt: 6 + R() * 8 };
    });
    const swayTrees = M.objects.filter((o) => o.sway);
    const particles = [];
    const ripples = [];
    const clouds = [0, 1, 2, 3, 4].map((i) => ({ x: R() * W, y: R() * H, s: S.cloud[i % 3], v: 4 + R() * 4 }));

    const landmarkList = LANDMARKS.map((L) => {
        let it = M.interact.find((i) => i.id === L.target);
        // walking to the gallery opens the full project list rather than one billboard
        if (L.zone === "projects") it = { ...it, id: "gallery", label: "Browse the Project Gallery", action: { panel: "projects", zone: "projects" } };
        return { ...L, it, x: it.x, y: it.y };
    });

    // interactable marker heights
    for (const it of M.interact) {
        let best = null;
        let bd = 40;
        for (const o of M.objects) {
            const d = Math.hypot(o.x - it.x, o.y - it.y);
            if (d < bd && !isTree(o.kind) && o.kind !== "fence") {
                bd = d;
                best = o;
            }
        }
        it.top = best ? best.y - best.spr.oy - 4 : it.y - 20;
    }

    // ---------- input ----------
    const keys = new Set();
    const joy = { x: 0, y: 0 };
    let target = null;
    let paused = true;
    let near = null;
    let lastPromptKey = null;

    const doInteract = (it = near) => {
        if (!it || paused) return;
        target = null;
        if (it.npc) {
            const n = it.npc;
            n.talking = true;
            n.dir = n === dog ? (player.x > n.x ? "right" : "left") : faceToward(n, player);
            onAction({ type: "dialog", name: n.name, lines: n.lines, onClose: () => (n.talking = false) });
            return;
        }
        const a = it.action;
        if (a.panel) onAction({ type: "panel", panel: a.panel, zone: a.zone });
        else if (a.dialog) onAction({ type: "dialog", ...a.dialog, zone: a.zone });
        else if (a.nav) onAction({ type: "nav", to: a.nav });
        else if (a.map) onAction({ type: "map" });
    };

    const onKeyDown = (e) => {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
        keys.add(e.code);
        if (!e.repeat && (e.code === "KeyE" || e.code === "Enter" || e.code === "Space")) doInteract();
        if (e.code === "Equal" || e.code === "NumpadAdd") setZoomBias(zoomBias + 1);
        if (e.code === "Minus" || e.code === "NumpadSubtract") setZoomBias(zoomBias - 1);
    };
    const onKeyUp = (e) => keys.delete(e.code);
    const onBlur = () => keys.clear();

    let dpr = 1;
    let zoom = 3;
    let zoomBias = 0;
    const cam = { x: player.x, y: player.y, vw: 0, vh: 0 };
    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        // aim for ~440 native px across on desktop and ~200 on phones
        const span = window.innerWidth < 700 ? 200 : 440;
        const base = Math.round(Math.min(canvas.width / span, canvas.height / (span * 0.6)));
        zoom = Math.max(2, Math.min(10, base + zoomBias));
        cam.vw = canvas.width / zoom;
        cam.vh = canvas.height / zoom;
    };
    const setZoomBias = (b) => {
        zoomBias = Math.max(-3, Math.min(4, b));
        resize();
    };
    const toWorld = (cx, cy) => {
        const r = canvas.getBoundingClientRect();
        return [Math.round(cam.x) + ((cx - r.left) * dpr) / zoom, Math.round(cam.y) + ((cy - r.top) * dpr) / zoom];
    };
    const hitTest = (wx, wy) => {
        let best = null;
        let bd = 26;
        for (const it of allInteractables()) {
            const d = Math.min(Math.hypot(it.x - wx, it.y - wy), Math.hypot(it.x - wx, (it.top ?? it.y) + 12 - wy));
            if (d < bd) {
                bd = d;
                best = it;
            }
        }
        return best;
    };
    const onPointerDown = (e) => {
        if (paused || e.pointerType === "touch") return;
        const [wx, wy] = toWorld(e.clientX, e.clientY);
        const it = hitTest(wx, wy);
        if (it && Math.hypot(it.x - player.x, it.y - player.y) < it.r) return doInteract(it);
        setTravel(it ? it.x : wx, it ? it.y : wy, it);
    };
    function setTravel(x, y, it = null, run = false) {
        const path = findPath(player.x, player.y, x, y) || [{ x, y }];
        target = { path, i: 0, it, stuck: 0, run, gx: x, gy: y, replanned: false };
    }

    const onPointerMove = (e) => {
        if (e.pointerType === "touch") return;
        const [wx, wy] = toWorld(e.clientX, e.clientY);
        canvas.style.cursor = hitTest(wx, wy) ? "pointer" : "default";
    };
    const onWheel = (e) => {
        e.preventDefault();
        setZoomBias(zoomBias + (e.deltaY < 0 ? 1 : -1));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    resize();

    function allInteractables() {
        const list = M.interact.slice();
        for (const n of npcs) list.push({ id: `npc-${n.id}`, x: n.x, y: n.y, r: 24, label: `Talk to ${n.name}`, npc: n, top: n.y - (n === dog ? 16 : 28) });
        return list;
    }

    function faceToward(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
        return dy > 0 ? "down" : "up";
    }
    const dirOf = (dx, dy, cur) => {
        if (!dx && !dy) return cur;
        if (Math.abs(dx) > Math.abs(dy) + 0.01) return dx > 0 ? "right" : "left";
        return dy > 0 ? "down" : "up";
    };

    // ---------- update ----------
    let t = 0;
    let saveT = 0;
    let leafT = 0;
    let smokeT = 0;
    let dustT = 0;
    let mmT = 0;

    function update(dt) {
        t += dt;
        // player
        let ix = 0;
        let iy = 0;
        if (!paused) {
            if (keys.has("ArrowLeft") || keys.has("KeyA")) ix -= 1;
            if (keys.has("ArrowRight") || keys.has("KeyD")) ix += 1;
            if (keys.has("ArrowUp") || keys.has("KeyW")) iy -= 1;
            if (keys.has("ArrowDown") || keys.has("KeyS")) iy += 1;
            if (joy.x || joy.y) {
                ix = joy.x;
                iy = joy.y;
            }
            if (ix || iy) target = null;
            else if (target) {
                const it = target.it;
                if (it && Math.hypot(it.x - player.x, it.y - player.y) < it.r * 0.7) {
                    target = null;
                    doInteract(it);
                } else {
                    let wp = target.path[target.i];
                    while (target.i < target.path.length - 1 && Math.hypot(wp.x - player.x, wp.y - player.y) < 3) wp = target.path[++target.i];
                    const dx = wp.x - player.x;
                    const dy = wp.y - player.y;
                    const d = Math.hypot(dx, dy);
                    if (d < 3) {
                        target = null;
                        if (it && Math.hypot(it.x - player.x, it.y - player.y) < it.r) doInteract(it);
                    } else {
                        ix = dx / d;
                        iy = dy / d;
                    }
                }
            }
        }
        const len = Math.hypot(ix, iy);
        player.running = !!(keys.has("ShiftLeft") || keys.has("ShiftRight") || Math.hypot(joy.x, joy.y) > 0.92 || target?.run);
        if (len > 0.1) {
            const sp = (player.running ? 120 : 70) * dt * Math.min(1, len);
            const dx = (ix / len) * sp;
            const dy = (iy / len) * sp;
            const ox = player.x;
            const oy = player.y;
            move(player, dx, dy);
            const moved = Math.hypot(player.x - ox, player.y - oy);
            player.dist += moved;
            player.moving = moved > 0.01;
            player.dir = dirOf(ix, iy, player.dir);
            if (target) {
                target.stuck = moved < sp * 0.2 ? target.stuck + dt : 0;
                if (target.stuck > 0.4) {
                    if (target.replanned) target = null;
                    else {
                        const { gx, gy, it, run } = target;
                        setTravel(gx, gy, it, run);
                        target.replanned = true;
                    }
                }
            }
            if (player.running && player.moving && (dustT -= dt) < 0) {
                dustT = 0.1;
                particles.push({ k: "dust", x: player.x + (R() - 0.5) * 4, y: player.y, vx: -dx * 4, vy: -6, life: 0.45, max: 0.45 });
            }
        } else player.moving = false;

        // NPCs
        for (const n of npcs) {
            if (n === dog) continue;
            if (n.talking) {
                n.moving = false;
                continue;
            }
            if (n.mode === "static") {
                n.dir = Math.hypot(player.x - n.x, player.y - n.y) < 48 ? faceToward(n, player) : n.homeDir;
            } else if (n.mode === "loop") {
                const r = (n.rx + n.ry) * 0.5 * T;
                n.ang += (n.speed / r) * dt;
                const nx = n.hx + Math.cos(n.ang) * n.rx * T;
                const ny = n.hy + Math.sin(n.ang) * n.ry * T;
                n.dir = dirOf(nx - n.x, ny - n.y, n.dir);
                n.dist += Math.hypot(nx - n.x, ny - n.y);
                n.x = nx;
                n.y = ny;
                n.moving = true;
            } else wander(n, n.rad * T, n.speed, dt);
        }
        // dog: follows the player when close, otherwise potters about
        const dd = Math.hypot(player.x - dog.x, player.y - dog.y);
        if (dog.talking) dog.moving = false;
        else if (dd < 110 && dd > 22) {
            const sp = Math.min(dd * 1.2, 90) * dt;
            const ox = dog.x;
            move(dog, ((player.x - dog.x) / dd) * sp, ((player.y - dog.y) / dd) * sp);
            if (Math.abs(dog.x - ox) > 0.01) dog.dir = dog.x > ox ? "right" : "left";
            dog.moving = true;
            dog.dist += sp;
        } else if (dd >= 110) {
            dog.hx = dog.hx || dog.x;
            dog.hy = dog.hy || dog.y;
            wander(dog, 40, 26, dt);
        } else dog.moving = false;

        // ducks
        for (const d of ducks) {
            d.t -= dt;
            const dx = d.tx - d.x;
            const dy = d.ty - d.y;
            const dist = Math.hypot(dx, dy);
            if (d.t <= 0 || dist < 1) {
                d.t = 3 + R() * 5;
                for (let k = 0; k < 10; k++) {
                    const x = d.x + (R() - 0.5) * 70;
                    const y = d.y + (R() - 0.5) * 40;
                    if (inPond(x, y)) {
                        d.tx = x;
                        d.ty = y;
                        break;
                    }
                }
            } else {
                const sp = 9 * dt;
                const nx = d.x + (dx / dist) * sp;
                const ny = d.y + (dy / dist) * sp;
                if (inPond(nx, ny)) {
                    d.x = nx;
                    d.y = ny;
                } else d.t = 0;
                if (Math.abs(dx) > 0.5) d.dir = dx > 0 ? "right" : "left";
                if (R() < dt * 0.7) ripples.push({ x: d.x - (d.dir === "right" ? 5 : -5), y: d.y + 2, r: 1, life: 1.2 });
            }
        }
        if (R() < dt * 0.35) {
            const x = M.pond.cx + (R() - 0.5) * M.pond.rx * 1.4;
            const y = M.pond.cy + (R() - 0.5) * M.pond.ry * 1.4;
            if (inPond(x, y)) {
                ripples.push({ x, y, r: 1, life: 1.6 });
                particles.push({ k: "fish", x, y, vx: (R() - 0.5) * 20, vy: -40, life: 0.7, max: 0.7, gy: y });
            }
        }
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.life -= dt;
            r.r += dt * 7;
            if (r.life <= 0) ripples.splice(i, 1);
        }

        // pigeons scatter when you walk through them
        for (const p of pigeons) {
            if (p.state === "ground") {
                p.t -= dt;
                p.peck = Math.max(0, p.peck - dt);
                if (p.t <= 0) {
                    p.t = 0.6 + R() * 2.5;
                    if (R() < 0.5) p.peck = 0.3;
                    else {
                        const nx = p.x + (R() - 0.5) * 10;
                        const ny = p.y + (R() - 0.5) * 6;
                        if (!blocked(nx, ny)) {
                            p.dir = nx > p.x ? "right" : "left";
                            p.x = nx;
                            p.y = ny;
                        }
                    }
                }
                if (Math.hypot(player.x - p.x, player.y - p.y) < (player.running ? 48 : 30)) {
                    p.state = "fly";
                    p.vx = (p.x > player.x ? 1 : -1) * (50 + R() * 40);
                    p.vy = -(15 + R() * 20);
                    p.dir = p.vx > 0 ? "right" : "left";
                    p.t = 5;
                }
            } else {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.alt = Math.min(60, p.alt + dt * 70);
                p.t -= dt;
                if (p.t <= 0) {
                    const [x, y] = plazaSpot();
                    if (Math.hypot(player.x - x, player.y - y) > 140) {
                        Object.assign(p, { x, y, state: "ground", alt: 0, t: 1 });
                    } else p.t = 1;
                }
            }
        }

        // butterflies
        for (const b of butterflies) {
            b.vx += (R() - 0.5) * 220 * dt + (b.hx - b.x) * 0.4 * dt;
            b.vy += (R() - 0.5) * 220 * dt + (b.hy - b.y) * 0.4 * dt;
            const pd = Math.hypot(b.x - player.x, b.y - player.y);
            if (pd < 26) {
                b.vx += ((b.x - player.x) / pd) * 160 * dt;
                b.vy += ((b.y - player.y) / pd) * 160 * dt;
            }
            const sp = Math.hypot(b.vx, b.vy);
            if (sp > 30) {
                b.vx *= 30 / sp;
                b.vy *= 30 / sp;
            }
            b.x += b.vx * dt;
            b.y += b.vy * dt;
        }

        // falling leaves / petals from on-screen trees
        if ((leafT -= dt) < 0) {
            leafT = 0.22;
            const vis = swayTrees.filter((o) => o.x > cam.x - 20 && o.x < cam.x + cam.vw + 20 && o.y > cam.y && o.y < cam.y + cam.vh + 40);
            if (vis.length) {
                const o = vis[Math.floor(R() * vis.length)];
                const pal = o.spr.pal;
                if (pal && (o.kind !== "oak" || R() < 0.4)) {
                    particles.push({
                        k: "leaf",
                        x: o.x + (R() - 0.5) * 26,
                        y: o.y - 40 + R() * 16,
                        gy: o.y + (R() - 0.3) * 16,
                        vx: 0,
                        vy: 9 + R() * 6,
                        c: pal[2 + Math.floor(R() * 3)],
                        ph: R() * 6,
                        life: 9,
                        max: 9,
                    });
                }
            }
        }
        // fountain spray
        for (let k = 0; k < 3; k++)
            particles.push({ k: "drop", x: M.fountainTop.x + (R() - 0.5) * 2, y: M.fountainTop.y, vx: (R() - 0.5) * 34, vy: -40 - R() * 22, life: 2, max: 2, gy: M.basinY - R() * 6 });
        // chimney smoke
        if ((smokeT -= dt) < 0) {
            smokeT = 0.35;
            particles.push({ k: "smoke", x: M.chimney.x + (R() - 0.5) * 3, y: M.chimney.y, vx: 5 + R() * 3, vy: -9 - R() * 4, life: 3.4, max: 3.4 });
        }
        // embers
        if (R() < dt * 6)
            particles.push({ k: "ember", x: M.campfire.x + (R() - 0.5) * 6, y: M.campfire.y - 4, vx: (R() - 0.5) * 8, vy: -14 - R() * 10, life: 1.4, max: 1.4 });

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= dt;
            if (p.k === "drop") {
                p.vy += 130 * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.vy > 0 && p.y > p.gy) p.life = 0;
            } else if (p.k === "fish") {
                p.vy += 120 * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.vy > 0 && p.y > p.gy) {
                    p.life = 0;
                    ripples.push({ x: p.x, y: p.gy, r: 1, life: 1.2 });
                }
            } else if (p.k === "leaf") {
                if (p.y < p.gy) {
                    p.x += Math.sin(t * 2.5 + p.ph) * 14 * dt + 4 * dt;
                    p.y += p.vy * dt;
                } else p.life = Math.min(p.life, 2.5);
            } else {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
            }
            if (p.life <= 0) particles.splice(i, 1);
        }
        for (const c of clouds) {
            c.x += c.v * dt;
            c.y += c.v * 0.35 * dt;
            if (c.x > W + 40) c.x = -260;
            if (c.y > H + 40) c.y = -160;
        }

        // nearest interactable
        let best = null;
        let bd = Infinity;
        if (!paused)
            for (const it of allInteractables()) {
                const d = Math.hypot(it.x - player.x, it.y - player.y);
                if (d < it.r && d < bd) {
                    bd = d;
                    best = it;
                }
            }
        near = best;
        const key = best ? best.id : null;
        if (key !== lastPromptKey) {
            lastPromptKey = key;
            onPrompt(best ? { id: best.id, label: best.label } : null);
        }

        // camera
        const tx = player.x - cam.vw / 2;
        const ty = player.y - 10 - cam.vh / 2;
        const k = 1 - Math.pow(0.002, dt);
        cam.x += (tx - cam.x) * k;
        cam.y += (ty - cam.y) * k;
        cam.x = cam.vw >= W ? (W - cam.vw) / 2 : Math.max(0, Math.min(W - cam.vw, cam.x));
        cam.y = cam.vh >= H ? (H - cam.vh) / 2 : Math.max(0, Math.min(H - cam.vh, cam.y));

        if ((saveT -= dt) < 0) {
            saveT = 2;
            savePos();
        }
    }

    function wander(n, rad, speed, dt) {
        n.t -= dt;
        if (n.tx === undefined || n.t <= 0) {
            n.t = 1.5 + R() * 3.5;
            if (R() < 0.45) {
                n.tx = null;
            } else {
                n.tx = n.hx + (R() - 0.5) * 2 * rad;
                n.ty = n.hy + (R() - 0.5) * 2 * rad * 0.6;
            }
        }
        if (n.tx == null) {
            n.moving = false;
            return;
        }
        const dx = n.tx - n.x;
        const dy = n.ty - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 2) {
            n.tx = null;
            n.moving = false;
            return;
        }
        const sp = speed * dt;
        const ok = move(n, (dx / d) * sp, (dy / d) * sp);
        if (!ok) n.tx = null;
        n.moving = ok;
        n.dist += sp;
        if (n.frames) n.dir = dirOf(dx, dy, n.dir);
        else if (Math.abs(dx) > 0.3) n.dir = dx > 0 ? "right" : "left";
    }

    // ---------- draw ----------
    const shadow = (() => {
        const c = document.createElement("canvas");
        c.width = 12;
        c.height = 4;
        const x = c.getContext("2d");
        x.fillStyle = "rgba(10,25,12,0.32)";
        x.fillRect(2, 0, 8, 4);
        x.fillRect(0, 1, 12, 2);
        return c;
    })();

    const drawChar = (frames, e) => {
        const f = e.moving ? ANIM[Math.floor(e.dist / 6) % 4] : 0;
        const img = frames[e.dir][f];
        const x = Math.round(e.x);
        const y = Math.round(e.y);
        ctx.drawImage(shadow, x - 6, y - 2);
        ctx.drawImage(img, x - 8, y - 21);
    };

    const drawObj = (o) => {
        const s = o.spr;
        const x = o.x - s.ox;
        const y = o.y - s.oy;
        if (s.trunk) {
            ctx.drawImage(s.trunk, x, y);
            const sw = Math.round(Math.sin(t * 1.3 + o.phase) * 0.75);
            ctx.drawImage(s.canopy, x + sw, y);
        } else ctx.drawImage(s.body, x, y);
    };

    const drawables = [];
    function draw() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#1d3a22";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = Math.round(cam.x);
        const cy = Math.round(cam.y);
        const vw = Math.ceil(cam.vw) + 1;
        const vh = Math.ceil(cam.vh) + 1;
        ctx.setTransform(zoom, 0, 0, zoom, -cx * zoom, -cy * zoom);
        const sx = Math.max(0, cx);
        const sy = Math.max(0, cy);
        ctx.drawImage(M.ground, sx, sy, Math.min(vw, W - sx), Math.min(vh, H - sy), sx, sy, Math.min(vw, W - sx), Math.min(vh, H - sy));

        const visible = (x, y, m = 60) => x > cx - m && x < cx + vw + m && y > cy - 10 && y < cy + vh + m + 40;

        // water sparkles + ripples
        for (const s of M.sparkles) {
            if (!visible(s.x, s.y, 4)) continue;
            const v = Math.sin(t * s.sp + s.ph);
            if (v > 0.82) {
                ctx.fillStyle = `rgba(225,244,255,${Math.min(1, (v - 0.82) * 6)})`;
                ctx.fillRect(s.x, s.y, v > 0.95 ? 3 : 2, 1);
            }
        }
        for (const r of ripples) {
            ctx.fillStyle = `rgba(220,240,255,${Math.min(0.8, r.life)})`;
            const n = Math.max(8, Math.floor(r.r * 3));
            for (let i = 0; i < n; i++) {
                const a = (i / n) * Math.PI * 2;
                ctx.fillRect(Math.round(r.x + Math.cos(a) * r.r * 1.6), Math.round(r.y + Math.sin(a) * r.r * 0.7), 1, 1);
            }
        }
        if (target && !paused) {
            const pts = [{ x: player.x, y: player.y }, ...target.path.slice(target.i)];
            let carry = 8 - ((t * 24) % 8);
            for (let k = 0; k < pts.length - 1; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                const len = Math.hypot(b.x - a.x, b.y - a.y);
                for (let s = carry; s < len; s += 8) {
                    const x = Math.round(a.x + ((b.x - a.x) * s) / len);
                    const y = Math.round(a.y + ((b.y - a.y) * s) / len);
                    ctx.fillStyle = "rgba(26,20,32,0.55)";
                    ctx.fillRect(x - 1, y - 1, 4, 4);
                    ctx.fillStyle = "#fde047";
                    ctx.fillRect(x, y, 2, 2);
                }
                carry = (carry - len) % 8;
                if (carry < 0) carry += 8;
            }
            const end = pts[pts.length - 1];
            const pr = 3 + ((t * 6) % 4);
            ctx.fillStyle = "#fde047";
            for (let k = 0; k < 12; k++) {
                const a = (k / 12) * Math.PI * 2;
                ctx.fillRect(Math.round(end.x + Math.cos(a) * pr * 1.5), Math.round(end.y + Math.sin(a) * pr * 0.7), 1, 1);
            }
        }
        for (const d of ducks) {
            const f = Math.floor(t * 2 + d.x) % 2;
            ctx.drawImage(S.duck[d.dir][f], Math.round(d.x) - 6, Math.round(d.y) - 7);
        }

        // y-sorted world
        drawables.length = 0;
        for (const o of M.objects) {
            const s = o.spr;
            if (o.x + s.w - s.ox < cx || o.x - s.ox > cx + vw || o.y < cy || o.y - s.oy > cy + vh) continue;
            drawables.push(o);
        }
        for (const n of npcs) if (visible(n.x, n.y)) drawables.push(n);
        for (const p of pigeons) if (p.state === "ground" && visible(p.x, p.y)) drawables.push(p);
        drawables.push(player);
        drawables.sort((a, b) => a.y - b.y);
        for (const d of drawables) {
            if (d === player) drawChar(S.player, player);
            else if (d === dog) {
                const f = d.moving ? Math.floor(d.dist / 5) % 2 : 0;
                ctx.drawImage(shadow, Math.round(d.x) - 6, Math.round(d.y) - 2);
                ctx.drawImage(S.dog[d.dir][f], Math.round(d.x) - 9, Math.round(d.y) - 12);
            } else if (d.frames) drawChar(d.frames, d);
            else if (d.state) {
                const f = d.peck > 0 ? 1 : 0;
                ctx.drawImage(S.pigeon[d.dir][f], Math.round(d.x) - 4, Math.round(d.y) - 7);
            } else drawObj(d);
        }
        drawObj(M.beam);

        // campfire flames
        {
            const fx = M.campfire.x;
            const fy = M.campfire.y;
            if (visible(fx, fy)) {
                const g = ctx.createRadialGradient(fx, fy - 4, 2, fx, fy - 4, 34);
                g.addColorStop(0, "rgba(255,170,60,0.28)");
                g.addColorStop(1, "rgba(255,170,60,0)");
                ctx.fillStyle = g;
                ctx.fillRect(fx - 34, fy - 38, 68, 68);
                const cols = ["#fff3b0", "#fcd34d", "#fb923c", "#ef4444"];
                for (let i = 0; i < 22; i++) {
                    const h = Math.floor(Math.abs(Math.sin(t * 9 + i * 1.7)) * 9);
                    const xo = Math.round(Math.sin(i * 2.4) * (4 - h * 0.35));
                    ctx.fillStyle = cols[Math.min(3, Math.floor(h / 2.5))];
                    ctx.fillRect(fx + xo, fy - 2 - h, 1, 1);
                }
                ctx.fillStyle = "#fde68a";
                ctx.fillRect(fx - 1, fy - 3, 2, 2);
            }
        }

        // particles & flyers
        for (const p of particles) {
            const a = Math.max(0, Math.min(1, p.life / Math.min(p.max, 1)));
            if (p.k === "drop") {
                ctx.fillStyle = "rgba(219,239,255,0.9)";
                ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
            } else if (p.k === "fish") {
                ctx.fillStyle = "#f97316";
                ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 3, 1);
            } else if (p.k === "leaf") {
                ctx.globalAlpha = a;
                ctx.fillStyle = p.c;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.sin(t * 5 + p.ph) > 0 ? 2 : 1, 1);
                ctx.globalAlpha = 1;
            } else if (p.k === "smoke") {
                const age = 1 - p.life / p.max;
                const s = 1 + Math.floor(age * 4);
                ctx.fillStyle = `rgba(200,205,212,${0.55 * (1 - age)})`;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
            } else if (p.k === "dust") {
                ctx.fillStyle = `rgba(214,190,140,${0.6 * a})`;
                ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 2, 1);
            } else if (p.k === "ember") {
                ctx.fillStyle = `rgba(253,186,116,${a})`;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
            }
        }
        for (const p of pigeons)
            if (p.state === "fly") ctx.drawImage(S.pigeon[p.dir][2], Math.round(p.x) - 4, Math.round(p.y - p.alt) - 7);
        for (const b of butterflies) {
            if (!visible(b.x, b.y)) continue;
            const f = Math.sin(t * 14 + b.ph) > 0 ? 0 : 1;
            ctx.drawImage(S.butterfly[b.c][f], Math.round(b.x) - 3, Math.round(b.y - b.alt - Math.sin(t * 3 + b.ph) * 2));
        }

        // drifting cloud shadows
        for (const c of clouds) ctx.drawImage(c.s, Math.round(c.x), Math.round(c.y), c.s.width * 1.6, c.s.height * 1.6);

        // bouncing marker over the nearest interactable
        if (near && !paused) {
            const bx = Math.round(near.x);
            const by = Math.round((near.npc ? near.npc.y - (near.npc === dog ? 16 : 28) : near.top) - 6 + Math.sin(t * 6) * 1.5);
            ctx.fillStyle = "#1a1420";
            ctx.fillRect(bx - 4, by - 1, 9, 2);
            ctx.fillRect(bx - 3, by + 1, 7, 2);
            ctx.fillRect(bx - 2, by + 3, 5, 1);
            ctx.fillStyle = "#fde047";
            ctx.fillRect(bx - 3, by, 7, 1);
            ctx.fillRect(bx - 2, by + 1, 5, 1);
            ctx.fillRect(bx - 1, by + 2, 3, 1);
            ctx.fillRect(bx, by + 3, 1, 1);
        }

        // nameplates in screen space
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const fs = Math.max(8, Math.round(9 * dpr));
        ctx.font = `${fs}px "Press Start 2P", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        for (const p of M.plates) {
            const d = Math.hypot(p.x - player.x, p.y + 40 - player.y);
            if (d > 200) continue;
            const a = Math.min(1, (200 - d) / 60);
            const sx2 = (p.x - cx) * zoom;
            const sy2 = (p.y - cy) * zoom + Math.sin(t * 2 + p.x) * dpr * 1.5;
            ctx.globalAlpha = a;
            ctx.lineWidth = 4 * dpr;
            ctx.strokeStyle = "rgba(10,12,20,0.85)";
            ctx.strokeText(p.text, sx2, sy2);
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, sx2, sy2);
        }
        ctx.globalAlpha = 1;

        // off-screen landmark arrows, clamped to an ellipse so they stay clear of the HUD corners
        const W2 = canvas.width / 2;
        const H2 = canvas.height / 2;
        const erx = W2 - 90 * dpr;
        const ery = H2 - 80 * dpr;
        const pad = 30 * dpr;
        ctx.font = `${Math.max(8, Math.round(8 * dpr))}px "Press Start 2P", monospace`;
        for (const L of landmarkList) {
            const lx = (L.x - cx) * zoom;
            const ly = (L.y - 20 - cy) * zoom;
            if (lx > pad && lx < canvas.width - pad && ly > pad && ly < canvas.height - pad) continue;
            const a = Math.atan2(ly - H2, lx - W2);
            const k = 1 / Math.sqrt((Math.cos(a) / erx) ** 2 + (Math.sin(a) / ery) ** 2);
            const ax = W2 + Math.cos(a) * k;
            const ay = H2 + Math.sin(a) * k;
            ctx.globalAlpha = visitedZones.has(L.zone) ? 0.5 : 1;
            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(a);
            const s = 13 * dpr;
            ctx.beginPath();
            ctx.moveTo(s, 0);
            ctx.lineTo(-s * 0.7, -s * 0.8);
            ctx.lineTo(-s * 0.25, 0);
            ctx.lineTo(-s * 0.7, s * 0.8);
            ctx.closePath();
            ctx.lineWidth = 3 * dpr;
            ctx.strokeStyle = "#1a1420";
            ctx.stroke();
            ctx.fillStyle = L.color;
            ctx.fill();
            ctx.restore();
            const tx2 = ax - Math.cos(a) * 38 * dpr;
            const ty2 = ay - Math.sin(a) * 26 * dpr;
            const label = L.hint.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
            ctx.lineWidth = 4 * dpr;
            ctx.strokeStyle = "rgba(10,12,20,0.9)";
            ctx.strokeText(label, tx2, ty2);
            ctx.fillStyle = L.color;
            ctx.fillText(label, tx2, ty2);
        }
        ctx.globalAlpha = 1;
    }

    // ---------- minimap ----------
    const mm = minimap ? minimap.getContext("2d") : null;
    let mmBase = null;
    if (mm) {
        mmBase = document.createElement("canvas");
        mmBase.width = minimap.width;
        mmBase.height = minimap.height;
        const b = mmBase.getContext("2d");
        b.imageSmoothingEnabled = true;
        b.drawImage(M.ground, 0, 0, mmBase.width, mmBase.height);
        const sxm = mmBase.width / W;
        const sym = mmBase.height / H;
        for (const o of M.objects) {
            if (isTree(o.kind)) {
                b.fillStyle = o.kind === "blossom" ? "#e889ad" : o.kind === "autumn" ? "#c96d1f" : "#1f4a2a";
                b.fillRect(o.x * sxm - 1.5, (o.y - 14) * sym - 1.5, 3, 3);
            } else if (["gazebo", "cabin", "fountain", "billboard"].includes(o.kind)) {
                b.fillStyle = "#e7dcc6";
                b.fillRect(o.x * sxm - 3, o.y * sym - 4, 6, 4);
            }
        }
    }
    const MM_DOTS = landmarkList.map((L) => ({ it: L, c: L.color, zone: L.zone }));
    let visitedZones = new Set();
    function drawMinimap() {
        if (!mm) return;
        const w = minimap.width;
        const h = minimap.height;
        mm.drawImage(mmBase, 0, 0);
        const sxm = w / W;
        const sym = h / H;
        mm.strokeStyle = "rgba(255,255,255,0.7)";
        mm.lineWidth = 1;
        mm.strokeRect(Math.round(cam.x * sxm) + 0.5, Math.round(cam.y * sym) + 0.5, Math.round(cam.vw * sxm), Math.round(cam.vh * sym));
        for (const d of MM_DOTS) {
            mm.fillStyle = "#0b0d14";
            mm.beginPath();
            mm.arc(d.it.x * sxm, d.it.y * sym, 4.5, 0, Math.PI * 2);
            mm.fill();
            mm.fillStyle = d.c;
            mm.globalAlpha = visitedZones.has(d.zone) ? 0.45 : 1;
            mm.beginPath();
            mm.arc(d.it.x * sxm, d.it.y * sym, 3, 0, Math.PI * 2);
            mm.fill();
            mm.globalAlpha = 1;
        }
        if (Math.floor(t * 3) % 2 === 0 || player.moving) {
            mm.fillStyle = "#0b0d14";
            mm.fillRect(player.x * sxm - 3, player.y * sym - 3, 6, 6);
            mm.fillStyle = "#ffffff";
            mm.fillRect(player.x * sxm - 2, player.y * sym - 2, 4, 4);
        }
    }

    const savePos = () => {
        try {
            sessionStorage.setItem("park-pos", JSON.stringify({ x: player.x, y: player.y, dir: player.dir }));
        } catch (e) {
            /* storage unavailable */
        }
    };

    // ---------- loop ----------
    let raf;
    let last = performance.now();
    const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
        last = now;
        update(dt);
        draw();
        if ((mmT -= dt) < 0) {
            mmT = 0.1;
            drawMinimap();
        }
    };
    raf = requestAnimationFrame(loop);

    return {
        setPaused(p) {
            paused = p;
            if (p) {
                keys.clear();
                target = null;
            }
        },
        setJoy(x, y) {
            joy.x = x;
            joy.y = y;
        },
        interact: () => doInteract(),
        setVisited(set) {
            visitedZones = set;
        },
        zoom: (d) => setZoomBias(zoomBias + d),
        landmarks: landmarkList.map(({ zone, label, hint, color, x, y }) => ({ zone, label, hint, color, x, y })),
        size: { w: W, h: H },
        getPlayer: () => ({ x: player.x, y: player.y }),
        travelTo(zone) {
            const L = landmarkList.find((l) => l.zone === zone);
            if (L) setTravel(L.x, L.y, L.it, true);
        },
        // illustrated overview: ground plus every object sprite, scaled down
        drawFullMap(cv) {
            const c = cv.getContext("2d");
            const k = cv.width / W;
            c.imageSmoothingEnabled = true;
            c.drawImage(M.ground, 0, 0, cv.width, cv.height);
            const objs = M.objects.slice().sort((a, b) => a.y - b.y);
            for (const o of objs) {
                const s = o.spr;
                const x = (o.x - s.ox) * k;
                const y = (o.y - s.oy) * k;
                if (s.trunk) {
                    c.drawImage(s.trunk, x, y, s.w * k, s.h * k);
                    c.drawImage(s.canopy, x, y, s.w * k, s.h * k);
                } else c.drawImage(s.body, x, y, s.w * k, s.h * k);
            }
            const b = M.beam.spr;
            c.drawImage(b.body, (M.beam.x - b.ox) * k, (M.beam.y - b.oy) * k, b.w * k, b.h * k);
        },
        destroy() {
            savePos();
            cancelAnimationFrame(raf);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("wheel", onWheel);
        },
    };
}
