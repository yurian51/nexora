import { PurchasesController } from './purchases.controller';

describe('PurchasesController', () => {
  it('passes authenticated tenant context to purchase creation', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 'purchase-1' }) } as any;
    const controller = new PurchasesController(service);
    const dto = { customerId: '00000000-0000-0000-0000-000000000001', packageId: '00000000-0000-0000-0000-000000000002' } as any;
    await controller.create({ user: { id: 'u1', tenantId: 'tenant-1', role: 'OWNER' }, headers: {} } as any, dto);
    expect(service.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('passes authenticated tenant context to payment confirmation', async () => {
    const service = { confirmPayment: jest.fn().mockResolvedValue({ purchase: { id: 'purchase-1' } }) } as any;
    const controller = new PurchasesController(service);
    const dto = { provider: 'test', providerReference: 'ref-1' } as any;
    await controller.confirmPayment({ user: { id: 'u1', tenantId: 'tenant-1', role: 'OWNER' }, headers: {} } as any, 'purchase-1', dto);
    expect(service.confirmPayment).toHaveBeenCalledWith('tenant-1', 'purchase-1', dto);
  });
});
