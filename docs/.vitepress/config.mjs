import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SkillForge Docs",
  description: "Internal training platform documentation",
  appearance: "dark",

  themeConfig: {
    // Top navigation
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/setup" },
      { text: "Reference", link: "/reference/markdown" },
    ],

    // Sidebar
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Setup", link: "/guide/setup" },
          { text: "Architecture", link: "/guide/architecture" },
          { text: "Employee Guide", link: "/guide/employee" },
          { text: "Admin Guide", link: "/guide/admin" },
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
