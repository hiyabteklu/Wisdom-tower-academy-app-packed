import { businessServices, type BusinessService } from "@/data/business-services";

const KEY = "wt_business_cart";
export const BUSINESS_CART_EVENT = "wt-business-cart";

export type BusinessCartItem = {
  serviceId: string;
  addedAt: string;
};

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BUSINESS_CART_EVENT));
}

export function getBusinessCart(): BusinessCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BusinessCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setBusinessCart(items: BusinessCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function addBusinessService(serviceId: string) {
  const items = getBusinessCart();
  if (items.some((i) => i.serviceId === serviceId)) return;
  setBusinessCart([...items, { serviceId, addedAt: new Date().toISOString() }]);
}

export function removeBusinessService(serviceId: string) {
  setBusinessCart(getBusinessCart().filter((i) => i.serviceId !== serviceId));
}

export function clearBusinessCart() {
  setBusinessCart([]);
}

export function getBusinessCartServices(): BusinessService[] {
  const ids = new Set(getBusinessCart().map((i) => i.serviceId));
  return businessServices.filter((s) => ids.has(s.id));
}

export function businessCartCount() {
  return getBusinessCart().length;
}
