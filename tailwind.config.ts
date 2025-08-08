import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B91C1C',
        secondary: '#DC2626',
        pastel: '#FEE2E2',
        white: '#FFFFFF',
        // Red variants for evaluation
        'red-variant-1': {
          primary: '#B91C1C',    // Darker red
          secondary: '#DC2626',
          pastel: '#FEE2E2',
          dark: '#7F1D1D',
          bg: '#1C1917',
        },
        'red-variant-2': {
          primary: '#DC2626',    // Current red
          secondary: '#EF4444',
          pastel: '#FEE2E2',
          dark: '#991B1B',
          bg: '#0C0A09',
        },
        'red-variant-3': {
          primary: '#EF4444',    // Brighter red
          secondary: '#F87171',
          pastel: '#FEE2E2',
          dark: '#B91C1C',
          bg: '#1F1917',
        },
        'red-variant-4': {
          primary: '#F87171',    // Light red
          secondary: '#FCA5A5',
          pastel: '#FEE2E2',
          dark: '#DC2626',
          bg: '#292524',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        subheading: ['var(--font-rubik)', 'Rubik', 'system-ui', 'sans-serif'],
        body: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      // Using default Tailwind breakpoints for better compatibility
      // screens: sm: '640px', md: '768px', lg: '1024px', xl: '1280px'
      // Optimized animations - only essential ones
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gentle': 'pulseGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
export default config