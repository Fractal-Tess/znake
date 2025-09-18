# Znake

<img src="./znake.png" alt="Znake Logo" width="200" height="200" />

**Docker Security Scanner** - Scan your Docker containers for vulnerabilities with lightning-fast precision.

> **⚠️ Learning Project** - This is a personal learning project focused on exploring modern web development technologies, Docker security concepts, and creating engaging user interfaces. It is not intended for production use.

## Overview

Znake is a modern web application built for scanning Docker containers for security vulnerabilities. It provides detailed security reports and helps keep your deployments safe with an intuitive, animated interface. This project serves as a hands-on exploration of full-stack development, container security concepts, and modern UI/UX design patterns.

## Features

- **Docker Container Scanning** - Comprehensive vulnerability detection
- **Lightning-Fast Performance** - Quick scan results and reporting
- **Modern UI** - Beautiful animated interface with GSAP animations
- **Detailed Reports** - Comprehensive security analysis and recommendations
- **Security-First** - Built with security best practices in mind

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with shadcn/ui components
- **Animations**: [GSAP](https://greensock.com/gsap/) for smooth text animations
- **Background**: Custom PixelBlast component for dynamic visual effects
- **Database**: [Drizzle ORM](https://orm.drizzle.team) with SQLite
- **API**: [tRPC](https://trpc.io) for type-safe API calls
- **Language**: TypeScript for full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Fractal-Tess/znake.git
cd znake
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up the database:

```bash
npx drizzle-kit push
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout with PixelBlast background
│   └── page.tsx        # Home page with animated text
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── PixelBlast.tsx  # Animated background component
│   └── SplitText.tsx   # GSAP text animation component
├── server/             # Backend API
│   ├── api/            # tRPC routers
│   └── db/             # Database schema and configuration
└── styles/             # Global styles and theme
```

## Development

### Database

The project uses Drizzle ORM with SQLite. To make schema changes:

```bash
# Generate migration
npx drizzle-kit generate

# Apply changes
npx drizzle-kit push
```

### Styling

The project uses Tailwind CSS with a custom theme. Colors and design tokens are defined in `src/styles/globals.css`.

### Animations

Text animations are powered by GSAP and the custom `SplitText` component. The background uses the `PixelBlast` component for dynamic visual effects.

## Contributing

This is a learning project! Feel free to:

- **Report bugs** - Help identify issues and edge cases
- **Suggest features** - Ideas for new functionality or improvements
- **Submit pull requests** - Contribute code, documentation, or fixes
- **Improve documentation** - Help make the project more understandable
- **Share feedback** - Let me know what you think about the implementation

## Learning Objectives

This project explores:

- **Modern React/Next.js patterns** - App Router, Server/Client Components, Suspense
- **Advanced CSS/UI techniques** - Tailwind CSS, shadcn/ui, custom animations
- **Animation libraries** - GSAP for complex text and visual effects
- **Database design** - Drizzle ORM, SQLite, schema management
- **Type-safe APIs** - tRPC for end-to-end type safety
- **Docker security concepts** - Container vulnerability scanning principles
- **Performance optimization** - Code splitting, lazy loading, efficient rendering

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations powered by [GSAP](https://greensock.com/gsap/)
