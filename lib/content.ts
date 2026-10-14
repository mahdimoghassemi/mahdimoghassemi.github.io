import { asset } from "./asset"

export const profile = {
  name: "Mahdi Moghassemi",
  role: "Software engineer",
  location: "UAE",
  timeZone: "Asia/Dubai",
  email: "mahdimoghassemi@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/mahdimoghassemi" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/mahdi-moghassemi-317a47292",
    },
  ],
}

export type ScreenId = "code" | "dashboard" | "graph" | "chat"

export type Chapter = {
  years: string
  company: string
  role: string
  color: string
  story: string
  domains: string[]
  url?: string
  logo: string
}

export const journey: Chapter[] = [
  {
    years: "2018 — 2023",
    company: "K. N. Toosi",
    role: "B.Sc. Computer Engineering",
    color: "#5b9be6",
    logo: asset("/logos/kntu.svg"),
    story:
      "Level one. Five years of computer engineering at K. N. Toosi University of Technology: algorithms, systems, networks, and a quiet question that never left: how much could a program figure out on its own?",
    domains: ["Computer engineering", "IELTS 6.5"],
  },
  {
    years: "2023 — 2024",
    company: "Tritex",
    role: "Front-End Developer",
    color: "#9b5cff",
    logo: asset("/logos/tritex.svg"),
    story:
      "I walked into a crypto exchange as QA and walked out an engineer. Breaking the product taught me how it worked, so the team let me fix it myself: performance, cross-browser bugs, then their OTC trading feature.",
    domains: ["Crypto exchange", "Fintech", "OTC trading"],
  },
  {
    years: "2023 — 2025",
    company: "Azmoon Meyar",
    role: "Technical Project Manager",
    color: "#f9a62f",
    logo: asset("/logos/azmoon-meyar.svg"),
    story:
      "The other side of the table. I took an exam analytics product, the kind that shows schools and students where they are heading, from an empty team to launch day: putting the team together, designing the APIs with the Java and MySQL side, writing the React myself, and automating the tests that kept production quiet.",
    domains: ["EdTech", "Exam analytics", "AI insights"],
  },
  {
    years: "2024 — 2025",
    company: "Pazh",
    role: "Front-End Developer",
    color: "#6c7fe6",
    logo: asset("/logos/pazh.svg"),
    story:
      "Day one at a brand-new company. I built a SaaS platform for invoices and the national tax system from scratch, on a modular architecture that kept features loosely coupled, and helped with the product and competitor research that shaped it.",
    domains: ["SaaS", "E-invoicing", "Tax tech"],
  },
  {
    years: "2024 — 2025",
    company: "Dastyar Tech",
    role: "Front-End Developer",
    color: "#5b8cff",
    logo: asset("/logos/dastyar-tech.svg"),
    story:
      "Another blank canvas, this time an AI assistant. A component-driven Next.js system that made every feature cheaper than the last, a caching layer that cut server traffic roughly in half, and multi-step flows sturdy enough that users stopped tripping over them.",
    domains: ["AI assistant", "Conversational AI"],
  },
  {
    years: "2025",
    company: "Positron",
    role: "Front-End Lead",
    color: "#8b74ff",
    logo: asset("/logos/positron.svg"),
    story:
      "My first time leading. I architected a micro-frontend platform from scratch, BNPL plus a shop and warehouse, and we launched in six months. Then we rebuilt the UI on a workflow where the tools do more of the thinking, and the team started shipping about 30% faster.",
    domains: ["Fintech", "BNPL", "E-commerce", "Inventory"],
  },
  {
    years: "2025 — now",
    company: "QubitOrbit",
    role: "Senior Front-End Developer",
    color: "#2aa3ec",
    logo: asset("/logos/qubitorbit.svg"),
    story:
      "Now, the big one. A trading platform for oil and gas markets, built from nothing. Most of its 130k lines of TypeScript are mine: a formula engine behind a node-graph curve builder, an Excel-like grid, risk and P&L, and Bozy, an assistant that reads trades, curves and news alongside the trader.",
    domains: ["Energy trading", "Oil & gas", "AI"],
  },
]

export type SkillGroup = {
  title: string
  note: string
  screen: ScreenId
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    note: "home turf",
    screen: "code",
    skills: [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Micro-frontends",
      "PWA · TWA",
      "Three.js · WebGL",
    ],
  },
  {
    title: "Data-heavy UI",
    note: "big tables, live numbers",
    screen: "dashboard",
    skills: [
      "React Query",
      "Zustand · Redux",
      "AG Grid",
      "Financial charts",
      "React Flow",
      "Design systems",
      "i18n · RTL",
    ],
  },
  {
    title: "Backend & infra",
    note: "the other side of the API",
    screen: "graph",
    skills: [
      "Java",
      "C#",
      "Python",
      "PostgreSQL",
      "MySQL",
      "Docker",
      "REST API design",
    ],
  },
  {
    title: "AI & ML",
    note: "the quiet obsession",
    screen: "chat",
    skills: [
      "NumPy · Matplotlib",
      "scikit-learn",
      "TensorFlow · Keras",
      "Neural networks",
      "XGBoost · decision trees",
      "Clustering · recommenders",
      "OpenCV · computer vision",
      "LLM products · agent UIs",
      "Claude · Cursor",
    ],
  },
  {
    title: "Quality & tooling",
    note: "how it ships",
    screen: "code",
    skills: [
      "Vitest",
      "Testing Library",
      "Cypress",
      "E2E · stress tests",
      "Git · GitHub · GitLab",
      "Jira",
      "Figma",
    ],
  },
]
