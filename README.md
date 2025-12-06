# Prompt-Keyword-Mixer

A mobile-first web tool for creating AI prompts by combining managed keywords. Built with Next.js and Tailwind CSS.

![Home Screen](./screenshots/home_page_mobile.png)

## Features

- **Prompt Mixer**: Select keywords from categorized lists to generate a prompt string.
- **Keyword Management**: Add, edit, and delete categories and keywords.
- **Local Persistence**: All data is saved instantly to your browser's Local Storage. No server required.
- **Mobile Optimized**: Designed for easy use on smartphones with large touch targets.

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Storage**: React Context + Local Storage

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  **Manage Tab**: Go here to set up your keyword categories (e.g., "Tone", "Format") and add keywords to them.
2.  **Mixer Tab**: Select the keywords you want to use. They will be combined into a comma-separated string at the bottom.
3.  **Copy**: Tap the copy button to save the prompt to your clipboard.

## License

MIT
