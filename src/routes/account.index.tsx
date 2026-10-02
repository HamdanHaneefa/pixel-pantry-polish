import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import TrustBar from "@/components/home/TrustBar";
import MobileTabBar from "@/components/home/MobileTabBar";
import { useCustomer } from "@/context/CustomerContext";
import {
  getCustomerOrdersFn,
  updateCustomerProfileFn,
  requestOrderReturnFn,
  CustomerOrderSummary,
} from "@/lib/customer/auth";
import {
  User,
  Package,
  Heart,
  Dog,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  FileText,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  RotateCcw,
  CreditCard,
  Building2,
  Bookmark,
  Award,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { formatPrice } from "@/data/home";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "My Account — Petpedia" },
      { name: "description", content: "Manage your profile, pet details, and track your Petpedia orders." },
    ],
  }),
  component: CustomerAccountPage,
});

type TabType = "profile" | "orders" | "pet" | "returns" | "addresses" | "wishlist";

function formatOrderDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const dayName = d.toLocaleDateString("en-IN", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${dayName} ${day}, ${month} ${year} at ${time}`;
  } catch {
    return dateString;
  }
}

function CustomerAccountPage() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, isLoading, logout, refreshSession } = useCustomer();

  // Active Tab & Subviews
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orderFilter, setOrderFilter] = useState<"all" | "in-transit" | "delivered">("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderSummary | null>(null);

  // Orders State
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<CustomerOrderSummary | null>(null);
  const [returnReason, setReturnReason] = useState("Ordered by mistake / Changed my mind");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnResolution, setReturnResolution] = useState("Refund to Original Payment Mode");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("male");
  const [altPhone, setAltPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Pet Profile mock state
  const [pets, setPets] = useState<Array<{ name: string; type: string; breed: string; age: string }>>([
    { name: "Max", type: "Dog", breed: "Golden Retriever", age: "2 Years" },
  ]);
  const [newPetName, setNewPetName] = useState("");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetType, setNewPetType] = useState("Dog");
  const [isAddingPet, setIsAddingPet] = useState(false);

  // Hash change detection (supports #order, #profile, #pet, #returns, #addresses, #wishlist)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "order" || hash === "orders") {
        setActiveTab("orders");
      } else if (hash === "profile") {
        setActiveTab("profile");
        setSelectedOrder(null);
      } else if (hash === "pet" || hash === "pet-profile") {
        setActiveTab("pet");
        setSelectedOrder(null);
      } else if (hash === "returns") {
        setActiveTab("returns");
        setSelectedOrder(null);
      } else if (hash === "addresses") {
        setActiveTab("addresses");
        setSelectedOrder(null);
      } else if (hash === "wishlist") {
        setActiveTab("wishlist");
        setSelectedOrder(null);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedOrder(null);
    window.location.hash = tab === "orders" ? "order" : tab;
  };

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/account/login", search: { redirect: "/account#order" } });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Sync profile fields from customer session
  useEffect(() => {
    if (customer) {
      const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
      setFullName(name || "Pet Parent");
      setEmail(customer.email || "");
    }
  }, [customer]);

  // Load customer orders from Shopify Admin
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await getCustomerOrdersFn();
      if (res.success && res.orders) {
        setOrders(res.orders);
        // If an order is currently selected, refresh its reference
        if (selectedOrder) {
          const fresh = res.orders.find((o) => o.id === selectedOrder.id || o.orderNumber === selectedOrder.orderNumber);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (e) {
      console.warn("Error fetching customer orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    if (orderFilter === "all") return true;
    if (orderFilter === "delivered") {
      return ord.fulfillmentStatus.toUpperCase() === "FULFILLED" || ord.fulfillmentStatus.toUpperCase() === "DELIVERED";
    }
    if (orderFilter === "in-transit") {
      return (
        ord.fulfillmentStatus.toUpperCase() === "IN_TRANSIT" ||
        ord.fulfillmentStatus.toUpperCase() === "PARTIALLY_FULFILLED" ||
        ord.fulfillmentStatus.toUpperCase() === "UNFULFILLED"
      );
    }
    return true;
  });

  // Handle return request submission
  const handleOpenReturnModal = (order: CustomerOrderSummary) => {
    setOrderToReturn(order);
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToReturn) return;

    setIsSubmittingReturn(true);
    try {
      const res = await requestOrderReturnFn({
        data: {
          orderId: orderToReturn.id,
          orderNumber: orderToReturn.orderNumber,
          reason: returnReason,
          notes: returnNotes,
          resolution: returnResolution,
        },
      });

      if (res.success) {
        toast.success(res.message || "Return request submitted successfully!");
        setIsReturnModalOpen(false);
        setReturnNotes("");
        // Reload orders to reflect updated status
        await loadOrders();
      } else {
        toast.error(res.error || "Failed to submit return request.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while submitting return.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "Pet";
    const lastName = parts.slice(1).join(" ") || "Parent";

    try {
      const res = await updateCustomerProfileFn({
        data: {
          firstName,
          lastName,
          email,
          dob,
          gender,
        },
      });

      if (res.success) {
        toast.success("Profile updated successfully!");
        refreshSession();
      } else {
        toast.error(res.error || "Failed to save profile.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;
    setPets([
      ...pets,
      {
        name: newPetName.trim(),
        type: newPetType,
        breed: newPetBreed.trim() || "Mixed",
        age: "1 Year",
      },
    ]);
    setNewPetName("");
    setNewPetBreed("");
    setIsAddingPet(false);
    toast.success("Pet profile added!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF9F3] flex flex-col justify-between">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            <p className="text-sm font-medium text-slate-600">Loading your Petpedia account...</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Get Initials for Avatar
  const customerName = `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Hamdan C";
  const initials = customerName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "HC";

  const cleanPhone = customer?.phone || "+917306827008";
  const maskedPhone = cleanPhone.replace(/(\+\d{2})(\d{5})(\d{5})/, "$1 $2*****");

  // Orders with return requested
  const returnOrders = orders.filter((o) => o.isReturnRequested);

  return (
    <div className="min-h-screen bg-[#FDF9F3] flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================================================= */}
          {/* LEFT SIDEBAR (Zigly Reference Layout)            */}
          {/* ================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* User Greeting Card */}
            <div className="bg-[#1E3A8A] text-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-extrabold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold truncate">Hey, {customerName}</h2>
                <p className="text-xs text-blue-200 truncate mt-0.5">
                  Logged in via {maskedPhone}
                </p>
              </div>
            </div>

            {/* Navigation Tabs List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
              {/* My Profile */}
              <button
                onClick={() => handleTabChange("profile")}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-slate-50 text-[#1E3A8A] font-bold border-l-4 border-[#1E3A8A]"
                    : "text-slate-700 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">My Profile</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded-full">
                        50% Completed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Create a unique profile</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* My Pet */}
              <button
                onClick={() => handleTabChange("pet")}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === "pet"
                    ? "bg-slate-50 text-[#1E3A8A] font-bold border-l-4 border-[#1E3A8A]"
                    : "text-slate-700 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Dog className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">My Pet</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded-full">
                        Add pet
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Create a unique profile of your pet</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* My Orders */}
              <button
                onClick={() => handleTabChange("orders")}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-slate-50 text-[#1E3A8A] font-bold border-l-4 border-[#1E3A8A]"
                    : "text-slate-700 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="text-sm">My Orders</span>
                    <p className="text-[11px] text-slate-400 font-normal">Check your order status</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* My Wishlist */}
              <Link
                to="/wishlist"
                className="w-full text-left p-4 flex items-center justify-between text-slate-700 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="text-sm">My Wishlist</span>
                    <p className="text-[11px] text-slate-400 font-normal">Shop from your wishlist</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* My Returns (Screenshot 1 & 2 sidebar item) */}
              <button
                onClick={() => handleTabChange("returns")}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === "returns"
                    ? "bg-slate-50 text-[#1E3A8A] font-bold border-l-4 border-[#1E3A8A]"
                    : "text-slate-700 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">My Returns</span>
                      {returnOrders.length > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-1.5 py-0.5 rounded-full">
                          {returnOrders.length}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Return your product</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Saved Addresses */}
              <button
                onClick={() => handleTabChange("addresses")}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-slate-50 text-[#1E3A8A] font-bold border-l-4 border-[#1E3A8A]"
                    : "text-slate-700 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="text-sm">Saved Addresses</span>
                    <p className="text-[11px] text-slate-400 font-normal">Add or edit your addresses</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Help & Support */}
              <Link
                to="/contact"
                className="w-full text-left p-4 flex items-center justify-between text-slate-700 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="text-sm">Help & Support</span>
                    <p className="text-[11px] text-slate-400 font-normal">Get solutions to your questions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* LOGOUT Button (Exact red outline button matching Screenshot 2) */}
              <div className="p-4">
                <button
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl border border-rose-500 text-rose-600 hover:bg-rose-50 transition-colors font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* MAIN CONTENT AREA                                */}
          {/* ================================================= */}
          <div className="lg:col-span-8">
            {/* ------------------------------------------------ */}
            {/* VIEW A: ORDER DETAILS VIEW (Screenshots 1 & 2)    */}
            {/* ------------------------------------------------ */}
            {activeTab === "orders" && selectedOrder && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Back to Orders Header (Screenshot 1) */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Orders</span>
                </button>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                  {/* Order Number & Date Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Order Number</p>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        {selectedOrder.orderNumber.startsWith("ZG-ORD")
                          ? selectedOrder.orderNumber
                          : `ZG-ORD-${selectedOrder.orderNumber}`}
                      </h2>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-slate-500 font-medium">Order Date</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {formatOrderDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Return Status Banner or Action Button */}
                  {selectedOrder.isReturnRequested ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                      <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                          Return Requested — Under Review
                        </h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {selectedOrder.returnReason
                            ? `Reason: ${selectedOrder.returnReason}`
                            : "Your request is being reviewed by our team. Our courier will contact you for pickup."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Need to cancel or return this order?</h4>
                        <p className="text-[11px] text-slate-500">
                          {selectedOrder.fulfillmentStatus.toUpperCase() === "FULFILLED" ||
                          selectedOrder.fulfillmentStatus.toUpperCase() === "DELIVERED"
                            ? "Returns are accepted within 7 days of delivery."
                            : "You can request cancellation / return before the order is delivered."}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenReturnModal(selectedOrder)}
                        className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return Order</span>
                      </button>
                    </div>
                  )}

                  {/* Items Subheading */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      {selectedOrder.itemCount}{" "}
                      <span className="capitalize">
                        {selectedOrder.fulfillmentStatus.toLowerCase()}
                      </span>{" "}
                      Item(s)
                    </h3>

                    {/* Item Cards Container */}
                    <div className="rounded-2xl border border-slate-200/90 p-4 space-y-4">
                      {selectedOrder.items.map((it) => (
                        <div key={it.id} className="flex gap-4 items-start">
                          <img
                            src={it.image || "/placeholder-product.png"}
                            alt={it.title}
                            className="w-24 h-24 rounded-2xl object-contain bg-slate-50 border border-slate-200/60 p-1 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                              {it.title}
                            </h4>
                            <p className="text-xs font-semibold text-slate-600">
                              QUANTITY: {it.quantity}
                            </p>
                            {it.variantTitle && (
                              <p className="text-xs font-semibold text-slate-600 uppercase">
                                SIZE: {it.variantTitle}
                              </p>
                            )}
                            <p className="text-xs font-bold text-slate-900 pt-0.5">
                              TOTAL: {formatPrice(it.price * it.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details Section */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Payment Details</h3>
                    <div className="rounded-2xl border border-slate-200/90 p-5 space-y-3 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Mode of Payment</span>
                        <span className="font-semibold text-slate-900">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal (Inclusive Tax)</span>
                        <span className="font-semibold text-slate-900">
                          {formatPrice(selectedOrder.subtotal || selectedOrder.total)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping Charges</span>
                        <span className="font-semibold text-slate-900">
                          {selectedOrder.shippingFee === 0 ? "Free" : formatPrice(selectedOrder.shippingFee)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                        <span>Total</span>
                        <span className="text-base font-black text-slate-900">
                          {formatPrice(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Section (Screenshot 2) */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Shipping Address</h3>
                    <div className="rounded-2xl border border-slate-200/90 p-5 space-y-1.5 text-xs text-slate-700">
                      <p className="font-bold text-sm text-slate-900">
                        {selectedOrder.shippingAddress?.name || customerName}
                      </p>
                      <p className="text-slate-400">|</p>
                      <p className="font-semibold text-slate-800">
                        {selectedOrder.shippingAddress?.phone || cleanPhone}
                      </p>
                      <p className="text-slate-600 leading-relaxed pt-1">
                        {selectedOrder.shippingAddress?.address1}
                        {selectedOrder.shippingAddress?.address2 ? `, ${selectedOrder.shippingAddress.address2}` : ""}
                        {selectedOrder.shippingAddress?.city ? `, ${selectedOrder.shippingAddress.city}` : ""}
                        {selectedOrder.shippingAddress?.province ? ` ${selectedOrder.shippingAddress.province}` : ""}
                        {selectedOrder.shippingAddress?.country ? `, ${selectedOrder.shippingAddress.country}` : " India"}
                        {selectedOrder.shippingAddress?.zip ? ` - ${selectedOrder.shippingAddress.zip}` : " - 676103"}
                      </p>
                    </div>
                  </div>

                  {/* Billing Address Section (Screenshot 2) */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Billing Address</h3>
                    <div className="rounded-2xl border border-slate-200/90 p-5 space-y-1.5 text-xs text-slate-700">
                      <p className="font-bold text-sm text-slate-900">
                        {selectedOrder.billingAddress?.name || selectedOrder.shippingAddress?.name || customerName}
                      </p>
                      <p className="text-slate-400">|</p>
                      <p className="font-semibold text-slate-800">
                        {selectedOrder.billingAddress?.phone || selectedOrder.shippingAddress?.phone || cleanPhone}
                      </p>
                      <p className="text-slate-600 leading-relaxed pt-1">
                        {selectedOrder.billingAddress?.address1 || selectedOrder.shippingAddress?.address1}
                        {selectedOrder.billingAddress?.city ? `, ${selectedOrder.billingAddress.city}` : ""}
                        {selectedOrder.billingAddress?.province ? ` ${selectedOrder.billingAddress.province}` : ""}
                        {selectedOrder.billingAddress?.country ? `, ${selectedOrder.billingAddress.country}` : " India"}
                        {selectedOrder.billingAddress?.zip ? ` - ${selectedOrder.billingAddress.zip}` : " - 676103"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW B: ORDERS LIST (Screenshot 5)               */}
            {/* ------------------------------------------------ */}
            {activeTab === "orders" && !selectedOrder && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Orders</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Showing orders placed on Petpedia directly linked to {cleanPhone}
                    </p>
                  </div>

                  <button
                    onClick={loadOrders}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Status Filter Pills (Zigly style) */}
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 overflow-x-auto">
                  <button
                    onClick={() => setOrderFilter("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === "all"
                        ? "bg-[#1E3A8A] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter("in-transit")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === "in-transit"
                        ? "bg-[#1E3A8A] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    In-Transit
                  </button>
                  <button
                    onClick={() => setOrderFilter("delivered")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === "delivered"
                        ? "bg-[#1E3A8A] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Delivered
                  </button>
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A] mx-auto" />
                    <p className="text-xs text-slate-500">Checking Shopify orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Any orders you place with {cleanPhone} will automatically appear right here!
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5B00] hover:bg-[#E55200] text-white text-xs font-bold shadow-md transition-all"
                    >
                      <span>Start Shopping</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all p-5 space-y-4 shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              Order Number{" "}
                              <span className="text-slate-900 font-extrabold">
                                {ord.orderNumber.startsWith("ZG-ORD")
                                  ? ord.orderNumber
                                  : `ZG-ORD-${ord.orderNumber}`}
                              </span>
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {formatOrderDate(ord.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.isReturnRequested ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Return Requested
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ord.fulfillmentStatus.toUpperCase() === "FULFILLED" ||
                                  ord.fulfillmentStatus.toUpperCase() === "DELIVERED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {ord.fulfillmentStatus}
                              </span>
                            )}

                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Order Details
                            </button>
                          </div>
                        </div>

                        {/* Order Content Row */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-3 overflow-hidden">
                              {ord.items.slice(0, 3).map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image || "/placeholder-product.png"}
                                  alt={item.title}
                                  className="w-14 h-14 rounded-xl object-contain bg-slate-50 border-2 border-white shadow-sm shrink-0"
                                />
                              ))}
                            </div>

                            <div className="text-xs">
                              <p className="font-semibold text-slate-800">
                                {ord.items[0]?.title}
                                {ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ""}
                              </p>
                              <p className="text-slate-400 mt-0.5">{ord.itemCount} Item(s)</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total</p>
                            <p className="text-base font-extrabold text-slate-900">
                              {formatPrice(ord.total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW C: MY RETURNS                               */}
            {/* ------------------------------------------------ */}
            {activeTab === "returns" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Returns</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage and track your product returns and refund statuses
                  </p>
                </div>

                {returnOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <RotateCcw className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">No Return Requests</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        You have not requested returns for any products yet. To return an undelivered or delivered item, click into Order Details.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152B6B] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>View My Orders</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {returnOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              Order #{ord.orderNumber}
                            </span>
                            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                              Status: Return Requested — Under Review
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setActiveTab("orders");
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold"
                          >
                            View Details
                          </button>
                        </div>
                        <div className="text-xs text-slate-600">
                          <p><strong>Reason:</strong> {ord.returnReason || "Customer cancellation / return request"}</p>
                          <p className="mt-1 text-slate-500">Refund amount: {formatPrice(ord.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW D: SAVED ADDRESSES                          */}
            {/* ------------------------------------------------ */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Addresses</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Your shipping addresses saved for fast 1-click checkout
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{customerName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Default Shipping
                    </span>
                  </div>
                  <p className="text-slate-500">{cleanPhone}</p>
                  <p className="text-slate-700 leading-relaxed">
                    Chulliyil House Thallakkadathur, Tharayil , areekad school ground road Tirur thalakkadathur Malappuram , India - 676103
                  </p>
                </div>
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW E: MY PROFILE (Screenshot 4)                */}
            {/* ------------------------------------------------ */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your personal information and contact preferences
                  </p>
                </div>

                <div className="flex justify-center py-2">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
                    <User className="w-12 h-12 stroke-[1.2]" />
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Hamdan C"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hamdanhaneefa23@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                      />
                    </div>

                    {/* Mobile Number (Locked / Verified via OTP) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Mobile Number*</span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> OTP Verified
                        </span>
                      </label>
                      <input
                        type="text"
                        disabled
                        value={cleanPhone}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 font-medium cursor-not-allowed"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                      />
                    </div>

                    {/* Gender Radio */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Gender
                      </label>
                      <div className="flex items-center gap-6 text-sm text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === "female"}
                            onChange={() => setGender("female")}
                            className="text-[#1E3A8A]"
                          />
                          <span>Female</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === "male"}
                            onChange={() => setGender("male")}
                            className="text-[#1E3A8A]"
                          />
                          <span>Male</span>
                        </label>
                      </div>
                    </div>

                    {/* Alternate Mobile */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alternate Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        placeholder="Optional alternate phone"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152B6B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW F: MY PET PROFILE                           */}
            {/* ------------------------------------------------ */}
            {activeTab === "pet" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Pet Profile</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Tell us about your pets to get personalized product & food recommendations
                    </p>
                  </div>

                  {!isAddingPet && (
                    <button
                      onClick={() => setIsAddingPet(true)}
                      className="px-4 py-2 rounded-xl bg-[#FF5B00] hover:bg-[#E55200] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      + Add New Pet
                    </button>
                  )}
                </div>

                {isAddingPet && (
                  <form onSubmit={handleAddPet} className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/60 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">Add Pet Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Pet Name"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs outline-none"
                        required
                      />
                      <select
                        value={newPetType}
                        onChange={(e) => setNewPetType(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs outline-none"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Small Pet">Small Pet</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Breed (e.g. Golden Retriever)"
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPet(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#FF5B00] text-white text-xs font-bold"
                      >
                        Save Pet
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 flex items-center gap-4 shadow-sm"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl shrink-0">
                        {pet.type === "Dog" ? "🐶" : "🐱"}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{pet.name}</h4>
                        <p className="text-xs text-slate-500">
                          {pet.type} • {pet.breed}
                        </p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md mt-1 inline-block">
                          Age: {pet.age}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================================================= */}
      {/* RETURN ORDER / CANCELLATION MODAL                 */}
      {/* ================================================= */}
      {isReturnModalOpen && orderToReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Return / Cancel Order #{orderToReturn.orderNumber}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {formatOrderDate(orderToReturn.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Return / Cancellation*
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-[#1E3A8A]"
                  required
                >
                  <option value="Ordered by mistake / Changed my mind">
                    Ordered by mistake / Changed my mind
                  </option>
                  <option value="Delivery taking too long / Need to cancel before arrival">
                    Delivery taking too long / Need to cancel before arrival
                  </option>
                  <option value="Product damaged or defective">
                    Product damaged or defective
                  </option>
                  <option value="Different from description on site">
                    Different from description on site
                  </option>
                  <option value="Incorrect size or item variant">
                    Incorrect size or item variant
                  </option>
                  <option value="Found a lower price elsewhere">
                    Found a lower price elsewhere
                  </option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Resolution*
                </label>
                <select
                  value={returnResolution}
                  onChange={(e) => setReturnResolution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-[#1E3A8A]"
                  required
                >
                  <option value="Refund to Original Payment Mode (UPI / Card / Bank)">
                    Refund to Original Payment Mode (UPI / Card / Bank)
                  </option>
                  <option value="Store Credit / Petpedia Wallet">
                    Store Credit / Petpedia Wallet (Instant)
                  </option>
                  <option value="Replacement Item / Exchange">
                    Replacement Item / Exchange
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Provide any additional details or feedback for our team..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Petpedia Return Policy Guarantee</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  For undelivered orders, shipment will be intercepted and refunded immediately. For delivered orders, a reverse courier pickup will be initiated at zero charge.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReturn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Return Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
