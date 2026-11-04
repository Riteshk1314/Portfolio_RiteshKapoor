import Logo from "./Logo";
import { scrollTo } from "@/lib/scroll";
import { PROFILE } from "@/data/content";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-surface/50">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
                <button
                    data-testid="footer-logo-link"
                    onClick={() => scrollTo("#top")}
                    className="flex items-center gap-3"
                    aria-label="Back to top"
                >
                    <Logo size={30} />
                    <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-slate-300">
                        {PROFILE.name}
                    </span>
                </button>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
                    © 2026 Ritesh Kapoor · Built with React, Three.js & Motion
                </p>
            </div>
        </footer>
    );
}
