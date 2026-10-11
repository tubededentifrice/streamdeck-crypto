const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = [
  {
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    ignores: [
      'node_modules/',
      'dist/',
      'com.courcelle.cryptoticker.streamDeckPlugin/',
      'com.courcelle.cryptoticker-dev.sdPlugin/libs/',
      'com.courcelle.cryptoticker-dev.sdPlugin/dev/libs/',
      'com.courcelle.cryptoticker-dev.sdPlugin/**/*.js'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        StreamDeck: 'readonly',
        CryptoTickerConfig: 'readonly',
        CryptoTickerProviders: 'readonly',
        CryptoTickerConnectionStates: 'readonly',
        CryptoTickerCanvasRenderer: 'readonly',
        CryptoTickerAlertManager: 'readonly',
        CryptoTickerFormatters: 'readonly',
        CryptoTickerState: 'readonly',
        CryptoTickerSettingsManager: 'readonly',
        CryptoTickerDefaults: 'readonly',
        CryptoTickerPIProviders: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }
      ],
      'no-console': 'off',
      'no-useless-assignment': 'off'
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': 'allow-with-description' }],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'error'
    }
  },
  {
    files: ['**/__tests__/**/*.js'],
    languageOptions: { globals: globals.jest }
  },
  prettier
];
