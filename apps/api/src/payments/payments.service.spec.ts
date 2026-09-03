import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('reuses an existing idempotent payment intent', async () => {
    const queries: string[] = [];
    const client = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
        if (sql === 'BEGIN' || sql === 'COMMIT') return { rowCount: 0, rows: [] };
        if (sql.includes('FROM wifi_plan_purchases')) return { rowCount: 1, rows: [{ customer_id: 'c1', price: '1000', currency: 'TZS', status: 'PENDING_PAYMENT' }] };
        if (sql.includes('FROM payments WHERE')) return { rowCount: 1, rows: [{ id: 'pay-1', status: 'PENDING', provider: 'mpesa' }] };
        return { rowCount: 0, rows: [] };
      }),
      release: jest.fn(),
    };
    const db = { connect: jest.fn().mockResolvedValue(client) } as any;
    const service = new PaymentsService(db);
    const result = await service.createIntent('tenant-1', { purchaseId: '00000000-0000-0000-0000-000000000001', provider: 'mpesa' });
    expect(result).toMatchObject({ id: 'pay-1', reused: true });
    expect(client.release).toHaveBeenCalled();
  });
});
