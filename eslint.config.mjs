import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
// import tailwind from 'eslint-plugin-tailwindcss';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });
//...tailwind.configs['flat/recommended'], -- waiting for this issue to be resolved https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  promise.configs['flat/recommended'],
  ...compat.extends('next', 'next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      'src/components/ui/**',
      'eslint.config.mjs',
      'prettier.config.cjs',
    ],
  },
  {
    rules: {
      'unicorn/no-null': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'import/prefer-default-export': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
    settings: {
      'import/resolver': {
        node: true,
        typescript: true,
      },
      react: {
        version: 'detect',
      },
      next: {
        rootDir: __dirname,
      },
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
);
