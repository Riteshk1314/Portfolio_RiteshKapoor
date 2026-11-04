export const scrollTo = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 });
    else el.scrollIntoView({ behavior: "smooth" });
};
