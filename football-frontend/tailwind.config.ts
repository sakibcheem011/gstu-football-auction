import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#14161F',
        panel: '#1B1E29',
        panelLight: '#242837',
        chalk: '#ECEAE3',
        chalkMuted: '#8B8FA3',
        gold: '#E8B84B',
        silver: '#A8AEB8',
        platinum: '#C9D3DC',
        danger: '#E4483B',
      },
      fontFamily: {
        display: ['var(--font-bebas-neue)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
