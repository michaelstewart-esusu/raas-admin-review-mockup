/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Esusu Admin Console palette
        'esusu-teal': '#153F32',
        'esusu-teal-dark': '#0F2E25',
        'esusu-teal-mid': '#1F5A47',
        'esusu-green': '#2EA678',
        'esusu-green-hover': '#268F67',
        'esusu-green-light': '#E7F6F0',
        'esusu-green-muted': '#D3EDE3',
        'esusu-canvas': '#F0F3F2',
        'esusu-surface': '#FFFFFF',
        'esusu-gray-light': '#F5F7F6',
        'esusu-gray-border': '#D7DEDB',
        'esusu-ink': '#1A2421',
        'esusu-ink-muted': '#5C6B65',
        'esusu-ink-subtle': '#8A9691',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(21, 63, 50, 0.06), 0 8px 24px rgba(21, 63, 50, 0.08)',
        drawer: '-8px 0 32px rgba(21, 63, 50, 0.12)',
      },
    },
  },
  plugins: [],
}
