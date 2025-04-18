
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
          DEFAULT: "#FFD600",
          foreground: "#000000"
        },
        secondary: {
          DEFAULT: "#FFD600",
          foreground: "#000000"
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
          DEFAULT: "#FFD600",
          foreground: "#000000",
          primary: "#FFFFFF",
          "primary-foreground": "#000000",
          accent: "#FFFAE6",
          "accent-foreground": "#000000",
          border: "#FFF9CC",
          ring: "#FFD600"
        },
        healthblue: {
          50: "#FFFAE6",
          100: "#FFF6CC",
          200: "#FFEE99",
          300: "#FFE566",
          400: "#FFDD33",
          500: "#FFD600",
          600: "#CCAB00",
          700: "#998000",
          800: "#665600",
          900: "#332B00",
          950: "#1A1500",
        },
        healthgreen: {
          50: "#FFFAE6",
          100: "#FFF6CC",
          200: "#FFEE99",
          300: "#FFE566",
          400: "#FFDD33",
          500: "#FFD600",
          600: "#CCAB00",
          700: "#998000",
          800: "#665600",
          900: "#332B00",
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
