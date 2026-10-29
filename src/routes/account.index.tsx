import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import TrustBar from "@/components/home/TrustBar";
import MobileTabBar from "@/components/home/MobileTabBar";
import AccountWishlist from "@/components/account/AccountWishlist";
import { useCustomer } from "@/context/CustomerContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  getCustomerOrdersFn,
  updateCustomerProfileFn,
  requestOrderReturnFn,
  getCustomerProfileFn,
  saveCustomerAddressFn,
  deleteCustomerAddressFn,
  CustomerOrderSummary,
  CustomerProfileDetails,
  CustomerSavedAddress,
  CustomerAddressInput,
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
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatPrice } from "@/data/formatPrice";
import { INDIAN_STATES } from "@/data/indianStates";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "My Account — Petpedia" },
      {
        name: "description",
        content: "Manage your profile, pet details, and track your Petpedia orders.",
      },
    ],
  }),
  component: CustomerAccountPage,
});

type TabType = "profile" | "orders" | "pet" | "returns" | "addresses" | "wishlist";

const EMPTY_ADDRESS: CustomerAddressInput = {
  firstName: "",
  lastName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  provinceCode: "",
  zip: "",
};

const inputClass =
  "w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all hover:border-slate-300 focus:border-[#FF5B00] focus:ring-4 focus:ring-[#FF5B00]/10";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

// Profile completion is based on what is actually saved on the backend, not unsaved form edits
function getProfileCompletion(
  profile: CustomerProfileDetails | null,
  addresses: CustomerSavedAddress[],
) {
  const checks = [
    { label: "Name", done: !!profile && !!`${profile.firstName}${profile.lastName}`.trim() },
    { label: "Email", done: !!profile?.email },
    { label: "Mobile number", done: !!profile?.phone },
    { label: "Date of birth", done: !!profile?.dob },
    { label: "Gender", done: !!profile?.gender },
    { label: "Saved address", done: addresses.length > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.done).map((c) => c.label),
  };
}

function formatOrderDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const dayName = d.toLocaleDateString("en-IN", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dayName} ${day}, ${month} ${year} at ${time}`;
  } catch {
    return dateString;
  }
}

function getFulfillmentDisplay(status: string) {
  const upper = (status || "").toUpperCase();
  if (upper === "FULFILLED" || upper === "DELIVERED") {
    return {
      label: "Delivered",
      badgeClass: "bg-emerald-100 text-emerald-800",
    };
  }
  if (upper === "PARTIALLY_FULFILLED" || upper === "IN_TRANSIT" || upper === "SHIPPED") {
    return {
      label: "In Transit",
      badgeClass: "bg-sky-100 text-sky-800",
    };
  }
  if (upper === "CANCELLED" || upper === "RESTOCKED") {
    return {
      label: "Cancelled",
      badgeClass: "bg-rose-100 text-rose-800",
    };
  }
  return {
    label: "Not Delivered",
    badgeClass: "bg-amber-100 text-amber-800",
  };
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
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [altPhone, setAltPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Saved (backend) profile + addresses
  const [savedProfile, setSavedProfile] = useState<CustomerProfileDetails | null>(null);
  const [addresses, setAddresses] = useState<CustomerSavedAddress[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Address form state (editingAddressId: null = closed, "new" = creating, otherwise address id)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<CustomerAddressInput>(EMPTY_ADDRESS);
  const [addressAsDefault, setAddressAsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);

  // Pet Profile mock state
  const [pets, setPets] = useState<
    Array<{ name: string; type: string; breed: string; age: string }>
  >([{ name: "Max", type: "Dog", breed: "Golden Retriever", age: "2 Years" }]);
  const [newPetName, setNewPetName] = useState("");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetType, setNewPetType] = useState("Dog");
  const [isAddingPet, setIsAddingPet] = useState(false);

  const { items: wishlistItems } = useWishlist();

  // Hash-driven tab selection (supports #order, #profile, #pet, #returns, #addresses, #wishlist).
  // Read the hash from router state so in-app <Link hash="..."> navigations (which use
  // pushState and don't fire "hashchange") still switch tabs.
  const locationHash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    const hash = locationHash.replace("#", "").toLowerCase();
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
    } else {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [locationHash]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedOrder(null);
    navigate({ to: "/account", hash: tab === "orders" ? "order" : tab });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  // Clean up any residual OAuth query parameters from the URL
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const url = new URL(window.location.href);
      if (
        url.searchParams.has("code") ||
        url.searchParams.has("iss") ||
        url.searchParams.has("scope") ||
        url.searchParams.has("authuser") ||
        url.searchParams.has("prompt") ||
        url.searchParams.has("state")
      ) {
        url.searchParams.delete("code");
        url.searchParams.delete("iss");
        url.searchParams.delete("scope");
        url.searchParams.delete("authuser");
        url.searchParams.delete("prompt");
        url.searchParams.delete("state");
        const newSearch = url.searchParams.toString();
        const cleanUrl =
          url.pathname + (newSearch ? `?${newSearch}` : "") + (window.location.hash || "");
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  // Always reset scroll to top once loaded or whenever switching tabs
  useEffect(() => {
    if (!isLoading) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [isLoading, activeTab]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/account/login", search: { redirect: "/account#order" } as any });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const applyProfileToForm = (p: CustomerProfileDetails) => {
    setFullName(`${p.firstName} ${p.lastName}`.trim());
    setEmail(p.email);
    setDob(p.dob);
    setGender(p.gender);
    setAltPhone(p.altPhone);
  };

  // Load the persisted profile + saved addresses from the backend
  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await getCustomerProfileFn();
      if (res.success) {
        setSavedProfile(res.profile);
        setAddresses(res.addresses);
        applyProfileToForm(res.profile);
      } else if (customer) {
        // Fall back to the session so the form is never blank
        setFullName(`${customer.firstName || ""} ${customer.lastName || ""}`.trim());
        setEmail(customer.email || "");
        console.warn("[Account] Could not load profile:", res.error);
      }
    } catch (e) {
      console.warn("[Account] Error loading profile:", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Load customer orders from Shopify Admin
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await getCustomerOrdersFn();
      if (res.success && res.orders) {
        setOrders(res.orders);
        // If an order is currently selected, refresh its reference
        if (selectedOrder) {
          const fresh = res.orders.find(
            (o) => o.id === selectedOrder.id || o.orderNumber === selectedOrder.orderNumber,
          );
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
      return (
        ord.fulfillmentStatus.toUpperCase() === "FULFILLED" ||
        ord.fulfillmentStatus.toUpperCase() === "DELIVERED"
      );
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

    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");
    if (!firstName) {
      toast.error("Please enter your name.");
      setIsSavingProfile(false);
      return;
    }

    try {
      const res = await updateCustomerProfileFn({
        data: {
          firstName,
          lastName,
          email,
          dob,
          gender,
          altPhone,
        },
      });

      if (res.success) {
        toast.success("Profile updated successfully!");
        setSavedProfile((prev) => ({
          firstName,
          lastName,
          email: email.trim(),
          phone: prev?.phone || customer?.phone || "",
          dob,
          gender,
          altPhone,
        }));
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

  const openAddressForm = (addr?: CustomerSavedAddress) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        firstName: addr.firstName,
        lastName: addr.lastName,
        phone: addr.phone,
        address1: addr.address1,
        address2: addr.address2,
        city: addr.city,
        provinceCode: addr.provinceCode,
        zip: addr.zip,
      });
      setAddressAsDefault(addr.isDefault);
    } else {
      setEditingAddressId("new");
      setAddressForm({
        ...EMPTY_ADDRESS,
        firstName: savedProfile?.firstName || customer?.firstName || "",
        lastName: savedProfile?.lastName || customer?.lastName || "",
        phone: (savedProfile?.phone || customer?.phone || "").replace(/^\+91/, ""),
      });
      setAddressAsDefault(addresses.length === 0);
    }
  };

  const closeAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const res = await saveCustomerAddressFn({
        data: {
          id: editingAddressId && editingAddressId !== "new" ? editingAddressId : undefined,
          address: addressForm,
          setAsDefault: addressAsDefault,
        },
      });
      if (res.success) {
        setAddresses(res.addresses);
        toast.success(editingAddressId === "new" ? "Address added!" : "Address updated!");
        closeAddressForm();
        refreshSession();
      } else {
        toast.error(res.error || "Failed to save address.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error saving address.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addr: CustomerSavedAddress) => {
    if (!window.confirm("Delete this address?")) return;
    setBusyAddressId(addr.id);
    try {
      const res = await deleteCustomerAddressFn({ data: { id: addr.id } });
      if (res.success) {
        setAddresses(res.addresses);
        toast.success("Address deleted.");
        refreshSession();
      } else {
        toast.error(res.error || "Failed to delete address.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting address.");
    } finally {
      setBusyAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (addr: CustomerSavedAddress) => {
    setBusyAddressId(addr.id);
    try {
      const res = await saveCustomerAddressFn({
        data: {
          id: addr.id,
          address: {
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone,
            address1: addr.address1,
            address2: addr.address2,
            city: addr.city,
            provinceCode: addr.provinceCode,
            zip: addr.zip,
          },
          setAsDefault: true,
        },
      });
      if (res.success) {
        setAddresses(res.addresses);
        toast.success("Default address updated.");
        refreshSession();
      } else {
        toast.error(res.error || "Failed to update default address.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error updating address.");
    } finally {
      setBusyAddressId(null);
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
            <Loader2 className="w-8 h-8 animate-spin text-[#FF5B00]" />
            <p className="text-sm font-medium text-slate-600">Loading your Petpedia account...</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Get Initials for Avatar
  const customerName =
    `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "My Account";
  const hasName = Boolean(`${customer?.firstName || ""}${customer?.lastName || ""}`.trim());
  const initials =
    (hasName ? customerName : "")
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  const contactInfo = customer?.email || customer?.phone || "";
  const cleanPhone = customer?.phone || customer?.email || "";
  const completion = getProfileCompletion(savedProfile, addresses);
  let maskedContact = contactInfo;
  if (contactInfo.includes("@")) {
    const parts = contactInfo.split("@");
    const namePart = parts[0] || "";
    const domainPart = parts[1] || "";
    maskedContact =
      namePart.length > 2 ? `${namePart.substring(0, 2)}***@${domainPart}` : contactInfo;
  } else {
    maskedContact = contactInfo.replace(/(\+\d{2})(\d{5})(\d{5})/, "$1 $2*****");
  }

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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6A1A] via-[#FF5B00] to-[#E04800] p-5 text-white shadow-lg shadow-orange-500/20">
              <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-16 right-12 h-32 w-32 rounded-full bg-white/5" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-[#FF5B00] shadow-md">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-orange-100">
                    Welcome back
                  </p>
                  <h2 className="truncate text-lg font-bold leading-tight">{customerName}</h2>
                  {maskedContact && (
                    <p className="mt-0.5 truncate text-xs text-orange-100">{maskedContact}</p>
                  )}
                </div>
              </div>
              {!loadingProfile && completion.percent < 100 && (
                <button
                  type="button"
                  onClick={() => handleTabChange("profile")}
                  className="relative mt-4 block w-full rounded-2xl bg-white/12 p-3 text-left ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/18 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Complete your profile</span>
                    <span>{completion.percent}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{ width: `${completion.percent}%` }}
                    />
                  </div>
                  {completion.missing.length > 0 && (
                    <p className="mt-2 truncate text-[11px] text-orange-100">
                      Add {completion.missing.join(", ").toLowerCase()}
                    </p>
                  )}
                </button>
              )}
            </div>

            {/* Navigation Tabs List */}
            <nav className="rounded-3xl border border-slate-200/70 bg-white p-2 shadow-sm">
              {(
                [
                  {
                    key: "profile",
                    label: "My Profile",
                    hint: "Personal details & preferences",
                    icon: User,
                    badge:
                      loadingProfile || completion.percent === 100
                        ? null
                        : { text: `${completion.percent}%`, cls: "bg-amber-50 text-amber-700" },
                  },
                  {
                    key: "pet",
                    label: "My Pet",
                    hint: "Your pet's profile",
                    icon: Dog,
                    badge:
                      pets.length === 0
                        ? { text: "Add pet", cls: "bg-amber-50 text-amber-700" }
                        : null,
                  },
                  {
                    key: "orders",
                    label: "My Orders",
                    hint: "Track & manage orders",
                    icon: Package,
                    badge:
                      orders.length > 0
                        ? { text: String(orders.length), cls: "bg-slate-100 text-slate-600" }
                        : null,
                  },
                  {
                    key: "wishlist",
                    label: "My Wishlist",
                    hint: "Items you've saved",
                    icon: Heart,
                    badge:
                      wishlistItems.length > 0
                        ? { text: String(wishlistItems.length), cls: "bg-rose-50 text-rose-700" }
                        : null,
                  },
                  {
                    key: "returns",
                    label: "My Returns",
                    hint: "Returns & refunds",
                    icon: RotateCcw,
                    badge:
                      returnOrders.length > 0
                        ? { text: String(returnOrders.length), cls: "bg-rose-50 text-rose-700" }
                        : null,
                  },
                  {
                    key: "addresses",
                    label: "Saved Addresses",
                    hint: "Manage delivery addresses",
                    icon: MapPin,
                    badge:
                      addresses.length > 0
                        ? { text: String(addresses.length), cls: "bg-slate-100 text-slate-600" }
                        : null,
                  },
                  {
                    key: "help",
                    label: "Help & Support",
                    hint: "Get answers to your questions",
                    icon: HelpCircle,
                    href: "/contact",
                  },
                ] as Array<{
                  key: string;
                  label: string;
                  hint: string;
                  icon: typeof User;
                  href?: string;
                  badge?: { text: string; cls: string } | null;
                }>
              ).map((item) => {
                const active = !item.href && activeTab === item.key;
                const Icon = item.icon;
                const content = (
                  <>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        active
                          ? "bg-[#FF5B00] text-white shadow-sm shadow-orange-500/30"
                          : "bg-slate-100/80 text-slate-500 group-hover:bg-orange-50 group-hover:text-[#FF5B00]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${active ? "text-[#FF5B00]" : "text-slate-800"}`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badge.cls}`}
                          >
                            {item.badge.text}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400">{item.hint}</span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        active ? "text-[#FF5B00]" : "text-slate-300"
                      }`}
                    />
                  </>
                );
                const cls = `group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  active ? "bg-orange-50" : "hover:bg-slate-50"
                }`;
                return item.href ? (
                  <Link key={item.key} to={item.href} className={cls}>
                    {content}
                  </Link>
                ) : (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTabChange(item.key as TabType)}
                    className={cls}
                  >
                    {content}
                  </button>
                );
              })}

              <div className="mt-1 border-t border-slate-100 px-1 pt-2">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </nav>
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
                  onClick={() => {
                    setSelectedOrder(null);
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  }}
                  className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-[#FF5B00] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Orders</span>
                </button>

                {/* Order Details Card */}
                <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
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
                        <h4 className="text-xs font-bold text-slate-800">
                          Need to cancel or return this order?
                        </h4>
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
                      <span>{getFulfillmentDisplay(selectedOrder.fulfillmentStatus).label}</span>{" "}
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
                          {selectedOrder.shippingFee === 0
                            ? "Free"
                            : formatPrice(selectedOrder.shippingFee)}
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
                        {selectedOrder.shippingAddress?.address2
                          ? `, ${selectedOrder.shippingAddress.address2}`
                          : ""}
                        {selectedOrder.shippingAddress?.city
                          ? `, ${selectedOrder.shippingAddress.city}`
                          : ""}
                        {selectedOrder.shippingAddress?.province
                          ? ` ${selectedOrder.shippingAddress.province}`
                          : ""}
                        {selectedOrder.shippingAddress?.country
                          ? `, ${selectedOrder.shippingAddress.country}`
                          : " India"}
                        {selectedOrder.shippingAddress?.zip
                          ? ` - ${selectedOrder.shippingAddress.zip}`
                          : " - 676103"}
                      </p>
                    </div>
                  </div>

                  {/* Billing Address Section (Screenshot 2) */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Billing Address</h3>
                    <div className="rounded-2xl border border-slate-200/90 p-5 space-y-1.5 text-xs text-slate-700">
                      <p className="font-bold text-sm text-slate-900">
                        {selectedOrder.billingAddress?.name ||
                          selectedOrder.shippingAddress?.name ||
                          customerName}
                      </p>
                      <p className="text-slate-400">|</p>
                      <p className="font-semibold text-slate-800">
                        {selectedOrder.billingAddress?.phone ||
                          selectedOrder.shippingAddress?.phone ||
                          cleanPhone}
                      </p>
                      <p className="text-slate-600 leading-relaxed pt-1">
                        {selectedOrder.billingAddress?.address1 ||
                          selectedOrder.shippingAddress?.address1}
                        {selectedOrder.billingAddress?.city
                          ? `, ${selectedOrder.billingAddress.city}`
                          : ""}
                        {selectedOrder.billingAddress?.province
                          ? ` ${selectedOrder.billingAddress.province}`
                          : ""}
                        {selectedOrder.billingAddress?.country
                          ? `, ${selectedOrder.billingAddress.country}`
                          : " India"}
                        {selectedOrder.billingAddress?.zip
                          ? ` - ${selectedOrder.billingAddress.zip}`
                          : " - 676103"}
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
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {cleanPhone
                        ? `Orders placed with ${cleanPhone}`
                        : "Orders placed with your account"}
                    </p>
                  </div>

                  <button
                    onClick={loadOrders}
                    disabled={loadingOrders}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#FF5B00]/40 hover:text-[#FF5B00] disabled:opacity-60 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Status Filter (segmented control) */}
                <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
                  {(
                    [
                      { key: "all", label: "All", count: orders.length },
                      {
                        key: "in-transit",
                        label: "Not delivered",
                        count: orders.filter((o) =>
                          ["IN_TRANSIT", "PARTIALLY_FULFILLED", "UNFULFILLED"].includes(
                            o.fulfillmentStatus.toUpperCase(),
                          ),
                        ).length,
                      },
                      {
                        key: "delivered",
                        label: "Delivered",
                        count: orders.filter((o) =>
                          ["FULFILLED", "DELIVERED"].includes(o.fulfillmentStatus.toUpperCase()),
                        ).length,
                      },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setOrderFilter(f.key)}
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        orderFilter === f.key
                          ? "bg-white text-[#FF5B00] shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {f.label}
                      <span
                        className={`rounded-full px-1.5 text-[10px] font-bold ${
                          orderFilter === f.key
                            ? "bg-orange-50 text-[#FF5B00]"
                            : "bg-slate-200/70 text-slate-500"
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5B00]">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800">
                      {orders.length === 0
                        ? "No orders yet"
                        : orderFilter === "delivered"
                          ? "No delivered orders"
                          : "No orders on the way"}
                    </h3>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
                      {orders.length === 0
                        ? "When you place an order, you'll be able to track it here."
                        : "Try another filter to see the rest of your orders."}
                    </p>
                    {orders.length === 0 ? (
                      <Link
                        to="/shop"
                        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#FF5B00] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#E05000]"
                      >
                        Start shopping
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => setOrderFilter("all")}
                        className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Show all orders
                      </button>
                    )}
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
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  getFulfillmentDisplay(ord.fulfillmentStatus).badgeClass
                                }`}
                              >
                                {getFulfillmentDisplay(ord.fulfillmentStatus).label}
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-[#FF5B00]/40 text-[#FF5B00] hover:bg-[#FF5B00]/5 text-xs font-bold transition-colors cursor-pointer"
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
                            <p className="text-[11px] font-semibold text-slate-400 uppercase">
                              Total
                            </p>
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
            {activeTab === "wishlist" && <AccountWishlist />}

            {activeTab === "returns" && (
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Returns</h1>
                  <p className="text-sm text-slate-500 mt-1">
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
                        You have not requested returns for any products yet. To return an
                        undelivered or delivered item, click into Order Details.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5B00] hover:bg-[#E05000] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
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
                          <p>
                            <strong>Reason:</strong>{" "}
                            {ord.returnReason || "Customer cancellation / return request"}
                          </p>
                          <p className="mt-1 text-slate-500">
                            Refund amount: {formatPrice(ord.total)}
                          </p>
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
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Saved Addresses
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Your default address is used to prefill checkout
                    </p>
                  </div>
                  {editingAddressId === null && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openAddressForm()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5B00] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#E05000] active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add address
                    </button>
                  )}
                </div>

                {editingAddressId !== null ? (
                  <form
                    onSubmit={handleSaveAddress}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 md:p-6 space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">
                        {editingAddressId === "new" ? "Add a new address" : "Edit address"}
                      </h2>
                      <button
                        type="button"
                        onClick={closeAddressForm}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>First name*</label>
                        <input
                          required
                          value={addressForm.firstName}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, firstName: e.target.value })
                          }
                          className={inputClass}
                          autoComplete="given-name"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Last name</label>
                        <input
                          value={addressForm.lastName}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, lastName: e.target.value })
                          }
                          className={inputClass}
                          autoComplete="family-name"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Mobile number*</label>
                        <div className="flex">
                          <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-500">
                            +91
                          </span>
                          <input
                            required
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={addressForm.phone.replace(/^\+91/, "")}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                phone: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            placeholder="10-digit mobile number"
                            className={`${inputClass} rounded-l-none`}
                            autoComplete="tel-national"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>House no., building, street*</label>
                        <input
                          required
                          value={addressForm.address1}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address1: e.target.value })
                          }
                          className={inputClass}
                          autoComplete="address-line1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Area, landmark (optional)</label>
                        <input
                          value={addressForm.address2}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address2: e.target.value })
                          }
                          className={inputClass}
                          autoComplete="address-line2"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>City*</label>
                        <input
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className={inputClass}
                          autoComplete="address-level2"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Pincode*</label>
                        <input
                          required
                          inputMode="numeric"
                          maxLength={6}
                          value={addressForm.zip}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              zip: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className={inputClass}
                          autoComplete="postal-code"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>State*</label>
                        <select
                          required
                          value={addressForm.provinceCode}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, provinceCode: e.target.value })
                          }
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="" disabled>
                            Select state
                          </option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st.code} value={st.code}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addressAsDefault}
                        onChange={(e) => setAddressAsDefault(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#FF5B00]"
                      />
                      Make this my default address
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-200/70 pt-4">
                      <button
                        type="button"
                        onClick={closeAddressForm}
                        className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FF5B00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#E05000] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingAddress && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSavingAddress ? "Saving..." : "Save address"}
                      </button>
                    </div>
                  </form>
                ) : loadingProfile ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5B00]">
                      <MapPin className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800">
                      No saved addresses yet
                    </h3>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
                      Save an address to check out faster next time.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAddressForm()}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#FF5B00] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#E05000] cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
                          addr.isDefault
                            ? "border-[#FF5B00]/40 bg-orange-50/40 ring-1 ring-[#FF5B00]/10"
                            : "border-slate-200 hover:border-slate-300"
                        } ${busyAddressId === addr.id ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {`${addr.firstName} ${addr.lastName}`.trim() || customerName}
                            </p>
                            {addr.phone && (
                              <p className="mt-0.5 text-xs text-slate-500">{addr.phone}</p>
                            )}
                          </div>
                          {addr.isDefault && (
                            <span className="shrink-0 rounded-full bg-[#FF5B00] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Default
                            </span>
                          )}
                        </div>
                        {addr.address1 || addr.city ? (
                          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                            {[addr.address1, addr.address2, addr.city, addr.province]
                              .filter(Boolean)
                              .join(", ")}
                            {addr.zip ? ` – ${addr.zip}` : ""}
                          </p>
                        ) : (
                          <p className="mt-3 flex flex-1 items-start gap-1.5 text-sm text-amber-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            Incomplete address. Edit to add the street, city and pincode.
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-1 border-t border-slate-200/70 pt-3">
                          <button
                            type="button"
                            disabled={busyAddressId !== null}
                            onClick={() => openAddressForm(addr)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            disabled={busyAddressId !== null}
                            onClick={() => handleDeleteAddress(addr)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                          {!addr.isDefault && (
                            <button
                              type="button"
                              disabled={busyAddressId !== null}
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#FF5B00] hover:bg-orange-50 cursor-pointer"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW E: MY PROFILE                               */}
            {/* ------------------------------------------------ */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Manage your personal information and contact preferences
                    </p>
                  </div>
                  {!loadingProfile && completion.percent < 100 && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {completion.percent}% complete
                    </span>
                  )}
                </div>

                {loadingProfile ? (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                        <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Full name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className={inputClass}
                          autoComplete="name"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Email address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={inputClass}
                          autoComplete="email"
                        />
                      </div>

                      <div>
                        <label className={`${labelClass} flex items-center justify-between`}>
                          <span>Mobile number</span>
                          {(savedProfile?.phone || customer?.phone) && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={savedProfile?.phone || customer?.phone || "Not added"}
                          className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500 hover:border-slate-200`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Date of birth</label>
                        <input
                          type="date"
                          value={dob}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setDob(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Gender</label>
                        <div className="grid h-11 grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                          {(["female", "male"] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGender(g)}
                              className={`rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer ${
                                gender === g
                                  ? "bg-white text-[#FF5B00] shadow-sm"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Alternate mobile number</label>
                        <input
                          type="tel"
                          value={altPhone}
                          onChange={(e) => setAltPhone(e.target.value.replace(/[^\d+]/g, ""))}
                          placeholder="Optional"
                          maxLength={13}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                      {savedProfile && (
                        <button
                          type="button"
                          onClick={() => applyProfileToForm(savedProfile)}
                          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FF5B00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#E05000] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSavingProfile ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* VIEW F: MY PET PROFILE                           */}
            {/* ------------------------------------------------ */}
            {activeTab === "pet" && (
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      My Pet Profile
                    </h1>
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
                  <form
                    onSubmit={handleAddPet}
                    className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/60 space-y-3"
                  >
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-[#FF5B00]"
                  required
                >
                  <option value="Ordered by mistake / Changed my mind">
                    Ordered by mistake / Changed my mind
                  </option>
                  <option value="Delivery taking too long / Need to cancel before arrival">
                    Delivery taking too long / Need to cancel before arrival
                  </option>
                  <option value="Product damaged or defective">Product damaged or defective</option>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-[#FF5B00]"
                  required
                >
                  <option value="Refund to Original Payment Mode (UPI / Card / Bank)">
                    Refund to Original Payment Mode (UPI / Card / Bank)
                  </option>
                  <option value="Store Credit / Petpedia Wallet">
                    Store Credit / Petpedia Wallet (Instant)
                  </option>
                  <option value="Replacement Item / Exchange">Replacement Item / Exchange</option>
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-[#FF5B00]"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Petpedia Return Policy Guarantee</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  For undelivered orders, shipment will be intercepted and refunded immediately. For
                  delivered orders, a reverse courier pickup will be initiated at zero charge.
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
