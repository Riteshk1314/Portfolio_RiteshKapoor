import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { ArrowLeft, X } from "lucide-react";
import WorldPanel from "@/components/WorldPanel";

const ZONES = [
    { id: "projects", label: "PROJECTS", color: "#38bdf8", hex: 0x38bdf8, x: -28, z: -18 },
    { id: "experience", label: "EXPERIENCE", color: "#f59e0b", hex: 0xf59e0b, x: 28, z: -18 },
    { id: "skills", label: "SKILLS", color: "#818cf8", hex: 0x818cf8, x: -28, z: 18 },
    { id: "about", label: "ABOUT", color: "#34d399", hex: 0x34d399, x: 28, z: 18 },
    { id: "contact", label: "CONTACT", color: "#f472b6", hex: 0xf472b6, x: 0, z: 0 },
];

function makeLabel(text, color) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.font = "700 58px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(c);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    spr.scale.set(13, 3.25, 1);
    return spr;
}

export default function World() {
    const mountRef = useRef(null);
    const [activeZone, setActiveZone] = useState(null);
    const [panel, setPanel] = useState(null);
    const [visited, setVisited] = useState(new Set());
    const activeRef = useRef(null);
    const visitedRef = useRef(new Set());
    const keys = useRef({});
    const panelOpenRef = useRef(false);
    const touch = useMemo(
        () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
        []
    );

    useEffect(() => {
        panelOpenRef.current = !!panel;
    }, [panel]);

    useEffect(() => {
        const mount = mountRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x07080c);
        scene.fog = new THREE.Fog(0x07080c, 45, 115);
        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            300
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0x8fa3c7, 0x0b0d14, 1.0));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
        dirLight.position.set(24, 36, 12);
        scene.add(dirLight);

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(140, 140),
            new THREE.MeshStandardMaterial({ color: 0x0b0e17, roughness: 1 })
        );
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);
        const grid = new THREE.GridHelper(140, 70, 0x1c2436, 0x111726);
        grid.position.y = 0.02;
        scene.add(grid);

        // stars
        const starPos = new Float32Array(700 * 3);
        for (let i = 0; i < 700; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 220;
            starPos[i * 3 + 1] = 25 + Math.random() * 90;
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 220;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x475569, size: 0.35 })));

        // zone pads
        const rings = [];
        const sprites = [];
        ZONES.forEach((z) => {
            const pad = new THREE.Mesh(
                new THREE.CylinderGeometry(6, 6, 0.12, 48),
                new THREE.MeshStandardMaterial({ color: 0x0f1420, emissive: z.hex, emissiveIntensity: 0.25 })
            );
            pad.position.set(z.x, 0.06, z.z);
            scene.add(pad);
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(6.5, 0.09, 8, 64),
                new THREE.MeshBasicMaterial({ color: z.hex, transparent: true, opacity: 0.8 })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(z.x, 0.15, z.z);
            scene.add(ring);
            rings.push(ring);
            const label = makeLabel(z.label, z.color);
            label.position.set(z.x, 6.5, z.z);
            scene.add(label);
            sprites.push(label);
            const beacon = new THREE.PointLight(z.hex, 25, 30);
            beacon.position.set(z.x, 5, z.z);
            scene.add(beacon);
        });

        // car
        const car = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.55, 4.2),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.55, roughness: 0.35 })
        );
        body.position.y = 0.62;
        car.add(body);
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.5, 2),
            new THREE.MeshStandardMaterial({ color: 0x0f111a, metalness: 0.4, roughness: 0.3 })
        );
        cabin.position.set(0, 1.08, -0.2);
        car.add(cabin);
        const wheels = [];
        [
            [1.05, 1.4],
            [-1.05, 1.4],
            [1.05, -1.4],
            [-1.05, -1.4],
        ].forEach(([x, z]) => {
            const w = new THREE.Mesh(
                new THREE.CylinderGeometry(0.38, 0.38, 0.32, 18),
                new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.8 })
            );
            w.rotation.z = Math.PI / 2;
            w.position.set(x, 0.38, z);
            car.add(w);
            wheels.push(w);
        });
        [
            [0.6, 2.12, 0xfff2c4],
            [-0.6, 2.12, 0xfff2c4],
            [0.6, -2.12, 0xff5470],
            [-0.6, -2.12, 0xff5470],
        ].forEach(([x, z, c]) => {
            const l = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.12, 0.06),
                new THREE.MeshBasicMaterial({ color: c })
            );
            l.position.set(x, 0.62, z);
            car.add(l);
        });
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1.9, 24),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.03;
        car.add(shadow);
        car.position.set(0, 0, 34);
        scene.add(car);

        // decorative obstacles (deterministic, kept clear of pads and spawn lane)
        let seed = 42;
        const rand = () => {
            seed = (seed * 16807) % 2147483647;
            return seed / 2147483647;
        };
        const obstacles = [];
        let placed = 0;
        while (placed < 26) {
            const x = (rand() - 0.5) * 110;
            const z = (rand() - 0.5) * 110;
            if (Math.abs(x) < 6 && z > 20) continue; // keep spawn lane clear
            if (ZONES.some((zo) => Math.hypot(x - zo.x, z - zo.z) < 11)) continue;
            const isTree = rand() > 0.4;
            const g = new THREE.Group();
            if (isTree) {
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.18, 0.24, 1.1, 8),
                    new THREE.MeshStandardMaterial({ color: 0x3d2f22 })
                );
                trunk.position.y = 0.55;
                const leaves = new THREE.Mesh(
                    new THREE.ConeGeometry(1.1, 2.6, 8),
                    new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 })
                );
                leaves.position.y = 2.2;
                g.add(trunk, leaves);
            } else {
                const rock = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(0.7 + rand() * 0.6, 0),
                    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 1, flatShading: true })
                );
                rock.position.y = 0.5;
                g.add(rock);
            }
            g.position.set(x, 0, z);
            scene.add(g);
            obstacles.push({ x, z, r: 1.2 });
            placed++;
        }

        // state
        let speed = 0;
        let heading = Math.PI;
        const dirV = new THREE.Vector3();
        const camTarget = new THREE.Vector3();
        const lookTarget = new THREE.Vector3();
        const clock = new THREE.Clock();
        let raf;

        const clampPos = (v, a, b) => Math.max(a, Math.min(b, v));

        function tick() {
            raf = requestAnimationFrame(tick);
            const dt = Math.min(clock.getDelta(), 0.05);
            const k = keys.current;
            const fwd = (k.ArrowUp || k.KeyW ? 1 : 0) - (k.ArrowDown || k.KeyS ? 1 : 0);
            const turn = (k.ArrowLeft || k.KeyA ? 1 : 0) - (k.ArrowRight || k.KeyD ? 1 : 0);

            speed += fwd * 30 * dt;
            speed -= speed * 1.7 * dt;
            speed = THREE.MathUtils.clamp(speed, -12, 26);
            if (Math.abs(speed) > 0.4) {
                heading +=
                    turn * 2.0 * dt * Math.sign(speed) * Math.min(1, Math.abs(speed) / 12);
            }
            dirV.set(Math.sin(heading), 0, Math.cos(heading));
            car.position.addScaledVector(dirV, speed * dt);
            car.position.x = clampPos(car.position.x, -58, 58);
            car.position.z = clampPos(car.position.z, -58, 58);

            for (const o of obstacles) {
                const dx = car.position.x - o.x;
                const dz = car.position.z - o.z;
                const d2 = dx * dx + dz * dz;
                const r = o.r + 1.7;
                if (d2 < r * r && d2 > 0.0001) {
                    const d = Math.sqrt(d2);
                    car.position.x = o.x + (dx / d) * r;
                    car.position.z = o.z + (dz / d) * r;
                    speed *= 0.55;
                }
            }

            car.rotation.y = heading;
            body.rotation.z = THREE.MathUtils.lerp(body.rotation.z, -turn * 0.07 * Math.min(1, Math.abs(speed) / 15), 0.12);
            wheels.forEach((w) => (w.rotation.x += (speed * dt) / 0.38));

            camTarget.set(car.position.x - dirV.x * 10, 6, car.position.z - dirV.z * 10);
            camera.position.lerp(camTarget, 1 - Math.pow(0.0015, dt));
            lookTarget.set(car.position.x + dirV.x * 4, 1.2, car.position.z + dirV.z * 4);
            camera.lookAt(lookTarget);

            let nearest = null;
            let nd = Infinity;
            for (const z of ZONES) {
                const d = Math.hypot(car.position.x - z.x, car.position.z - z.z);
                if (d < nd) {
                    nd = d;
                    nearest = z;
                }
            }
            const inside = nd < 7.5 ? nearest.id : null;
            if (inside !== activeRef.current) {
                activeRef.current = inside;
                setActiveZone(inside);
                if (inside && !visitedRef.current.has(inside)) {
                    visitedRef.current.add(inside);
                    setVisited(new Set(visitedRef.current));
                }
            }

            const t = clock.elapsedTime;
            rings.forEach((r, i) => {
                r.rotation.z += dt * (i % 2 ? 0.5 : -0.5);
                r.material.opacity = 0.55 + Math.sin(t * 2 + i) * 0.25;
            });
            sprites.forEach((s, i) => (s.position.y = 6.5 + Math.sin(t * 1.4 + i) * 0.35));

            renderer.render(scene, camera);
        }
        tick();

        const onKeyDown = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
                e.preventDefault();
            keys.current[e.code] = true;
            if (e.key === "Enter" && activeRef.current && !panelOpenRef.current)
                setPanel(activeRef.current);
            if (e.key === "Escape") setPanel(null);
        };
        const onKeyUp = (e) => {
            keys.current[e.code] = false;
        };
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, []);

    const hold = (code) => ({
        onPointerDown: (e) => {
            e.preventDefault();
            keys.current[code] = true;
        },
        onPointerUp: () => (keys.current[code] = false),
        onPointerLeave: () => (keys.current[code] = false),
    });

    const activeLabel = ZONES.find((z) => z.id === activeZone)?.label;

    return (
        <div className="fixed inset-0 z-[60] bg-obsidian" data-testid="world-container">
            <div ref={mountRef} data-testid="world-canvas" className="absolute inset-0" />

            {/* top bar */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-4">
                <Link
                    to="/"
                    data-testid="world-back-button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-obsidian/70 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to site
                </Link>
                <div className="rounded-full border border-white/15 bg-obsidian/70 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md" data-testid="world-progress">
                    {visited.size}/{ZONES.length} zones explored
                </div>
            </div>

            {/* controls hint */}
            <div className="absolute bottom-6 left-6 z-10 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500 md:block">
                <p>WASD / Arrow keys — drive</p>
                <p className="mt-1">Enter — open zone · Esc — close</p>
            </div>

            {/* zone prompt */}
            {activeZone && !panel && (
                <div
                    data-testid="world-zone-prompt"
                    className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full border px-6 py-3 font-display text-sm font-bold backdrop-blur-md"
                    style={{
                        borderColor: `${ZONES.find((z) => z.id === activeZone).color}66`,
                        color: ZONES.find((z) => z.id === activeZone).color,
                        background: "rgba(7,8,12,0.75)",
                    }}
                >
                    Press ENTER to open {activeLabel}
                </div>
            )}

            {/* mobile / touch controls */}
            {touch && (
                <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center gap-2" data-testid="world-mobile-controls">
                    <button {...hold("ArrowUp")} aria-label="Drive forward" data-testid="world-btn-forward" className="h-14 w-14 rounded-xl border border-white/15 bg-obsidian/80 text-slate-200 backdrop-blur-md active:bg-cyan-500/30">▲</button>
                    <div className="flex gap-2">
                        <button {...hold("ArrowLeft")} aria-label="Steer left" data-testid="world-btn-left" className="h-14 w-14 rounded-xl border border-white/15 bg-obsidian/80 text-slate-200 backdrop-blur-md active:bg-cyan-500/30">◀</button>
                        <button {...hold("ArrowDown")} aria-label="Drive backward" data-testid="world-btn-back" className="h-14 w-14 rounded-xl border border-white/15 bg-obsidian/80 text-slate-200 backdrop-blur-md active:bg-cyan-500/30">▼</button>
                        <button {...hold("ArrowRight")} aria-label="Steer right" data-testid="world-btn-right" className="h-14 w-14 rounded-xl border border-white/15 bg-obsidian/80 text-slate-200 backdrop-blur-md active:bg-cyan-500/30">▶</button>
                    </div>
                    <button
                        data-testid="world-btn-enter"
                        onClick={() => activeZone && setPanel(activeZone)}
                        className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-md"
                    >
                        Enter zone
                    </button>
                </div>
            )}

            {/* zone panel */}
            {panel && (
                <div
                    className="absolute inset-0 z-20 grid place-items-center bg-obsidian/60 backdrop-blur-sm"
                    data-testid="world-panel-backdrop"
                    onClick={(e) => e.target === e.currentTarget && setPanel(null)}
                >
                    <div
                        data-testid="world-panel"
                        className="relative max-h-[78vh] w-[min(92vw,760px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f111a]/95 p-8 shadow-2xl"
                    >
                        <button
                            data-testid="world-panel-close"
                            onClick={() => setPanel(null)}
                            aria-label="Close panel"
                            className="absolute right-5 top-5 text-slate-500 transition-colors hover:text-slate-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <WorldPanel zone={panel} />
                    </div>
                </div>
            )}
        </div>
    );
}
