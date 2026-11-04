export const PROFILE = {
    name: "Ritesh Kapoor",
    role: "Full-Stack & AI Engineer",
    status: "Data Science Intern @ Axis Bank",
    email: "riteshkapoor1314@gmail.com",
    phone: "+91 98149 56560",
    github: "https://github.com/Riteshk1314",
    linkedin: "https://linkedin.com/in/ritesh-kapoor1314",
    leetcode: "https://leetcode.com/u/Ritesh_Kapoor",
};

export const HERO_LINES = ["RITESH", "KAPOOR"];

export const HERO_SUB =
    "I build full-stack platforms and multi-agent AI systems — from realtime LLM orchestration to ticketing platforms serving thousands of users.";

export const MARQUEE_ITEMS = [
    "PYTHON",
    "JAVASCRIPT",
    "C++",
    "SQL",
    "LANGCHAIN",
    "RAG",
    "DJANGO",
    "EXPRESS.JS",
    "REACT",
    "POSTGRESQL",
    "MONGODB",
    "GCP",
    "DOCKER",
];

export const PROJECTS = [
    {
        id: "project-card-1",
        index: "01",
        title: "AgentStream",
        kind: "Multi-Agent LLM Orchestration Platform",
        description:
            "A Python orchestration layer coordinating 3 locally-hosted LLMs as specialized agents — tool calling, task routing, agent-to-agent delegation and output aggregation into one coherent response, with a custom WebSocket protocol streaming every agent's tokens to the frontend in real time.",
        tags: ["Python", "LangChain", "WebSockets", "SSE"],
        image:
            "https://images.pexels.com/photos/27141313/pexels-photo-27141313.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        span: "featured",
    },
    {
        id: "project-card-2",
        index: "02",
        title: "Talkeys",
        kind: "Event Ticketing Platform",
        description:
            "Full-stack ticketing platform with a RESTful API backend and QR-code scanning that admits only valid tickets. Integrated the PhonePe payment gateway with webhook callbacks for secure end-to-end transactions, deployed and scaled on GCP.",
        stat: "3,500+ users · 99.9% uptime at peak",
        tags: ["Express.js", "MongoDB", "React", "GCP"],
        image:
            "https://images.pexels.com/photos/27141316/pexels-photo-27141316.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        span: "compact",
    },
    {
        id: "project-card-3",
        index: "03",
        title: "Fooddle",
        kind: "Food Delivery Platform",
        description:
            "Full-stack food delivery platform connecting students with campus vendors — RESTful backend services on Django with PostgreSQL databases and PhonePe payments, processing 10,000+ orders with 100+ concurrent daily transactions.",
        stat: "5,000+ users · 10,000+ orders",
        tags: ["Django", "PostgreSQL", "React"],
        image:
            "https://images.unsplash.com/photo-1763805508094-901f2a79ff77?crop=entropy&cs=srgb&fm=jpg&q=85",
        span: "tall",
    },
];

export const LIVE_LINKS = [
    { label: "talkeys.xyz", url: "https://talkeys.xyz" },
    { label: "fooddle.in", url: "https://fooddle.in" },
];

export const EXPERIENCE = [
    {
        company: "Axis Bank",
        role: "Data Science Intern",
        period: "Jun 2026 — Jul 2026",
        location: "Mumbai, India",
        bullets: [
            "Queried and transformed 500K+ corporate grievance records across voice, email and digital channels using Oracle SQL, uncovering resolution bottlenecks that helped reduce average complaint closure time",
            "Bridged business and data teams on the Tableau-to-Power BI migration — gathered stakeholder requirements, agreed KPIs and business definitions, and migrated existing dashboards",
            "Replaced manual report checks with an automated validation and scheduled email-reporting workflow using SQL and PySpark, improving stakeholder trust in the data",
        ],
    },
    {
        company: "Creative Computing Society, Thapar University",
        role: "General Secretary",
        period: "Aug 2025 — May 2026",
        location: "Patiala, India",
        bullets: [
            "Organized and led HackTU 6.0 & 7.0 for 450+ offline participants",
            "Conducted technical workshops on Artificial Intelligence, Web Development and Git/GitHub for 200+ students",
            "Managed on-ground execution, stakeholder coordination and issue resolution for large-scale events",
        ],
    },
];

export const EDUCATION = {
    school: "Thapar Institute of Engineering and Technology",
    degree: "B.Tech in Computer Science and Engineering",
    detail: "CGPA 8.53 / 10.0 · Expected graduation May 2027",
    school2: "B.C.M School, Ludhiana",
    detail2: "Class of 2023 · 12th — 94% · 10th — 94.8%",
};

