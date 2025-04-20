import tailwindcssPlugin from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

/** @type {import('postcss').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

export default config;
