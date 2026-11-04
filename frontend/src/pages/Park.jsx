import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Plus, Minus, Map as MapIcon } from "lucide-react";
import WorldPanel from "@/components/WorldPanel";
import { createPark } from "@/park/engine";

const ZONES = ["projects", "experience", "skills", "about", "contact", "resume"];
const PIXEL = "font-['Press_Start_2P']";
const BODY = "font-['Pixelify_Sans']";

const readSession = (key, fallback) => {
    try {
        const v = sessionStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch (e) {
        return fallback;
    }
};
const writeSession = (key, v) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(v));
    } catch (e) {
        /* storage unavailable */
    }
};

function PixelBox({ children, className = "", ...rest }) {
    return (
        <div
            {...rest}
            className={`border-4 border-[#1a1420] bg-[#f4ead5] text-[#2a1d17] shadow-[inset_-4px_-4px_0_#d9c9a6,inset_4px_4px_0_#fffaf0,6px_6px_0_rgba(0,0,0,0.35)] ${className}`}
        >
            {children}
        </div>
    );
}

function Joystick({ onMove }) {
    const base = useRef(null);
    const [knob, setKnob] = useState({ x: 0, y: 0 });
    const id = useRef(null);
    const update = (e) => {
        const r = base.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const max = r.width / 2;
        const d = Math.hypot(dx, dy);
        if (d > max) {
            dx = (dx / d) * max;
            dy = (dy / d) * max;
        }
        setKnob({ x: dx, y: dy });
        onMove(dx / max, dy / max);
    };
    const end = () => {
        id.current = null;
        setKnob({ x: 0, y: 0 });
        onMove(0, 0);
    };
    return (
        <div
            ref={base}
            data-testid="park-joystick"
            className="relative h-32 w-32 touch-none rounded-full border-4 border-[#1a1420]/70 bg-[#f4ead5]/40"
            onPointerDown={(e) => {
                id.current = e.pointerId;
                e.currentTarget.setPointerCapture(e.pointerId);
                update(e);
            }}
            onPointerMove={(e) => id.current === e.pointerId && update(e)}
            onPointerUp={end}
            onPointerCancel={end}
        >
            <div
                className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-4 border-[#1a1420] bg-[#f4ead5]"
                style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
            />
        </div>
    );
}

function QuestLog({ landmarks, visited, open, onToggle, onGo }) {
    return (
        <PixelBox className="w-[200px] p-2 md:w-[230px]" data-testid="park-progress">
            <button onClick={onToggle} className={`${PIXEL} flex w-full items-center justify-between px-1 py-1 text-[9px]`} data-testid="park-questlog-toggle">
                <span>
                    LANDMARKS {visited.size}/{ZONES.length}
                </span>
                <span>{open ? "−" : "+"}</span>
            </button>
            {open && (
                <>
                    <ul className="mt-1 space-y-0.5">
                        {landmarks.map((L) => {
                            const done = visited.has(L.zone);
                            return (
                                <li key={L.zone}>
                                    <button
                                        data-testid={`park-goto-${L.zone}`}
                                        onClick={(e) => {
                                            e.currentTarget.blur();
                                            onGo(L.zone);
                                        }}
                                        className="group flex w-full items-center gap-2 px-1 py-1 text-left transition-colors hover:bg-[#e6d6b3]"
                                    >
                                        <span className="h-3 w-3 shrink-0 border-2 border-[#1a1420]" style={{ background: L.color }} />
                                        <span className={`${BODY} flex-1 text-[15px] leading-none ${done ? "opacity-55" : ""}`}>{L.hint}</span>
                                        <span className={`${PIXEL} text-[7px] ${done ? "" : "opacity-0 group-hover:opacity-100"}`}>{done ? "✓" : "GO ▶"}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <p className={`${BODY} mt-1 px-1 text-[13px] leading-tight text-[#7a5a3a]`}>Click one and you'll walk there.</p>
                </>
            )}
        </PixelBox>
    );
}

function BigMap({ engine, landmarks, visited, onGo, onClose }) {
    const ref = useRef(null);
    const [player, setPlayer] = useState(null);
    const size = engine.current?.size || { w: 1152, h: 768 };
    useEffect(() => {
        const e = engine.current;
        if (!e || !ref.current) return;
        e.drawFullMap(ref.current);
        setPlayer(e.getPlayer());
    }, [engine]);
    return (
        <div
            className="absolute inset-0 z-30 grid place-items-center bg-[#0b1220]/60 p-2 md:p-6"
            data-testid="park-bigmap"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <PixelBox className="relative w-[min(96vw,1060px)] p-3 md:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <h2 className={`${PIXEL} text-xs md:text-sm`}>PARK MAP</h2>
                        <p className={`${BODY} mt-1 text-base leading-tight md:text-lg`}>Click a place to walk straight there, or close the map and explore.</p>
                    </div>
                    <button onClick={onClose} aria-label="Close map" data-testid="park-bigmap-close" className="border-4 border-[#1a1420] bg-[#f4ead5] p-1">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="relative">
                    <canvas ref={ref} width={size.w} height={size.h} className="block h-auto w-full border-4 border-[#1a1420]" />
                    {landmarks.map((L) => (
                        <button
                            key={L.zone}
                            data-testid={`park-map-${L.zone}`}
                            onClick={() => onGo(L.zone)}
                            style={{ left: `${(L.x / size.w) * 100}%`, top: `${((L.y - 30) / size.h) * 100}%` }}
                            className={`${PIXEL} absolute -translate-x-1/2 -translate-y-full whitespace-nowrap border-[3px] border-[#1a1420] bg-[#f4ead5] px-1.5 py-1 text-[7px] shadow-[3px_3px_0_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-[calc(100%+3px)] md:px-2 md:text-[9px]`}
                        >
                            <span className="mr-1.5 inline-block h-2 w-2 border border-[#1a1420] align-middle" style={{ background: L.color }} />
                            {L.hint.toUpperCase()}
                            {visited.has(L.zone) ? " ✓" : ""}
                        </button>
                    ))}
                    {player && (
                        <div
                            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${(player.x / size.w) * 100}%`, top: `${((player.y - 8) / size.h) * 100}%` }}
                        >
                            <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/70" />
                            <span className={`${PIXEL} relative block border-[3px] border-[#1a1420] bg-white px-1 text-[7px]`}>YOU</span>
                        </div>
                    )}
                </div>
            </PixelBox>
        </div>
    );
}

export default function Park() {
    const canvasRef = useRef(null);
    const miniRef = useRef(null);
    const engine = useRef(null);
    const navigate = useNavigate();
    const [started, setStarted] = useState(() => readSession("park-started", false));
    const [prompt, setPrompt] = useState(null);
    const [dialog, setDialog] = useState(null);
    const [panel, setPanel] = useState(null);
    const [visited, setVisited] = useState(() => new Set(readSession("park-visited", [])));
    const [showMap, setShowMap] = useState(true);
    const [bigMap, setBigMap] = useState(false);
    const [landmarks, setLandmarks] = useState([]);
    const [questOpen, setQuestOpen] = useState(() => !window.matchMedia("(pointer: coarse)").matches);
    const touch = useMemo(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches, []);

    const visit = useCallback((zone) => {
        if (!zone) return;
        setVisited((prev) => {
            if (prev.has(zone)) return prev;
            const next = new Set(prev).add(zone);
            writeSession("park-visited", [...next]);
            return next;
        });
    }, []);

    useEffect(() => {
        const e = createPark({
            canvas: canvasRef.current,
            minimap: miniRef.current,
            startPos: readSession("park-pos", null),
            onPrompt: setPrompt,
            onAction: (a) => {
                if (a.type === "nav") return navigate(a.to);
                e.setPaused(true);
                if (a.type === "map") return setBigMap(true);
                if (a.type === "panel") {
                    setPanel(a.panel);
                    visit(a.zone);
                } else {
                    setDialog({ name: a.name, lines: a.lines, i: 0, onClose: a.onClose });
                    visit(a.zone);
                }
            },
        });
        engine.current = e;
        setLandmarks(e.landmarks);
        return () => e.destroy();
    }, [navigate, visit]);

    useEffect(() => {
        engine.current?.setVisited(visited);
    }, [visited]);

    useEffect(() => {
        engine.current?.setPaused(!started || !!dialog || !!panel || bigMap);
    }, [started, dialog, panel, bigMap]);

    const start = useCallback(() => {
        setStarted(true);
        writeSession("park-started", true);
        if (!readSession("park-map-seen", false)) {
            writeSession("park-map-seen", true);
            setBigMap(true);
        }
    }, []);

    const goTo = useCallback((zone) => {
        setBigMap(false);
        // resume first so the engine isn't paused when the walk starts
        engine.current?.setPaused(false);
        engine.current?.travelTo(zone);
    }, []);

    const advance = useCallback(() => {
        setDialog((d) => {
            if (!d) return d;
            if (d.i < d.lines.length - 1) return { ...d, i: d.i + 1 };
            d.onClose?.();
            return null;
        });
    }, []);

    const closePanel = useCallback(() => setPanel(null), []);

    // keyboard for overlays (attached after render, so the key that opened them doesn't also advance them)
    useEffect(() => {
        const onKey = (e) => {
            if (e.repeat) return;
            if (!started) {
                if (["Enter", "Space", "KeyE"].includes(e.code)) {
                    e.preventDefault();
                    start();
                }
                return;
            }
            if (dialog && ["Enter", "Space", "KeyE", "Escape"].includes(e.code)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (e.code === "Escape") {
                    dialog.onClose?.();
                    setDialog(null);
                } else advance();
            } else if (panel && e.code === "Escape") closePanel();
            else if (bigMap && (e.code === "Escape" || e.code === "KeyM")) {
                e.stopImmediatePropagation();
                setBigMap(false);
            } else if (!dialog && !panel && e.code === "KeyM") setBigMap(true);
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [started, dialog, panel, bigMap, advance, closePanel, start]);

    const line = dialog ? dialog.lines[dialog.i] : "";
    const [typed, setTyped] = useState(0);
    useEffect(() => {
        setTyped(0);
        if (!line) return;
        const id = setInterval(() => setTyped((n) => (n >= line.length ? (clearInterval(id), n) : n + 2)), 16);
        return () => clearInterval(id);
    }, [line]);

    return (
        <div className="fixed inset-0 z-[60] select-none overflow-hidden bg-[#1d3a22]" data-testid="park-container">
            <canvas ref={canvasRef} data-testid="park-canvas" className="absolute inset-0 h-full w-full" style={{ imageRendering: "pixelated" }} />
            {/* soft vignette */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_rgba(8,20,10,0.55)]" />

            {/* top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 md:p-4">
                <div className="pointer-events-auto flex flex-col gap-2">
                    <Link
                        to="/site"
                        data-testid="park-classic-site"
                        className={`${PIXEL} border-4 border-[#1a1420] bg-[#f4ead5] px-3 py-2 text-[9px] uppercase text-[#2a1d17] shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 md:text-[10px]`}
                    >
                        <span className="md:hidden">Classic site →</span>
                        <span className="hidden md:inline">Skip to classic site →</span>
                    </Link>
                    {started && (
                        <QuestLog
                            landmarks={landmarks}
                            visited={visited}
                            open={questOpen}
                            onToggle={() => setQuestOpen((o) => !o)}
                            onGo={goTo}
                        />
                    )}
                </div>
                <div className="pointer-events-auto flex flex-col items-end gap-2">
                    <div className={showMap ? "" : "hidden"}>
                        <PixelBox className="relative p-1">
                            <button onClick={() => started && setBigMap(true)} className="group block" aria-label="Open the park map" data-testid="park-minimap-open">
                                <canvas ref={miniRef} width={216} height={144} className="block h-[96px] w-[144px] md:h-[144px] md:w-[216px]" data-testid="park-minimap" />
                                <span className={`${PIXEL} absolute bottom-2 right-2 flex items-center gap-1 border-2 border-[#1a1420] bg-[#f4ead5] px-1 py-0.5 text-[7px] opacity-90 group-hover:opacity-100`}>
                                    <MapIcon className="h-3 w-3" /> MAP (M)
                                </span>
                            </button>
                        </PixelBox>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowMap((s) => !s)}
                            className={`${PIXEL} border-4 border-[#1a1420] bg-[#f4ead5] px-2 py-1 text-[8px] text-[#2a1d17] shadow-[3px_3px_0_rgba(0,0,0,0.35)]`}
                            data-testid="park-toggle-map"
                        >
                            {showMap ? "Hide minimap" : "Minimap"}
                        </button>
                        <button aria-label="Zoom out" onClick={() => engine.current?.zoom(-1)} className="border-4 border-[#1a1420] bg-[#f4ead5] p-1 text-[#2a1d17] shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
                            <Minus className="h-3 w-3" />
                        </button>
                        <button aria-label="Zoom in" onClick={() => engine.current?.zoom(1)} className="border-4 border-[#1a1420] bg-[#f4ead5] p-1 text-[#2a1d17] shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* controls hint */}
            {started && !touch && (
                <div className={`${PIXEL} pointer-events-none absolute bottom-4 left-4 z-10 space-y-1.5 text-[8px] leading-relaxed text-[#f4ead5] [text-shadow:2px_2px_0_#1a1420]`}>
                    <p>WASD / ARROWS — WALK · SHIFT — RUN</p>
                    <p>E / ENTER — INTERACT · CLICK — WALK THERE</p>
                    <p>M — PARK MAP · SCROLL — ZOOM</p>
                </div>
            )}

            {/* interaction prompt */}
            {started && prompt && !dialog && !panel && (
                <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 md:bottom-16" data-testid="park-prompt">
                    <PixelBox className={`${PIXEL} flex items-center gap-3 px-4 py-3 text-[10px]`}>
                        <span className="border-2 border-[#1a1420] bg-[#fde047] px-1.5 py-0.5">{touch ? "A" : "E"}</span>
                        {prompt.label}
                    </PixelBox>
                </div>
            )}

            {/* touch controls */}
            {started && touch && !panel && (
                <>
                    <div className="absolute bottom-6 left-6 z-10">
                        <Joystick onMove={(x, y) => engine.current?.setJoy(x, y)} />
                    </div>
                    <button
                        data-testid="park-btn-a"
                        onClick={() => (dialog ? advance() : engine.current?.interact())}
                        className={`${PIXEL} absolute bottom-10 right-6 z-10 grid h-20 w-20 place-items-center rounded-full border-4 border-[#1a1420] bg-[#fde047] text-lg text-[#1a1420] shadow-[4px_4px_0_rgba(0,0,0,0.35)] active:translate-y-0.5`}
                    >
                        A
                    </button>
                </>
            )}

            {/* dialog box */}
            {dialog && (
                <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-3" onClick={advance} data-testid="park-dialog">
                    <PixelBox className="relative w-[min(96vw,760px)] cursor-pointer px-5 pb-5 pt-6">
                        <div className={`${PIXEL} absolute -top-4 left-4 border-4 border-[#1a1420] bg-[#38bdf8] px-2 py-1 text-[9px] text-[#0b1220]`}>{dialog.name}</div>
                        <p className={`${BODY} min-h-[3.5em] text-lg leading-snug md:text-xl`}>{line.slice(0, typed)}</p>
                        <p className={`${PIXEL} mt-2 text-right text-[8px] text-[#7a5a3a]`}>
                            {dialog.i < dialog.lines.length - 1 ? "▼ NEXT" : "■ CLOSE"} ({touch ? "TAP" : "E"})
                        </p>
                    </PixelBox>
                </div>
            )}

            {/* landmark panel */}
            {panel && (
                <div
                    className="absolute inset-0 z-30 grid place-items-center bg-[#0b1220]/55 p-3 backdrop-blur-[2px]"
                    data-testid="park-panel-backdrop"
                    onClick={(e) => e.target === e.currentTarget && closePanel()}
                >
                    <div
                        data-testid="park-panel"
                        className="relative max-h-[82vh] w-[min(94vw,760px)] overflow-y-auto border-4 border-[#1a1420] bg-[#0f111a] p-6 text-slate-50 shadow-[inset_0_0_0_4px_#2b2f45,8px_8px_0_rgba(0,0,0,0.45)] md:p-8"
                    >
                        <button
                            data-testid="park-panel-close"
                            onClick={closePanel}
                            aria-label="Close panel"
                            className="absolute right-4 top-4 border-2 border-white/20 p-1 text-slate-400 transition-colors hover:text-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <WorldPanel zone={panel} />
                        <p className={`${PIXEL} mt-6 text-[8px] text-slate-500`}>ESC — BACK TO THE PARK</p>
                    </div>
                </div>
            )}

            {/* full park map */}
            {bigMap && <BigMap engine={engine} landmarks={landmarks} visited={visited} onGo={goTo} onClose={() => setBigMap(false)} />}

            {/* intro */}
            {!started && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-[#0b1a10]/60 p-4 backdrop-blur-[1px]" data-testid="park-intro">
                    <PixelBox className="w-[min(94vw,620px)] p-6 text-center md:p-10">
                        <p className={`${PIXEL} text-[9px] tracking-widest text-[#7a5a3a]`}>WELCOME TO</p>
                        <h1 className={`${PIXEL} mt-3 text-xl leading-relaxed md:text-3xl`}>RITESH KAPOOR'S PARK</h1>
                        <p className={`${BODY} mx-auto mt-4 max-w-md text-lg leading-snug md:text-xl`}>
                            A walkable portfolio. Visit each landmark to see projects, experience, skills and how to get in touch — the map and the landmark list will walk you anywhere.
                        </p>
                        <div className={`${PIXEL} mx-auto mt-6 grid max-w-sm grid-cols-2 gap-2 text-left text-[8px] leading-relaxed`}>
                            {touch ? (
                                <>
                                    <span>JOYSTICK</span>
                                    <span>WALK (PUSH FAR = RUN)</span>
                                    <span>A BUTTON</span>
                                    <span>INTERACT</span>
                                </>
                            ) : (
                                <>
                                    <span>WASD / ARROWS</span>
                                    <span>WALK</span>
                                    <span>SHIFT</span>
                                    <span>RUN</span>
                                    <span>E / ENTER</span>
                                    <span>INTERACT</span>
                                    <span>CLICK</span>
                                    <span>WALK THERE</span>
                                </>
                            )}
                        </div>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button
                                autoFocus
                                data-testid="park-start"
                                onClick={start}
                                className={`${PIXEL} border-4 border-[#1a1420] bg-[#22c55e] px-5 py-3 text-[10px] text-[#0b1a10] shadow-[4px_4px_0_#1a1420] transition-transform hover:-translate-y-0.5`}
                            >
                                ▶ START EXPLORING
                            </button>
                            <Link
                                to="/site"
                                data-testid="park-intro-classic"
                                className={`${PIXEL} border-4 border-[#1a1420] bg-[#f4ead5] px-5 py-3 text-[10px] shadow-[4px_4px_0_#1a1420] transition-transform hover:-translate-y-0.5`}
                            >
                                CLASSIC SITE
                            </Link>
                        </div>
                    </PixelBox>
                </div>
            )}
        </div>
    );
}
