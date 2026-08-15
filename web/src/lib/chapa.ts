const CHAPA_BASE = "https://api.chapa.co/v1";

export interface ChapaInitParams {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  txRef: string;
  callbackUrl: string;
  returnUrl: string;
  title?: string;
  description?: string;
}

export interface ChapaInitResponse {
  status: string;
  message: string;
  data?: {
    checkout_url: string;
  };
}

export async function initializeChapaPayment(
  params: ChapaInitParams
): Promise<ChapaInitResponse> {
  const secretKey = process.env.CHAPA_SECRET_KEY;

  if (!secretKey || secretKey.includes("your-chapa")) {
    return {
      status: "success",
      message: "Demo mode - Chapa keys not configured",
      data: {
        checkout_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/demo?tx_ref=${params.txRef}`,
      },
    };
  }

  const response = await fetch(`${CHAPA_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount.toString(),
      currency: "ETB",
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      phone_number: params.phone || "0910000000",
      tx_ref: params.txRef,
      callback_url: params.callbackUrl,
      return_url: params.returnUrl,
      customization: {
        title: params.title || "Delala Rentals Platform",
        description: params.description || "Payment for Delala rental order",
      },
    }),
  });

  return response.json();
}

export async function verifyChapaPayment(txRef: string) {
  const secretKey = process.env.CHAPA_SECRET_KEY;

  if (!secretKey || secretKey.includes("your-chapa")) {
    return { status: "success", data: { status: "success" } };
  }

  const response = await fetch(
    `${CHAPA_BASE}/transaction/verify/${txRef}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    }
  );

  return response.json();
}
