import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0f172a",
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        tajawal: ["var(--font-tajawal)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 10px 40px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
        card: "0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 25px 30px -8px rgba(0, 0, 0, 0.14), 0 10px 12px -5px rgba(0, 0, 0, 0.06)",
        glow: "0 0 28px -3px rgba(37, 99, 235, 0.45), 0 0 10px -2px rgba(37, 99, 235, 0.25)",
        "glow-sm": "0 0 14px -2px rgba(37, 99, 235, 0.35)",
        "amber-glow": "0 0 25px -4px rgba(245, 158, 11, 0.45)",
        "emerald-glow": "0 0 25px -4px rgba(16, 185, 129, 0.4)",
        "purple-glow": "0 0 25px -4px rgba(139, 92, 246, 0.4)",
        inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)",
        "gradient-premium": "linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #06b6d4 100%)",
        "gradient-fire": "linear-gradient(135deg, #f59e0b 0%, #f97316 60%, #ef4444 100%)",
        "gradient-success": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-dark": "linear-gradient(180deg, #070a12 0%, #0d1322 100%)",
      },
      animation: {
        "float": "floatSlow 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "scale-up": "scaleUp 0.35s cubic-bezier(0.22,0.61,0.36,1) forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.22,0.61,0.36,1) forwards",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.06)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.93)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
