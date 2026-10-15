/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vynk: {
          bg: '#0c1317',
          panel: '#111b21',
          sidebar: '#202c33',
          card: '#182229',
          border: '#2a3942',
          input: '#2a3942',
          text: '#e9edef',
          muted: '#8696a0',
          accent: '#00a884',
          accentHover: '#06cf9c',
          greenSent: '#005c4b',
          whiteReceived: '#202c33',
          blueTick: '#53bdeb',
        }
      }
    },
  },
  plugins: [],
}
