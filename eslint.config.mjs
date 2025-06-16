import defineLint from '@hacxy/eslint-config/vue';

export default defineLint({
  rules: {
    'max-params': 0,
    'vue/block-lang': 0,
    'vue/enforce-style-attribute': 0
  },
  ignores: ['lib/**', 'dist/**', 'docs/api/**']
});
