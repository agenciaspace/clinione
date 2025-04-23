
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FFD400",
          foreground: "#0A0A0A"
        },
        secondary: {
          DEFAULT: "#FFD400",
          foreground: "#0A0A0A"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "#FFD400",
          foreground: "#0A0A0A",
          primary: "#FFFFFF",
          "primary-foreground": "#0A0A0A",
          accent: "#FFFDF5",
          "accent-foreground": "#0A0A0A",
          border: "#FFF9E6",
          ring: "#FFD400"
        },
        healthblue: {
          50: "#FFFDF5",
          100: "#FFF9E6",
          200: "#FFF5CC",
          300: "#FFEB99",
          400: "#FFE266",
          500: "#FFD400",
          600: "#CCAA00",
          700: "#997F00",
          800: "#665500",
          900: "#332A00",
          950: "#1A1500",
        },
        healthgreen: {
          50: "#FFFDF5",
          100: "#FFF9E6",
          200: "#FFF5CC",
          300: "#FFEB99",
          400: "#FFE266",
          500: "#FFD400",
          600: "#CCAA00",
          700: "#997F00",
          800: "#665500",
          900: "#332A00",
          950: "#1A1500",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
