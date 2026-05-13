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
        oak:        "#2C1810",
        walnut:     "#6B4423",
        accent:     "#C8956D",
        cream:      "#EDD9C0",
        background: "#FBF5EC",
        gold:       "#C8882A",
        verified:   "#3D7A3D",
        muted:      "#8A7968",
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        "card":         "0 1px 3px rgba(44,24,16,0.06), 0 4px 16px rgba(44,24,16,0.08)",
        "card-hover":   "0 4px 8px rgba(44,24,16,0.08), 0 12px 28px rgba(44,24,16,0.12)",
        "glow-gold":    "0 0 20px rgba(200,136,42,0.35), 0 2px 8px rgba(200,136,42,0.25)",
        "glow-walnut":  "0 4px 24px rgba(107,68,35,0.30)",
        "glow-sm":      "0 2px 12px rgba(107,68,35,0.20)",
        "bottom-nav":   "0 -1px 0 rgba(44,24,16,0.06), 0 -4px 20px rgba(44,24,16,0.04)",
        "glass":        "0 4px 24px rgba(44,24,16,0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "gradient-walnut": "linear-gradient(135deg, #6B4423 0%, #2C1810 100%)",
        "gradient-gold":   "linear-gradient(135deg, #D4A574 0%, #C8882A 100%)",
        "gradient-warm":   "linear-gradient(160deg, #FDF7EE 0%, #FBF5EC 60%, #F5ECD8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
