import { ConflictException, NotFoundException } from '@nestjs/common';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  it('rejects a purchase from another tenant', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    } as any;
    const service = new BillingService(db);

    await expect(
      service.initiatePayment('tenant-a', {
        purchaseId: '00000000-0000-0000-0000-000000000001',
        provider: 'test',
        idempotencyKey: 'idem-12345678',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns the existing payment for a repeated idempotency key', async () => {
    const payment = {
      id: 'payment-1',
      purchase_id: 'purchase-1',
      provider: 'test',
      status: 'PENDING',
    };
    const db = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 'purchase-1', customer_id: 'customer-1', price: 1000, currency: 'TZS', status: 'PENDING_PAYMENT' }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [payment] }),
    } as any;
    const service = new BillingService(db);

    await expect(
      service.initiatePayment('tenant-a', {
        purchaseId: 'purchase-1',
        provider: 'test',
        idempotencyKey: 'idem-12345678',
      }),
    ).resolves.toEqual(payment);
  });

  it('rejects an idempotency key reused for another purchase', async () => {
    const db = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 'purchase-1', customer_id: 'customer-1', price: 1000, currency: 'TZS', status: 'PENDING_PAYMENT' }],
        })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 'payment-1', purchase_id: 'purchase-2', status: 'PENDING' }],
        }),
    } as any;
    const service = new BillingService(db);

    await expect(
      service.initiatePayment('tenant-a', {
        purchaseId: 'purchase-1',
        provider: 'test',
        idempotencyKey: 'idem-12345678',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
