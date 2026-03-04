/** @type {import('tailwindcss').Config} */

import defaultTheme from "tailwindcss/defaultTheme";
import { nextui } from "@nextui-org/theme";

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "400px",
      sm: "480px",
      bsmmd: "750px",
      bsmmdTwo: "500px",
      md: "700px",
      lg: "1024px",
      blgxllg: "920px",
      blgxl: "1224px",
      xl: "1440px",
      xxl: "1600px",
    },
    extend: {
      fontFamily: {
        Anton: ["Anton", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primaryTextColor: "rgb(var(--color-text-primary) / <alpha-value>)",
        secondaryTextColor: "rgba(var(--color-text-secondary), 0.7)",
        primaryBtn: "var(--color-primary)",
        primaryBtnHower: "var(--color-primary-hover)",
        bgColor: "rgb(var(--color-bg) / <alpha-value>)",
        bgColorSecondary: "rgb(var(--color-bg-secondary) / <alpha-value>)",
        btnColor: "rgb(var(--color-btn) / <alpha-value>)",
        otherColor: "var(--color-primary)",
      },
      aspectRatio: {
        "9/13": "9/13",
      },
      borderRadius: {
        DEFAULT: "var(--radius-base)",
        sm: "calc(var(--radius-base) * 0.5)",
        md: "calc(var(--radius-base) * 0.75)",
        lg: "var(--radius-base)",
        xl: "calc(var(--radius-base) * 1.5)",
        "2xl": "calc(var(--radius-base) * 2)",
        "3xl": "calc(var(--radius-base) * 3)",
        full: "9999px",
      },
      boxShadow: {
        DEFAULT: "var(--shadow-base)",
        sm: "var(--shadow-base)",
        md: "var(--shadow-base)",
        lg: "var(--shadow-base)",
        xl: "var(--shadow-base)",
        "2xl": "var(--shadow-base)",
      },
      fontSize: {
        sm: "0.8rem",
        base: "1rem",
        md: "0.9rem",
        xl: "1.25rem",
        "2xl": "1.4rem",
        "3xl": "1.953rem",
        "4xl": "2.441rem",
        "5xl": "3.052rem",
        "6xl": "4rem",
        "7xl": "6rem",
        "8xl": "8rem",
        "9xl": "11rem",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};