import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", "out/**", "build/**", "public/**", "next-env.d.ts"],
  },
  {
    // Existing-codebase conventions: surfaced as warnings so `npm run lint`
    // stays usable while they're cleaned up incrementally
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
    },
  },
  {
    // CommonJS config/scripts
    files: ["**/*.js", "**/*.cjs", "tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
