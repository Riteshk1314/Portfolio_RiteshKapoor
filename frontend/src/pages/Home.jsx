import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollTo } from "@/lib/scroll";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
    const { hash } = useLocation();
    useEffect(() => {
        if (!hash) return;
        const id = setTimeout(() => scrollTo(hash), 450);
        return () => clearTimeout(id);
    }, [hash]);

    return (
        <>
            <Hero />
            <Marquee />
            <About />
            <Projects />
            <Experience />
            <Skills />
            <Contact />
        </>
    );
}
