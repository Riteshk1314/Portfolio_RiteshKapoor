import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EASE = [0.16, 1, 0.3, 1];

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [sending, setSending] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post(`${API}/contact`, form);
            toast.success("Message sent — I'll get back to you soon.");
            setForm({ name: "", email: "", message: "" });
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const field =
        "w-full rounded-xl border border-white/10 bg-obsidian/60 px-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-colors duration-300 focus:border-cyan-400/60";

    return (
        <section id="contact" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="grid gap-12 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.8, ease: EASE }}
                >
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                        Contact
                    </p>
                    <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        Let's build something.
                    </h2>
                    <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400">
                        Open to full-time roles, internships and ambitious
                        collaborations. The fastest way to reach me is the form —
                        it lands directly in my inbox.
                    </p>
                </motion.div>

                <motion.form
                    data-testid="contact-form"
                    onSubmit={submit}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl"
                >
                    <label className="sr-only" htmlFor="contact-name">Name</label>
                    <input
                        id="contact-name"
                        data-testid="contact-input-name"
                        className={field}
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        maxLength={120}
                    />
                    <label className="sr-only" htmlFor="contact-email">Email</label>
                    <input
                        id="contact-email"
                        data-testid="contact-input-email"
                        type="email"
                        className={field}
                        placeholder="Your email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        maxLength={200}
                    />
                    <label className="sr-only" htmlFor="contact-message">Message</label>
                    <textarea
                        id="contact-message"
                        data-testid="contact-input-message"
                        className={`${field} min-h-[140px] resize-y`}
                        placeholder="What are we building?"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        maxLength={5000}
                    />
                    <button
                        data-testid="contact-submit-button"
                        type="submit"
                        disabled={sending}
                        className="mt-2 rounded-full bg-electric px-7 py-3.5 font-display text-sm font-bold text-obsidian transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_32px_rgba(56,189,248,0.45)] disabled:opacity-50"
                    >
                        {sending ? "Sending…" : "Send Message"}
                    </button>
                </motion.form>
            </div>
        </section>
    );
}
