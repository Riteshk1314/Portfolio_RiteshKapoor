import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SKILLS, SKILL_CATEGORIES } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];

export default function Skills() {
    const [cat, setCat] = useState("All");
    const filtered = cat === "All" ? SKILLS : SKILLS.filter((s) => s.cat === cat);

    return (
        <section id="skills" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="mb-12"
            >
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                    Stack
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    Tools I think in.
                </h2>
            </motion.div>

            <div
                data-testid="skills-filter"
                className="mb-10 flex flex-wrap gap-2"
                role="tablist"
                aria-label="Skill categories"
            >
                {SKILL_CATEGORIES.map((c) => (
                    <button
                        key={c}
                        data-testid="skills-filter-btn"
                        role="tab"
                        aria-selected={cat === c}
                        onClick={() => setCat(c)}
                        className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                            cat === c
                                ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                                : "border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300"
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <motion.ul
                data-testid="skills-list"
                layout
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            >
                <AnimatePresence mode="popLayout">
                    {filtered.map((s) => (
                        <motion.li
                            key={s.name}
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="group rounded-xl border border-white/10 bg-slate-900/40 px-5 py-4 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/40"
                        >
                            <p className="text-sm font-medium text-slate-200">
                                {s.name}
                            </p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600 group-hover:text-cyan-400/70">
                                {s.cat}
                            </p>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </motion.ul>
        </section>
    );
}
