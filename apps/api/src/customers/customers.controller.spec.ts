import { CustomersController } from './customers.controller';

describe('CustomersController', () => {
  it('passes the authenticated tenant id and query to the service', async () => {
    const service = { list: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 25, total: 0, pages: 0 } }) } as any;
    const controller = new CustomersController(service);
    const query = { page: 2, limit: 10, search: 'amani', activeOnly: true } as any;
    await controller.list({ user: { id: 'u1', tenantId: 'tenant-1', role: 'OWNER', email: 'owner@nexora.test' }, headers: {} } as any, query);
    expect(service.list).toHaveBeenCalledWith('tenant-1', query);
  });
});
