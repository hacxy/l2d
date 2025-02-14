import linter from '@hacxy/eslint-config/vue';

export default linter({
  rules: {
    'max-params': 0
  },
  ignores: ['lib/**', 'dist/**', 'docs/api/**']
});
