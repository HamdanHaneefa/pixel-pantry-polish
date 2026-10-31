import { createFileRoute } from "@tanstack/react-router";
import { getInvoiceData, cleanOrderId } from "@/lib/invoice/service";
import { generateInvoicePdf } from "@/lib/invoice/generator";

export const Route = createFileRoute("/api/invoices/$orderId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const rawId = params.orderId;
        const orderId = cleanOrderId(rawId);

        if (!orderId) {
          return Response.json(
            { error: "Invalid order identifier provided." },
            { status: 400 },
          );
        }

        try {
          const invoiceData = await getInvoiceData(orderId);

          if (!invoiceData) {
            return Response.json(
              {
                error: `Invoice for order #${orderId} was not found. Please verify the order ID.`,
              },
              { status: 404 },
            );
          }

          const pdfBuffer = await generateInvoicePdf(invoiceData);
          // ?download=1 saves the file; otherwise it opens in the browser for printing
          const download = new URL(request.url).searchParams.get("download") === "1";
          const sanitizedFilename = `Petpedia-Invoice-${invoiceData.orderName.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`;

          return new Response(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${sanitizedFilename}"`,
              "Content-Length": String(pdfBuffer.length),
              "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            },
          });
        } catch (err: any) {
          console.error(`[Invoice Endpoint Error] Failed generating invoice for ${orderId}:`, err);
          return Response.json(
            {
              error: "An unexpected error occurred while generating the invoice PDF.",
              details: process.env.NODE_ENV === "development" ? err.message : undefined,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
