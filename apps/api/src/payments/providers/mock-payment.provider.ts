import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentProviderResult } from './payment-provider';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createPayment(input: { amount: string | number; currency: string; reference: string; metadata?: Record<string, unknown> }): Promise<PaymentProviderResult> {
    return {
      providerReference: `MOCK-${input.reference}`,
      status: 'PENDING',
      raw: { provider: this.name, amount: input.amount, currency: input.currency, metadata: input.metadata ?? {} },
    };
  }
}
