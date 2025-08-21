import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'test/**'],
  },

  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: eslintPluginImport,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      prettier,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // node core
            ['^(assert|buffer|child_process|cluster|console|crypto|dns|events|fs|http|https|net|os|path|querystring|readline|stream|string_decoder|timers|tls|tty|url|util|vm|zlib)(/.*|$)'],
            // nestjs
            ['^@nestjs'],
            // сторонние пакеты
            ['^@?\\w'],
            // абсолютные импорты из проекта
            ['^'],
            // относительные импорты
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prettier/prettier': 'error',
    },
  },
];
