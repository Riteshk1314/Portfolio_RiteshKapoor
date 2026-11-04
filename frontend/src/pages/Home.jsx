import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
    return (
        <>
            <Hero />
            <Marquee />
            <Projects />
            <Skills />
            <Experience />
            <About />
            <Contact />
        </>
    );
}
