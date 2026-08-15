import { PaymentProvider } from './payment.provider';
import { InitiatePaymentDTO, PaymentResult } from './payment.types';
import { PaymentStatus } from '@prisma/client';

export class ChapaSimulationProvider implements PaymentProvider {
  name = 'CHAPA_SIMULATION';

  async initializePayment(dto: InitiatePaymentDTO): Promise<PaymentResult> {
    const txRef = dto.txRef || `CHAPA-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      transactionRef: txRef,
      checkoutUrl: `http://localhost:5000/api/v1/payments/chapa-sim-checkout?tx_ref=${txRef}`,
      status: PaymentStatus.PENDING,
      message: 'Chapa simulation checkout URL generated',
    };
  }

  async verifyPayment(transactionRef: string): Promise<PaymentResult> {
    // In simulation mode, verification succeeds automatically for valid references
    return {
      transactionRef,
      status: PaymentStatus.SUCCESS,
      message: 'Chapa simulated payment verified successfully',
    };
  }
}

export const defaultPaymentProvider: PaymentProvider = new ChapaSimulationProvider();
