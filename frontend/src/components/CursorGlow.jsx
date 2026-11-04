import { useEffect, useRef } from "react";

export default function CursorGlow() {
    const ref = useRef(null);
    useEffect(() => {
        const move = (e) => {
            if (!ref.current) return;
            ref.current.animate(
                {
                    transform: `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`,
                },
                { duration: 450, fill: "forwards", easing: "ease-out" }
            );
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
    }, []);
    return (
        <div
            aria-hidden="true"
            ref={ref}
            className="pointer-events-none fixed left-0 top-0 z-[5] hidden h-[500px] w-[500px] rounded-full opacity-50 md:block"
            style={{
                background:
                    "radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 60%)",
            }}
        />
    );
}
