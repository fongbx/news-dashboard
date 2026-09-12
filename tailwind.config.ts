import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF7",
        surface: "#FFFFFF",
        ink: "#1A1A1A",
        muted: "#6B6B65",
        border: "#E8E6E0",
        lane: {
          sg: "#C8102E",
          world: "#2E5C8A",
          ai: "#5B4B8A",
        },
        read: "#8A9A7E",
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
