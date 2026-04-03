import hacxy from '@hacxy/eslint-config';

export default hacxy({
  rules: {
    'max-params': 0,
    'antfu/no-import-dist': 0
  },
  ignores: ['src/lib/**', 'dist/**', 'docs/api/**', 'docs/guide/**', 'src/cubism2/**', 'src/cubism6/**', '__tests__/public/**'],
}, {
  rules: {
    'no-console': 0,
  }
});
