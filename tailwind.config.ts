import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oak: "#3B2008",
        walnut: "#7A5230",
        accent: "#C4956A",
        cream: "#EDD9C0",
        background: "#FAF3E8",
        gold: "#D4A853",
        verified: "#5C8A5C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-walnut": "0 4px 24px rgba(122, 82, 48, 0.28)",
        "glow-gold":   "0 4px 20px rgba(212, 168, 83, 0.40)",
        "glow-sm":     "0 2px 12px rgba(122, 82, 48, 0.18)",
        "glass":       "0 4px 24px rgba(59, 32, 8, 0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
        "card":        "0 2px 16px rgba(59, 32, 8, 0.06)",
      },
      backgroundImage: {
        "gradient-walnut": "linear-gradient(135deg, #7A5230 0%, #3B2008 100%)",
        "gradient-gold":   "linear-gradient(135deg, #D4A853 0%, #B8892E 100%)",
        "gradient-warm":   "linear-gradient(160deg, #FDF7EE 0%, #FAF3E8 60%, #F5ECD8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
