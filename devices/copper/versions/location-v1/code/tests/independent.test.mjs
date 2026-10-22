import test from 'node:test';
test('independent SciPy fixtures, invariance, passivity and observation controls', async () => {
  await import('../reference/compare_producer.mjs');
});
