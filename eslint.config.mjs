import linter from '@hacxy/eslint-config/vue';

export default linter({
  rules: {
    'max-params': 0,
    'vue/block-lang': 0,
    'vue/enforce-style-attribute': 0
  },
  ignores: ['lib/**', 'dist/**', 'docs/api/**']
});
