import { motion } from "framer-motion";
import { SKILLS, SKILL_CATEGORIES } from "@/data/content";
import { EASE, Eyebrow, SplitText } from "@/components/site/motion";

export default function Skills() {
    const cats = SKILL_CATEGORIES.filter((c) => c !== "All");
    return (
        <section id="skills" className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
            <Eyebrow index="04">Toolkit</Eyebrow>
            <h2 className="mb-16 mt-8 font-display text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.85] tracking-[-0.055em]">
                <SplitText text="Tools I" /> <span className="font-serif font-normal italic text-ember"><SplitText text="think in." delay={0.1} /></span>
            </h2>
            <div data-testid="skills-list" className="divide-y divide-bone/10 border-y border-bone/10">
                {cats.map((cat, ci) => {
                    const list = SKILLS.filter((s) => s.cat === cat);
                    return (
                        <motion.div
                            key={cat}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.7, ease: EASE, delay: ci * 0.04 }}
                            className="grid gap-3 py-6 md:grid-cols-12 md:gap-6 md:py-8"
                        >
                            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45 md:col-span-3 md:pt-3">
                                {cat} <span className="text-ember">({list.length})</span>
                            </p>
                            <p className="min-w-0 font-display text-[clamp(1.6rem,3.6vw,3.2rem)] font-semibold leading-[1.1] tracking-[-0.03em] md:col-span-9">
                                {list.map((s, i) => (
                                    <span key={s.name}>
                                        <span className="cursor-default transition-colors duration-300 hover:font-serif hover:font-normal hover:italic hover:text-ember">{s.name}</span>
                                        {i < list.length - 1 && <span className="mx-3 font-light text-bone/20">/</span>}{" "}
                                    </span>
                                ))}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
