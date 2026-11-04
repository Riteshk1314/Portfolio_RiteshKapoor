import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Globe } from "lucide-react";
import { PROJECTS, LIVE_LINKS } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];

const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.8, ease: EASE },
};

function onSpotlightMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function ProjectCard({ p, className }) {
    const navigate = useNavigate();
    return (
        <motion.article
            data-testid={p.id}
            {...reveal}
            onClick={() => navigate(`/projects/${p.title.toLowerCase()}`)}
            onMouseMove={onSpotlightMove}
            className={`spotlight-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl transition-colors duration-500 hover:border-cyan-500/40 ${className}`}
        >
            <div className="relative h-56 overflow-hidden md:h-64">
                <img
                    src={p.image}
                    alt={`${p.title} — ${p.kind}`}
                    loading="lazy"
                    width="940"
                    height="650"
                    className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"
                />
                <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-obsidian/60 px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-cyan-300 backdrop-blur-md">
                    {p.index}
                </span>
            </div>
            <div className="relative z-[3] flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                            {p.title}
                        </h3>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
                            {p.kind}
                        </p>
                    </div>
                    <ArrowUpRight
                        className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-400"
                        aria-hidden="true"
                    />
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                    {p.description}
                </p>
                {p.stat && (
                    <p className="font-mono text-xs tracking-wide text-amber">
                        {p.stat}
                    </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    {p.tags.map((t) => (
                        <span
                            key={t}
                            className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400"
                        >
                            {t}
                        </span>
                    ))}
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600 transition-colors duration-300 group-hover:text-cyan-400">
                        Case study →
                    </span>
                </div>
            </div>
        </motion.article>
    );
}

export default function Projects() {
    const [featured, compact, tall] = PROJECTS;
    return (
        <section id="projects" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
            <motion.div {...reveal} className="mb-14">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                    Selected Work
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    Projects that shipped.
                </h2>
            </motion.div>

            <div
                data-testid="bento-grid-container"
                className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8"
            >
                <ProjectCard
                    p={featured}
                    className="md:col-span-8 md:row-span-2 md:min-h-[560px]"
                />
                <ProjectCard p={compact} className="md:col-span-4" />
                <ProjectCard p={tall} className="md:col-span-4 md:row-span-2" />

                <motion.a
                    data-testid="project-card-4"
                    {...reveal}
                    href={LIVE_LINKS[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseMove={onSpotlightMove}
                    className="spotlight-card group relative flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl transition-colors duration-500 hover:border-amber/40 md:col-span-8"
                >
                    <div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-amber/90">
                            Live in production
                        </p>
                        <p className="max-w-md text-sm leading-relaxed text-slate-400">
                            Both platforms are deployed, scaled on GCP and used by
                            thousands of real users — not demo projects.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {LIVE_LINKS.map((l) => (
                            <span
                                key={l.label}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-xs text-slate-300 transition-colors duration-300 group-hover:border-amber/50 group-hover:text-amber"
                            >
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                {l.label}
                            </span>
                        ))}
                    </div>
                </motion.a>
            </div>
        </section>
    );
}
