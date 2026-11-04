import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { scrollTo } from "@/lib/scroll";
import { PROFILE, RESUME_URL } from "@/data/content";
import { CountUp, EASE, Magnetic, Roll, Scramble } from "@/components/site/motion";

const ROLES = ["multi-agent LLM systems", "ticketing at 3,500+ users", "campus delivery at scale", "data that drives decisions"];

const STATS = [
    { to: 5000, suffix: "+", label: "Users on Fooddle" },
    { to: 10000, suffix: "+", label: "Orders processed" },
    { to: 500, suffix: "K+", label: "Records analysed at Axis" },
    { to: 450, suffix: "+", label: "Hackers at HackTU" },
];

// Dot grid that bulges away from the cursor and settles back with a spring.
function DotField() {
    const ref = useRef(null);
    useEffect(() => {
        const cv = ref.current;
        const ctx = cv.getContext("2d");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let dots = [];
        let w = 0;
        let h = 0;
        let dpr = 1;
        const mouse = { x: -9999, y: -9999 };
        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            const r = cv.getBoundingClientRect();
            w = r.width;
            h = r.height;
            cv.width = w * dpr;
            cv.height = h * dpr;
            const gap = w < 700 ? 22 : 30;
            dots = [];
            for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
        };
        const onMove = (e) => {
            const r = cv.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        };
        const onLeave = () => {
            mouse.x = mouse.y = -9999;
        };
        let raf;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(cv);
        const tick = (t) => {
            raf = requestAnimationFrame(tick);
            if (!visible) return;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            const R = 150;
            for (const d of dots) {
                const dx = d.x - mouse.x;
                const dy = d.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < R && !reduce) {
                    const f = (1 - dist / R) * 2.2;
                    d.vx += (dx / (dist || 1)) * f;
                    d.vy += (dy / (dist || 1)) * f;
                }
                d.vx += (d.ox - d.x) * 0.06;
                d.vy += (d.oy - d.y) * 0.06;
                d.vx *= 0.82;
                d.vy *= 0.82;
                d.x += d.vx;
                d.y += d.vy;
                const near = Math.max(0, 1 - dist / R);
                const wave = reduce ? 0 : (Math.sin(d.ox * 0.012 + t * 0.0012) + Math.cos(d.oy * 0.015 - t * 0.0009)) * 0.25;
                ctx.fillStyle = near > 0.02 ? `rgba(239,106,62,${0.25 + near * 0.75})` : `rgba(237,232,222,${0.2 + wave * 0.12})`;
                const s = 1.2 + near * 2.2;
                ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
            }
        };
        resize();
        raf = requestAnimationFrame(tick);
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", onMove);
        document.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
        };
    }, []);
    return <canvas ref={ref} data-testid="hero-3d-canvas" className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

function NameLine({ text, delay }) {
    return (
        <span className="block overflow-hidden">
            {Array.from(text).map((c, i) => (
                <motion.span
                    key={i}
                    className="hero-char inline-block"
                    initial={{ y: "105%", rotate: 6 }}
                    animate={{ y: "0%", rotate: 0 }}
                    transition={{ duration: 1.2, ease: EASE, delay: delay + i * 0.05 }}
                >
                    {c}
                </motion.span>
            ))}
        </span>
    );
}

const fade = (delay) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
});

export default function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const left = useTransform(scrollYProgress, [0, 1], ["0vw", "-14vw"]);
    const right = useTransform(scrollYProgress, [0, 1], ["0vw", "14vw"]);
    const fadeOut = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section id="top" ref={ref} className="relative flex min-h-[100dvh] flex-col overflow-hidden px-5 pb-8 pt-24 md:px-10 md:pt-28">
            <DotField />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,transparent_0%,#0e0d0b_70%)]" />

            <motion.div {...fade(0.2)} className="relative z-10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/60">
                <span className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
                    </span>
                    {PROFILE.status}
                </span>
                <span>B.Tech CSE · Thapar · Class of 2027</span>
            </motion.div>

            <h1 data-testid="hero-headline" className="relative z-10 mt-auto font-display leading-[0.8] tracking-[-0.055em] text-[clamp(4.2rem,19vw,19rem)]" aria-label="Ritesh Kapoor">
                <motion.span style={{ x: left }} className="block" aria-hidden="true">
                    <NameLine text="Ritesh" delay={0.15} />
                </motion.span>
                <motion.span style={{ x: right }} className="block text-right" aria-hidden="true">
                    <NameLine text="Kapoor" delay={0.35} />
                </motion.span>
            </h1>

            <motion.div style={{ opacity: fadeOut }} className="relative z-10 mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:items-end">
                <motion.p {...fade(0.9)} data-testid="hero-subheading" className="max-w-md text-lg leading-snug text-bone/80 md:col-span-5 md:text-xl">
                    {PROFILE.role}. I build <span className="font-serif text-[1.25em] italic text-ember">and ship</span>{" "}
                    <Scramble words={ROLES} className="whitespace-nowrap font-mono text-[0.85em] text-bone" />
                </motion.p>

                <motion.dl {...fade(1.05)} className="grid grid-cols-2 gap-x-6 gap-y-4 md:col-span-4 md:grid-cols-2">
                    {STATS.map((s) => (
                        <div key={s.label} className="border-t border-bone/15 pt-2">
                            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/45">{s.label}</dt>
                            <dd className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                                <CountUp to={s.to} suffix={s.suffix} />
                            </dd>
                        </div>
                    ))}
                </motion.dl>

                <motion.div {...fade(1.2)} className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-3 md:justify-end">
                    <Magnetic>
                        <button
                            data-testid="hero-cta-projects"
                            data-cursor="Scroll"
                            onClick={() => scrollTo("#projects")}
                            className="grid h-28 w-28 place-items-center rounded-full bg-ember text-center font-display text-sm font-semibold leading-tight text-ink transition-transform active:scale-95"
                        >
                            View
                            <br />
                            work ↓
                        </button>
                    </Magnetic>
                    <div className="flex flex-col gap-2 font-mono text-[12px] uppercase tracking-[0.14em]">
                        <a data-testid="hero-cta-resume" href={RESUME_URL} download="RiteshKapoorResume.pdf" className="group">
                            <Roll>Résumé ↓</Roll>
                        </a>
                        <button data-testid="hero-cta-contact" onClick={() => scrollTo("#contact")} className="group text-left">
                            <Roll>Get in touch</Roll>
                        </button>
                        <Link data-testid="hero-cta-world" to="/" className="group text-ember">
                            <Roll>Walk the park ↗</Roll>
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
