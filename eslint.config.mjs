import hacxy from '@hacxy/eslint-config';

export default hacxy({
  rules: {
    'max-params': 0,
    'antfu/no-import-dist': 0
  },
  ignores: ['src/lib/**', 'dist/**', 'docs/api/**', 'docs/guide/**', 'src/cubism2/**', 'src/cubism5/**', 'src/CubismSdkForWeb-5-r.5/**'],
}, {
  rules: {
    'no-console': 0,
  }
});
