const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: color('background'),
        foreground: color('foreground'),
        card: color('card'),
        muted: { DEFAULT: color('muted'), foreground: color('muted-foreground') },
        border: color('border'),
        input: color('input'),
        primary: { DEFAULT: color('primary'), foreground: color('primary-foreground') },
        secondary: color('secondary'),
        accent: { DEFAULT: color('accent'), foreground: color('accent-foreground') },
        destructive: color('destructive'),
        ring: color('ring'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Calistoga', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
