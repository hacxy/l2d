import defineLint from '@hacxy/eslint-config';

export default defineLint({
  rules: {
    'max-params': 0,
  },
  ignores: ['lib/**', 'dist/**', 'docs/api/**', 'docs/guide/**'],
});
