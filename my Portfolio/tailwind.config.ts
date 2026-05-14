import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        grid: "grid 20s linear infinite"
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        grid: { from: { transform: "translateY(0)" }, to: { transform: "translateY(40px)" } }
      }
    }
  },
  plugins: []
} satisfies Config;
