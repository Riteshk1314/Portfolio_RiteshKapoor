import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { MARQUEE_ITEMS } from "@/data/content";

const wrap = (min, max, v) => {
    const r = max - min;
    return ((((v - min) % r) + r) % r) + min;
};

// A row that drifts on its own and speeds up / reverses with scroll velocity.
function Row({ children, base = 2.4 }) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
    const factor = useTransform(vel, [0, 1000], [0, 4], { clamp: false });
    const skew = useTransform(vel, [-2500, 2500], [10, -10]);
    const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
    const dir = useRef(1);
    useAnimationFrame((_, delta) => {
        let by = dir.current * base * (delta / 1000);
        const f = factor.get();
        if (f < 0) dir.current = -Math.sign(base);
        else if (f > 0) dir.current = Math.sign(base);
        by += dir.current * Math.abs(by) * Math.abs(f);
        baseX.set(baseX.get() + by);
    });
    return (
        <div className="overflow-hidden">
            <motion.div style={{ x, skewX: skew }} className="flex w-max whitespace-nowrap">
                {children}
                {children}
            </motion.div>
        </div>
    );
}

export default function Marquee() {
    const items = (
        <div className="flex items-center">
            {MARQUEE_ITEMS.map((item, i) => (
                <span key={item} className="flex items-center">
                    <span className={`px-6 font-display text-[clamp(2.6rem,7vw,6.5rem)] font-bold uppercase leading-none tracking-[-0.04em] ${i % 2 ? "text-outline" : "text-bone"}`}>
                        {item}
                    </span>
                    <span className="text-[clamp(1.5rem,3vw,2.6rem)] text-ember">✦</span>
                </span>
            ))}
        </div>
    );
    const verbs = (
        <div className="flex items-center">
            {["designs", "builds", "ships", "scales", "measures", "iterates"].map((v) => (
                <span key={v} className="flex items-center px-6 font-serif text-[clamp(1.8rem,4vw,3.6rem)] italic leading-none text-bone/45">
                    {v}
                    <span className="ml-12 h-px w-16 bg-bone/20" />
                </span>
            ))}
        </div>
    );
    return (
        <div data-testid="editorial-marquee-container" className="relative flex flex-col gap-4 overflow-hidden border-y border-bone/10 py-8 md:py-10" aria-label={MARQUEE_ITEMS.join(", ")}>
            <Row base={-2.2}>{items}</Row>
            <Row base={1.6}>{verbs}</Row>
        </div>
    );
}
