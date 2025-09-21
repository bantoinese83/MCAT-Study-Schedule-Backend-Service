import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  // Base JavaScript recommendations
  js.configs.recommended,

  // TypeScript support
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      // Disable conflicting rules with Prettier
      ...prettierConfig.rules,

      // Prettier formatting
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: true,
          trailingComma: 'es5',
          tabWidth: 2,
          semi: false,
          printWidth: 100,
        },
      ],

      // Disable base no-unused-vars in favor of TypeScript version
      'no-unused-vars': 'off',
      
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'warn',

      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/no-cycle': 'off', // Too restrictive for TypeScript
      'import/no-unused-modules': 'off', // TypeScript handles this

      // General code quality
      'no-console': 'off', // We use Logger instead
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'template-curly-spacing': 'warn',

      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-duplicate-imports': 'error',
      'no-return-await': 'warn',
      'require-await': 'warn',
      'no-extra-bind': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-return': 'warn',
      'no-else-return': 'warn',
      'no-lonely-if': 'warn',
      'no-nested-ternary': 'warn',
      'yoda': 'warn',

      // Error prevention
      'no-undef': 'off', // TypeScript handles this
      'no-unused-expressions': 'warn',
      'no-unused-labels': 'warn',

      // Node.js specific (simplified)
      'node/no-deprecated-api': 'off', // Disabled due to compatibility issues
      'node/no-extraneous-import': 'off', // TypeScript handles this
      'node/no-extraneous-require': 'off', // TypeScript handles this
      'node/no-missing-import': 'off', // TypeScript handles this
      'node/no-missing-require': 'off', // TypeScript handles this
      'node/no-unpublished-import': 'off', // TypeScript handles this
      'node/no-unpublished-require': 'off', // TypeScript handles this
      'node/no-unsupported-features/es-syntax': 'off', // TypeScript handles this
    },
  },

  // Configuration files
  {
    files: ['*.config.js', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },

  // Test files (if any)
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'test/**', 'tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.js',
      '!src/**/*.js', // Allow JS in src for config files
      'coverage/**',
      '.nyc_output/**',
      '*.log',
      '.DS_Store',
    ],
  },
];
