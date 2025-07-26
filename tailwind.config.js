/** @type {import('tailwindcss').Config} */
import {heroui} from "@heroui/react";
module.exports = {
  content: [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  //"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}", -- by default maybe old version
  "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
],

  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()]
}
