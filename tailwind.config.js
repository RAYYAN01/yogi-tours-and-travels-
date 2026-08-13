/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/views/**/*.ejs",
    "./src/client/**/*.ts"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem"
      }
    },
    extend: {
      colors: {
        // Brand palette — generated from the approved swatch set (Burgundy #942106,
        // Yellow Green #dee64c, Black #491607), keeping each anchor color at the
        // stop it's used at across the site (e.g. sun-400 / brand-600 / ink-900).
        // Burnt Sienna (orange) was dropped from the accent role — `sun` is now the
        // bright Yellow Green instead, so no more orange anywhere on the site.
        // `ink` is hand-tuned rather than auto-ramped from Black, since that hex is
        // heavily saturated (~83%) — used at full strength it would make ordinary
        // body text/borders look like tinted rust rather than a neutral gray, so
        // mid tones are desaturated and only deepen toward true Black at 900/950.
        ink: {
          50: "#f9f6f6",
          100: "#f0ebea",
          200: "#dcd3d0",
          300: "#bfb0ab",
          400: "#9c8881",
          500: "#7d655e",
          600: "#634c45",
          700: "#4f3830",
          800: "#46251b",
          900: "#491607",
          950: "#2f0e04"
        },
        brand: {
          50: "#fef1ee",
          100: "#fcded7",
          200: "#f9b8a8",
          300: "#f68368",
          400: "#f34921",
          500: "#c22c09",
          600: "#942106",
          700: "#761c06",
          800: "#591606",
          900: "#3d1005",
          950: "#250a03"
        },
        sun: {
          50: "#fcfdf1",
          100: "#f8fadf",
          200: "#f1f4b9",
          300: "#e8ed85",
          400: "#dee64c",
          500: "#ccd521",
          600: "#a9b01f",
          700: "#878d1b",
          800: "#666a16",
          900: "#454811",
          950: "#2a2c0b"
        },
        success: "#1e8a6b",
        error: "#942106"
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        body: ["'Inter'", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      maxWidth: {
        "8xl": "88rem"
      },
      boxShadow: {
        card: "0 1px 1px rgba(11,16,23,0.04), 0 4px 10px -4px rgba(11,16,23,0.12), 0 16px 32px -12px rgba(11,16,23,0.14)",
        "card-hover": "0 2px 2px rgba(11,16,23,0.05), 0 8px 20px -6px rgba(11,16,23,0.18), 0 28px 48px -16px rgba(11,16,23,0.22)",
        popover: "0 4px 8px rgba(11,16,23,0.08), 0 16px 32px -8px rgba(11,16,23,0.22), 0 36px 64px -20px rgba(11,16,23,0.3)",
        glass: "0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 32px -8px rgba(11,16,23,0.25)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both"
      }
    }
  },
  plugins: []
};
