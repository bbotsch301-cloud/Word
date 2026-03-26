import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
        crimson: ["var(--font-crimson-pro)", "Georgia", "serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#c8920a",
          light: "#e8b430",
          dim: "rgba(200,146,10,0.25)",
        },
        parchment: {
          DEFAULT: "#ede0c0",
          dim: "#a08860",
        },
        ink: "#080502",
        stratum: {
          0: "#3a2510",
          1: "#2e1c0a",
          2: "#231508",
          3: "#180e05",
          4: "#100803",
          root: "#060300",
        },
        accent: {
          0: "#b8885a",
          1: "#9a6835",
          2: "#7a4818",
          3: "#5c2e08",
          4: "#3a1a04",
          root: "#c8920a",
        },
        family: {
          germanic: "#7c9eb2",
          romance: "#b87a4b",
          hellenic: "#8b7bb8",
          celtic: "#6b9b6b",
          indoiranian: "#c4956a",
          semitic: "#a67c52",
          proto: "#c8920a",
        },
      },
      letterSpacing: {
        archaeological: "0.2em",
        label: "0.4em",
        subtle: "0.06em",
      },
      keyframes: {
        "root-pulse": {
          "0%, 100%": {
            textShadow: "0 0 8px rgba(200,146,10,0.4), 0 0 20px rgba(200,146,10,0.15)",
          },
          "50%": {
            textShadow: "0 0 16px rgba(200,146,10,0.6), 0 0 40px rgba(200,146,10,0.25)",
          },
        },
        "root-reveal": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(200,146,10,0)" },
          "50%": { transform: "scale(1.01)", boxShadow: "0 0 40px 8px rgba(200,146,10,0.3)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 20px 4px rgba(200,146,10,0.1)" },
        },
        "spine-draw": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "root-pulse": "root-pulse 3.5s ease-in-out infinite",
        "root-reveal": "root-reveal 1.2s ease-out forwards",
        "spine-draw": "spine-draw 2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
