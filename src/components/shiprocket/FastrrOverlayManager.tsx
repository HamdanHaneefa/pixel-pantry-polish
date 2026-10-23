import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { X } from "lucide-react";

export function forceCloseFastrr(onAfterClose?: () => void) {
  try {
    // 1. Send Fastrr SDK internal close trigger
    window.postMessage({ trigger: "headless-close" }, "*");

    // 2. Call Shiprocket callback if registered
    const win = window as any;
    if (typeof win.srCustomCheckoutCallBackFn === "function") {
      win.srCustomCheckoutCallBackFn({ event: "sr-headless-close", exitCheckout: true });
    }

    // 3. Directly remove injected DOM nodes
    const headless = document.getElementById("headless-container");
    if (headless) headless.remove();

    const mainContainer = document.getElementById("fastrr-main-container");
    if (mainContainer) mainContainer.remove();

    const preLoader = document.querySelector(".fastrr-pre-loader-container, .fastrr-pre-loader");
    if (preLoader) preLoader.remove();

    // 4. Restore scroll locking on document body
    document.body.style.overflow = "auto";
    document.body.classList.remove("stop__scroll__body", "stop__scroll");

    // 5. Re-enable any disabled checkout buttons
    document.querySelectorAll(".sr-headless-checkout").forEach((el) => {
      el.removeAttribute("disabled");
    });

    // 6. Notify listeners
    window.dispatchEvent(new CustomEvent("fastrr:closed"));

    onAfterClose?.();
  } catch (err) {
    console.warn("[FastrrOverlayManager] Error forcing close:", err);
  }
}

export default function FastrrOverlayManager() {
  const { closeCart, clearCart } = useCart();
  const [isFastrrActive, setIsFastrrActive] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  // Check if Fastrr is currently present in the DOM
  const checkFastrrPresence = useCallback(() => {
    if (typeof document === "undefined") return false;
    const hasHeadless = !!document.getElementById("headless-container");
    const hasMain = !!document.getElementById("fastrr-main-container");
    const hasIframe = !!document.getElementById("headless-iframe");
    const hasModal = !!document.querySelector(".headless-modal");

    return hasHeadless || hasMain || hasIframe || hasModal;
  }, []);

  // Handle user closing Fastrr
  const handleClose = useCallback(() => {
    forceCloseFastrr(() => {
      setIsFastrrActive(false);

      // If customer completed the purchase, clear bag and redirect to confirmation
      if (isOrderConfirmed) {
        clearCart();
        window.location.href = "/order-success";
      }
    });
  }, [isOrderConfirmed, clearCart]);

  // Monitor DOM for Fastrr injection / removal
  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateState = () => {
      const active = checkFastrrPresence();
      setIsFastrrActive(active);

      // When Fastrr appears, immediately close Cart Drawer so it doesn't hang in background
      if (active) {
        closeCart();
      }
    };

    // Initial check
    updateState();

    // Observe changes to document.body
    const observer = new MutationObserver(() => {
      updateState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Fallback polling every 500ms to guarantee detection
    const interval = setInterval(updateState, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [checkFastrrPresence, closeCart]);

  // Listen to keyboard ESC to close Fastrr
  useEffect(() => {
    if (!isFastrrActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isFastrrActive, handleClose]);

  // Listen to Fastrr postMessage events for order success / completion
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;

        const strData = typeof data === "string" ? data : JSON.stringify(data);

        // Detect successful order placement from Fastrr
        if (
          strData.includes("order_placed") ||
          strData.includes("SUCCESS") ||
          strData.includes("thank_you") ||
          strData.includes("order-confirmation") ||
          data.trigger === "order_placed" ||
          data.status === "SUCCESS"
        ) {
          setIsOrderConfirmed(true);
          clearCart();
        }

        // Fastrr native close trigger
        if (data.trigger === "headless-close") {
          setIsFastrrActive(false);
        }
      } catch {
        // Cross-origin message safety
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [clearCart]);

  if (!isFastrrActive) return null;

  return (
    <>
      {/* 1. Primary Top-Right Floating Close Button (Visible on all screen sizes, high z-index) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[2147483649] flex items-center gap-2 animate-in fade-in duration-150">
        <button
          type="button"
          onClick={handleClose}
          id="petpedia-fastrr-close-btn"
          title="Close Checkout (Esc)"
          aria-label="Close Checkout"
          className="group flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 px-4 py-2 sm:py-2.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.35)] border-2 border-slate-900/10 font-bold text-xs sm:text-sm transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer select-none"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-xs group-hover:rotate-90 transition-transform duration-200">
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </span>
          <span className="font-extrabold tracking-wide">
            {isOrderConfirmed ? "Done / Close" : "Close Checkout"}
          </span>
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
            ESC
          </kbd>
        </button>
      </div>

      {/* 2. Secondary Modal Top-Right Corner '✕' Button (Desktop specific, placed directly at the modal's top-right corner) */}
      <div className="hidden sm:flex fixed top-3 left-1/2 translate-x-[190px] md:translate-x-[215px] z-[2147483649] animate-in fade-in duration-150">
        <button
          type="button"
          onClick={handleClose}
          title="Close (Esc)"
          aria-label="Close"
          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-slate-300 flex items-center justify-center font-bold text-sm transition-transform duration-150 hover:scale-110 active:scale-90 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
}
