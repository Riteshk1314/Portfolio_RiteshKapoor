import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { scrollTo } from "@/lib/scroll";

const LINKS = [
    ["Projects", "#projects", "nav-item-projects"],
    ["Skills", "#skills", "nav-item-skills"],
    ["About", "#about", "nav-item-about"],
    ["Contact", "#contact", "nav-item-contact"],
];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const go = (hash) => {
        setOpen(false);
        scrollTo(hash);
    };

    return (
        <header
            data-testid="nav-header"
            className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-obsidian/80 backdrop-blur-2xl"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <button
                    data-testid="nav-logo-link"
                    onClick={() => go("#top")}
                    className="group flex items-center gap-3"
                    aria-label="Ritesh Kapoor — home"
                >
                    <Logo size={32} />
                    <span className="font-display text-xs font-bold uppercase tracking-[0.3em] text-slate-200">
                        Ritesh Kapoor
                    </span>
                </button>

                <nav className="hidden items-center gap-8 md:flex">
                    {LINKS.map(([label, hash, id]) => (
                        <button
                            key={id}
                            data-testid={id}
                            onClick={() => go(hash)}
                            className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors duration-300 hover:text-cyan-400"
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <button
                    data-testid="nav-mobile-toggle"
                    className="text-slate-300 md:hidden"
                    onClick={() => setOpen(!open)}
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-white/10 md:hidden"
                    >
                        <div className="flex flex-col gap-1 px-6 py-4">
                            {LINKS.map(([label, hash, id]) => (
                                <button
                                    key={id}
                                    data-testid={`${id}-mobile`}
                                    onClick={() => go(hash)}
                                    className="py-3 text-left font-mono text-sm uppercase tracking-[0.2em] text-slate-300"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
