import { triggerShiprocketHeadlessCheckout } from "@/lib/shiprocket/fastrr";

interface FastrrButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  token?: string;
}

export default function FastrrButton({
  onClick,
  className = "",
  label = "BUY NOW",
  disabled = false,
  token = "ZPhXTpxkZf2sZb4kOcFGNyhTmTikGkU8",
}: FastrrButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Try launching the official Shiprocket Headless SDK script
    const launched = triggerShiprocketHeadlessCheckout(token, e);
    if (!launched) {
      // 2. If SDK isn't active on localhost yet, trigger the in-app modal
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full bg-black hover:bg-[#111111] text-white rounded-full py-3.5 px-6 flex flex-col items-center justify-center relative shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 ${className}`}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="font-extrabold text-[15px] tracking-wider text-white">
          {label}
        </span>

        {/* Payment Icons Badge (GPay, PhonePe, Paytm) */}
        <div className="flex items-center -space-x-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
          {/* GPay */}
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
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
          <span className="w-5 h-5 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-[10px] font-extrabold shadow-xs">
            पे
          </span>

          {/* Paytm */}
          <span className="w-5 h-5 rounded-full bg-[#002e6e] flex items-center justify-center text-[#00b9f5] text-[8px] font-black tracking-tighter shadow-xs">
            pay
          </span>
        </div>
      </div>

      {/* Powered by Shiprocket bottom tag */}
      <div className="absolute right-4 bottom-1.5 flex items-center gap-1 text-[9px] text-gray-400">
        <span>Powered By</span>
        <span className="text-white font-semibold flex items-center gap-0.5">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#FF5B00]">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Shiprocket
        </span>
      </div>
    </button>
  );
}
