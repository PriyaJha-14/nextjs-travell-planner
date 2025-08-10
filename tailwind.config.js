// tailwind.config.js
import { heroui } from "@heroui/react";

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/react/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui()],
};
