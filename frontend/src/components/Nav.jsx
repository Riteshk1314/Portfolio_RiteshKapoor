import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { scrollTo } from "@/lib/scroll";
import { Roll, useLocalTime, EASE } from "@/components/site/motion";

const LINKS = [
    ["Work", "#projects", "nav-item-projects"],
    ["Experience", "#experience", "nav-item-experience"],
    ["Skills", "#skills", "nav-item-skills"],
    ["Contact", "#contact", "nav-item-contact"],
];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const time = useLocalTime();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const go = (hash) => {
        setOpen(false);
        if (pathname !== "/site") navigate(`/site${hash}`);
        else scrollTo(hash);
    };

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => (document.body.style.overflow = "");
    }, [open]);

    return (
        <>
            <header data-testid="nav-header" className="fixed inset-x-0 top-0 z-50 text-bone mix-blend-difference">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 md:px-10">
                    <button
                        data-testid="nav-logo-link"
                        onClick={() => go("#top")}
                        className="group flex items-baseline gap-2"
                        aria-label="Ritesh Kapoor — back to top"
                    >
                        <span className="font-display text-lg font-bold tracking-tight">
                            <Roll>Ritesh Kapoor</Roll>
                        </span>
                        <span className="font-mono text-[10px] text-bone/60">©26</span>
                    </button>

                    <p className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-bone/60 lg:block">Patiala, IN — {time} IST</p>

                    <nav className="hidden items-center gap-7 md:flex">
                        {LINKS.map(([label, hash, id]) => (
                            <button key={id} data-testid={id} onClick={() => go(hash)} className="group font-mono text-[12px] uppercase tracking-[0.14em]">
                                <Roll>{label}</Roll>
                            </button>
                        ))}
                        <Link
                            to="/"
                            data-testid="nav-park-link"
                            className="group rounded-full border border-bone/40 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors hover:bg-bone hover:text-ink"
                        >
                            <Roll>Park ↗</Roll>
                        </Link>
                    </nav>

                    <button
                        data-testid="nav-mobile-toggle"
                        className="font-mono text-[12px] uppercase tracking-[0.14em] md:hidden"
                        onClick={() => setOpen(!open)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                    >
                        {open ? "Close" : "Menu"}
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {open && (
                    <motion.nav
                        initial={{ clipPath: "inset(0 0 100% 0)" }}
                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                        exit={{ clipPath: "inset(0 0 100% 0)" }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-5 pb-12 pt-24 text-bone md:hidden"
                    >
                        {[...LINKS, ["Park ↗", null, "nav-item-park"]].map(([label, hash, id], i) => (
                            <motion.button
                                key={id}
                                data-testid={`${id}-mobile`}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                                onClick={() => (hash ? go(hash) : navigate("/"))}
                                className="border-b border-bone/10 py-3 text-left font-display text-5xl font-bold tracking-tight"
                            >
                                {label}
                            </motion.button>
                        ))}
                        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">Patiala, IN — {time} IST</p>
                    </motion.nav>
                )}
            </AnimatePresence>
        </>
    );
}
