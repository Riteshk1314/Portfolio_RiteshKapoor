import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { EXPERIENCE, EDUCATION } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];
const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.8, ease: EASE },
};

export default function Experience() {
    return (
        <section id="experience" className="relative bg-surface/50 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div {...reveal} className="mb-14">
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                        Track Record
                    </p>
                    <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        Experience.
                    </h2>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {EXPERIENCE.map((x, i) => (
                        <motion.div
                            key={x.company}
                            {...reveal}
                            transition={{ ...reveal.transition, delay: i * 0.12 }}
                            data-testid={`experience-card-${i + 1}`}
                            className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl transition-colors duration-500 hover:border-cyan-500/30"
                        >
                            <Briefcase className="mb-5 h-5 w-5 text-cyan-400" aria-hidden="true" />
                            <h3 className="font-display text-lg font-bold tracking-tight">
                                {x.role}
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">{x.company}</p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                {x.period} · {x.location}
                            </p>
                            <ul className="mt-5 space-y-3">
                                {x.bullets.map((b) => (
                                    <li
                                        key={b}
                                        className="flex gap-3 text-sm leading-relaxed text-slate-400"
                                    >
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    <motion.div
                        {...reveal}
                        transition={{ ...reveal.transition, delay: 0.24 }}
                        data-testid="education-card"
                        className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-8 backdrop-blur-xl"
                    >
                        <GraduationCap className="mb-5 h-5 w-5 text-amber" aria-hidden="true" />
                        <h3 className="font-display text-lg font-bold tracking-tight">
                            {EDUCATION.degree}
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">{EDUCATION.school}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            {EDUCATION.detail}
                        </p>
                        <div className="my-5 h-px bg-white/10" />
                        <p className="text-sm text-slate-300">{EDUCATION.school2}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            {EDUCATION.detail2}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
