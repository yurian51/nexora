import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  it('scopes customer lookup to tenant id', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'c1' }] });
    const service = new CustomersService({ query } as any);
    await service.get('tenant-a', 'c1');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('tenant_id = $1 AND id = $2'), ['tenant-a', 'c1']);
  });

  it('returns paginated tenant-scoped customers', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rowCount: 2, rows: [{ id: 'c1' }, { id: 'c2' }] })
      .mockResolvedValueOnce({ rows: [{ count: 42 }] });
    const service = new CustomersService({ query } as any);

    const result = await service.list('tenant-a', { search: 'amani', page: 2, limit: 2, activeOnly: true });

    expect(result.pagination).toEqual({ page: 2, limit: 2, total: 42, pages: 21 });
    expect(result.data).toHaveLength(2);
    expect(query.mock.calls[0][1]).toEqual(['tenant-a', 'amani', true, 2, 2]);
    expect(query.mock.calls[1][1]).toEqual(['tenant-a', 'amani', true]);
  });
});
