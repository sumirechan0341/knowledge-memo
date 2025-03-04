import type { Config } from 'tailwindcss'
import tailwindAnimate from 'tailwindcss-animate'

const config = {
  darkMode: ['class', 'dark'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    // 以前と同じ設定
    // ...
  },
  plugins: [tailwindAnimate]
} satisfies Config

export default config
