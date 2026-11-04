import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PROFILE, RESUME_URL } from "@/data/content";
import { Eyebrow, Magnetic, Roll, SplitText, useLocalTime } from "@/components/site/motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LINKS = [
    ["GitHub", PROFILE.github, "social-github"],
    ["LinkedIn", PROFILE.linkedin, "social-linkedin"],
    ["LeetCode", PROFILE.leetcode, "social-leetcode"],
];

function Field({ id, label, textarea, ...rest }) {
    const Tag = textarea ? "textarea" : "input";
    return (
        <label htmlFor={id} className="group block border-b border-bone/20 pb-3 transition-colors focus-within:border-ember">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45 group-focus-within:text-ember">{label}</span>
            <Tag
                id={id}
                {...rest}
                className={`mt-2 w-full resize-none bg-transparent font-display text-2xl tracking-tight text-bone outline-none placeholder:text-bone/20 md:text-3xl ${textarea ? "min-h-[110px]" : ""}`}
            />
        </label>
    );
}

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [sending, setSending] = useState(false);
    const time = useLocalTime();

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post(`${API}/contact`, form);
            toast.success("Message sent. I'll get back to you soon.");
            setForm({ name: "", email: "", message: "" });
        } catch {
            toast.error("Couldn't send that. Please try again, or email me directly.");
        } finally {
            setSending(false);
        }
    };

    return (
        <section id="contact" className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
            <Eyebrow index="05">Contact</Eyebrow>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-10">
                <h2 className="font-display text-[clamp(3.4rem,11vw,12rem)] font-bold leading-[0.82] tracking-[-0.06em]">
                    <SplitText text="Have a role" />
                    <br />
                    <span className="font-serif font-normal italic text-ember">
                        <SplitText text="in mind?" delay={0.15} />
                    </span>
                </h2>
                <Magnetic strength={0.4}>
                    <a
                        href={`mailto:${PROFILE.email}`}
                        data-testid="about-email-link"
                        data-cursor="Email"
                        className="grid h-40 w-40 place-items-center rounded-full bg-ember text-center font-display text-lg font-semibold leading-tight text-ink transition-transform active:scale-95 md:h-48 md:w-48 md:text-xl"
                    >
                        Let's
                        <br />
                        talk ↗
                    </a>
                </Magnetic>
            </div>

            <div className="mt-24 grid gap-16 md:grid-cols-12">
                <div className="space-y-10 md:col-span-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">Email</p>
                        <a href={`mailto:${PROFILE.email}`} className="group mt-2 inline-block break-all font-display text-xl tracking-tight md:text-2xl">
                            <Roll>{PROFILE.email}</Roll>
                        </a>
                    </div>
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">Phone</p>
                        <p className="mt-2 font-display text-xl tracking-tight md:text-2xl">{PROFILE.phone}</p>
                    </div>
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">Elsewhere</p>
                        <ul className="mt-2 space-y-1">
                            {LINKS.map(([label, href, id]) => (
                                <li key={id}>
                                    <a data-testid={id} href={href} target="_blank" rel="noopener noreferrer" className="group inline-block font-display text-xl tracking-tight md:text-2xl">
                                        <Roll>{label} ↗</Roll>
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a href={RESUME_URL} download="RiteshKapoorResume.pdf" className="group inline-block font-display text-xl tracking-tight text-ember md:text-2xl">
                                    <Roll>Résumé (PDF) ↓</Roll>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/45">
                        Local time · {time} IST
                        <br />
                        Usually replies within a day
                    </p>
                </div>

                <form data-testid="contact-form" onSubmit={submit} className="space-y-10 md:col-span-7 md:col-start-6">
                    <div className="grid gap-10 sm:grid-cols-2">
                        <Field
                            id="contact-name"
                            data-testid="contact-input-name"
                            label="Your name"
                            placeholder="Priya Sharma"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            maxLength={120}
                        />
                        <Field
                            id="contact-email"
                            data-testid="contact-input-email"
                            label="Your email"
                            type="email"
                            placeholder="priya@company.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            maxLength={200}
                        />
                    </div>
                    <Field
                        id="contact-message"
                        data-testid="contact-input-message"
                        label="Message"
                        textarea
                        placeholder="Tell me about the role or project…"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        maxLength={5000}
                    />
                    <button
                        data-testid="contact-submit-button"
                        type="submit"
                        disabled={sending}
                        className="group flex w-full items-center justify-between rounded-full bg-bone px-8 py-5 font-display text-lg font-semibold text-ink transition-colors hover:bg-ember active:scale-[0.99] disabled:opacity-50"
                    >
                        <Roll>{sending ? "Sending…" : "Send message"}</Roll>
                        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </button>
                </form>
            </div>
        </section>
    );
}
