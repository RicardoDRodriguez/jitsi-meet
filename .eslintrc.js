// .eslintrc.js
module.exports = {
  // O ambiente onde o código vai rodar (browser, node, etc.)
  env: {
    browser: true,
    es2021: true,
    jest: true, // Se você usar Jest para testes
  },
  // Conjuntos de regras pré-configuradas que você pode estender
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',

  ],
  // O parser que vai analisar o código
  parser: '@typescript-eslint/parser',
  // Opções específicas do parser
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Habilita a análise de JSX
    },
    ecmaVersion: 'latest', // Usa a versão mais recente do ECMAScript
    sourceType: 'module', // Permite o uso de 'imports'
  },
  // Plugins que adicionam novas regras
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks'
  ],
  // Aqui você pode sobrescrever ou adicionar regras específicas
  rules: {
    'react/react-in-jsx-scope': 'off', // Regra desativada para React 17+
    'react/prop-types': 'off', // Desativado pois usamos TypeScript para tipos
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  // Configurações que podem ser compartilhadas entre as regras
  settings: {
    react: {
      version: 'detect', // Detecta automaticamente a versão do React
    },
  },
};