module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: ["node_modules", "dist", ".next", "out"],
};
