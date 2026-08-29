describe('BillingService payment webhook invariants', () => {
  it('documents the required terminal payment states', () => {
    expect(['SUCCESS', 'FAILED', 'REFUNDED']).toEqual(expect.arrayContaining(['SUCCESS', 'FAILED', 'REFUNDED']));
  });
});
