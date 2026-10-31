import PDFDocument from "pdfkit";
import { InvoiceAddress, InvoiceData } from "./types";
import { code128B } from "./barcode";

/** The registered business behind Petpedia (GST invoice details). */
const SELLER = {
  legalName: "PETBEY INDIA PRIVATE LIMITED",
  /** Pickup / return address printed as "Sold By". */
  address: "11/22-O, PTK Square, 1st floor, Down Hill, Malappuram - 676505",
  registeredAddress:
    "1st Floor, PTK Square, 11/22-O, Panikkarpadi, Perumanna Malappuram, Malappuram, MALAPPURAM - 676501",
  gstin: "32AAOCP3507G2ZJ",
  pan: "AAOCP3507G",
  /** CGST + SGST inside this state, IGST outside it. */
  state: "Kerala",
  stateCode: "KL",
  phone: "+91 9061333733",
  email: "support@petpedia.in",
};

/** GST % for products without a "gst-<rate>" tag. */
const DEFAULT_GST_RATE = 18;

const INK = "#000000";
const MUTED = "#444444";
const BRAND = "#EA580C";
const FONT = "Helvetica";
const BOLD = "Helvetica-Bold";

function money(amount: number): string {
  const [intPart = "0", decPart = "00"] = Math.abs(Number(amount || 0)).toFixed(2).split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}` : lastThree;
  return `${amount < 0 ? "-" : ""}${grouped}.${decPart}`;
}

/** Cash on delivery: the courier must collect the total from the customer. */
export function isCashOnDelivery(data: InvoiceData): boolean {
  if (/\bcod\b|cash on delivery/i.test(data.paymentMethod || "")) return true;
  return /pending/i.test(data.financialStatus || "");
}

function isIntraState(state?: string): boolean {
  const s = String(state || "").trim().toLowerCase();
  return s === SELLER.state.toLowerCase() || s === SELLER.stateCode.toLowerCase();
}

function addressLines(a: InvoiceAddress | undefined): string[] {
  if (!a) return [];
  const street = [a.line1, a.line2].filter(Boolean).join(", ");
  const cityLine = [a.city, a.state].filter(Boolean).join(", ");
  return [
    street,
    [cityLine, a.pincode].filter(Boolean).join(" - "),
    a.country && a.country !== "India" ? a.country : "",
  ].filter(Boolean);
}

/** Splits a tax-inclusive amount into taxable value and GST. */
function splitTax(total: number, rate: number, intra: boolean) {
  const taxable = total / (1 + rate / 100);
  const tax = total - taxable;
  return {
    taxable,
    cgst: intra ? tax / 2 : 0,
    sgst: intra ? tax / 2 : 0,
    igst: intra ? 0 : tax,
  };
}

function nowIst(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: `Petpedia Invoice - ${data.invoiceNumber}`,
          Author: SELLER.legalName,
          Subject: `Tax Invoice for Order ${data.orderName}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const cod = isCashOnDelivery(data);
      const orderNo = (data.orderName || data.orderId).replace(/^#/, "");
      const shipTo = data.customer.address;
      const intra = isIntraState(shipTo?.state);

      const labelBottom = drawShippingLabel(doc, data, { cod, orderNo });

      // Cut line between the label and the invoice
      const cutY = labelBottom + 14;
      doc
        .moveTo(20, cutY)
        .lineTo(575, cutY)
        .dash(5, { space: 4 })
        .lineWidth(1)
        .strokeColor(INK)
        .stroke()
        .undash();

      drawTaxInvoice(doc, data, { cod, intra, top: cutY + 14 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/** Shipping label (top half): sized like a courier label, centred on the page. */
function drawShippingLabel(
  doc: PDFKit.PDFDocument,
  data: InvoiceData,
  { cod, orderNo }: { cod: boolean; orderNo: string },
): number {
  const x = 150;
  const w = 295;
  const pad = 6;
  const top = 24;
  let y = top;

  doc.lineWidth(1).strokeColor(INK);

  // Row 1: courier / order | payment mode
  const modeW = 92;
  const row1H = 36;
  doc.font(BOLD).fontSize(9).fillColor(INK);
  doc.text(data.courier?.company || "Courier: ____________", x + pad, y + 6, {
    width: w - modeW - pad * 2,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font(FONT).fontSize(8.5);
  doc.text(
    data.courier?.awb ? `AWB: ${data.courier.awb}` : `Order: ${data.orderName}`,
    x + pad,
    y + 20,
    { width: w - modeW - pad * 2, lineBreak: false, ellipsis: true },
  );
  doc.moveTo(x + w - modeW, y).lineTo(x + w - modeW, y + row1H).stroke();
  doc.font(BOLD).fontSize(cod ? 15 : 12);
  doc.text(cod ? "COD" : "PREPAID", x + w - modeW, y + (cod ? 11 : 13), {
    width: modeW,
    align: "center",
  });
  y += row1H;
  doc.moveTo(x, y).lineTo(x + w, y).stroke();

  // Row 2: order barcode
  const bars = code128B(orderNo);
  const modules = bars.reduce((a, b) => a + b, 0);
  const barMaxW = w - 40;
  const moduleW = Math.min(1.6, barMaxW / modules);
  const barW = modules * moduleW;
  let bx = x + (w - barW) / 2;
  const barTop = y + 10;
  const barH = 48;
  bars.forEach((width, i) => {
    if (i % 2 === 0) doc.rect(bx, barTop, width * moduleW, barH).fill(INK);
    bx += width * moduleW;
  });
  doc.font(BOLD).fontSize(10).fillColor(INK);
  doc.text(`ORDER ${data.orderName}`, x, barTop + barH + 4, { width: w, align: "center" });
  y = barTop + barH + 20;
  doc.moveTo(x, y).lineTo(x + w, y).stroke();

  // Row 3: ship to
  const ship = data.customer.address;
  const textW = w - pad * 2;
  let ty = y + 6;
  doc.font(BOLD).fontSize(9).text("Shipping / Customer address:", x + pad, ty, { width: textW });
  ty = doc.y + 1;
  doc.font(BOLD).fontSize(10).text(ship?.name || data.customer.name, x + pad, ty, { width: textW });
  ty = doc.y + 1;
  doc.font(FONT).fontSize(9);
  const street = [ship?.line1, ship?.line2].filter(Boolean).join(", ");
  if (street) {
    doc.text(street, x + pad, ty, { width: textW });
    ty = doc.y + 1;
  }
  const cityState = [ship?.city, ship?.state].filter(Boolean).join(", ");
  doc.text(`${cityState}${ship?.pincode ? " - " : ""}`, x + pad, ty, { width: textW, continued: true });
  doc.font(BOLD).text(ship?.pincode || "");
  ty = doc.y + 1;
  const phone = data.customer.phone || ship?.phone;
  if (phone) {
    doc.font(FONT).text(`Phone: ${phone}`, x + pad, ty, { width: textW });
    ty = doc.y;
  }
  y = ty + 6;
  doc.moveTo(x, y).lineTo(x + w, y).stroke();

  // Row 4: amount to collect
  const collectH = 22;
  doc.font(BOLD).fontSize(cod ? 11 : 10).fillColor(INK);
  doc.text(
    cod ? `COLLECT CASH: Rs. ${money(data.totalAmount)}` : "PREPAID - DO NOT COLLECT CASH",
    x,
    y + 6,
    { width: w, align: "center" },
  );
  y += collectH;
  doc.moveTo(x, y).lineTo(x + w, y).stroke();

  // Row 5: sold by
  ty = y + 5;
  doc.font(BOLD).fontSize(7.5).text("Sold By: ", x + pad, ty, { width: textW, continued: true });
  doc.text(`${SELLER.legalName}, `, { continued: true });
  doc.font(FONT).text(SELLER.address);
  ty = doc.y + 2;
  doc.font(FONT).fontSize(7.5).text(`GSTIN: ${SELLER.gstin}   |   Phone: ${SELLER.phone}`, x + pad, ty, {
    width: textW,
  });
  y = doc.y + 5;
  doc.moveTo(x, y).lineTo(x + w, y).stroke();

  // Row 6: SKU | description | qty
  const qtyW = 30;
  const headH = 13;
  doc.font(BOLD).fontSize(7.5);
  doc.text("SKU ID | Description", x + pad, y + 3, { width: w - qtyW - pad * 2, align: "center" });
  doc.text("QTY", x + w - qtyW, y + 3, { width: qtyW, align: "center" });
  doc.moveTo(x, y + headH).lineTo(x + w, y + headH).stroke();
  const tableTop = y;
  ty = y + headH + 3;
  doc.font(FONT).fontSize(7.5);
  data.items.forEach((item, i) => {
    const variant =
      item.variantTitle && item.variantTitle.toLowerCase() !== "default title"
        ? ` - ${item.variantTitle}`
        : "";
    const desc = `${i + 1}. ${item.sku ? `${item.sku} | ` : ""}${item.title}${variant}`;
    doc.text(desc, x + pad, ty, { width: w - qtyW - pad * 2 });
    const next = doc.y;
    doc.text(String(item.quantity), x + w - qtyW, ty, { width: qtyW, align: "center" });
    ty = next + 2;
  });
  y = Math.max(ty + 4, tableTop + headH + 40);
  doc.moveTo(x + w - qtyW, tableTop).lineTo(x + w - qtyW, y).stroke();
  doc.moveTo(x, y).lineTo(x + w, y).stroke();

  // Row 7: footer
  doc.font(BOLD).fontSize(7).text("Not for resale.", x + pad, y + 4);
  doc.font(BOLD).fontSize(7).text(`Printed at ${nowIst()}`, x + pad, y + 4, {
    width: w - pad * 2,
    align: "right",
  });
  y += 15;

  doc.rect(x, top, w, y - top).lineWidth(1.2).strokeColor(INK).stroke();
  return y;
}

/** GST tax invoice (bottom half). */
function drawTaxInvoice(
  doc: PDFKit.PDFDocument,
  data: InvoiceData,
  { cod, intra, top }: { cod: boolean; intra: boolean; top: number },
) {
  const left = 40;
  const right = 555;
  const pageBottom = 815;
  let y = top;

  // Header: title | order | invoice | GSTIN
  doc.font(BOLD).fontSize(13).fillColor(INK).text("Tax Invoice", left, y + 2);
  const meta = (label: string, value: string, sub: string, mx: number, mw: number) => {
    doc.font(FONT).fontSize(7.5).fillColor(MUTED).text(label, mx, y, { width: mw });
    doc.font(BOLD).fontSize(8).fillColor(INK).text(value, mx, y + 11, { width: mw });
    doc.font(FONT).fontSize(7.5).fillColor(MUTED).text(sub, mx, y + 23, { width: mw });
  };
  meta("Order Id:", data.orderName, `Order Date: ${data.orderDate}`, 135, 120);
  meta("Invoice No:", data.invoiceNumber, `Invoice Date: ${data.orderDate}`, 265, 125);
  doc.font(FONT).fontSize(8.5).fillColor(MUTED);
  doc.text(`GSTIN: ${SELLER.gstin}`, 400, y, { width: right - 400, align: "right" });
  doc.text(`PAN: ${SELLER.pan}`, 400, y + 12, { width: right - 400, align: "right" });
  y += 40;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.6).strokeColor("#BBBBBB").stroke();
  y += 8;

  // Addresses: sold by | billing | shipping
  const ship = data.customer.address;
  const bill = data.customer.billingAddress || ship;
  const columns: Array<{ title: string; name: string; lines: string[]; x: number; w: number }> = [
    {
      title: "Sold By",
      name: SELLER.legalName,
      lines: [SELLER.address, `GST: ${SELLER.gstin}`],
      x: left,
      w: 165,
    },
    {
      title: "Billing Address",
      name: bill?.name || data.customer.name,
      lines: addressLines(bill),
      x: 220,
      w: 160,
    },
    {
      title: "Shipping Address",
      name: ship?.name || data.customer.name,
      lines: [
        ...addressLines(ship),
        ...(data.customer.phone || ship?.phone ? [`Phone: ${data.customer.phone || ship?.phone}`] : []),
      ],
      x: 395,
      w: right - 395,
    },
  ];
  let addrBottom = y;
  for (const col of columns) {
    doc.font(BOLD).fontSize(9).fillColor(INK).text(col.title, col.x, y, { width: col.w });
    doc.font(BOLD).fontSize(8).text(col.name, col.x, doc.y + 2, { width: col.w });
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    for (const line of col.lines) doc.text(line, col.x, doc.y + 1, { width: col.w });
    addrBottom = Math.max(addrBottom, doc.y);
  }
  y = addrBottom + 10;

  // Items table
  const cols = [
    { key: "product", label: "Product", w: 112, align: "left" },
    { key: "desc", label: "Description", w: 92, align: "left" },
    { key: "qty", label: "Qty", w: 22, align: "center" },
    { key: "gross", label: "Gross\nAmount", w: 46, align: "right" },
    { key: "disc", label: "Discount", w: 40, align: "right" },
    { key: "taxable", label: "Taxable\nValue", w: 48, align: "right" },
    { key: "cgst", label: "CGST", w: 37, align: "right" },
    { key: "sgst", label: "SGST/\nUTGST", w: 37, align: "right" },
    { key: "igst", label: "IGST", w: 37, align: "right" },
    { key: "total", label: "Total", w: 44, align: "right" },
  ] as const;
  type ColKey = (typeof cols)[number]["key"];
  const cellPad = 3;

  const drawRow = (values: Record<ColKey, string>, rowY: number, opts: { bold?: boolean } = {}) => {
    doc.font(opts.bold ? BOLD : FONT).fontSize(7).fillColor(INK);
    let cx = left;
    let bottom = rowY;
    for (const c of cols) {
      doc.text(values[c.key], cx + cellPad, rowY + 4, { width: c.w - cellPad * 2, align: c.align });
      bottom = Math.max(bottom, doc.y);
      cx += c.w;
    }
    return bottom + 4;
  };

  const headerValues = Object.fromEntries(cols.map((c) => [c.key, c.label])) as Record<ColKey, string>;
  const tableTop = y;
  y = drawRow(headerValues, y, { bold: true });
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.6).strokeColor(INK).stroke();

  let totalQty = 0;
  const lines = data.items.map((item) => {
    const rate = item.gstRate ?? DEFAULT_GST_RATE;
    const gross = item.price * item.quantity;
    const tax = splitTax(item.total, rate, intra);
    totalQty += item.quantity;
    const variant =
      item.variantTitle && item.variantTitle.toLowerCase() !== "default title"
        ? `\n${item.variantTitle}`
        : "";
    const rates = intra ? `CGST: ${money(rate / 2)}% | SGST: ${money(rate / 2)}%` : `IGST: ${money(rate)}%`;
    return {
      product: `${item.title}${variant}${item.sku ? `\nSKU: ${item.sku}` : ""}`,
      desc: `HSN: ${item.hsn || "-"} | ${rates}`,
      qty: String(item.quantity),
      gross: money(gross),
      disc: money(-(gross - item.total)),
      taxable: money(tax.taxable),
      cgst: money(tax.cgst),
      sgst: money(tax.sgst),
      igst: money(tax.igst),
      total: money(item.total),
    };
  });

  const shipTax = splitTax(data.shippingFee || 0, DEFAULT_GST_RATE, intra);
  lines.push({
    product: "",
    desc: "Shipping / Handling Fee",
    qty: data.shippingFee > 0 ? "1" : "-",
    gross: money(data.shippingFee || 0),
    disc: money(0),
    taxable: money(shipTax.taxable),
    cgst: money(shipTax.cgst),
    sgst: money(shipTax.sgst),
    igst: money(shipTax.igst),
    total: money(data.shippingFee || 0),
  });

  let sectionTop = tableTop;
  for (const values of lines) {
    if (y > pageBottom - 60) {
      doc.rect(left, sectionTop, right - left, y - sectionTop).lineWidth(0.8).stroke();
      doc.addPage();
      y = 40;
      sectionTop = y;
    }
    y = drawRow(values, y);
  }

  // Totals row
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.6).stroke();
  doc.font(BOLD).fontSize(8.5).fillColor(INK).text(`TOTAL QTY: ${totalQty}`, left + 6, y + 7);
  doc.text(`TOTAL PRICE: ${money(data.totalAmount)}`, left, y + 5, {
    width: right - left - 6,
    align: "right",
  });
  doc.font(FONT).fontSize(7).text("All values are in INR", left, y + 16, {
    width: right - left - 6,
    align: "right",
  });
  y += 28;
  doc.rect(left, sectionTop, right - left, y - sectionTop).lineWidth(0.8).strokeColor(INK).stroke();

  if (y > pageBottom - 110) {
    doc.addPage();
    y = 40;
  }

  // Payment, registered address and signature
  y += 10;
  doc.font(BOLD).fontSize(8).fillColor(INK).text("Payment: ", left, y, { continued: true });
  doc
    .font(FONT)
    .text(
      `${data.paymentMethod || "Prepaid"} (${data.financialStatus || "PAID"})${
        cod ? ` - collect Rs. ${money(data.totalAmount)} on delivery` : ""
      }`,
    );
  doc.font(BOLD).fontSize(8).text("Seller Registered Address: ", left, doc.y + 3, {
    width: 330,
    continued: true,
  });
  doc.font(FONT).text(`${SELLER.legalName}, ${SELLER.registeredAddress}`);
  doc.font(FONT).fontSize(7.5).fillColor(MUTED);
  doc.text(
    "Prices are inclusive of GST. This is a computer-generated invoice.",
    left,
    doc.y + 3,
    { width: 330 },
  );

  const sigW = 120;
  const sigX = right - sigW;
  doc.rect(sigX, y, sigW, 55).lineWidth(0.6).strokeColor("#BBBBBB").stroke();
  doc.font(BOLD).fontSize(9).fillColor(INK).text(SELLER.legalName, sigX - 60, y + 62, {
    width: sigW + 60,
    align: "right",
  });
  doc.font(FONT).fontSize(8).text("Authorized Signatory", sigX - 60, doc.y + 1, {
    width: sigW + 60,
    align: "right",
  });

  const footY = doc.y + 8;
  doc.font(FONT).fontSize(8).fillColor(INK).text("E. & O.E.", left, footY);
  doc.font(FONT).fontSize(8).text("Ordered Through", left, footY - 4, { width: right - left, align: "center" });
  doc.font(BOLD).fontSize(12).fillColor(BRAND).text("Petpedia", left, doc.y, {
    width: right - left,
    align: "center",
  });
}
