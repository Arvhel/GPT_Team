import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101512",
        moss: "#bedf9b",
        paper: "#f0f2e9",
      },
    },
  },
  plugins: [],
};

export default config;
