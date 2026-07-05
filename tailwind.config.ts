import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F86C6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#52B788",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F4A261",
          foreground: "#1E293B",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        foreground: "#1E293B",
        muted: {
          DEFAULT: "#64748B",
          foreground: "#94A3B8",
        },
        border: "#E2E8F0",
        danger: "#E76F51",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(30 41 59 / 0.05), 0 1px 3px 0 rgb(30 41 59 / 0.06)",
        card: "0 4px 12px -2px rgb(30 41 59 / 0.08)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rise": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        "pulse-slow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(231, 111, 81, 0.45)" },
          "50%": { boxShadow: "0 0 0 12px rgba(231, 111, 81, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "rise": "rise 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-slow": "pulse-slow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
