import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { PROJECTS, CASE_STUDIES, LIVE_LINKS } from "@/data/content";
import { Eyebrow, Magnetic, Roll, SplitText, useMedia } from "@/components/site/motion";
import { AgentArt, OrdersArt, TicketArt } from "@/components/site/ProjectArt";

const ART = { agentstream: AgentArt, talkeys: TicketArt, fooddle: OrdersArt };
const FACTS = {
    agentstream: ["3 local LLMs", "live token streaming"],
    talkeys: ["3,500+ users", "99.9% uptime at peak"],
    fooddle: ["5,000+ users", "10,000+ orders"],
};

function Chapter({ p, pinned }) {
    const navigate = useNavigate();
    const slug = p.title.toLowerCase();
    const study = CASE_STUDIES[slug];
    const Art = ART[slug];
    const open = () => navigate(`/projects/${slug}`);
    return (
        <article
            data-testid={p.id}
            className={`relative flex shrink-0 items-center px-5 md:px-10 ${pinned ? "h-full w-screen" : "w-full border-t border-bone/10 py-20"}`}
        >
            <div className="mx-auto grid w-full max-w-[1600px] gap-10 md:grid-cols-12 md:items-center md:gap-14">
                <div className="md:col-span-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">
                        <span className="text-ember">{p.index}</span> / 0{PROJECTS.length} — {p.kind}
                    </p>
                    <h3 className="mt-4 font-display text-[clamp(3.4rem,8.5vw,8.6rem)] font-bold leading-[0.84] tracking-[-0.055em]">
                        <SplitText text={p.title} stagger={0.035} />
                    </h3>
                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
                        {FACTS[slug].map((f) => (
                            <span key={f} className="font-serif text-2xl italic text-ember md:text-3xl">
                                {f}
                            </span>
                        ))}
                    </div>
                    <p className="mt-6 max-w-[46ch] leading-relaxed text-bone/70">{p.description}</p>
                    <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">{p.tags.join("  /  ")}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                        <Magnetic strength={0.25}>
                            <button
                                onClick={open}
                                data-testid={`project-open-${slug}`}
                                className="group rounded-full bg-bone px-6 py-3.5 font-display text-sm font-semibold text-ink transition-colors hover:bg-ember active:scale-[0.98]"
                            >
                                <Roll>Read the case study →</Roll>
                            </button>
                        </Magnetic>
                        {study?.live && (
                            <a href={study.live} target="_blank" rel="noopener noreferrer" className="group font-mono text-[12px] uppercase tracking-[0.14em] text-bone/70 hover:text-bone">
                                <Roll>{study.live.replace("https://", "")} ↗</Roll>
                            </a>
                        )}
                    </div>
                </div>
                <motion.div
                    whileHover={{ scale: 0.985 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    onClick={open}
                    data-cursor="Open"
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[28px] border border-bone/10 bg-char md:col-span-7"
                >
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(239,106,62,0.12),transparent_55%)]" />
                    <div className="relative h-full">
                        <Art />
                    </div>
                </motion.div>
            </div>
        </article>
    );
}

function Intro({ pinned }) {
    return (
        <div className={`relative flex shrink-0 flex-col justify-center px-5 md:px-10 ${pinned ? "h-full w-[70vw]" : "w-full pb-10 pt-28"}`}>
            <Eyebrow index="02">Selected work</Eyebrow>
            <h2 className="mt-8 font-display text-[clamp(3.6rem,11vw,12rem)] font-bold leading-[0.82] tracking-[-0.06em]">
                <SplitText text="Things" />
                <br />
                <span className="font-serif font-normal italic text-ember">
                    <SplitText text="that shipped." delay={0.2} />
                </span>
            </h2>
            <p className="mt-8 max-w-md leading-relaxed text-bone/60">
                Three products, two of them live in production — <a className="underline decoration-ember underline-offset-4" href={LIVE_LINKS[0].url} target="_blank" rel="noopener noreferrer">{LIVE_LINKS[0].label}</a> and{" "}
                <a className="underline decoration-ember underline-offset-4" href={LIVE_LINKS[1].url} target="_blank" rel="noopener noreferrer">{LIVE_LINKS[1].label}</a>.
            </p>
            {pinned && <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">Keep scrolling →</p>}
        </div>
    );
}

export default function Projects() {
    const pinned = useMedia("(min-width: 900px)") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    // intro panel is 70vw; then one 100vw chapter per project
    const travel = 70 + (PROJECTS.length - 1) * 100;
    const x = useTransform(scrollYProgress, [0.04, 0.96], ["0vw", `-${travel}vw`]);
    const [idx, setIdx] = useState(0);
    useMotionValueEvent(scrollYProgress, "change", (v) => setIdx(Math.min(PROJECTS.length, Math.max(0, Math.round(((v - 0.04) / 0.92) * travel / 100 + 0.25)))));

    if (!pinned)
        return (
            <section id="projects" data-testid="bento-grid-container" className="relative">
                <Intro />
                {PROJECTS.map((p) => (
                    <Chapter key={p.id} p={p} />
                ))}
            </section>
        );

    return (
        <section id="projects" ref={ref} data-testid="bento-grid-container" className="relative" style={{ height: `${(PROJECTS.length + 1) * 100}vh` }}>
            <div className="sticky top-0 h-[100dvh] overflow-hidden">
                <motion.div style={{ x }} className="flex h-full w-max">
                    <Intro pinned />
                    {PROJECTS.map((p) => (
                        <Chapter key={p.id} p={p} pinned />
                    ))}
                </motion.div>
                <div className="absolute inset-x-10 bottom-8 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">
                    <span className="tabular-nums text-bone">{idx === 0 ? "00" : `0${idx}`}</span>
                    <div className="relative h-px flex-1 bg-bone/15">
                        <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-0 origin-left bg-ember" />
                    </div>
                    <span>0{PROJECTS.length}</span>
                </div>
            </div>
        </section>
    );
}
