import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EDUCATION } from "@/data/content";
import { Eyebrow, SplitText } from "@/components/site/motion";

const STATEMENT =
    "I'm a Computer Science undergrad at Thapar who ships real products — ticketing and delivery platforms used by thousands, multi-agent LLM systems that stream their thinking live, and half a million grievance records turned into decisions at Axis Bank.";
const EMPHASIS = new Set(["real", "thousands,", "live,", "decisions"]);

function Word({ children, progress, range, em }) {
    const opacity = useTransform(progress, range, [0.12, 1]);
    const y = useTransform(progress, range, [6, 0]);
    return (
        <motion.span style={{ opacity, y }} className={`inline-block ${em ? "font-serif font-normal italic text-ember" : ""}`}>
            {children}&nbsp;
        </motion.span>
    );
}

export default function About() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
    const words = STATEMENT.split(" ");
    return (
        <section id="about" className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
            <Eyebrow index="01">About</Eyebrow>
            <p ref={ref} data-testid="about-bio-card" className="mt-10 max-w-[22ch] font-display text-[clamp(2rem,5.4vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.035em] sm:max-w-[26ch]">
                {words.map((w, i) => (
                    <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} em={EMPHASIS.has(w)}>
                        {w}
                    </Word>
                ))}
            </p>

            <div className="mt-20 grid gap-10 md:grid-cols-12">
                <div className="md:col-span-4 md:col-start-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">Education</p>
                    <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                        <SplitText text={EDUCATION.degree} by="word" stagger={0.05} />
                    </h3>
                    <p className="mt-2 text-bone/70">{EDUCATION.school}</p>
                    <p className="mt-1 font-mono text-xs text-bone/45">{EDUCATION.detail}</p>
                </div>
                <div className="md:col-span-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">Before that</p>
                    <p className="mt-3 text-bone/70">{EDUCATION.school2}</p>
                    <p className="mt-1 font-mono text-xs text-bone/45">{EDUCATION.detail2}</p>
                </div>
            </div>
        </section>
    );
}
