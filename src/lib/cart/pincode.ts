const PINCODE_STORAGE_KEY = "petpedia_user_pincode";

export function getSavedPincode(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PINCODE_STORAGE_KEY) || "";
}

export function savePincode(pincode: string): void {
  if (typeof window === "undefined") return;
  if (!pincode.trim()) {
    localStorage.removeItem(PINCODE_STORAGE_KEY);
  } else {
    localStorage.setItem(PINCODE_STORAGE_KEY, pincode.trim());
  }
}

export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function getEstimatedDeliveryText(pincode: string): string {
  if (!pincode) return "";
  return `Delivering to ${pincode} in 2-3 Business Days`;
}
