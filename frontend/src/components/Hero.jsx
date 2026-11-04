import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroCanvas from "./HeroCanvas";
import { scrollTo } from "@/lib/scroll";
import { HERO_LINES, HERO_SUB, PROFILE, RESUME_URL } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];

const lineVariants = {
    hidden: { y: "115%" },
    show: (i) => ({
        y: "0%",
        transition: { duration: 1.1, ease: EASE, delay: 0.2 + i * 0.14 },
    }),
};

const fade = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
});

export default function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
    const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

    return (
        <section
            id="top"
            ref={ref}
            className="relative flex min-h-screen items-center overflow-hidden"
        >
            <div data-testid="hero-3d-canvas" className="absolute inset-0 z-0">
                <HeroCanvas />
            </div>
            <div
                aria-hidden="true"
                className="absolute inset-0 z-[1]"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(7,8,12,0.35) 0%, rgba(7,8,12,0.15) 40%, rgba(7,8,12,0.92) 100%)",
                }}
            />

            <motion.div
                style={{ y, opacity }}
                className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 pb-16"
            >
                <motion.div
                    {...fade(0.1)}
                    className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                        {PROFILE.status}
                    </span>
                </motion.div>

                <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                    {PROFILE.role} — B.Tech CSE '27
                </p>

                <h1
                    data-testid="hero-headline"
                    className="font-display font-black leading-[0.9] tracking-tighter text-[clamp(2.8rem,11vw,9rem)]"
                >
                    {HERO_LINES.map((line, i) => (
                        <span key={line} className="block overflow-hidden pb-1">
                            <motion.span
                                custom={i}
                                variants={lineVariants}
                                initial="hidden"
                                animate="show"
                                className={`block ${i === 1 ? "text-transparent" : ""} ${i === 1 ? "[-webkit-text-stroke:2px_#38BDF8]" : ""}`}
                            >
                                {line}
                            </motion.span>
                        </span>
                    ))}
                </h1>

                <motion.p
                    data-testid="hero-subheading"
                    {...fade(0.75)}
                    className="mt-8 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
                >
                    {HERO_SUB}
                </motion.p>

                <motion.div {...fade(0.9)} className="mt-10 flex flex-wrap gap-4">
                    <button
                        data-testid="hero-cta-projects"
                        onClick={() => scrollTo("#projects")}
                        className="group rounded-full bg-electric px-7 py-3.5 font-display text-sm font-bold text-obsidian transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_32px_rgba(56,189,248,0.45)]"
                    >
                        View Projects
                        <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </button>
                    <button
                        data-testid="hero-cta-contact"
                        onClick={() => scrollTo("#contact")}
                        className="rounded-full border border-white/15 px-7 py-3.5 font-display text-sm font-bold text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:text-cyan-300"
                    >
                        Get in Touch
                    </button>
                    <a
                        data-testid="hero-cta-resume"
                        href={RESUME_URL}
                        download="RiteshKapoorResume.pdf"
                        className="rounded-full border border-amber/40 px-7 py-3.5 font-display text-sm font-bold text-amber backdrop-blur-md transition-all duration-300 hover:bg-amber/10 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                    >
                        Download Résumé ↓
                    </a>
                </motion.div>

                <motion.div
                    {...fade(1.1)}
                    className="mt-20 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600"
                >
                    <span className="h-px w-12 bg-slate-700" />
                    <span>Scroll to explore</span>
                    <span>Patiala → Mumbai</span>
                </motion.div>
            </motion.div>
        </section>
    );
}
