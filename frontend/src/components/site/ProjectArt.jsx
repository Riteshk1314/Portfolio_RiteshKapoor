import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Live illustrations of what each project does, drawn in code instead of stock photos.

const SCRIPT = [
    ["planner", "route(task) → researcher, writer"],
    ["researcher", 'tool_call search("event ticket validation")'],
    ["researcher", "3 sources ranked · handing off"],
    ["writer", "streaming draft · token 214/512"],
    ["orchestrator", "aggregate(3 agents) → 1 response ✓"],
];
const AGENTS = {
    planner: { x: 80, y: 70, label: "Planner" },
    researcher: { x: 320, y: 70, label: "Researcher" },
    writer: { x: 200, y: 235, label: "Writer" },
    orchestrator: { x: 200, y: 140, label: "Orchestrator" },
};

export function AgentArt() {
    const [step, setStep] = useState(0);
    const [chars, setChars] = useState(0);
    useEffect(() => {
        const line = SCRIPT[step % SCRIPT.length][1];
        if (chars < line.length) {
            const id = setTimeout(() => setChars((c) => c + 1), 28);
            return () => clearTimeout(id);
        }
        const id = setTimeout(() => {
            setStep((s) => s + 1);
            setChars(0);
        }, 900);
        return () => clearTimeout(id);
    }, [chars, step]);
    const active = SCRIPT[step % SCRIPT.length][0];
    const history = Array.from({ length: 4 }, (_, k) => SCRIPT[(step - 4 + k + SCRIPT.length * 10) % SCRIPT.length]).slice(step < 4 ? 4 - step : 0);

    return (
        <div className="flex h-full flex-col">
            <svg viewBox="0 0 400 290" className="w-full flex-1" aria-hidden="true">
                {["planner", "researcher", "writer"].map((k) => (
                    <line
                        key={k}
                        x1={AGENTS.orchestrator.x}
                        y1={AGENTS.orchestrator.y}
                        x2={AGENTS[k].x}
                        y2={AGENTS[k].y}
                        className="flow-line"
                        stroke={active === k ? "#EF6A3E" : "rgba(237,232,222,0.25)"}
                        strokeWidth={active === k ? 2 : 1}
                    />
                ))}
                {Object.entries(AGENTS).map(([k, a]) => (
                    <g key={k}>
                        {active === k && (
                            <circle cx={a.x} cy={a.y} r="30" fill="none" stroke="#EF6A3E" strokeOpacity="0.5">
                                <animate attributeName="r" from="22" to="40" dur="1.2s" repeatCount="indefinite" />
                                <animate attributeName="stroke-opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                        )}
                        <circle cx={a.x} cy={a.y} r={k === "orchestrator" ? 24 : 20} fill={active === k ? "#EF6A3E" : "#24211c"} stroke="rgba(237,232,222,0.3)" />
                        <text x={a.x} y={a.y + (k === "writer" ? 40 : -32)} textAnchor="middle" fill="rgba(237,232,222,0.7)" fontFamily="Geist Mono, monospace" fontSize="11">
                            {a.label}
                        </text>
                    </g>
                ))}
            </svg>
            <div className="border-t border-bone/10 bg-ink/60 p-4 font-mono text-[11px] leading-relaxed md:text-xs">
                {history.map(([who, msg], i) => (
                    <p key={`${step}-${i}`} className="truncate text-bone/35">
                        <span className="text-bone/50">{who.padEnd(12, " ")}</span> {msg}
                    </p>
                ))}
                <p className="truncate text-bone">
                    <span className="text-ember">{active.padEnd(12, " ")}</span> {SCRIPT[step % SCRIPT.length][1].slice(0, chars)}
                    <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-ember align-middle" />
                </p>
            </div>
        </div>
    );
}

export function TicketArt() {
    const cells = useMemo(() => {
        const n = 17;
        const out = [];
        let s = 7;
        for (let y = 0; y < n; y++)
            for (let x = 0; x < n; x++) {
                const finder = (x < 5 && y < 5) || (x > 11 && y < 5) || (x < 5 && y > 11);
                s = (s * 16807) % 2147483647;
                const on = finder ? (x % 4 === 0 || y % 4 === 0 || (x % 4 === 2 && y % 4 === 2)) && !(x === 4 || y === 4 || x === 12 || y === 12) : s % 3 === 0;
                out.push(on);
            }
        return out;
    }, []);
    const [valid, setValid] = useState(false);
    useEffect(() => {
        const id = setInterval(() => setValid((v) => !v), 1400);
        return () => clearInterval(id);
    }, []);
    return (
        <div className="grid h-full place-items-center p-6">
            <motion.div
                initial={{ rotate: -4 }}
                animate={{ rotate: [-4, -2, -4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex w-full max-w-[440px] overflow-hidden rounded-2xl bg-bone text-ink shadow-[0_30px_80px_-20px_rgba(239,106,62,0.35)]"
            >
                <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">Talkeys · Entry pass</p>
                        <p className="mt-2 font-display text-2xl font-bold leading-none tracking-tight">Admit one</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 font-mono text-[11px]">
                        <motion.span
                            key={valid ? "v" : "s"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded px-2 py-1 ${valid ? "bg-emerald-600 text-bone" : "bg-ink text-bone"}`}
                        >
                            {valid ? "VALID ✓ admitted" : "SCANNING…"}
                        </motion.span>
                    </div>
                </div>
                <div className="relative border-l-2 border-dashed border-ink/20 p-4">
                    <div className="relative grid grid-cols-[repeat(17,1fr)] gap-[1px]" style={{ width: 136, height: 136 }}>
                        {cells.map((on, i) => (
                            <span key={i} className={on ? "bg-ink" : ""} />
                        ))}
                        <span className="scan-line absolute inset-x-[-6px] top-0 h-0.5 bg-ember shadow-[0_0_12px_2px_rgba(239,106,62,0.8)]" style={{ "--scan": "134px" }} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

const VENDORS = ["Vendor 03", "Vendor 07", "Vendor 11", "Vendor 02", "Vendor 09"];
const STAGES = ["paid · PhonePe", "preparing", "out for delivery", "delivered"];

export function OrdersArt() {
    const [orders, setOrders] = useState(() =>
        Array.from({ length: 5 }, (_, i) => ({ id: 10412 - i, vendor: VENDORS[i % 5], amt: 60 + ((i * 47) % 180), stage: Math.min(3, i) }))
    );
    useEffect(() => {
        const id = setInterval(() => {
            setOrders((o) => {
                const top = o[0].id + 1;
                const next = [{ id: top, vendor: VENDORS[top % 5], amt: 60 + ((top * 47) % 180), stage: 0 }, ...o.slice(0, 4)];
                return next.map((x, i) => (i === 0 ? x : { ...x, stage: Math.min(3, x.stage + 1) }));
            });
        }, 1600);
        return () => clearInterval(id);
    }, []);
    return (
        <div className="flex h-full flex-col p-5 md:p-6">
            <div className="mb-4 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">
                <span>Live orders</span>
                <span className="text-ember">● campus</span>
            </div>
            <ul className="flex flex-1 flex-col gap-2 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                    {orders.map((o) => (
                        <motion.li
                            key={o.id}
                            layout
                            initial={{ opacity: 0, y: -24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-center justify-between rounded-xl border border-bone/10 bg-ink/50 px-4 py-3 font-mono text-xs"
                        >
                            <span className="text-bone">#{o.id.toLocaleString("en-IN")}</span>
                            <span className="hidden text-bone/50 sm:inline">{o.vendor}</span>
                            <span className="text-bone/70">₹{o.amt}</span>
                            <span className={`w-28 text-right ${o.stage === 3 ? "text-emerald-400" : o.stage === 0 ? "text-ember" : "text-bone/60"}`}>{STAGES[o.stage]}</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    );
}
