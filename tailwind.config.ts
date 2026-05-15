import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      colors: {
        "brand-blue": "#4775F2",
        "brand-pink": "#DB33A1",
        "brand-gray": "#F2F2F2"
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #4775F2 27.54%, #DB33A1 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
