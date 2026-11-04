import { MARQUEE_ITEMS } from "@/data/content";

export default function Marquee() {
    return (
        <div
            data-testid="editorial-marquee-container"
            className="relative overflow-hidden border-y border-white/10 bg-surface py-6"
        >
            <div className="marquee-track flex w-max items-center whitespace-nowrap">
                {[0, 1].map((copy) => (
                    <div
                        key={copy}
                        aria-hidden={copy === 1}
                        className="flex items-center"
                    >
                        {MARQUEE_ITEMS.map((item) => (
                            <span
                                key={item}
                                className="flex items-center font-mono text-sm uppercase tracking-[0.3em] text-slate-500"
                            >
                                <span className="px-8">{item}</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-amber/70" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
