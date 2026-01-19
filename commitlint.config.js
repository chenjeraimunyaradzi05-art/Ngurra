/**
 * Commitlint Configuration
 * 
 * Enforces conventional commits format.
 * @see https://www.conventionalcommits.org/
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these values
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Code style (formatting, semicolons, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD configuration
        'chore',    // Maintenance tasks
        'revert',   // Revert a previous commit
        'security', // Security improvements
        'a11y',     // Accessibility improvements
      ],
    ],
    
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    
    // Subject max length
    'subject-max-length': [2, 'always', 72],
    
    // Header max length
    'header-max-length': [2, 'always', 100],
    
    // Body max line length
    'body-max-line-length': [1, 'always', 100],
    
    // Footer max line length
    'footer-max-line-length': [1, 'always', 100],
  },
  
  // Prompt configuration for interactive commits
  prompt: {
    messages: {
      skip: ':skip',
      max: 'Max %d characters',
      min: 'Min %d characters',
    },
    questions: {
      type: {
        description: 'Select the type of change you are committing',
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: 'Code style changes (formatting, semicolons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'Code refactoring without changing functionality',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'Performance improvements',
            title: 'Performance',
            emoji: '🚀',
          },
          test: {
            description: 'Adding or updating tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: 'Build system or dependency changes',
            title: 'Builds',
            emoji: '🛠️',
          },
          ci: {
            description: 'CI/CD configuration changes',
            title: 'Continuous Integration',
            emoji: '⚙️',
          },
          chore: {
            description: 'Maintenance tasks',
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Revert a previous commit',
            title: 'Reverts',
            emoji: '🗑️',
          },
          security: {
            description: 'Security improvements',
            title: 'Security',
            emoji: '🔒',
          },
          a11y: {
            description: 'Accessibility improvements',
            title: 'Accessibility',
            emoji: '♿',
          },
        },
      },
    },
  },
};
