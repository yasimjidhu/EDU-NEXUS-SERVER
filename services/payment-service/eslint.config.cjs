

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': import('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          project: './tsconfig.json',
        },
        rules: {
          '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
      },
    ],
  },
];
