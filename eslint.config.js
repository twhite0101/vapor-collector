// @ts-check
import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import angular from 'angular-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig(
  {
    files: ["**/*.ts"],
    plugins: { '@stylistic': stylistic },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-empty': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      'no-unused-expressions': 'error',
      'no-prototype-builtins': 'error',
      'no-case-declarations': 'error',
      'semi': ['error', 'never'],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-extra-parens': ['error', 'all', { 'nestedBinaryExpressions': false }],
      'quotes': ['error', 'single'],
      'eqeqeq': ['error', 'always'],
      'padded-blocks': ['error', 'never'],
      '@stylistic/indent': ['error', 2],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
      'space-before-function-paren': 'error',
      'eol-last': 'error',
      'curly': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@stylistic/comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/member-delimiter-style': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      'no-restricted-globals': ['error', 'fdescribe', 'fit', 'event'],
      'no-restricted-imports': [
        'error',
        {
          'paths': [
            {
              'name': '@angular/common',
              'importNames': ['CommonModule'],
              'message': 'Instead, add Angular imports directly for NgIf, NgFor, etc.'
            },
            {
              'name': '@angular/platform-browser/animations',
              'importNames': ['provideAnimations'],
              'message': 'Instead, use provideAnimations. We never want to test unneccessary animations and resources.'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          'selector': 'Literal[value=/@app\\u002Fcomponents/]',
          'message': 'Components should be imported from @components/*, instead of @app/components/*'
        }
      ],
      '@typescript-eslint/explicit-member-accessibility': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/dot-notation': 'off'
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/attributes-order': 'warn',
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/button-has-type': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/conditional-complexity': ['error', { 'maxComplexity': 10 }],
      '@angular-eslint/template/cyclomatic-complexity': ['error', { 'maxComplexity': 82 }],
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-call-expression': 'warn',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-inline-styles': ['warn', { 'allowBindToStyle': true }],
      '@angular-eslint/template/no-interpolation-in-attributes': 'warn',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-nested-tags': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-contextual-for-variables': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error'
    },
  }
);
