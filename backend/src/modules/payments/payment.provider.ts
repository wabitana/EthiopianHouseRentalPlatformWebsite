export interface PaymentRequest {
  userId: string;
  amountETB: number;
  email: string;
  phone: string;
  title: string;
  metadata?: any;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  transactionId: string;
  amountETB: number;
  checkoutUrl?: string;
  message: string;
}

export interface IPaymentProvider {
  name: string;
  initializePayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<boolean>;
}

export class ChapaSimulationProvider implements IPaymentProvider {
  name = 'Chapa Simulation Engine';

  async initializePayment(request: PaymentRequest): Promise<PaymentResult> {
    const reference = `chapa_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const transactionId = `txn_${Date.now()}`;

    console.log(`💳 [Chapa Simulation] Processed ${request.amountETB} ETB payment for ${request.email} (${request.title}). Ref: ${reference}`);

    return {
      success: true,
      reference,
      transactionId,
      amountETB: request.amountETB,
      checkoutUrl: `http://localhost:3000/payments/simulated-checkout?ref=${reference}`,
      message: 'Subscription payment approved via Chapa Simulation Engine ✓',
    };
  }

  async verifyPayment(reference: string): Promise<boolean> {
    return reference.startsWith('chapa_sim_');
  }
}
