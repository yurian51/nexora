import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  it('scopes customer lookup to tenant id', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'c1' }] });
    const service = new CustomersService({ query } as any);
    await service.get('tenant-a', 'c1');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('tenant_id = $1 AND id = $2'), ['tenant-a', 'c1']);
  });
});
