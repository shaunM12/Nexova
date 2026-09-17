import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A1628",
          muted: "#3D4F63",
        },
        fog: "#F3F6F9",
        tide: {
          DEFAULT: "#0F766E",
          dark: "#0B5F58",
          light: "#14B8A6",
        },
        danger: "#B42318",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-figtree)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-up-delay": "fade-up 0.7s ease-out 0.12s both",
        "fade-up-delay-2": "fade-up 0.7s ease-out 0.24s both",
      },
    },
  },
  plugins: [],
};

export default config;
