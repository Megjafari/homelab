export const EMAIL = "meghdad.jafari@outlook.com";
export const GITHUB = "https://github.com/Megjafari";
export const LINKEDIN = "https://linkedin.com/in/meghdad-jafari";
export const REPO = "https://github.com/Megjafari/homelab";
export const BLOG = "https://blog.meghdadjafari.dev";
export const STATUS = "Available · Gothenburg & remote";

// CV files live in public/. The first one is listed first in the dropdown.
export const CV_FILES = [
  { label: "English", file: "Meghdad-Jafari-Resume.pdf" },
  { label: "Svenska", file: "Meghdad-Jafari-cv.pdf" },
];

export const FLIPS = [
  { word: "fullstack apps", sub: "C#/.NET and React, from the database to the interface." },
  { word: "reliable APIs", sub: "Backend systems and Web APIs that are clean and easy to run." },
  { word: "Kubernetes platforms", sub: "A homelab run with GitOps and Argo CD, with every change reviewed." },
];

export const PROJECTS = [
  {
    title: "Selah",
    category: "PWA",
    description: "A personal Bible study app with highlights, notes and reading history. Clean Architecture with tests.",
    tags: ["Angular", "ASP.NET Core", "PostgreSQL"],
    source: "https://github.com/Megjafari/selah",
    demo: "https://selah.meghdadjafari.dev",
  },
  {
    title: "ProxDash",
    category: "Dashboard",
    description: "Real-time monitoring and control of a Proxmox homelab, with a browser-based SSH terminal.",
    tags: ["SignalR", "React", "JWT"],
    source: "https://github.com/Megjafari/proxdash",
  },
  {
    title: "Platform Pipelines",
    category: "CI/CD",
    description:
      "A library of reusable GitHub Actions workflows with policy checks. Projects pin a version, so a fix lands everywhere with one bump.",
    tags: ["GitHub Actions", "Open Policy Agent", "CI/CD"],
    source: "https://github.com/Megjafari/platform-pipelines",
  },
  {
    title: "dev-digest",
    category: "Automation",
    description: "Collects developer news and job ads, summarizes them with Claude and posts a daily digest to Discord.",
    tags: [".NET", "GitHub Actions", "Claude API"],
    source: "https://github.com/Megjafari/dev-digest",
  },
  {
    title: "Debugged API",
    category: "REST API",
    description: "A bug knowledge base that surfaces similar past solutions. Clean Architecture and CQRS.",
    tags: [".NET", "CQRS", "PostgreSQL"],
    source: "https://github.com/Megjafari/debugged-api",
  },
];

// Written by hand for now; the blog itself builds from content/posts.
export const POSTS = [
  {
    title: "How I Deploy This Blog on My Homelab, and What Broke",
    category: "28 Oct 2026",
    description:
      "How this blog runs on my homelab with Coolify, Proxmox and a Cloudflare Tunnel, and the four things that broke on the way.",
    tags: ["homelab", "proxmox", "troubleshooting"],
    demo: `${BLOG}/blog/how-i-deploy-this-blog-on-my-homelab-and-what-broke`,
  },
  {
    title: "My Homelab: Building My Own Infrastructure",
    category: "28 Oct 2026",
    description: "How it started on one old laptop, how it grew into a Kubernetes cluster, and what runs on it today.",
    tags: ["homelab", "kubernetes", "devops"],
    demo: `${BLOG}/blog/my-homelab-building-my-own-infrastructure`,
  },
];

export const HOMELAB = {
  statement:
    "I run a Kubernetes cluster at home. Every change is a pull request, checked by CI and applied by Argo CD. When something breaks, I write down why.",
  flow: [
    { title: "Pull request", text: "Every change starts as a branch." },
    { title: "CI checks", text: "Lint, validate and secret scan must pass." },
    { title: "Argo CD", text: "Syncs the merged change to the cluster." },
    { title: "Cluster", text: "Two nodes, one with a GPU." },
  ],
  stats: [
    { value: "2", label: "Kubernetes nodes" },
    { value: "14", label: "Argo CD applications" },
    { value: "6", label: "required CI checks" },
  ],
  tags: ["Kubernetes", "Argo CD", "Ansible", "Terraform", "Proxmox", "Cloudflare"],
};

export const ABOUT = {
  statement:
    "I'm a fullstack developer and homelabber in Gothenburg. I started from zero in 2025, got hooked, and now I like knowing what happens behind the screen, from the code to the network.",
  small: "Outside of code I run my homelab, play with networking and go to the gym. I love working in a team, as a developer among developers.",
  facts: [
    { label: "Studying", value: "Backend development with a cloud specialization, since 2025" },
    { label: "Now", value: "My first internship (LIA)" },
    { label: "Next", value: "Internship 1 Feb – 7 May 2027" },
    { label: "Looking for", value: "A developer or DevOps role after my internship, open to platform and cloud work" },
  ],
};

export const SKILLS = [
  { group: "Backend", items: ["C# / .NET", "ASP.NET Core", "REST APIs", "Entity Framework Core", "PostgreSQL"] },
  { group: "Frontend", items: ["React", "TypeScript", "Tailwind CSS"] },
  { group: "Cloud", items: ["Azure Kubernetes Service", "Azure SQL", "AWS EC2", "AWS S3"] },
  { group: "Infra­structure", items: ["Kubernetes", "Docker", "Linux", "Networking & VLAN", "Proxmox"] },
  { group: "Delivery & automation", items: ["Argo CD / GitOps", "GitHub Actions (CI/CD)", "Terraform", "Ansible"] },
];
