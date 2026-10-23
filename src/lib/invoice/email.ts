import { InvoiceData } from "./types";

interface SendInvoiceEmailParams {
  to: string;
  invoiceData: InvoiceData;
  pdfBuffer: Buffer;
  downloadUrl?: string;
}

export async function sendInvoiceEmail({
  to,
  invoiceData,
  pdfBuffer,
  downloadUrl,
}: SendInvoiceEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[Invoice Email] RESEND_API_KEY is not set in environment. Skipping email dispatch to ${to} for order ${invoiceData.orderName}.`,
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment.",
    };
  }

  const fromAddress =
    process.env.RESEND_FROM_EMAIL ||
    process.env.INVOICE_SENDER_EMAIL ||
    "Petpedia <orders@petpedia.in>";

  const customerName = invoiceData.customer.name || "Pet Lover";
  const formattedTotal = `₹${invoiceData.totalAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

  const itemsHtml = invoiceData.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; font-size: 14px; color: #1e293b;">
          <strong>${item.title}</strong>
          ${item.variantTitle && item.variantTitle.toLowerCase() !== "default title" ? `<br/><span style="font-size: 12px; color: #64748b;">Variant: ${item.variantTitle}</span>` : ""}
        </td>
        <td style="padding: 10px 0; font-size: 14px; color: #475569; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; font-size: 14px; color: #1e293b; text-align: right; font-weight: 600;">₹${item.total.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  const downloadButtonHtml = downloadUrl
    ? `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${downloadUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
          Download Tax Invoice (PDF)
        </a>
      </div>
    `
    : "";

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice for ${invoiceData.orderName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 28px 32px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PETPEDIA</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Premium Pet Essentials</p>
          </div>

          <div style="padding: 32px;">
            <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #0f172a;">Order Confirmed & Invoice Ready! 🎉</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
              Hi <strong>${customerName}</strong>,<br/>
              Thank you for shopping at Petpedia! Your order <strong>${invoiceData.orderName}</strong> has been successfully placed. Your official tax invoice is attached with this email for your records.
            </p>

            <!-- Order Summary Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">
                  <th style="text-align: left; padding-bottom: 8px;">Item</th>
                  <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Financial Summary -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
                <span>Subtotal:</span>
                <span>₹${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              ${
                invoiceData.discount > 0
                  ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #16a34a;">
                  <span>Discount:</span>
                  <span>- ₹${invoiceData.discount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569;">
                <span>Delivery:</span>
                <span>${invoiceData.shippingFee === 0 ? "FREE" : `₹${invoiceData.shippingFee.toFixed(2)}`}</span>
              </div>
              <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #ea580c;">
                <span>Total Paid:</span>
                <span>${formattedTotal}</span>
              </div>
            </div>

            ${downloadButtonHtml}

            <!-- Support Footer -->
            <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              <p style="margin: 0;">Need help with your order? Reply directly to this email or reach us at <a href="mailto:support@petpedia.in" style="color: #ea580c; text-decoration: none;">support@petpedia.in</a>.</p>
              <p style="margin: 8px 0 0 0;">Petpedia &bull; <a href="https://www.petpedia.in" style="color: #64748b;">www.petpedia.in</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const payload = {
      from: fromAddress,
      to: [to],
      subject: `Invoice for Petpedia Order ${invoiceData.orderName} (${invoiceData.invoiceNumber})`,
      html: htmlBody,
      attachments: [
        {
          filename: `Petpedia-Invoice-${invoiceData.orderName.replace(/#/g, "")}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Invoice Email Error] Resend returned status ${res.status}:`, errText);
      return { success: false, error: errText };
    }

    const data = await res.json();
    console.log(`[Invoice Email] Dispatched invoice email for ${invoiceData.orderName} to ${to}:`, data.id);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("[Invoice Email Error] Failed to send email via Resend:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
