import forms from "@tailwindcss/forms";

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        muted: token("muted"),
        line: token("line"),
        ink: { DEFAULT: token("ink"), soft: token("ink-soft"), faint: token("ink-faint") },
        brand: { DEFAULT: token("brand"), strong: token("brand-strong"), soft: token("brand-soft"), ink: token("brand-ink") },
        success: { DEFAULT: token("success"), soft: token("success-soft") },
        warning: { DEFAULT: token("warning"), soft: token("warning-soft") },
        danger: { DEFAULT: token("danger"), soft: token("danger-soft") },
        info: { DEFAULT: token("info"), soft: token("info-soft") },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem" },
      boxShadow: {
        card: "0 1px 2px rgb(28 25 23 / 0.04), 0 4px 16px -4px rgb(28 25 23 / 0.08)",
        lift: "0 2px 4px rgb(28 25 23 / 0.04), 0 16px 40px -12px rgb(28 25 23 / 0.18)",
      },
      keyframes: {
        "fade-up": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: { "fade-up": "fade-up .35s ease-out both" },
    },
  },
  plugins: [forms({ strategy: "class" })],
};
