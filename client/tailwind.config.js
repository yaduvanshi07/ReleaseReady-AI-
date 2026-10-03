/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Primary Saffron
          600: '#D97706', // Deep Saffron
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        surface: {
          DEFAULT: '#F5F6F8', // App background
          card: '#FFFFFF',    // Card background
          border: '#E5E7EB',  // Border
          subtle: '#F8FAFC',
          hover: '#F1F5F9'
        },
        ink: {
          primary: '#202124',
          secondary: '#475569',
          muted: '#64748B',
          inverted: '#FFFFFF'
        },
        status: {
          success: '#15803D',
          'success-bg': '#DCFCE7',
          warning: '#B45309',
          'warning-bg': '#FEF3C7',
          error: '#B91C1C',
          'error-bg': '#FEE2E2',
          info: '#1D4ED8',
          'info-bg': '#DBEAFE'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace']
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'elevated': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'saffron-glow': '0 0 15px -3px rgba(245, 158, 11, 0.25)'
      }
    },
  },
  plugins: [],
}
