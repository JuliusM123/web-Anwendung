// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
// const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
    {
        ignores: ['node_modules/', 'dist/', '**/*.spec.ts', '.angular/'],
    },
    {
        files: ['**/*.ts'],
        extends: [
            tseslint.configs.eslintRecommended,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            ...angular.configs.tsRecommended,
            // eslintConfigPrettier,
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
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
            '@angular-eslint/no-empty-lifecycle-method': 'error',
            '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
            '@angular-eslint/sort-lifecycle-methods': 'warn',
            '@angular-eslint/no-input-rename': 'error',
            '@angular-eslint/no-output-rename': 'error',
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
