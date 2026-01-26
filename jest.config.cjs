/** @type {import('jest').Config} */
module.exports = {
  // Note: apps/api uses Vitest for testing (see apps/api/vitest.config.ts)
  // Run API tests with: npm --prefix apps/api run test
  // This Jest config is for other projects that may use Jest
  projects: [],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/apps/api/', // Uses Vitest
  ],
};
