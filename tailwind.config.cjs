/**
 * Tailwind CSS Configuration
 * Generated for VirtualOS Playground
 */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class", // enables manual toggle via class on <html>
  theme: {
    extend: {
      colors: {
        primary: "hsl(260, 80%, 60%)",
        accent: "hsl(340, 70%, 55%)",
        surface: "hsl(210, 15%, 95%)",
        "surface-dark": "hsl(210, 15%, 12%)",
        background: "hsl(210, 15%, 99%)",
        "background-dark": "hsl(210, 15%, 5%)",
        text: "hsl(210, 15%, 20%)",
        "text-dark": "hsl(210, 15%, 85%)"
      },
      boxShadow: {
        glass: "rgba(0, 0, 0, 0.1) 0 4px 6px -1px, rgba(0, 0, 0, 0.06) 0 2px 4px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};
