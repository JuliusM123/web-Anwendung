// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

import eslintPluginUnicorn from 'eslint-plugin-unicorn';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
    {
        ignores: ['node_modules/', 'dist/', '**/*.spec.ts', '.angular/'],
    },
    {
        files: ['**/*.ts'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            ...angular.configs.tsRecommended,
            eslintPluginUnicorn.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
            },
        },
        processor: angular.processInlineTemplates,
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
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-floating-promises': [
                'error',
                { ignoreVoid: true },
            ],
            '@typescript-eslint/consistent-type-imports': 'off',
            '@angular-eslint/no-empty-lifecycle-method': 'error',
            '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
            '@angular-eslint/sort-lifecycle-methods': 'warn',
            '@angular-eslint/no-input-rename': 'error',
            '@angular-eslint/no-output-rename': 'error',
        },
    },
    {
        files: ['e2e/pages/**/*.ts'],
        rules: {
            'unicorn/filename-case': [
                'error',
                {
                    case: 'pascalCase',
                },
            ],
        },
    },
    {
        files: ['**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
            ...angular.configs.templateAccessibility,
            // eslintConfigPrettier,
        ],
        rules: {
            // '@angular-eslint/template/banana-in-a-box': 'error',
            // '@angular-eslint/template/no-negated-async': 'warn',
        },
    },
);