export const SKILL_CATEGORIES = [
    "All",
    "Languages",
    "AI & LLMs",
    "Frameworks",
    "Databases",
    "Cloud & DevOps",
    "Core CS",
];

export const SKILLS = [
    { name: "Python", cat: "Languages" },
    { name: "JavaScript", cat: "Languages" },
    { name: "C++", cat: "Languages" },
    { name: "SQL", cat: "Languages" },
    { name: "LangChain", cat: "AI & LLMs" },
    { name: "LangSmith", cat: "AI & LLMs" },
    { name: "RAG", cat: "AI & LLMs" },
    { name: "Multi-Agent Orchestration", cat: "AI & LLMs" },
    { name: "Real-time Token Streaming (SSE)", cat: "AI & LLMs" },
    { name: "Django", cat: "Frameworks" },
    { name: "Express.js", cat: "Frameworks" },
    { name: "React.js", cat: "Frameworks" },
    { name: "PostgreSQL", cat: "Databases" },
    { name: "MongoDB", cat: "Databases" },
    { name: "GCP", cat: "Cloud & DevOps" },
    { name: "Docker", cat: "Cloud & DevOps" },
    { name: "GitHub Actions (CI/CD)", cat: "Cloud & DevOps" },
    { name: "Data Structures & Algorithms", cat: "Core CS" },
    { name: "Computer Networks", cat: "Core CS" },
    { name: "DBMS", cat: "Core CS" },
    { name: "OOP", cat: "Core CS" },
];

export const ABOUT_BIO =
    "I'm Ritesh — a Computer Science undergraduate at Thapar Institute who ships real products. I've deployed ticketing and delivery platforms used by thousands, orchestrated multi-agent LLM systems, and turned half a million grievance records into decisions at Axis Bank. I care about clean architecture, fast interfaces and details you can feel.";

export const RESUME_URL = "/RiteshKapoorResume.pdf";

export const CASE_STUDIES = {
    agentstream: {
        slug: "agentstream",
        overview:
            "AgentStream is a multi-agent LLM orchestration platform built in Python. It coordinates 3 locally-hosted LLMs as specialized agents — handling tool calling, task routing, agent-to-agent delegation, turn-taking and output aggregation into one coherent response. A custom WebSocket streaming protocol delivers each agent's tokens to the frontend in real time, making multi-agent reasoning observable as it happens.",
        highlights: [
            "Coordinated 3 locally-hosted LLMs as specialized agents with defined roles and turn-taking",
            "Implemented tool calling, task routing and agent-to-agent delegation",
            "Aggregated multi-agent outputs into a single coherent response",
            "Engineered a custom WebSocket streaming protocol for real-time token delivery to the frontend",
        ],
        stack: ["Python", "LangChain", "WebSockets", "SSE", "Locally-hosted LLMs"],
        live: null,
        repo: PROFILE?.github || "https://github.com/Riteshk1314",
    },
    talkeys: {
        slug: "talkeys",
        overview:
            "Talkeys is a full-stack event ticketing platform serving 3,500+ users. It pairs a RESTful API backend with QR-code scanning that admits only valid tickets, and integrates the PhonePe payment gateway API with webhook callbacks for secure, end-to-end ticket transactions.",
        highlights: [
            "QR-code ticket validation at entry — only valid tickets are admitted",
            "PhonePe payment gateway integration with webhook callbacks for secure end-to-end transactions",
            "Deployed and scaled the backend on GCP for thousands of concurrent requests",
            "Sustained 99.9% uptime at peak",
        ],
        stack: ["Express.js", "MongoDB", "React.js", "GCP", "PhonePe API"],
        live: "https://talkeys.xyz",
        repo: "https://github.com/Riteshk1314",
    },
    fooddle: {
        slug: "fooddle",
        overview:
            "Fooddle is a full-stack food delivery platform connecting students with campus vendors, serving 5,000+ users. Built on Django with PostgreSQL databases, it processes 10,000+ orders and supports 100+ concurrent daily transactions, with PhonePe payments integrated.",
        highlights: [
            "Full-stack platform connecting students with campus vendors",
            "RESTful backend services with PostgreSQL databases",
            "PhonePe payment integration for orders",
            "10,000+ orders processed with 100+ concurrent daily transactions",
        ],
        stack: ["Django", "PostgreSQL", "React.js", "PhonePe API"],
        live: "https://fooddle.in",
        repo: "https://github.com/Riteshk1314",
    },
};
