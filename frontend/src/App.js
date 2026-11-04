import { useEffect, Component } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import CaseStudy from "@/pages/CaseStudy";
import Inbox from "@/pages/Inbox";
import Park from "@/pages/Park";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Cursor from "@/components/site/Cursor";

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

function SiteLayout() {
    return (
        <>
            <Cursor />
            <Nav />
            <Outlet />
            <Footer />
        </>
    );
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
                <div className="grain bg-ink font-body text-bone antialiased">
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<Park />} />
                        <Route path="/world" element={<Navigate to="/" replace />} />
                        <Route element={<SiteLayout />}>
                            <Route path="/site" element={<Home />} />
                            <Route path="/projects/:slug" element={<CaseStudy />} />
                            <Route path="/admin/inbox" element={<Inbox />} />
                        </Route>
                    </Routes>
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
