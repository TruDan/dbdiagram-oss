module.exports = {
  root: true,
  parserOptions: {
    parser: "@babel/eslint-parser"
  },
  env: {
    browser: true
    // node: true
  },
  globals: {
    "$": true
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended"
    //"standard"
  ],
  plugins: [
    "vue"
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // allow async-await
    "generator-star-spacing": "off",
    // allow paren-less arrow functions
    "arrow-parens": "off",
    "one-var": "off",
    "no-void": "off",
    "multiline-ternary": "off",

    "import/first": "off",
    // 'import/namespace': 'off',
    // 'import/default': 'error',
    // 'import/export': 'error',
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "prefer-promise-reject-errors": "off",
    "vue/no-unused-components": "warn",
    "vue/multi-word-component-names": "off",

    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-redeclare': 'off',
    "quotes": 'off'
  },
  ignorePatterns: [
    "mode-dbml.js"
  ]
};
