/**
 * Android WebView Detection & Native App Bridge for Wisdom Tower Academy
 *
 * Distinguishes the native Android Jetpack Compose WebView app from
 * regular web browsers (including Chrome on Android, mobile Safari, desktop).
 *
 * In regular browsers:
 *   Normal loading indicators (BrandLoader, circular spinner) remain visible.
 *
 * In native Android app:
 *   The native Jetpack Compose app provides its own Wisdom Tower GIF animation.
 *   The website's generic circular spinner is hidden/disabled so only the native GIF plays.
 */

declare global {
  interface Window {
    Android?: {
      openTool?: (tool: string) => boolean | void;
      closeOverlay?: () => void;
      closeTool?: () => void;
      dismissOverlay?: () => void;
      onClose?: () => void;
      isOverlay?: boolean;
      [key: string]: unknown;
    };
    AndroidBridge?: {
      openTool?: (tool: string) => boolean | void;
      closeOverlay?: () => void;
      closeTool?: () => void;
      dismissOverlay?: () => void;
      onClose?: () => void;
      getFcmToken?: () => string;
      requestNotificationPermission?: () => void;
      isOverlay?: boolean;
      [key: string]: unknown;
    };
    WisdomTower?: unknown;
    wtaNative?: unknown;
    __wtaNativeApp?: boolean;
    __wtaStructuralBack?: () => boolean;
    __wtaHardRefresh?: () => void;
    __wtaInPageBack?: () => boolean;
    __wtaOpenTool?: (tool: string, options?: { standalone?: boolean }) => void;
    __wtaCloseTool?: () => void;
    __wtaOverlay?: boolean;
    __wtaTutorApi?: {
      openHistory?: () => void;
      closeHistory?: () => void;
      toggleHistory?: () => void;
      newChat?: () => void;
      close?: () => void;
      clear?: () => void;
      [key: string]: unknown;
    };
  }
}

/**
 * Checks if the current environment is running inside the native Android WebView.
 * Uses User-Agent / SSR flags and Android bridge interfaces.
 * Never uses localStorage for detection.
 */
export function isAndroidWebView(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    // 1. Check DOM attribute and class (set synchronously during SSR via next/headers User-Agent)
    if (
      document.documentElement.getAttribute("data-wta-app") === "1" ||
      document.documentElement.classList.contains("wta-app-mode") ||
      document.documentElement.classList.contains("wta-native-app") ||
      document.body?.classList.contains("wta-native-app")
    ) {
      return true;
    }

    // 2. Inspect User Agent for WisdomTowerApp token (primary client-side fallback)
    const ua = navigator.userAgent || "";
    if (/WisdomTowerApp/i.test(ua)) {
      markDocumentNative();
      return true;
    }

    // 3. Check JavaScript Bridge interfaces injected by Android WebView
    if (
      Boolean(
        window.Android ||
        window.AndroidBridge ||
        window.WisdomTower ||
        window.wtaNative ||
        window.__wtaNativeApp
      )
    ) {
      markDocumentNative();
      return true;
    }

    // 4. Check query parameters or hash passed by native app (e.g. ?app=1, ?native=1, ?wta=1)
    const search = window.location.search || "";
    const hash = window.location.hash || "";
    if (
      /(?:[?&])(?:app|native|wta|platform)=(?:1|true|android|wta)/i.test(search) ||
      /(?:[#&])(?:app|native|wta)=(?:1|true|android|wta)/i.test(hash)
    ) {
      markDocumentNative();
      return true;
    }

    // 5. Inspect User Agent for Chromium Android WebView tokens
    const isAndroid = /Android/i.test(ua);
    if (isAndroid) {
      if (/WisdomTower|wta-native/i.test(ua)) {
        markDocumentNative();
        return true;
      }

      // Chromium standard Android WebView token: "; wv)" or " wv" in build string
      const hasWvToken = /\bwv\b/i.test(ua);
      const hasVersion4 = /Version\/4\.0/i.test(ua);

      if (hasWvToken || (hasVersion4 && !/Chrome\/[0-9.]+\s+Mobile\s+Safari/i.test(ua.replace(/Version\/4\.0/, "")))) {
        markDocumentNative();
        return true;
      }
    }
  } catch {
    /* fallback to safe default */
  }

  return false;
}

function markDocumentNative() {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-wta-app", "1");
    if (!document.documentElement.classList.contains("wta-app-mode")) {
      document.documentElement.classList.add("wta-app-mode");
    }
    if (!document.documentElement.classList.contains("wta-native-app")) {
      document.documentElement.classList.add("wta-native-app");
    }
    if (document.body && !document.body.classList.contains("wta-native-app")) {
      document.body.classList.add("wta-native-app");
    }
  }
}

/**
 * Checks if the current page is running inside a tool overlay, iframe modal, or standalone tool view.
 */
