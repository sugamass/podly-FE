/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // プロジェクト固有のカラーパレット
        podly: {
          background: '#121620',
          card: '#1E2430',
          primary: '#4F7CFF',
          secondary: '#6AD5E8',
          highlight: '#F2994A',
          text: '#FFFFFF',
          subtext: '#A0A7B5',
          inactive: '#6B7280',
          border: '#374151',
        }
      },
    },
  },
  plugins: [],
};