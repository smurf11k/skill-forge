import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SkillForge Docs",
  description: "Documentation for setup, architecture, workflows, and API",
  appearance: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],

  themeConfig: {
    // Top navigation
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/setup" },
      { text: "API", link: "/reference/api" },
      { text: "Roadmap", link: "/roadmap" },
    ],

    // Sidebar
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Setup", link: "/guide/setup" },
          { text: "Architecture", link: "/guide/architecture" },
          { text: "Auth and Routing", link: "/guide/auth-and-routing" },
          { text: "Employee Guide", link: "/guide/employee" },
          { text: "Admin Guide", link: "/guide/admin" },
          { text: "Testing", link: "/guide/testing" },
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
    ],

    // Socials (optional, you can replace with your repo later)
    socialLinks: [
      { icon: "github", link: "https://github.com/smurf11k/skill-forge" },
    ],
  },
});
