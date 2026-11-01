import tseslint from "typescript-eslint";

export default [
  { ignores: ["node_modules/", "drizzle/", "stand/dokat/"] },
  ...tseslint.configs.recommended,
];
