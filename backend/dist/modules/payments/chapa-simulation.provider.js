"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPaymentProvider = exports.ChapaSimulationProvider = void 0;
const client_1 = require("@prisma/client");
class ChapaSimulationProvider {
    constructor() {
        this.name = 'CHAPA_SIMULATION';
    }
    async initializePayment(dto) {
        const txRef = dto.txRef || `CHAPA-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return {
            transactionRef: txRef,
            checkoutUrl: `http://localhost:5000/api/v1/payments/chapa-sim-checkout?tx_ref=${txRef}`,
            status: client_1.PaymentStatus.PENDING,
            message: 'Chapa simulation checkout URL generated',
        };
    }
    async verifyPayment(transactionRef) {
        // In simulation mode, verification succeeds automatically for valid references
        return {
            transactionRef,
            status: client_1.PaymentStatus.SUCCESS,
            message: 'Chapa simulated payment verified successfully',
        };
    }
}
exports.ChapaSimulationProvider = ChapaSimulationProvider;
exports.defaultPaymentProvider = new ChapaSimulationProvider();
