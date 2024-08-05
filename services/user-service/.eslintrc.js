exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'airbnb-typescript/base',
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
      '@typescript-eslint',
    ],
    parserOptions: {
      project: './tsconfig.json',
    },
    rules: {
      'import/prefer-default-export': 'off'
    }
  };
  