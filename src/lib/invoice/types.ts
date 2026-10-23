export interface InvoiceLineItem {
  id: string;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceCustomer {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
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
}
