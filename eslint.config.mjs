import hacxy from '@hacxy/eslint-config';

export default hacxy({
  rules: {
    'max-params': 0,
    'antfu/no-import-dist': 0
  },
  ignores: ['src/vendor/**', 'dist/**', 'docs/api/**', 'docs/guide/**', '**/public/**'],
}, {
  rules: {
    'no-console': 0,
  }
});
