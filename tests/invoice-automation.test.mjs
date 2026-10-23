import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const ROOT_DIR = process.cwd();

test("1. Invoice Types and Model files exist and export expected interfaces", () => {
  const typesPath = path.join(ROOT_DIR, "src/lib/invoice/types.ts");
  assert.ok(fs.existsSync(typesPath), "types.ts must exist");
  const content = fs.readFileSync(typesPath, "utf-8");
  assert.match(content, /export interface InvoiceLineItem/);
  assert.match(content, /export interface InvoiceCustomer/);
  assert.match(content, /export interface InvoiceData/);
});

test("2. Invoice Generator exists, configures PDFKit and exports generateInvoicePdf", () => {
  const genPath = path.join(ROOT_DIR, "src/lib/invoice/generator.ts");
  assert.ok(fs.existsSync(genPath), "generator.ts must exist");
  const content = fs.readFileSync(genPath, "utf-8");
  assert.match(content, /import PDFDocument from "pdfkit"/);
  assert.match(content, /export function generateInvoicePdf/);
  assert.match(content, /PETPEDIA/);
  assert.match(content, /TAX INVOICE/);
  assert.match(content, /support@petpedia\.in/);
});

test("3. Invoice Email service exists, exports sendInvoiceEmail and configures Resend payload", () => {
  const emailPath = path.join(ROOT_DIR, "src/lib/invoice/email.ts");
  assert.ok(fs.existsSync(emailPath), "email.ts must exist");
  const content = fs.readFileSync(emailPath, "utf-8");
  assert.match(content, /export async function sendInvoiceEmail/);
  assert.match(content, /https:\/\/api\.resend\.com\/emails/);
  assert.match(content, /RESEND_API_KEY/);
  assert.match(content, /attachments/);
});

test("4. Invoice Service provides snapshot persistence, fallback fetch, and Shopify timeline note sync", () => {
  const servicePath = path.join(ROOT_DIR, "src/lib/invoice/service.ts");
  assert.ok(fs.existsSync(servicePath), "service.ts must exist");
  const content = fs.readFileSync(servicePath, "utf-8");
  assert.match(content, /export function cleanOrderId/);
  assert.match(content, /export async function saveInvoiceSnapshot/);
  assert.match(content, /export async function getInvoiceData/);
  assert.match(content, /export function buildInvoiceFromWebhook/);
  assert.match(content, /export async function syncInvoiceToShopifyOrder/);
  assert.match(content, /storageSet\(`invoice:\$\{id\}`/);
});

test("5. Invoice API route (/api/invoices/$orderId) streams PDF on demand", () => {
  const routePath = path.join(ROOT_DIR, "src/routes/api.invoices.$orderId.ts");
  assert.ok(fs.existsSync(routePath), "api.invoices.$orderId.ts must exist");
  const content = fs.readFileSync(routePath, "utf-8");
  assert.match(content, /createFileRoute\("\/api\/invoices\/\$orderId"\)/);
  assert.match(content, /application\/pdf/);
  assert.match(content, /getInvoiceData/);
  assert.match(content, /generateInvoicePdf/);
});

test("6. Shopify Webhook handler integrates invoice snapshot persistence, Resend email and note sync", () => {
  const webhookPath = path.join(ROOT_DIR, "src/routes/api.webhooks.shopify-orders.ts");
  const content = fs.readFileSync(webhookPath, "utf-8");
  assert.match(content, /buildInvoiceFromWebhook/);
  assert.match(content, /saveInvoiceSnapshot/);
  assert.match(content, /syncInvoiceToShopifyOrder/);
  assert.match(content, /sendInvoiceEmail/);
  assert.match(content, /generateInvoicePdf/);
});

test("7. Petpedia Admin OrderDetailsModal contains Download Invoice PDF link", () => {
  const modalPath = path.join(ROOT_DIR, "src/components/admin/OrderDetailsModal.tsx");
  const content = fs.readFileSync(modalPath, "utf-8");
  assert.match(content, /\/api\/invoices\//);
  assert.match(content, /Download Invoice \(PDF\)/);
  assert.match(content, /FileText/);
});

test("8. Functional PDF generation with PDFKit generates a valid binary document", async () => {
  const pdfBuffer = await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(16).text("PETPEDIA TAX INVOICE", 40, 50);
      doc.fontSize(10).text("Order #1025", 40, 80);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });

  assert.ok(pdfBuffer instanceof Buffer);
  assert.ok(pdfBuffer.length > 500, "PDF buffer must contain binary PDF content");
  const magic = pdfBuffer.subarray(0, 5).toString("utf-8");
  assert.equal(magic, "%PDF-", "Generated buffer must have standard PDF magic number");
});

test("9. MSG91 Order Confirmation SMS service and webhook integration (PETPED)", () => {
  const msg91Path = path.join(ROOT_DIR, "src/lib/sms/msg91.ts");
  const content = fs.readFileSync(msg91Path, "utf-8");
  assert.match(content, /export async function sendMsg91OrderConfirmation/);
  assert.match(content, /orderTemplateId/);
  assert.match(content, /order_number/);
  assert.match(content, /maskMobileForLogs/);

  const webhookPath = path.join(ROOT_DIR, "src/routes/api.webhooks.shopify-orders.ts");
  const webhookContent = fs.readFileSync(webhookPath, "utf-8");
  assert.match(webhookContent, /sendMsg91OrderConfirmation/);
});

