import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Inbox as InboxIcon, Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EASE = [0.16, 1, 0.3, 1];

export default function Inbox() {
    const [messages, setMessages] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios
            .get(`${API}/contact`)
            .then((r) => setMessages(r.data))
            .catch(() => setError(true));
    }, []);

    return (
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 md:pt-40" data-testid="inbox-container">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-400/80">
                Admin
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Inbox
            </h1>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                Contact-form messages · newest first
            </p>

            {error && (
                <p data-testid="inbox-error" className="mt-10 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    Couldn't load messages. Is the backend running?
                </p>
            )}

            {!error && messages === null && (
                <p data-testid="inbox-loading" className="mt-10 flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading messages…
                </p>
            )}

            {messages && messages.length === 0 && (
                <div data-testid="inbox-empty" className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/40 py-16 text-center">
                    <InboxIcon className="h-8 w-8 text-slate-600" aria-hidden="true" />
                    <p className="text-sm text-slate-500">No messages yet.</p>
                </div>
            )}

            <div className="mt-10 flex flex-col gap-4">
                {messages &&
                    messages.map((m, i) => (
                        <motion.div
                            key={m.id}
                            data-testid={`inbox-message-${i}`}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.06, 0.4) }}
                            className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl"
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="font-display text-base font-bold">
                                    {m.name}{" "}
                                    <span className="ml-2 font-body text-xs font-normal text-cyan-400">
                                        {m.email}
                                    </span>
                                </p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600">
                                    {new Date(m.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                                {m.message}
                            </p>
                        </motion.div>
                    ))}
            </div>
        </div>
    );
}
