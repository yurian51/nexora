import { CustomersController } from './customers.controller';

describe('CustomersController', () => {
  it('passes the authenticated tenant id to the service', async () => {
    const service = { list: jest.fn().mockResolvedValue({ data: [], count: 0 }) } as any;
    const controller = new CustomersController(service);
    await controller.list({ user: { id: 'u1', tenantId: 'tenant-1', role: 'OWNER', email: 'owner@nexora.test' }, headers: {} } as any);
    expect(service.list).toHaveBeenCalledWith('tenant-1', undefined);
  });
});
