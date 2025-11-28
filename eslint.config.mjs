import hacxy from '@hacxy/eslint-config';

export default hacxy({
  rules: {
    'max-params': 0,
  },
  ignores: ['lib/**', 'dist/**', 'docs/api/**', 'docs/guide/**', '**/*.d.ts'],
});
