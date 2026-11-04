import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMedia } from "./motion";

// Trailing dot that opens into a ring over links. Elements with data-cursor="Label" show that label inside it.
export default function Cursor() {
    const fine = useMedia("(pointer: fine)");
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
    const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });
    const [state, setState] = useState({ hover: false, label: "" });

    useEffect(() => {
        if (!fine) return;
        const move = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        const over = (e) => {
            const el = e.target.closest?.("[data-cursor], a, button, input, textarea");
            setState({ hover: !!el, label: el?.getAttribute?.("data-cursor") || "" });
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerover", over);
        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerover", over);
        };
    }, [fine, x, y]);

    if (!fine) return null;
    const ring = state.hover && !state.label;
    const size = state.label ? 84 : ring ? 46 : 12;
    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[70] grid place-items-center rounded-full border-solid mix-blend-difference"
            style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
            animate={{
                width: size,
                height: size,
                backgroundColor: ring ? "rgba(237,232,222,0)" : "rgba(237,232,222,1)",
                borderWidth: ring ? 1.5 : 0,
                borderColor: "rgba(237,232,222,1)",
            }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
            {state.label && <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink">{state.label}</span>}
        </motion.div>
    );
}
