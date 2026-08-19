import { triggerShiprocketHeadlessCheckout, type FastrrProductPayload } from "@/lib/shiprocket/fastrr";
import { trackBeginCheckout } from "@/lib/analytics";

interface FastrrButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  items?: FastrrProductPayload[];
}

export default function FastrrButton({
  onClick,
  className = "",
  label = "BUY NOW",
  disabled = false,
  items,
}: FastrrButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (items && items.length > 0) {
      const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
      trackBeginCheckout(
        items.map((i) => ({
          id: i.variantId || i.productId || "item",
          name: i.title || "Product",
          price: i.price || 0,
          quantity: i.quantity || 1,
        })),
        total
      );
    }
    // 1. Try launching the official Shiprocket SDK: shiprocketCheckoutEvents.buyDirect()
    const launched = items && items.length > 0
      ? triggerShiprocketHeadlessCheckout(items)
      : false;
    if (!launched) {
      // 2. If SDK isn't available, trigger the in-app modal fallback
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full bg-[#E51E2B] hover:bg-[#D01521] active:bg-[#B8101B] text-white rounded-lg h-[50px] md:h-[52px] px-6 flex items-center justify-center relative shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 select-none ${className}`}
    >
      <div className="flex items-center justify-center gap-2.5">
        <span className="font-black text-[15px] md:text-[16px] tracking-wider text-white uppercase">
          {label}
        </span>

        {/* Payment Icons Badge (GPay, PhonePe, Paytm) */}
        <div className="flex items-center -space-x-1.5 pl-0.5">
          {/* GPay */}
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-200 overflow-hidden shrink-0 z-30">
            <svg viewBox="0 0 24 24" className="w-3 h-3">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </span>

          {/* PhonePe */}
          <span className="w-5 h-5 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-[10px] font-black shadow-xs border border-white shrink-0 z-20">
            पे
          </span>

          {/* Paytm */}
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#002e6e] text-[7.5px] font-black tracking-tighter shadow-xs border border-gray-200 shrink-0 z-10">
            <span className="text-[#002e6e]">pay</span>
            <span className="text-[#00b9f5]">tm</span>
          </span>
        </div>

        {/* White bold chevron right */}
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 md:w-5 md:h-5 fill-none stroke-white stroke-[3.5] stroke-linecap-round stroke-linejoin-round ml-0.5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* Powered by Shiprocket bottom right tag */}
      <div className="absolute right-3 bottom-1 flex items-center gap-1 text-[8.5px] text-white/80">
        <span>Powered By</span>
        <span className="text-white font-bold flex items-center gap-0.5">
          <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Shiprocket
        </span>
      </div>
    </button>
  );
}
