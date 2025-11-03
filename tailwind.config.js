/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '11': '2.75rem', // 44px for touch targets
      },
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          light: '#3399FF',
          dark: '#004C99',
        },
        danger: {
          DEFAULT: '#CC0000',
          light: '#FF3333',
          dark: '#990000',
        },
        success: {
          DEFAULT: '#00AA00',
          light: '#00DD00',
          dark: '#008800',
        },
      },
    },
  },
  plugins: [],
};
