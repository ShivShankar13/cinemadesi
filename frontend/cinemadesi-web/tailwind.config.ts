import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        brand: {
          bg: "#080808",
          surface: "#101010",
          surface2: "#161616",
          surface3: "#1E1E1E",
          border: "#1F1F1F",
          borderHi: "#2E2E2E",
          gold: "#E8B84B",
          goldDim: "#A07C28",
          goldGlow: "rgba(232,184,75,0.12)",
          red: "#E8504B",
          redDim: "rgba(232,80,75,0.15)",
          text: "#F0ECE3",
          textMuted: "#7A7570",
          textDim: "#3A3530",
          bollywood: "#E8504B",
          tamil: "#F97316",
          telugu: "#22C55E",
          malayalam: "#3B82F6",
          kannada: "#EAB308",
          marathi: "#A855F7",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      backgroundImage: {
        "gold-radial":
          "radial-gradient(closest-side, rgba(232,184,75,0.22), rgba(232,184,75,0) 70%)",
        "red-radial":
          "radial-gradient(closest-side, rgba(232,80,75,0.22), rgba(232,80,75,0) 70%)",
        "mesh-hero":
          "radial-gradient(at 12% 18%, rgba(232,184,75,0.18) 0px, transparent 50%), radial-gradient(at 88% 22%, rgba(232,80,75,0.18) 0px, transparent 50%), radial-gradient(at 52% 92%, rgba(168,85,247,0.16) 0px, transparent 50%)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        shimmer: "shimmer 1.5s infinite",
        marquee: "marquee 28s linear infinite",
        glow: "glow 2.4s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
