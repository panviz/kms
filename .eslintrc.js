module.exports = {
  extends: 'airbnb',
  rules: {
    // Automatic semicolon insertion saves time and symbols
    semi: ['error', 'never'],
    'func-names': 0,
    // 4 symbols is too much for max 100 string length
    indent: ['error', 2],
    'vars-on-top': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': ['error', 'always'],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    // it is necessary to document what is passed to callback
    'no-unused-vars': ['error', { 'args': 'none' }],
    // undefined is pretty usefull by itself
    'no-undefined': 0,
    // no need in empty parentheses after self-explanatory new tagKeysword
    'new-parens': 0,
    'no-loop-func': 0,
    // naming convention for private methods and params
    'no-underscore-dangle': 0,
    // non-critical errors can be just catched
    'no-empty': ['error', { 'allowEmptyCatch': true }],
  },
  env: {
    mocha: true,
  },
  globals: {
    _: true,
    $: true,
    d3: true,
    G: true,
    DEBUG: true,
  },
}
