# 👨‍💻 Daryl Mendoza | DevOps Engineer / SRE Portfolio

This is my professional portfolio, built with **Astro 5.0** and designed to showcase my experience in infrastructure automation, Site Reliability Engineering (SRE), and cloud architectures.

## 🚀 Key Features

- **🌎 Native Bilingual Support**: Implemented using Astro's official i18n system, supporting English and Spanish with automatic browser language detection.
- **📊 GitHub Integration**: Real-time fetching of profile metrics (repositories, followers, gists) via the GitHub API.
- **📝 Technical Blog**: Content system managed through Astro `Content Collections` to share articles about DevOps and infrastructure.
- **✨ Premium Design**: Modern "Glassmorphism" aesthetic with **Roboto Mono** typography for a technical and professional (DevOps-focused) look.
- **⚡ Peak Performance**: Static Site Generation (SSG) for instant load times and SEO optimization.

## 🛠️ Tech Stack

- **Core**: [Astro 5.16.7+](https://astro.build/)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with a design system based on CSS variables and blur effects.
- **Fonts**: Roboto Mono (via Google Fonts).
- **Deployment**: Optimized for [Cloudflare Pages](https://pages.cloudflare.com/).

## 📁 Project Structure

```text
/
├── src/
│   ├── components/     # Visual components (Hero, Navbar, TechStack, etc.)
│   ├── content/        # Markdown for the Technical Blog (EN/ES)
│   ├── i18n/           # Translation dictionaries and utilities
│   ├── layouts/        # Base layout with the global design system
│   └── pages/
│       ├── [lang]/     # Dynamic routes for bilingual support
│       └── 404.astro   # Custom error page
├── public/             # Static assets (favicon.svg, robots.txt)
└── astro.config.mjs    # i18n configuration and plugins
```

## 🧞 Commands

All commands are run from the project's root:

| Command | Action |
| :--- | :--- |
| `pnpm install` | Installs necessary dependencies. |
| `pnpm dev` | Starts the local dev server at `localhost:4321`. |
| `pnpm build` | Builds the static site to the `./dist/` folder. |
| `pnpm preview` | Previews the build locally. |

## 🌐 i18n Configuration

The site uses a dynamic routing architecture. To add a new language:
1. Add the locale to `astro.config.mjs`.
2. Add the translations to `src/i18n/ui.ts`.
3. Astro will automatically generate the new routes during the build process.

## 📄 License

This project is licensed under the MIT License. Feel free to use it as a base for your own portfolio!
