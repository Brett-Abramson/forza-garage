import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        fh: {
          red:          'var(--fh-red)',
          'red-dim':    'var(--fh-red-dim)',
          'red-pale':   'var(--fh-red-pale)',
          'red-border': 'var(--fh-red-border)',
          pink:         'var(--fh-pink)',
          'pink-pale':  'var(--fh-pink-pale)',
          bg:           'var(--fh-bg)',
          'bg-2':       'var(--fh-bg2)',
          panel:        'var(--fh-panel)',
          'panel-2':    'var(--fh-panel2)',
          dark:         'var(--fh-dark)',
          'dark-2':     'var(--fh-dark2)',
          muted:        'var(--fh-muted)',
          'muted-2':    'var(--fh-muted2)',
          border:       'var(--fh-border)',
          'border-2':   'var(--fh-border2)',
          amber:        'var(--fh-amber)',
          blue:         'var(--fh-blue)',
          purple:       'var(--fh-purple)',
        },
      },
      borderColor: {
        fh: {
          DEFAULT: 'var(--fh-border)',
          '2':     'var(--fh-border2)',
          red:     'var(--fh-red-border)',
          pink:    'rgba(196,85,112,0.3)',
        },
      },
    },
  },
  plugins: [],
}

export default config
