/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        surface: '#192134',
        primary: '#15803D',
        accent: '#D97706',
        muted: '#94A3B8',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        heading: ['"Playfair Display"', '"Smiley Sans"', 'serif'],
        body: ['"Public Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        page: '1280px',
      },
    },
  },
  plugins: [],
};
