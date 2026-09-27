import { useState } from "react";
import { AdminOrder, updateOrderDetailsFn } from "@/lib/admin/orders";
import {
  X,
  Phone,
  MessageSquare,
  MapPin,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Check,
  Loader2,
  Clock,
  Edit3,
} from "lucide-react";

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onOrderUpdated?: ((updated: AdminOrder) => void) | undefined;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order?.fulfillmentStatus || "UNFULFILLED");
  const [financialStatus, setFinancialStatus] = useState(order?.financialStatus || "PENDING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("Shiprocket");
  const [note, setNote] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!order) return null;

  // Clean phone for WhatsApp link
  const rawPhone = (order.customer.phone || order.shippingAddress.phone || "").replace(/\D/g, "");
  const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  const handleUpdate = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await updateOrderDetailsFn({
        data: {
          orderId: order.id,
          fulfillmentStatus,
          financialStatus,
          trackingNumber: trackingNumber.trim() || undefined,
          courierName: courierName || undefined,
          note: note.trim() || undefined,
        },
      });

      if (res.success) {
        setSaveSuccess(true);
        const updated: AdminOrder = {
          ...order,
          fulfillmentStatus: fulfillmentStatus || order.fulfillmentStatus,
          financialStatus: financialStatus || order.financialStatus,
        };
        onOrderUpdated?.(updated);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{order.name}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  fulfillmentStatus === "FULFILLED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {fulfillmentStatus === "FULFILLED" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {fulfillmentStatus}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  financialStatus === "PAID"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {financialStatus}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Order Update Controls (New Feature) */}
          <div className="rounded-2xl border border-orange-200/80 bg-orange-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-900">
                <Edit3 className="h-3.5 w-3.5 text-orange-600" />
                Update Order Status & Tracking
              </span>
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <Check className="h-3.5 w-3.5" /> Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="UNFULFILLED">Pending / Unfulfilled</option>
                  <option value="FULFILLED">Fulfilled (Dispatched)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payment Status
                </label>
                <select
                  value={financialStatus}
                  onChange={(e) => setFinancialStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid (Confirmed)</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shiprocket, BlueDart"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  AWB / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14324924021"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleUpdate}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" /> Save Order Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Customer & Quick Contact */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Customer Information
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-slate-900">{order.customer.name}</p>
                {order.customer.email && (
                  <p className="text-sm text-slate-500">{order.customer.email}</p>
                )}
                <p className="text-sm font-medium text-slate-700 mt-0.5">
                  {order.customer.phone || "No phone provided"}
                </p>
              </div>

              {rawPhone ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                  >
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${waPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              Delivery Address
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {order.shippingAddress.address1 || "No address specified"}
              {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
              {order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ""}
              {order.shippingAddress.zip ? ` - ${order.shippingAddress.zip}` : ""}
            </p>
          </div>

          {/* Items Breakdown */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Package className="h-3.5 w-3.5 text-orange-500" />
              Order Items ({order.itemCount})
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Quantity: <span className="font-bold text-slate-700">{item.quantity}</span> × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl bg-orange-50/80 border border-orange-200/60 p-4">
            <span className="text-sm font-semibold text-slate-700">Total Order Amount</span>
            <span className="text-xl font-extrabold text-orange-600">
              ₹{order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
