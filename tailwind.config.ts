import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutral premium palette. Replace `accent` with the refined TovarkaDuck brand color.
        ink: "#111111",
        paper: "#FAFAFA",
        line: "#E5E5E5",
        muted: "#6B6B6B",
        accent: "#111111",
        "accent-foreground": "#FFFFFF",
        sale: "#B3261E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
      },
      borderRadius: {
        card: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
