const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('typescript-eslint');
const angularPlugin = require('@angular-eslint/eslint-plugin');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = [
  {
    ignores: ['dist', 'node_modules', '.angular', 'coverage'],
  },
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin.plugin,
      '@angular-eslint': angularPlugin,
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  prettierConfig,
];