export function isOverlayOrStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // 1. Explicit search param in URL
    const search = window.location.search || "";
    if (/(?:[?&])(?:overlay|standalone|embed|view=overlay|mode=overlay)=(?:1|true|standalone|overlay)/i.test(search)) {
      return true;
    }

    // 2. Hash query param
    const hash = window.location.hash || "";
    if (/(?:[#&])(?:overlay|standalone|embed)=(?:1|true)/i.test(hash)) {
      return true;
    }

    // 3. Embedded in iframe or WebView overlay container
    if (window.self !== window.top) {
      return true;
    }

    // 4. Injected bridge overlay flag
    if (
      Boolean(
        window.__wtaOverlay ||
        (window.AndroidBridge && window.AndroidBridge.isOverlay) ||
        (window.Android && window.Android.isOverlay)
      )
    ) {
      return true;
    }
  } catch {
    /* ignore */
  }

  return false;
}

/**
 * Checks if the current environment is running inside the native Android app's
 * dedicated tool overlay WebView (e.g. /learning?tool=tutor&overlay=1&app=1).
 * When true, the native app provides its own top bar with a red Close button,
 * so the web tool header should be hidden to prevent dual headers.
 */
export function isNativeToolOverlay(toolKey?: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  try {
    const isNative = isAndroidWebView();
    if (!isNative) return false;

    // Check if document has wta-tool-overlay class
    if (
      document.documentElement.classList.contains("wta-tool-overlay") ||
      document.body?.classList.contains("wta-tool-overlay")
    ) {
      return true;
    }

    // Check URL query parameters or hash
    const search = window.location.search || "";
    const hash = window.location.hash || "";

    if (
      /(?:[?&])(?:overlay|standalone|embed)=(?:1|true|standalone|overlay)/i.test(search) ||
      /(?:[#&])(?:overlay|standalone|embed)=(?:1|true)/i.test(hash)
    ) {
      return true;
    }

    if (toolKey) {
      const toolPattern = new RegExp(`(?:[?&])(?:tool|tab)=${toolKey}`, "i");
      if (toolPattern.test(search) || toolPattern.test(hash)) {
        return true;
      }
    } else {
      if (/(?:[?&])(?:tool|tab)=(?:tutor|ai-tutor|calculator|notes|timer)/i.test(search)) {
        return true;
      }
    }

    if (
      Boolean(
        window.__wtaOverlay ||
        (window.AndroidBridge && window.AndroidBridge.isOverlay) ||
        (window.Android && window.Android.isOverlay)
      )
    ) {
      return true;
    }
  } catch {
    /* fallback */
  }

  return false;
}

/**
 * Notifies the native Android app or host container to close the tool overlay.
 * Returns true if an Android bridge method was invoked.
 */
export function closeToolOverlay(toolKey?: string): boolean {
  if (typeof window === "undefined") return false;

  let handled = false;

  try {
    const bridge = window.AndroidBridge || window.Android;
    if (bridge) {
      if (typeof bridge.closeOverlay === "function") {
        bridge.closeOverlay();
        handled = true;
      }
      if (typeof bridge.closeTool === "function") {
        bridge.closeTool();
        handled = true;
      }
      if (typeof bridge.dismissOverlay === "function") {
        bridge.dismissOverlay();
        handled = true;
      }
      if (typeof bridge.onClose === "function") {
        bridge.onClose();
        handled = true;
      }
    }
  } catch {
    /* ignore */
  }

  try {
    if (typeof window.__wtaCloseTool === "function") {
      window.__wtaCloseTool();
    }
  } catch {
    /* ignore */
  }

  try {
    window.parent?.postMessage({ type: "wta-close-tool", tool: toolKey }, "*");
    window.opener?.postMessage({ type: "wta-close-tool", tool: toolKey }, "*");
    window.dispatchEvent(new CustomEvent("wta-close-tool", { detail: { tool: toolKey } }));
  } catch {
    /* ignore */
  }

  try {
    // If opened via window.open() in WebView
    window.close();
  } catch {
    /* ignore */
  }

  return handled;
}

/**
 * Requests opening a study tool non-destructively.
 * - If running inside native Android app with AndroidBridge.openTool:
 *     delegates to native app bridge so native overlay WebView or sheet opens
 *     WITHOUT navigating the main WebView away from hub content.
 * - Otherwise (or if native bridge doesn't intercept):
 *     dispatches "wta-open-tool" event to open the non-destructive in-page tool overlay.
 */
export function requestOpenTool(
  tool: string,
  options?: { fallbackNavigate?: boolean; router?: { push: (url: string) => void } }
): boolean {
  if (typeof window === "undefined") return false;

  // 1. Try native Android bridge if available
  try {
    const bridge = window.AndroidBridge || window.Android;
    if (bridge && typeof bridge.openTool === "function") {
      const res = bridge.openTool(tool);
      // If bridge explicitly returned false, fall through to in-page overlay
      if (res !== false) {
        return true;
      }
    }
  } catch {
    /* ignore */
  }

  // 2. Dispatch in-page overlay event (handled by GlobalToolOverlay)
  try {
    if (typeof window.__wtaOpenTool === "function") {
      window.__wtaOpenTool(tool);
      return true;
    }
  } catch {
    /* ignore */
  }

  try {
    window.dispatchEvent(
      new CustomEvent("wta-open-tool", {
        detail: { tool },
      })
    );
    return true;
  } catch {
    /* ignore */
  }

  // 3. Fallback to router navigation if explicitly requested
  if (options?.fallbackNavigate && options?.router) {
    options.router.push(`/learning?tool=${encodeURIComponent(tool)}`);
    return true;
  }

  return false;
}

