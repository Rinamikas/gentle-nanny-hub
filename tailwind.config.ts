import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e7c6ff",
        input: "#e7c6ff",
        ring: "#c8b6ff",
        background: "#ffffff",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#53008f",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#b8c0ff",
          foreground: "#1a1a1a",
        },
        destructive: {
          DEFAULT: "#ff6b6b",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#ffd6ff",
          foreground: "#6c757d",
        },
        accent: {
          DEFAULT: "#bbd0ff",
          foreground: "#1a1a1a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;