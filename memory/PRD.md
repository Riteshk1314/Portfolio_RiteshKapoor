# PRD — Ritesh Kapoor Portfolio

## Original Problem Statement
Build a portfolio website for Ritesh Kapoor from his resume PDF (work-only showcase, no personal photos). Before coding: set up GitHub repo `Portfolio_RiteshKapoor` and research photo-judging metrics into a .MD guide. User choices: modern dark theme, bold typography, 3D + interactive, award-level motion.

## Architecture
- Frontend: React (CRA) + Tailwind + framer-motion + Lenis (momentum scroll) + Three.js/@react-three/fiber/@react-three/drei (3D hero) + sonner (toasts). Single-page, anchor navigation.
- Backend: FastAPI (`/api/contact` POST/GET, `/api/status` legacy) + MongoDB (contact_messages collection, timestamp index).
- Repo: github.com/Riteshk1314/Portfolio_RiteshKapoor (origin = /app, main branch).

## User Personas
- Recruiters/hiring managers scanning projects + stats fast.
- Collaborators/clients reaching out via contact form.
- Ritesh (owner) keeping content in sync with resume.

## Core Requirements
- Kinetic 3D hero with masked line-by-line on-load reveal, cursor-reactive geometry, parallax fade on scroll
- Bento project grid with spotlight hover cards, real resume projects + live-site links
- Editorial marquee of stack keywords
- Filterable skills grid (resume skills)
- Experience + education cards (real resume data)
- About + contact (real email/phone/socials) with working form → MongoDB, toast confirmation
- Original SVG logo mark as header/footer/favicon
- Lenis smooth scroll, scroll-reveals, custom cursor glow, film grain, dark obsidian theme (Syne / Space Grotesk / JetBrains Mono)

## Implemented (2026-11-04)
- GitHub repo setup + PHOTO_METRICS_GUIDE.md (photo judging metrics & best practices, from research)
- Full site as above, verified: curl backend endpoints, desktop 1440 + mobile 390 screenshots, mobile menu, skills filter, contact form e2e (Preview Tester message stored in DB)
- Resume download button on hero (serves /RiteshKapoorResume.pdf from public/, verified 200 application/pdf)
- Case study pages at /projects/{agentstream|talkeys|fooddle} (overview, highlights, stack, live/repo links, clickable bento cards)
- Inbox panel at /admin/inbox (reads GET /api/contact, newest first; unauthenticated — direct URL only)
- SEO + Open Graph/Twitter meta tags in index.html
- Test contact messages cleaned from DB after verification
- Drivable 3D open world at /world (Bruno Simon style, user request): Three.js low-poly car driven with WASD/arrow keys (touch buttons on coarse-pointer devices), 5 glowing zone pads (Projects, Experience, Skills, About, Contact) with Enter-to-open glass panels showing real resume content, camera follow, obstacle collisions, boundary clamp, zone-explored progress counter. Hero has "Explore in 3D" CTA. Verified e2e: drove car onto CONTACT pad via keyboard, prompt fired, panel opened, back button works after z-index fix (world z-60 above fixed nav).

## Backlog
- P1: Downloadable resume PDF button; project detail modals; per-project case-study pages
- P2: Admin view of contact messages; SEO meta/OG tags; analytics
- P2: Dark/light toggle (user chose dark; low priority)

## Notes
- LeetCode URL normalized to /u/Ritesh_Kapoor (resume had a space in the URL)
- All content sourced from RiteshKapoorResume.pdf; no invented stats
