export interface InvoiceLineItem {
  id: string;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  /** Unit price before discount (tax inclusive). */
  price: number;
  /** Line total after discount (tax inclusive). */
  total: number;
  /** HSN code from the variant's Shopify "HS code". */
  hsn?: string;
  /** GST % from a product tag like "gst-5"; the invoice uses the default rate when missing. */
  gstRate?: number;
}

export interface InvoiceAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
}

export interface InvoiceCustomer {
  name: string;
  email?: string;
  phone?: string;
  /** Shipping address. */
  address?: InvoiceAddress;
  /** Billing address; the shipping address is used when missing. */
  billingAddress?: InvoiceAddress;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  orderName: string;
  orderDate: string;
  customer: InvoiceCustomer;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  financialStatus: string;
  createdAt: string;
  /** Courier and AWB once the order is fulfilled with tracking. */
  courier?: { company?: string; awb?: string };
}
