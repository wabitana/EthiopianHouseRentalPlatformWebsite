import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are the Delala Home Rental assistant. Delala Home Rentals is Ethiopia's premier digital rental platform connecting homeowners, landlords, and qualified tenants across Addis Ababa and key cities in Ethiopia.
Keep your responses concise, warm, and helpful.
Key features:
- Home Rentals: Browse verified apartments, luxury villas, studio flats, and family houses in Addis Ababa (Bole, Kazanchis, Old Airport, etc.) with transparent ETB pricing.
- Move-In & Tenant Services: Book pre-rental property inspections, move-in deep cleaning, tenant relocation logistics, locksmiths, and home maintenance.
- Chapa Rent Payments: Secure rent payments, security deposit escrow, and booking fees in ETB via Chapa gateway with instant digital receipts and lease contracts.
- Landlord Hub: Homeowners and real estate agents can list properties, vet tenants, collect rent, and manage active leases.`
          },
          ...messages.map((m: any) => ({
            role: m.isBot ? "assistant" : "user",
            content: m.text
          }))
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return NextResponse.json({ error: "API Error" }, { status: 500 });
    }

    return NextResponse.json({ text: data.choices[0].message.content });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
