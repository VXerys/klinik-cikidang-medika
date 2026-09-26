import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'btn-primary': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.32), 0 2px 4px -1px rgba(13, 148, 136, 0.35), 0 4px 14px -2px rgba(13, 148, 136, 0.25)',
        'btn-secondary': 'inset 0 1px 0 0 #ffffff, 0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'card-double': '0 0 0 1px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.02), 0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 1)',
        'card-hover': '0 0 0 1px rgba(13, 148, 136, 0.3), 0 4px 8px -2px rgba(15, 23, 42, 0.05), 0 16px 36px -6px rgba(13, 148, 136, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 1)',
        'well': 'inset 0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        'sidebar-active': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.28), 0 3px 10px -2px rgba(13, 148, 136, 0.4), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'popover': '0 0 0 1px rgba(15, 23, 42, 0.08), 0 16px 36px -4px rgba(15, 23, 42, 0.16), 0 6px 12px -2px rgba(15, 23, 42, 0.06)',
        'dialog': '0 0 0 1px rgba(15, 23, 42, 0.1), 0 28px 56px -12px rgba(15, 23, 42, 0.25), 0 12px 24px -4px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        clinic: {
          turkish: '#0d9488',
          teal: '#0d9488',
          emerald: '#059669',
          sky: '#0284c7',
        }
      },
    },
  },
  plugins: [],
};
export default config;
