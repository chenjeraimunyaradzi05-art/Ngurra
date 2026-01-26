module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
