module.exports = {
  plugins: ['@typescript-eslint', 'no-null'],
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig.json'
  },
  extends: [
    'escapace'
  ],
  rules: {
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/promise-function-async': 0
  }
}
