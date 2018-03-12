module.exports = {
  extends: '@graphiy/eslint-config',
  env: {
    browser: true,
    mocha: true,
  },
  globals: {
    _: true,
    $: true,
    d3: true,
  },
}
