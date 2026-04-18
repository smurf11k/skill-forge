import { defineConfig } from "vitepress";

const socialLinks = [
  { icon: "github", link: "https://github.com/smurf11k/skill-forge" },
];

const englishNav = [
  { text: "Home", link: "/" },
  { text: "Guide", link: "/guide/setup" },
  { text: "API", link: "/reference/api" },
  { text: "Roadmap", link: "/roadmap" },
];

const englishSidebar = [
  {
    text: "Guide",
    items: [
      { text: "Setup", link: "/guide/setup" },
      { text: "Architecture", link: "/guide/architecture" },
      { text: "Auth and Routing", link: "/guide/auth-and-routing" },
      { text: "Employee Guide", link: "/guide/employee" },
      { text: "Admin Guide", link: "/guide/admin" },
      { text: "Testing", link: "/guide/testing" },
      { text: "Product Demos", link: "/guide/demos" },
    ],
  },
  {
    text: "Reference",
    items: [
      { text: "Markdown", link: "/reference/markdown" },
      { text: "API", link: "/reference/api" },
    ],
  },
  {
    text: "Project",
    items: [{ text: "Roadmap", link: "/roadmap" }],
  },
];

const ukrainianNav = [
  { text: "Головна", link: "/uk/" },
  { text: "Посібник", link: "/uk/guide/setup" },
  { text: "API", link: "/uk/reference/api" },
  { text: "Дорожня карта", link: "/uk/roadmap" },
];

const ukrainianSidebar = [
  {
    text: "Посібник",
    items: [
      { text: "Налаштування", link: "/uk/guide/setup" },
      { text: "Архітектура", link: "/uk/guide/architecture" },
      {
        text: "Аутентифікація і маршрутизація",
        link: "/uk/guide/auth-and-routing",
      },
      { text: "Посібник для співробітника", link: "/uk/guide/employee" },
      { text: "Посібник для адміністратора", link: "/uk/guide/admin" },
      { text: "Тестування", link: "/uk/guide/testing" },
      { text: "Демо продукту", link: "/uk/guide/demos" },
    ],
  },
  {
    text: "Довідка",
    items: [
      { text: "Markdown", link: "/uk/reference/markdown" },
      { text: "API", link: "/uk/reference/api" },
    ],
  },
  {
    text: "Проєкт",
    items: [{ text: "Дорожня карта", link: "/uk/roadmap" }],
  },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SkillForge Docs",
  description: "Documentation for setup, architecture, workflows, and API",
  appearance: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],

  locales: {
    root: {
      label: "EN",
      lang: "en-US",
      title: "SkillForge Docs",
      description: "Documentation for setup, architecture, workflows, and API",
      themeConfig: {
        nav: englishNav,
        sidebar: englishSidebar,
        socialLinks,
      },
    },
    uk: {
      label: "UA",
      lang: "uk-UA",
      link: "/uk/",
      title: "Документація SkillForge",
      description:
        "Документація зі встановлення, архітектури, робочих процесів і API",
      themeConfig: {
        nav: ukrainianNav,
        sidebar: ukrainianSidebar,
        socialLinks,
      },
    },
  },
});
