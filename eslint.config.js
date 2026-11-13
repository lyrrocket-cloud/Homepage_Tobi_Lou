/** @type {import('eslint').Linter.FlatConfig} */
module.exports = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**'],
  },
  {
    languageOptions: {
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
  },
];
