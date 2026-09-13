import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A2342",
        orange: "#FF7A00",
        bg: "#FAFAFA",
        secondary: "#86868B",
        border: "#E5E5E5",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "24px" },
    },
  },
  plugins: [],
};
export default config;
