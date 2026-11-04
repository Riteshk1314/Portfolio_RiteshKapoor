import { motion } from "framer-motion";
import { Github, Linkedin, Code2, Mail, Phone } from "lucide-react";
import { PROFILE, ABOUT_BIO } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];
const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.8, ease: EASE },
};

const SOCIALS = [
    { label: "GitHub", href: PROFILE.github, icon: Github, id: "social-github" },
    { label: "LinkedIn", href: PROFILE.linkedin, icon: Linkedin, id: "social-linkedin" },
    { label: "LeetCode", href: PROFILE.leetcode, icon: Code2, id: "social-leetcode" },
];

export default function About() {
    return (
        <section id="about" className="relative bg-surface/50 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div {...reveal} className="mb-14">
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                        About
                    </p>
                    <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        Behind the build.
                    </h2>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-5">
                    <motion.div
                        data-testid="about-bio-card"
                        {...reveal}
                        className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl lg:col-span-3"
                    >
                        <p className="text-lg leading-relaxed text-slate-300">
                            {ABOUT_BIO}
                        </p>
                    </motion.div>

                    <motion.div
                        {...reveal}
                        transition={{ ...reveal.transition, delay: 0.12 }}
                        className="flex flex-col gap-4 lg:col-span-2"
                    >
                        <a
                            href={`mailto:${PROFILE.email}`}
                            data-testid="about-email-link"
                            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-6 py-5 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/40"
                        >
                            <span className="flex items-center gap-3 text-sm text-slate-300">
                                <Mail className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                                {PROFILE.email}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600 group-hover:text-cyan-300">
                                Email
                            </span>
                        </a>
                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-6 py-5 backdrop-blur-xl">
                            <span className="flex items-center gap-3 text-sm text-slate-300">
                                <Phone className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                                {PROFILE.phone}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                                Phone
                            </span>
                        </div>
                        <div className="mt-auto grid grid-cols-3 gap-3">
                            {SOCIALS.map(({ label, href, icon: Icon, id }) => (
                                <a
                                    key={id}
                                    data-testid={id}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/40 py-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:text-cyan-300"
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                                        {label}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
