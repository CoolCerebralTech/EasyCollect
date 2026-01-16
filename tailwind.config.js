/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // --- Backgrounds (Student-friendly, warm) ---
        background: {
          light: "#FFFFFF",      // Pure white for light mode
          DEFAULT: "#0F172A",    // Deep slate for dark mode
          subtle: "#1E293B",     // Slightly lighter slate
          muted: "#334155",      // Medium slate
          elevated: "#475569",   // Elevated slate
          card: "#1E293B",       // Card background
          hover: "#334155",      // Hover state
        },

        // --- Borders (Soft, not harsh) ---
        border: {
          DEFAULT: "#E2E8F0",    // Light mode border
          light: "#CBD5E1",
          dark: "#334155",       // Dark mode border
          accent: "#3B82F6",     // Accent border (blue)
        },

        // --- Text (Student-readable) ---
        text: {
          DEFAULT: "#0F172A",    // Dark text for light mode
          subtle: "#64748B",     // Subtle gray
          muted: "#94A3B8",      // Muted gray
          inverted: "#FFFFFF",   // White text
          link: "#3B82F6",       // Blue links
          accent: "#8B5CF6",     // Purple accent
        },

        // --- Brand Palette (Energetic, Student vibes) ---
        brand: {
          primary: "#3B82F6",    // Trust blue
          secondary: "#8B5CF6",  // Creative purple
          accent: "#F59E0B",     // Energy amber
          success: "#10B981",    // Success green
          warning: "#F59E0B",    // Warning amber
          danger: "#EF4444",     // Danger red
        },

        // --- University Colors (Vibrant) ---
        university: {
          blue: "#2563EB",
          green: "#10B981",
          purple: "#8B5CF6",
          orange: "#F97316",
          pink: "#EC4899",
          teal: "#14B8A6",
          indigo: "#6366F1",
          yellow: "#FACC15",
        },

        // --- Primary (Blue - Trust & Reliability) ---
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          foreground: "#FFFFFF",
        },

        // --- Secondary (Purple - Creativity & Youth) ---
        secondary: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          foreground: "#FFFFFF",
        },

        // --- Status Colors (Clear & Friendly) ---
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#2563EB",
        },
      },

      // --- Typography (Student-friendly, readable) ---
      fontFamily: {
        display: ["Lexend", "Inter", "sans-serif"],    // Modern, friendly headings
        body: ["Inter", "system-ui", "sans-serif"],    // Clean, readable body
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Display sizes
        display: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        hero: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        subtitle: ["1.5rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "600" }],
        // Functional sizes
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },

      // --- Shadows (Soft, friendly) ---
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.3)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
      },

      // --- Border Radius (Friendly, rounded) ---
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },

      // --- Animations (Smooth, delightful) ---
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 1s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      // --- Spacing (Consistent rhythm) ---
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },

      // --- Z-index (Proper layering) ---
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        modal: "1040",
        popover: "1050",
        tooltip: "1060",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};