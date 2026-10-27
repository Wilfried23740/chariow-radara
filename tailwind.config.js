const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        brand: color('brand'),
        accent: { DEFAULT: color('accent'), foreground: color('accent-foreground') },
        destructive: color('destructive'),
        ring: color('ring'),
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'grow-x': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'grow-y': { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'fade-up': 'fade-up 0.35s ease-out both',
        'grow-x': 'grow-x 0.7s ease-out both',
        'grow-y': 'grow-y 0.7s ease-out both',
        sweep: 'spin 5s linear infinite',
      },
    },
  },
  plugins: [],
};
