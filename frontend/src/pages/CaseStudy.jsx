import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Github, Globe, CheckCircle2 } from "lucide-react";
import { PROJECTS, CASE_STUDIES } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];
const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.8, ease: EASE },
};

export default function CaseStudy() {
    const { slug } = useParams();
    const project = PROJECTS.find((p) => p.title.toLowerCase() === slug);
    const study = CASE_STUDIES[slug];

    if (!project || !study) return <Navigate to="/" replace />;

    return (
        <article className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:pt-40">
            <Link
                to="/"
                data-testid="back-to-projects"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-slate-500 transition-colors hover:text-cyan-400"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to projects
            </Link>

            <motion.header {...reveal} className="mt-10" data-testid="case-study-hero">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                    Case Study — {project.index}
                </p>
                <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {project.title}
                </h1>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                    {project.kind}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                        <span
                            key={t}
                            className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400"
                        >
                            {t}
                        </span>
                    ))}
                </div>
                {project.stat && (
                    <p className="mt-6 font-mono text-sm tracking-wide text-amber">
                        {project.stat}
                    </p>
                )}
            </motion.header>

            <motion.div {...reveal} className="mt-12 overflow-hidden rounded-2xl border border-white/10">
                <img
                    src={project.image}
                    alt={`${project.title} visual`}
                    width="940"
                    height="650"
                    className="h-64 w-full object-cover md:h-96"
                />
            </motion.div>

            <div className="mt-14 grid gap-10 lg:grid-cols-5">
                <motion.section {...reveal} className="lg:col-span-3" data-testid="case-study-overview">
                    <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight">
                        Overview
                    </h2>
                    <p className="text-lg leading-relaxed text-slate-300">{study.overview}</p>

                    <h3 className="mb-4 mt-12 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                        Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {study.stack.map((s) => (
                            <span
                                key={s}
                                className="rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 font-mono text-xs text-cyan-300"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </motion.section>

                <motion.aside {...reveal} className="lg:col-span-2" data-testid="case-study-highlights">
                    <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight">
                        Highlights
                    </h2>
                    <ul className="space-y-4">
                        {study.highlights.map((h) => (
                            <li key={h} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                                <CheckCircle2
                                    className="mt-0.5 h-4 w-4 shrink-0 text-amber"
                                    aria-hidden="true"
                                />
                                {h}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-10 flex flex-col gap-3">
                        {study.live && (
                            <a
                                data-testid="case-study-live-link"
                                href={study.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-5 py-4 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/40"
                            >
                                <span className="flex items-center gap-3 text-sm text-slate-200">
                                    <Globe className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                                    {study.live.replace("https://", "")}
                                </span>
                                <ArrowUpRight
                                    className="h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                                    aria-hidden="true"
                                />
                            </a>
                        )}
                        <a
                            data-testid="case-study-repo-link"
                            href={study.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-5 py-4 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/40"
                        >
                            <span className="flex items-center gap-3 text-sm text-slate-200">
                                <Github className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                                View on GitHub
                            </span>
                            <ArrowUpRight
                                className="h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                                aria-hidden="true"
                            />
                        </a>
                    </div>
                </motion.aside>
            </div>
        </article>
    );
}
