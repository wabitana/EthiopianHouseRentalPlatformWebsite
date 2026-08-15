import { PaymentStatus } from '@prisma/client';

export interface InitiatePaymentDTO {
  amount: number;
  currency?: string;
  email: string;
  name: string;
  txRef?: string;
}

export interface PaymentResult {
  transactionRef: string;
  checkoutUrl?: string;
  status: PaymentStatus;
  message: string;
}
