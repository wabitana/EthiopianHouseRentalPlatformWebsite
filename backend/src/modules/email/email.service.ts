import nodemailer from 'nodemailer';

export interface NewPropertyEmailPayload {
  title: string;
  description: string;
  propertyType: string;
  price: number;
  rentalPeriod: string;
  rooms: number;
  bathrooms: number;
  city: string;
  area: string;
  neighborhood: string;
  images: string[];
}

export async function sendNewPropertyEmailAlert(
  recipientEmails: string[],
  property: NewPropertyEmailPayload
): Promise<void> {
  if (!recipientEmails || recipientEmails.length === 0) {
    console.log('📧 No recipient emails provided for property alert.');
    return;
  }

  try {
    let transporter: nodemailer.Transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const coverImage =
      property.images && property.images.length > 0
        ? property.images[0]
        : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    })
      .format(property.price)
      .replace('ETB', 'ETB ');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; color: #10b981; }
          .body { padding: 24px; }
          .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px; }
          .price { font-size: 24px; font-weight: 900; color: #059669; margin-bottom: 16px; }
          .image { width: 100%; height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .details-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .details-table td.label { font-weight: 600; color: #64748b; width: 35%; }
          .details-table td.value { font-weight: 700; color: #0f172a; }
          .cta { display: block; width: 100%; text-align: center; background: #0f172a; color: #ffffff; font-weight: 700; padding: 14px 0; border-radius: 12px; text-decoration: none; font-size: 14px; margin-top: 20px; }
          .footer { background: #f1f5f9; text-align: center; padding: 16px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 ETHIOPIAN HOUSE RENTAL</h1>
          </div>
          <div class="body">
            <span class="badge">NEW LISTING ALERT</span>
            <h2 class="title">${property.title}</h2>
            <div class="price">${formattedPrice} / ${property.rentalPeriod || 'Monthly'}</div>
            <img src="${coverImage}" alt="${property.title}" class="image" />
            <table class="details-table">
              <tr><td class="label">Location</td><td class="value">📍 ${property.neighborhood}, ${property.area}, ${property.city}</td></tr>
              <tr><td class="label">Type</td><td class="value">${property.propertyType}</td></tr>
              <tr><td class="label">Rooms</td><td class="value">🛏️ ${property.rooms} Beds • 🚿 ${property.bathrooms} Baths</td></tr>
            </table>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">${property.description}</p>
            <a href="http://localhost:3000/browse-houses" class="cta">View Property Details on Seeker Portal</a>
          </div>
          <div class="footer">
            You received this email because you are registered on Ethiopian House Rental Platform.<br>
            © ${new Date().getFullYear()} Ethiopian House Rental. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Ethiopian House Rental" <noreply@ethiopianhouserental.et>',
      to: recipientEmails.join(', '),
      subject: `🏠 New Property Listed: ${property.title} (${formattedPrice})`,
      html: htmlBody,
    });

    console.log(`📧 Dispatched notification email alert to ${recipientEmails.length} recipients. MessageId: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
    }
  } catch (err) {
    console.error('⚠️ Failed to dispatch email alert:', err);
  }
}
