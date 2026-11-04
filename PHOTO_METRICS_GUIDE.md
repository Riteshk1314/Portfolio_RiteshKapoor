# Photo & Image Quality Guide — Metrics + Best Practices

> A research-backed guide for judging the images used on this portfolio website (project shots, screenshots, mockups and visual work). No personal/headshot photos are in scope.

---

## 1. Why a rubric?

Image quality on a portfolio is judged on **intentionality, technical consistency and delivery performance** — not on subjective "looks nice" preferences. This document defines the metrics so every image on the site can be scored, compared and curated objectively.

---

## 2. Judging Metrics

### 2.1 Technical Metrics (the baseline)

| Metric | What to check | Pass benchmark |
|---|---|---|
| **Sharpness** | Focus on the subject; no over-sharpening halos or contrast halos. Perceived sharpness correlates with the 50% MTF (Modulation Transfer Function) frequency. | Subject plane crisp; artifacts absent at 100% zoom |
| **Resolution** | Pixel count sufficient for the display size (rendered at ~2x for retina). | No visible upscaling; original ≥ rendered size |
| **Noise / Grain** | Signal-to-noise ratio appropriate; no muddy smearing from aggressive noise reduction. | Detail preserved; noise only if intentional (mood) |
| **Exposure & Tonal Range** | No unintentional clipping in highlights or shadows; pleasing contrast. | Histogram holds detail at both ends; no blown whites/crushed blacks |
| **White Balance / Color** | Color casts are controlled or deliberately stylistic. Coherent grading beats "correct" grading. | Consistent grade across the set |
| **Dynamic Range** | Detail held across light levels (measured in EV/f-stops). | Shadow + highlight detail both readable |

### 2.2 Composition Metrics

| Metric | What to check |
|---|---|
| **Subject clarity** | Main subject stands out immediately; no distracting clutter or unintended overlaps. |
| **Balance & framing** | Lines, shapes and negative space contribute deliberately; horizon level; nothing awkward clipped at frame edges. |
| **Negative space** | Functions as breathing room, not an empty void. |
| **Rule of thirds vs. center** | Either is valid — what matters is that the framing supports the subject. Rules are guidelines, not laws. |

### 2.3 Intent Metric (overrides all others)

A technical "flaw" (motion blur, grain, hard crop) is **correct if it serves the narrative or mood**. Always judge: *does this image communicate the work clearly and confidently?* Technical perfection that dilutes intent is a failure; controlled imperfection that amplifies it is a success.

### 2.4 Consistency Metrics (portfolio-level)

- **Lighting**: consistent quality (soft vs. hard) and direction across all project images — this establishes one cohesive visual mood.
- **Texture & grading**: no wild swings in contrast, saturation or treatment between images in the same gallery.
- **Cropping discipline**: grids must preserve original aspect ratios — avoid square-thumbnail cropping that destroys intentional compositions.

### 2.5 Web Delivery & Performance Metrics

| Metric | Benchmark |
|---|---|
| **LCP (Largest Contentful Paint)** | < 2.5 s; hero image loads eagerly, everything else lazy-loads |
| **CLS (Cumulative Layout Shift)** | ≤ 0.25 — always reserve width/height or aspect-ratio for images |
| **Color space** | Export in **sRGB** for consistent color across screens |
| **Formats** | Modern formats first: **WebP / AVIF** (with fallbacks) |
| **Compression** | Test on "hard" images (gradients, fine hair/lines, text in screenshots) — settings must not destroy detail |
| **Retina** | Serve 2x assets for retina; cap device pixel ratio at 2 on mobile (3D contexts: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`) to protect GPU budget |

### 2.6 Engagement Validation (analytics, optional)

- **Scroll depth** — are images being seen?
- **Click-through rate** on project images — are they inviting interaction?
- Use these to settle "which image is better" debates with data instead of taste.

---

## 3. Scoring Rubric (use per image)

Score each image 1–5 on the six axes below; only images scoring **≥ 4 average** make the site.

1. **Technical** — sharpness, exposure, noise, color
2. **Composition** — subject clarity, balance, framing
3. **Intent** — does it tell the story of the work?
4. **Consistency** — does it match the set's mood?
5. **Delivery** — format, weight, retina-readiness
6. **Impact** — the gut check: would a hiring manager remember it?

---

## 4. Best Practices (Do / Don't)

### Do
- **Curate ruthlessly — less is more.** A series of 12–20 strong images beats showing everything. Every image must earn its place.
- **Sequence like a book.** Order images to create a narrative arc: hook → process → result.
- **Show the work honestly.** Screenshots/mockups should represent real output, not aspirational renders.
- **Reserve layout space** for every image (aspect-ratio boxes) to keep CLS low.
- **Optimize before upload**: compress, convert to WebP/AVIF, strip EXIF, sRGB.
- **Test on a real retina screen and a slow connection** before publishing.

### Don't
- Don't mix lighting/grading styles inside one gallery.
- Don't crop intentional compositions to fit forced square thumbnails.
- Don't serve original camera-resolution files to the browser.
- Don't stack decorative filters, borders or drop shadows that fight the image itself.
- Don't include near-duplicates — one hero version of each project moment.
- Don't rely on "it looks better to me" — fall back on the rubric above.

---

## 5. Quick Checklist (before an image ships)

- [ ] Sharp at 100% zoom, no over-sharpening halos
- [ ] Exposure: no clipped highlights/shadows (unless intentional)
- [ ] Grade matches the rest of the gallery
- [ ] Composition supports the subject; edges clean, horizon level
- [ ] Exported sRGB, WebP/AVIF, correctly compressed
- [ ] Correct dimensions for retina (2x), reserved layout space
- [ ] Lazy-loaded (unless it's the hero / LCP element)
- [ ] It scores ≥ 4/5 on the rubric and beats any duplicate

---

## 6. Sources

- thecrit.co — Portfolio critique checklist
- projektid.co — Photography & website design philosophy
- webdesignawards.io — Judging rubric (LCP, CLS, typography, color)
- lensic.app — Photography rubric fundamentals
- imatest.com — Image quality factors (MTF/SFR, noise, dynamic range)
- rps.org — Royal Photographic Society appraisal criteria
- instituteofphotographers.co.uk — Professional critique framework (2026)
- getwebp.com — Image workflows for portfolio sites
- hontran.dev — Building an award-winning portfolio site
