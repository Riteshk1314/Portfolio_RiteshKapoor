import { useEffect, Component } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import CaseStudy from "@/pages/CaseStudy";
import Inbox from "@/pages/Inbox";
import World from "@/pages/World";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { err: false };
    }
    static getDerivedStateFromError() {
        return { err: true };
    }
    render() {
        if (this.state.err) {
            return (
                <div className="grid min-h-screen place-items-center bg-obsidian font-mono text-sm text-slate-400">
                    Something broke — please refresh the page.
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
        window.__lenis = lenis;
        let raf;
        const loop = (t) => {
            lenis.raf(t);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            lenis.destroy();
            window.__lenis = null;
        };
    }, []);

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div className="grain bg-obsidian font-body text-slate-50 antialiased">
                    <CursorGlow />
                    <Nav />
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/projects/:slug" element={<CaseStudy />} />
                        <Route path="/admin/inbox" element={<Inbox />} />
                        <Route path="/world" element={<World />} />
                    </Routes>
                    <Footer />
                    <Toaster
                        theme="dark"
                        position="bottom-right"
                        data-testid="toast-notification"
                    />
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
