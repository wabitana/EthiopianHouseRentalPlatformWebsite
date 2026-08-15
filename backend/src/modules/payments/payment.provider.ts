import { InitiatePaymentDTO, PaymentResult } from './payment.types';

export interface PaymentProvider {
  name: string;
  initializePayment(dto: InitiatePaymentDTO): Promise<PaymentResult>;
  verifyPayment(transactionRef: string): Promise<PaymentResult>;
}
