"use client";

/**
 * Wisdom Tower Academy — FCM Push Notification Client Bridge
 *
 * Handles:
 * 1. Background registration of FCM tokens to POST /api/fcm-token
 * 2. Android 13+ (POST_NOTIFICATIONS) and Web Notification permission requests
 * 3. Bidirectional communication between the Android WebView native shell and web app
 */

const FCM_TOKEN_STORAGE_KEY = "wta_fcm_token_registered";
const PERMISSION_REQUESTED_KEY = "wta_notif_perm_requested";

export type FcmRegisterParams = {
  token: string;
  userId?: string | null;
  platform?: "android" | "web" | "ios";
  deviceName?: string;
};

/**
 * Send an FCM token to the backend quietly in the background.
 * Never blocks the UI or throws errors.
 */
export async function sendFcmTokenToBackend(params: FcmRegisterParams): Promise<boolean> {
  const { token, userId, platform = "android", deviceName } = params;

  if (!token || typeof token !== "string" || !token.trim()) {
    return false;
  }

  try {
    const res = await fetch("/api/fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token.trim(),
        userId: userId || null,
        platform,
        deviceName: deviceName || (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
      }),
    });

    if (res.ok) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token.trim());
        } catch {}
      }
      return true;
    }
  } catch {
    // Quietly fail in background
  }
  return false;
}

/**
 * Automatically check for an FCM token or native Android token on app start or login.
 * Runs quietly in the background.
 */
export async function initFcmPushBackground(userId?: string | null): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // 1. Check if native Android bridge provides a token
    const win = window as unknown as {
      Android?: { getFcmToken?: () => string; requestNotificationPermission?: () => void };
      AndroidBridge?: { getFcmToken?: () => string; requestNotificationPermission?: () => void };
      __wtaFcmToken?: string;
    };

    let token = win.__wtaFcmToken || null;

    if (!token && typeof win.Android?.getFcmToken === "function") {
      try {
        token = win.Android.getFcmToken() || null;
      } catch {}
    }

    if (!token && typeof win.AndroidBridge?.getFcmToken === "function") {
      try {
        token = win.AndroidBridge.getFcmToken() || null;
      } catch {}
    }

    if (!token) {
      try {
        token = localStorage.getItem("wta_native_fcm_token") || null;
      } catch {}
    }

    if (token) {
      await sendFcmTokenToBackend({
        token,
        userId: userId || null,
        platform: "android",
      });
      return;
    }

    // 2. If running in a web browser supporting Notification API, check permission
    if ("Notification" in window && Notification.permission === "granted") {
      const cachedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      if (cachedToken) {
        await sendFcmTokenToBackend({
          token: cachedToken,
          userId: userId || null,
          platform: "web",
        });
      }
    }
  } catch {
    // Never interrupt the user
  }
}

/**
 * Request notification permission appropriately (e.g. after login or when clicking notification bell).
 * Does not force or nag aggressively.
 */
export async function requestNotificationPermissionGently(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // 1. If in native Android app, signal native chrome to request POST_NOTIFICATIONS (Android 13+)
    const win = window as unknown as {
      Android?: { requestNotificationPermission?: () => void };
      AndroidBridge?: { requestNotificationPermission?: () => void };
    };

    if (typeof win.Android?.requestNotificationPermission === "function") {
      win.Android.requestNotificationPermission();
      return true;
    }
    if (typeof win.AndroidBridge?.requestNotificationPermission === "function") {
      win.AndroidBridge.requestNotificationPermission();
      return true;
    }

    // 2. Browser web notifications
    if ("Notification" in window) {
      if (Notification.permission === "granted") return true;
      if (Notification.permission === "denied") return false;

      // Check if already asked in this session
      const alreadyAsked = sessionStorage.getItem(PERMISSION_REQUESTED_KEY);
      if (alreadyAsked) return false;

      sessionStorage.setItem(PERMISSION_REQUESTED_KEY, "1");
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
  } catch {
    return false;
  }

  return false;
}
