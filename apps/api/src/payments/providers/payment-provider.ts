export type PaymentProviderResult = {
  providerReference?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  raw?: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: {
    amount: string | number;
    currency: string;
    reference: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentProviderResult>;
}
