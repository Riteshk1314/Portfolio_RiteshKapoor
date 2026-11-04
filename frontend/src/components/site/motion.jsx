import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useSpring } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

// Masked line-by-line reveal. Splits into words (kept unbreakable) and optionally characters.
export function SplitText({ text, by = "char", delay = 0, stagger = 0.03, className = "", charClassName = "", once = true, play }) {
    const ref = useRef(null);
    const seen = useInView(ref, { once, amount: 0.3 });
    const reduce = useReducedMotion();
    const show = play ?? seen;
    let n = 0;
    const words = text.split(" ");
    return (
        <span ref={ref} className={className} aria-label={text}>
            {words.map((w, wi) => (
                <span key={wi} aria-hidden="true" className="inline-block whitespace-nowrap">
                    {(by === "char" ? Array.from(w) : [w]).map((c, ci) => {
                        const i = n++;
                        return (
                            <span key={ci} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                                <motion.span
                                    className={`inline-block ${charClassName}`}
                                    initial={reduce ? false : { y: "115%" }}
                                    animate={show || reduce ? { y: "0%" } : { y: "115%" }}
                                    transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
                                >
                                    {c}
                                </motion.span>
                            </span>
                        );
                    })}
                    {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                </span>
            ))}
        </span>
    );
}

// Cycles through phrases with a glyph-scramble transition.
const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFKLMNRSTXZ";
export function Scramble({ words, hold = 2400, className = "" }) {
    const [out, setOut] = useState(words[0]);
    const reduce = useReducedMotion();
    useEffect(() => {
        if (reduce || words.length < 2) return;
        let idx = 0;
        let raf;
        let timer;
        const run = (from, to) => {
            const len = Math.max(from.length, to.length);
            const q = Array.from({ length: len }, (_, i) => {
                const start = Math.floor(Math.random() * 18);
                return { from: from[i] || "", to: to[i] || "", start, end: start + 10 + Math.floor(Math.random() * 18), ch: "" };
            });
            let frame = 0;
            const tick = () => {
                let done = 0;
                let s = "";
                for (const c of q) {
                    if (frame >= c.end) {
                        done++;
                        s += c.to;
                    } else if (frame >= c.start) {
                        if (!c.ch || Math.random() < 0.28) c.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                        s += c.ch;
                    } else s += c.from;
                }
                setOut(s);
                frame++;
                if (done < q.length) raf = requestAnimationFrame(tick);
                else timer = setTimeout(next, hold);
            };
            tick();
        };
        const next = () => {
            const from = words[idx];
            idx = (idx + 1) % words.length;
            run(from, words[idx]);
        };
        timer = setTimeout(next, hold);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(timer);
        };
    }, [words, hold, reduce]);
    return (
        <span className={className} aria-live="off">
            {out}
        </span>
    );
}

// Pulls its child toward the cursor while hovered.
export function Magnetic({ children, strength = 0.35, className = "" }) {
    const ref = useRef(null);
    const x = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 });
    const y = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 });
    return (
        <motion.span
            ref={ref}
            style={{ x, y }}
            className={`inline-block ${className}`}
            onMouseMove={(e) => {
                const r = ref.current.getBoundingClientRect();
                x.set((e.clientX - (r.left + r.width / 2)) * strength);
                y.set((e.clientY - (r.top + r.height / 2)) * strength);
            }}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
        >
            {children}
        </motion.span>
    );
}

// Text that rolls up to a duplicate on hover. Put it inside an element with `group`.
export function Roll({ children, className = "" }) {
    const t = "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]";
    return (
        <span className={`relative inline-flex overflow-hidden ${className}`}>
            <span className={`block ${t} group-hover:-translate-y-full`}>{children}</span>
            <span aria-hidden="true" className={`absolute inset-0 block translate-y-full ${t} group-hover:translate-y-0`}>
                {children}
            </span>
        </span>
    );
}

// Counts up to `to` the first time it scrolls into view.
export function CountUp({ to, suffix = "", decimals = 0, className = "" }) {
    const ref = useRef(null);
    const seen = useInView(ref, { once: true, amount: 0.6 });
    const [v, setV] = useState(0);
    useEffect(() => {
        if (!seen) return;
        const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: setV });
        return () => c.stop();
    }, [seen, to]);
    return (
        <span ref={ref} className={`tabular-nums ${className}`}>
            {v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            {suffix}
        </span>
    );
}

export function useLocalTime(timeZone = "Asia/Kolkata") {
    const fmt = () => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date());
    const [t, setT] = useState(fmt);
    useEffect(() => {
        const id = setInterval(() => setT(fmt()), 15000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return t;
}

export function useMedia(query) {
    const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const on = () => setM(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, [query]);
    return m;
}

// Small mono label with an index, used as section eyebrows: "(02) — Work".
export function Eyebrow({ index, children, className = "" }) {
    return (
        <p className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/50 ${className}`}>
            <span className="text-ember">({index})</span>
            <span className="h-px w-8 bg-bone/20" />
            {children}
        </p>
    );
}
