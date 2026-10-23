import PDFDocument from "pdfkit";
import { InvoiceData } from "./types";

function formatCurrency(amount: number): string {
  const parts = Number(amount || 0).toFixed(2).split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  // Indian currency formatting: 1,23,456.00
  let lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  return `Rs. ${formattedInt}.${decPart}`;
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Petpedia Invoice - ${data.invoiceNumber}`,
          Author: "Petpedia (petpedia.in)",
          Subject: `Tax Invoice for Order ${data.orderName}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const primaryColor = "#EA580C"; // Brand orange
      const darkColor = "#0F172A"; // Slate 900
      const mutedColor = "#64748B"; // Slate 500
      const lightBorder = "#E2E8F0"; // Slate 200

      // ----------------------------------------------------
      // 1. TOP HEADER & BRANDING
      // ----------------------------------------------------
      doc.rect(40, 40, 515, 4).fill(primaryColor);

      // Logo / Store Title
      doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor).text("PETPEDIA", 40, 55);
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text("PREMIUM PET ESSENTIALS & CARE", 40, 80);
      doc.text("Web: www.petpedia.in  |  Email: support@petpedia.in", 40, 93);

      // Invoice Title & Meta (Right aligned)
      doc.font("Helvetica-Bold").fontSize(18).fillColor(darkColor).text("TAX INVOICE", 340, 55, {
        align: "right",
        width: 215,
      });

      doc.font("Helvetica").fontSize(9).fillColor(mutedColor);
      doc.text(`Invoice No: ${data.invoiceNumber}`, 340, 78, { align: "right", width: 215 });
      doc.text(`Order: ${data.orderName}`, 340, 91, { align: "right", width: 215 });
      doc.text(`Date: ${data.orderDate}`, 340, 104, { align: "right", width: 215 });

      // Horizontal separator
      doc.moveTo(40, 122).lineTo(555, 122).strokeColor(lightBorder).stroke();

      // ----------------------------------------------------
      // 2. SELLER & CUSTOMER ADDRESS
      // ----------------------------------------------------
      const addressTop = 135;

      // Left Column: Sold By
      doc.font("Helvetica-Bold").fontSize(9).fillColor(primaryColor).text("SOLD BY / SHIPPER:", 40, addressTop);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(darkColor).text("Petpedia Retail India", 40, addressTop + 14);
      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor);
      doc.text("Official Online Pet Supplies Store", 40, addressTop + 27);
      doc.text("Support: support@petpedia.in", 40, addressTop + 39);
      doc.text("Domain: https://www.petpedia.in", 40, addressTop + 51);

      // Right Column: Bill To / Ship To
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(primaryColor)
        .text("BILL & SHIP TO:", 310, addressTop);
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(darkColor)
        .text(data.customer.name || "Valued Customer", 310, addressTop + 14);

      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor);
      let customerY = addressTop + 27;

      if (data.customer.phone) {
        doc.text(`Phone: ${data.customer.phone}`, 310, customerY);
        customerY += 12;
      }
      if (data.customer.email) {
        doc.text(`Email: ${data.customer.email}`, 310, customerY);
        customerY += 12;
      }

      if (data.customer.address) {
        const addr = data.customer.address;
        const line1 = [addr.line1, addr.line2].filter(Boolean).join(", ");
        if (line1) {
          doc.text(line1, 310, customerY, { width: 245 });
          customerY += 12;
        }
        const cityState = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
        if (cityState) {
          doc.text(cityState, 310, customerY, { width: 245 });
          customerY += 12;
        }
        if (addr.country) {
          doc.text(addr.country, 310, customerY);
          customerY += 12;
        }
      }

      const tableStartY = Math.max(customerY + 15, 215);

      // ----------------------------------------------------
      // 3. LINE ITEMS TABLE
      // ----------------------------------------------------
      // Table Header Background
      doc.rect(40, tableStartY, 515, 22).fill("#F8FAFC");
      doc.rect(40, tableStartY, 515, 22).strokeColor(lightBorder).stroke();

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor);
      doc.text("#", 48, tableStartY + 6, { width: 20 });
      doc.text("ITEM DESCRIPTION", 75, tableStartY + 6, { width: 250 });
      doc.text("QTY", 335, tableStartY + 6, { width: 40, align: "center" });
      doc.text("UNIT PRICE", 385, tableStartY + 6, { width: 80, align: "right" });
      doc.text("TOTAL", 475, tableStartY + 6, { width: 70, align: "right" });

      let currentY = tableStartY + 22;

      data.items.forEach((item, index) => {
        const rowHeight = item.variantTitle ? 28 : 20;

        // Subtle alternate row shading
        if (index % 2 === 1) {
          doc.rect(40, currentY, 515, rowHeight).fill("#FDFDFD");
        }

        doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor);
        doc.text(String(index + 1), 48, currentY + 5, { width: 20 });

        // Item Title
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor);
        doc.text(item.title, 75, currentY + 5, { width: 250, ellipsis: true });

        if (item.variantTitle && item.variantTitle.toLowerCase() !== "default title") {
          doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor);
          doc.text(`Variant: ${item.variantTitle}`, 75, currentY + 16, { width: 250, ellipsis: true });
        }

        // Qty
        doc.font("Helvetica").fontSize(8.5).fillColor(darkColor);
        doc.text(String(item.quantity), 335, currentY + 5, { width: 40, align: "center" });

        // Unit Price
        doc.text(formatCurrency(item.price), 385, currentY + 5, { width: 80, align: "right" });

        // Total
        doc.font("Helvetica-Bold");
        doc.text(formatCurrency(item.total), 475, currentY + 5, { width: 70, align: "right" });

        // Divider
        doc
          .moveTo(40, currentY + rowHeight)
          .lineTo(555, currentY + rowHeight)
          .strokeColor("#F1F5F9")
          .stroke();

        currentY += rowHeight;
      });

      // ----------------------------------------------------
      // 4. TOTALS & SUMMARY SECTION
      // ----------------------------------------------------
      currentY += 12;
      const summaryStartY = currentY;

      // Payment Info (Left box)
      doc.rect(40, summaryStartY, 260, 68).strokeColor(lightBorder).stroke();
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(primaryColor);
      doc.text("PAYMENT DETAILS", 52, summaryStartY + 10);

      doc.font("Helvetica").fontSize(8).fillColor(mutedColor);
      doc.text("Payment Method:", 52, summaryStartY + 25);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(darkColor);
      doc.text(data.paymentMethod || "Prepaid", 130, summaryStartY + 25);

      doc.font("Helvetica").fontSize(8).fillColor(mutedColor);
      doc.text("Payment Status:", 52, summaryStartY + 40);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(darkColor);
      doc.text(data.financialStatus || "PAID", 130, summaryStartY + 40);

      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor);
      doc.text("All taxes are included in prices.", 52, summaryStartY + 55);

      // Financial Calculation (Right box)
      const rightColLabelX = 320;
      const rightColValueX = 455;
      let calcY = summaryStartY;

      // Subtotal
      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor);
      doc.text("Subtotal:", rightColLabelX, calcY);
      doc.text(formatCurrency(data.subtotal), rightColValueX, calcY, { width: 90, align: "right" });
      calcY += 15;

      // Discount (if any)
      if (data.discount > 0) {
        doc.text("Discount Savings:", rightColLabelX, calcY);
        doc.fillColor("#16A34A"); // Green
        doc.text(`- ${formatCurrency(data.discount)}`, rightColValueX, calcY, { width: 90, align: "right" });
        calcY += 15;
      }

      // Shipping
      doc.fillColor(mutedColor);
      doc.text("Shipping & Handling:", rightColLabelX, calcY);
      if (data.shippingFee === 0) {
        doc.text("FREE", rightColValueX, calcY, { width: 90, align: "right" });
      } else {
        doc.text(formatCurrency(data.shippingFee), rightColValueX, calcY, { width: 90, align: "right" });
      }
      calcY += 16;

      // Total Box
      doc.rect(rightColLabelX - 5, calcY - 2, 240, 26).fill("#FFF7ED");
      doc.rect(rightColLabelX - 5, calcY - 2, 240, 26).strokeColor("#FDBA74").stroke();

      doc.font("Helvetica-Bold").fontSize(10).fillColor(darkColor);
      doc.text("TOTAL AMOUNT:", rightColLabelX + 5, calcY + 6);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor);
      doc.text(formatCurrency(data.totalAmount), rightColValueX - 5, calcY + 5, {
        width: 100,
        align: "right",
      });

      // ----------------------------------------------------
      // 5. FOOTER
      // ----------------------------------------------------
      const footerY = 740;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(lightBorder).stroke();

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor);
      doc.text("Thank you for choosing Petpedia for your furry friend!", 40, footerY + 12, {
        align: "center",
        width: 515,
      });

      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor);
      doc.text(
        "For order queries, returns, or support, please email support@petpedia.in or visit https://www.petpedia.in",
        40,
        footerY + 26,
        { align: "center", width: 515 },
      );

      doc.text(
        "This is a computer-generated tax invoice and does not require a physical signature.",
        40,
        footerY + 38,
        { align: "center", width: 515 },
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
