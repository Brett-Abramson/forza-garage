import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Forza-inspired dark UI palette
        surface: {
          DEFAULT: '#0d1117',
          card: '#161b22',
          elevated: '#1f2937',
          border: '#30363d',
        },
      },
    },
  },
  plugins: [],
}

export default config
