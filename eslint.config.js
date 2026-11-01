import tseslint from "typescript-eslint";

export default [
  { ignores: ["node_modules/", "drizzle/"] },
  ...tseslint.configs.recommended,
];
