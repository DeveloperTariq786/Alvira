import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable the exhaustive-deps rule that's causing issues with functions in dependencies
      "react-hooks/exhaustive-deps": "off",
      // Disable the unescaped entities rule to allow apostrophes in JSX
      "react/no-unescaped-entities": "off",
      // Disable the img element warning
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;
