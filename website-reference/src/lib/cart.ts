/**
 * Cart: package ids in localStorage. Only purchasable packages can be added.
 */

import { academyPackages, type AcademyPackage } from "@/data/packages";
import { getPackageResolved, getRuntimeCatalog } from "@/lib/catalog";
import { isPackagePurchasable } from "@/data/content-availability";

const KEY = "wt_cart_v1";
export const CART_EVENT = "wt-cart-change";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCartIds(): string[] {
  return readIds().filter((id) => isPackagePurchasable(id));
}

export function getCartPackages(): AcademyPackage[] {
  return getCartIds()
    .map((id) => getPackageResolved(id))
    .filter((p): p is AcademyPackage => Boolean(p));
}

export function cartCount(): number {
  return getCartIds().length;
}

export function isInCart(packageId: string): boolean {
  return getCartIds().includes(packageId);
}

export function addToCart(packageId: string): boolean {
  if (!isPackagePurchasable(packageId)) return false;
  if (!getPackageResolved(packageId) && !academyPackages.find((p) => p.id === packageId)) {
    return false;
  }
  const ids = readIds().filter((id) => isPackagePurchasable(id));
  if (ids.includes(packageId)) return false;
  writeIds([...ids, packageId]);
  return true;
}

export function removeFromCart(packageId: string) {
  writeIds(readIds().filter((id) => id !== packageId));
}

export function clearCart() {
  writeIds([]);
}

export function cartTotalEtb(): number {
  return getCartPackages().reduce((sum, p) => sum + p.priceEtb, 0);
}

export function allPackageIds(): string[] {
  const runtime = getRuntimeCatalog();
  if (runtime?.length) return runtime.map((p) => p.id);
  return academyPackages.map((p) => p.id);
}
