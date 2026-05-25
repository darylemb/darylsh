import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import eslintPluginSecurity from 'eslint-plugin-security';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', '.git/**', 'build/**', '.astro/**', 'coverage/**']
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...eslintPluginAstro.configs.recommended,

  eslintPluginSecurity.configs.recommended,

  eslintPluginAstro.configs['jsx-a11y-recommended'],

  eslintConfigPrettier,

  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
      'astro/no-unsafe-inline-scripts': 'warn'
    }
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },

  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off'
    }
  }
]);