export const scrollTo = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    if (window.__lenis) {
        // page height may have changed since Lenis last measured (e.g. right after a route change)
        window.__lenis.resize();
        window.__lenis.scrollTo(el, { offset: -70 });
    }
    else el.scrollIntoView({ behavior: "smooth" });
};
