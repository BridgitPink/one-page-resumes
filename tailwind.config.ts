import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Configure Tailwind to use RGB-based colors instead of OKLab
    // to avoid lab() color generation which is not supported by html2canvas
    colors: {
      // Explicitly define colors in RGB format
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      slate: {
        50: 'rgb(248 250 252)',
        100: 'rgb(241 245 249)',
        200: 'rgb(226 232 240)',
        300: 'rgb(203 213 225)',
        400: 'rgb(148 163 184)',
        500: 'rgb(100 116 139)',
        600: 'rgb(71 85 105)',
        700: 'rgb(51 65 85)',
        800: 'rgb(30 41 59)',
        900: 'rgb(15 23 42)',
        950: 'rgb(2 6 23)',
      },
      gray: {
        50: 'rgb(249 250 251)',
        100: 'rgb(243 244 246)',
        200: 'rgb(229 231 235)',
        300: 'rgb(209 213 219)',
        400: 'rgb(156 163 175)',
        500: 'rgb(107 114 128)',
        600: 'rgb(75 85 99)',
        700: 'rgb(55 65 81)',
        800: 'rgb(31 41 55)',
        900: 'rgb(17 24 39)',
        950: 'rgb(3 7 18)',
      },
      emerald: {
        50: 'rgb(240 253 250)',
        100: 'rgb(204 251 241)',
        200: 'rgb(167 243 208)',
        300: 'rgb(110 231 183)',
        400: 'rgb(52 211 153)',
        500: 'rgb(16 185 129)',
        600: 'rgb(5 150 105)',
        700: 'rgb(4 120 87)',
        800: 'rgb(6 78 59)',
        900: 'rgb(6 41 37)',
        950: 'rgb(2 26 21)',
      },
      red: {
        50: 'rgb(254 242 242)',
        100: 'rgb(254 226 226)',
        200: 'rgb(254 202 202)',
        300: 'rgb(252 165 165)',
        400: 'rgb(248 113 113)',
        500: 'rgb(239 68 68)',
        600: 'rgb(220 38 38)',
        700: 'rgb(185 28 28)',
        800: 'rgb(153 27 27)',
        900: 'rgb(127 29 29)',
        950: 'rgb(71 13 13)',
      },
    },
  },
  plugins: [],
};

export default config;
