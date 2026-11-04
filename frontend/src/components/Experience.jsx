import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXPERIENCE } from "@/data/content";
import { EASE, Eyebrow, SplitText } from "@/components/site/motion";

function Row({ x, i, open, onToggle }) {
    return (
        <motion.li
            data-testid={`experience-card-${i + 1}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
            className="border-t border-bone/15 last:border-b"
        >
            <button onClick={onToggle} aria-expanded={open} className="group relative grid w-full grid-cols-12 items-baseline gap-4 overflow-hidden px-3 py-7 text-left md:px-5 md:py-9">
                <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
                <span className="relative col-span-12 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45 transition-colors group-hover:text-ink md:col-span-2">{x.period}</span>
                <span className="relative col-span-10 font-display text-[clamp(1.8rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.04em] transition-colors group-hover:text-ink md:col-span-6">
                    {x.role}
                    <span className="block font-serif text-[0.6em] font-normal italic tracking-normal text-bone/60 transition-colors group-hover:text-ink/70">{x.company}</span>
                </span>
                <span className="relative hidden font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45 transition-colors group-hover:text-ink md:col-span-3 md:block">{x.location}</span>
                <span className="relative col-span-2 justify-self-end font-display text-3xl font-light transition-transform duration-500 group-hover:text-ink md:col-span-1" style={{ transform: open ? "rotate(45deg)" : "none" }}>
                    +
                </span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="overflow-hidden">
                        <ul className="grid gap-4 pb-10 md:grid-cols-12">
                            {x.bullets.map((b, k) => (
                                <li key={b} className="flex gap-4 leading-relaxed text-bone/70 md:col-span-6 md:col-start-3 lg:col-span-5 lg:col-start-3 [&:nth-child(even)]:lg:col-start-8">
                                    <span className="font-mono text-xs text-ember">0{k + 1}</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.li>
    );
}

export default function Experience() {
    const [open, setOpen] = useState(0);
    return (
        <section id="experience" className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
            <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
                <div>
                    <Eyebrow index="03">Experience</Eyebrow>
                    <h2 className="mt-8 font-display text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.85] tracking-[-0.055em]">
                        <SplitText text="Where I've" />
                        <br />
                        <span className="font-serif font-normal italic text-ember">
                            <SplitText text="put in the work." delay={0.15} />
                        </span>
                    </h2>
                </div>
                <p className="max-w-xs text-bone/55">From banking data pipelines to running a 450-person hackathon. Click a row for details.</p>
            </div>
            <ul>
                {EXPERIENCE.map((x, i) => (
                    <Row key={x.company} x={x} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
                ))}
            </ul>
        </section>
    );
}
