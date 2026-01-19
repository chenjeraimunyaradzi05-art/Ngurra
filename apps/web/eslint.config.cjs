// ESLint flat config (required by eslint-config-next v16)
// See: https://nextjs.org/docs/app/api-reference/config/eslint

const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');
const prettier = require('eslint-config-prettier');

function withRuleOverrides(config) {
  if (!config || typeof config !== 'object' || !config.plugins) return config;

  const rules = { ...(config.rules || {}) };

  if (config.plugins['@next/next']) {
    // This repo has many legacy internal <a href="/..."></a> links; enforcing
    // <Link /> everywhere is too noisy for now.
    rules['@next/next/no-html-link-for-pages'] = 'off';

    // Best practice, but don't fail CI.
    rules['@next/next/no-img-element'] = 'warn';
  }

  if (config.plugins.react) {
    // Content-heavy pages include lots of apostrophes/quotes; escaping is noisy.
    rules['react/no-unescaped-entities'] = 'off';
  }

  if (config.plugins['jsx-a11y']) {
    // Best practice, but don't fail CI.
    rules['jsx-a11y/alt-text'] = 'warn';
  }

  if (config.plugins['react-hooks']) {
    // These strict purity/structure rules are currently failing across the app.
    rules['react-hooks/set-state-in-effect'] = 'off';
    rules['react-hooks/immutability'] = 'off';
    rules['react-hooks/purity'] = 'off';
    rules['react-hooks/static-components'] = 'off';
  }

  return { ...config, rules };
}

module.exports = [
  ...nextCoreWebVitals.map(withRuleOverrides),
  // Disable stylistic rules that conflict with Prettier
  prettier,
];
