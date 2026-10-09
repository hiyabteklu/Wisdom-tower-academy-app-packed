import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wisdom: {
          dark: "rgb(var(--wt-dark-rgb) / <alpha-value>)",
          navy: "rgb(var(--wt-navy-rgb) / <alpha-value>)",
          card: "rgb(var(--wt-card-rgb) / <alpha-value>)",
          cyan: "#22e0ff",
          "cyan-dark": "#00c4e6",
          muted: "rgb(var(--wt-muted-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display-lg": ["2.75rem", { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display-md": ["2.125rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      boxShadow: {
        "card-3d":
          "0 12px 40px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
        "card-3d-hover":
          "0 28px 60px -16px rgba(34, 224, 255, 0.28), 0 12px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,224,255,0.3)",
        glow: "0 0 48px -6px rgba(34, 224, 255, 0.55)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
