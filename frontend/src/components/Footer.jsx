import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { scrollTo } from "@/lib/scroll";
import { Roll } from "@/components/site/motion";

export default function Footer() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
    const y = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);
    return (
        <footer ref={ref} className="relative overflow-hidden border-t border-bone/10">
            <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 pt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50 md:px-10">
                <span>© 2026 Ritesh Kapoor</span>
                <div className="flex gap-6">
                    <Link to="/" className="group hover:text-bone">
                        <Roll>Walk the park ↗</Roll>
                    </Link>
                    <button data-testid="footer-logo-link" onClick={() => scrollTo("#top")} className="group uppercase hover:text-bone">
                        <Roll>Back to top ↑</Roll>
                    </button>
                </div>
            </div>
            <motion.p
                style={{ y }}
                aria-hidden="true"
                className="select-none whitespace-nowrap px-3 pb-2 pt-6 text-center font-display text-[16.5vw] font-bold leading-[0.78] tracking-[-0.06em] text-bone"
            >
                Ritesh Kapoor
            </motion.p>
        </footer>
    );
}
