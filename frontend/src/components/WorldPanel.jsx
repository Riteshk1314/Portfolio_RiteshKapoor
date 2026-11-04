import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Mail, Phone, Github, Linkedin, Code2, Download, FileText } from "lucide-react";
import { PROJECTS, EXPERIENCE, SKILLS, ABOUT_BIO, EDUCATION, PROFILE, CASE_STUDIES, RESUME_URL } from "@/data/content";

const TITLES = {
    projects: "Projects",
    experience: "Experience",
    skills: "Skill Set",
    about: "About",
    contact: "Contact",
    resume: "Résumé",
};

export default function WorldPanel({ zone }) {
    const navigate = useNavigate();
    const openCaseStudy = (p) => navigate(`/projects/${p.title.toLowerCase()}`, { state: { from: "park" } });

    if (zone.startsWith("project:")) {
        const slug = zone.slice("project:".length);
        const p = PROJECTS.find((x) => x.title.toLowerCase() === slug);
        const study = CASE_STUDIES[slug];
        return (
            <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/80">Project {p.index}</p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">{p.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{p.kind}</p>
                {p.stat && <p className="mt-3 font-mono text-xs text-amber">{p.stat}</p>}
                <p className="mt-4 text-base leading-relaxed text-slate-300">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-obsidian/50 px-3 py-1 font-mono text-[11px] text-slate-300">
                            {t}
                        </span>
                    ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        data-testid={`world-panel-link-${slug}`}
                        onClick={() => openCaseStudy(p)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-5 py-2.5 font-display text-sm font-bold text-obsidian transition-colors hover:bg-cyan-300"
                    >
                        Read the case study <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {study?.live && (
                        <a
                            href={study.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 font-display text-sm font-bold text-slate-200 transition-colors hover:border-cyan-400/50"
                        >
                            Visit live site <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                    )}
                </div>
            </div>
        );
    }

    if (zone === "resume") {
        return (
            <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-amber/80">Notice board</p>
                <h2 className="mb-3 font-display text-2xl font-extrabold tracking-tight">{TITLES[zone]}</h2>
                <p className="text-base leading-relaxed text-slate-300">
                    {PROFILE.role} · {PROFILE.status}. The full one-page résumé is pinned here.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <a
                        href={RESUME_URL}
                        download="RiteshKapoorResume.pdf"
                        data-testid="world-panel-resume-download"
                        className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 font-display text-sm font-bold text-obsidian transition-opacity hover:opacity-90"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
                    </a>
                    <a
                        href={RESUME_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-display text-sm font-bold text-slate-200 transition-colors hover:border-amber/50"
                    >
                        <FileText className="h-4 w-4" aria-hidden="true" /> Open in a new tab
                    </a>
                </div>
            </div>
        );
    }

    if (zone === "projects") {
        return (
            <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/80">Zone</p>
                <h2 className="mb-6 font-display text-2xl font-extrabold tracking-tight">{TITLES[zone]}</h2>
                <div className="flex flex-col gap-4">
                    {PROJECTS.map((p) => (
                        <div key={p.id} className="rounded-xl border border-white/10 bg-obsidian/50 p-5">
                            <div className="flex items-baseline justify-between gap-3">
                                <h3 className="font-display text-lg font-bold">{p.title}</h3>
                                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">{p.kind}</span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{p.description}</p>
                            {p.stat && <p className="mt-2 font-mono text-xs text-amber">{p.stat}</p>}
                            <button
                                data-testid={`world-panel-link-${p.title.toLowerCase()}`}
                                onClick={() => openCaseStudy(p)}
                                className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 transition-colors hover:text-cyan-300"
                            >
                                Open case study <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (zone === "experience") {
        return (
            <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-amber/80">Zone</p>
                <h2 className="mb-6 font-display text-2xl font-extrabold tracking-tight">{TITLES[zone]}</h2>
                <div className="flex flex-col gap-5">
                    {EXPERIENCE.map((x) => (
                        <div key={x.company} className="rounded-xl border border-white/10 bg-obsidian/50 p-5">
                            <h3 className="font-display text-lg font-bold">{x.role}</h3>
                            <p className="mt-0.5 text-sm text-slate-300">{x.company}</p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                {x.period} · {x.location}
                            </p>
                            <ul className="mt-3 space-y-2">
                                {x.bullets.map((b) => (
                                    <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (zone === "skills") {
        return (
            <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-iris">Zone</p>
                <h2 className="mb-6 font-display text-2xl font-extrabold tracking-tight">{TITLES[zone]}</h2>
                <div className="flex flex-wrap gap-2">
                    {SKILLS.map((s) => (
                        <span key={s.name} className="rounded-full border border-white/10 bg-obsidian/50 px-4 py-2 font-mono text-xs text-slate-300">
                            {s.name}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    if (zone === "about") {
        return (
            <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/80">Zone</p>
                <h2 className="mb-6 font-display text-2xl font-extrabold tracking-tight">{TITLES[zone]}</h2>
                <p className="text-base leading-relaxed text-slate-300">{ABOUT_BIO}</p>
                <div className="mt-6 rounded-xl border border-white/10 bg-obsidian/50 p-5">
                    <h3 className="font-display text-base font-bold">{EDUCATION.degree}</h3>
                    <p className="mt-0.5 text-sm text-slate-300">{EDUCATION.school}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{EDUCATION.detail}</p>
                </div>
            </div>
        );
    }

    // contact
    return (
        <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-pink-400/80">Zone</p>
            <h2 className="mb-6 font-display text-2xl font-extrabold tracking-tight">{TITLES[zone]}</h2>
            <div className="flex flex-col gap-3">
                <a href={`mailto:${PROFILE.email}`} data-testid="world-panel-email" className="flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian/50 px-5 py-4 text-sm text-slate-200 transition-colors hover:border-pink-400/40">
                    <Mail className="h-4 w-4 text-pink-400" aria-hidden="true" /> {PROFILE.email}
                </a>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian/50 px-5 py-4 text-sm text-slate-200">
                    <Phone className="h-4 w-4 text-pink-400" aria-hidden="true" /> {PROFILE.phone}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        ["GitHub", PROFILE.github, Github],
                        ["LinkedIn", PROFILE.linkedin, Linkedin],
                        ["LeetCode", PROFILE.leetcode, Code2],
                    ].map(([label, href, Icon]) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-obsidian/50 py-4 transition-colors hover:border-pink-400/40">
                            <Icon className="h-5 w-5 text-pink-400" aria-hidden="true" />
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
                        </a>
                    ))}
                </div>
                <button
                    data-testid="world-panel-contact-form"
                    onClick={() => navigate("/site#contact")}
                    className="mt-2 rounded-full bg-pink-500/90 px-6 py-3 font-display text-sm font-bold text-obsidian transition-colors hover:bg-pink-400"
                >
                    Use the contact form instead
                </button>
            </div>
        </div>
    );
}
