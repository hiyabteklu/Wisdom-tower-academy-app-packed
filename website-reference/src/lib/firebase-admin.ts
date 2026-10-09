import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";

/**
 * Server-only Firebase Admin SDK initialization.
 * Used for Firebase Cloud Messaging (FCM) push notifications.
 *
 * Configured via environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 * Or FIREBASE_SERVICE_ACCOUNT_KEY (raw JSON)
 */

let app: App | null = null;

export function isFirebaseAdminConfigured(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) return true;
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return true;
  }
  return false;
}

export function getFirebaseAdminApp(): App | null {
  if (app) return app;

  const currentApps = getApps();
  if (currentApps.length > 0 && currentApps[0]) {
    app = currentApps[0];
    return app;
  }

  try {
    // 1. Try raw JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      app = initializeApp({
        credential: cert(sa),
      });
      return app;
    }

    // 2. Try individual env variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Handle escaped newlines in private key string
      privateKey = privateKey.replace(/\\n/g, "\n");

      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return app;
    }

    // 3. Fallback to application default credentials (e.g. if running in GCP Cloud Run / App Engine)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT) {
      app = initializeApp();
      return app;
    }
  } catch (err) {
    console.error("[FirebaseAdmin] Failed to initialize Firebase Admin SDK:", err);
  }

  return null;
}

export type FcmPushPayload = {
  title: string;
  body: string;
  url?: string;
  type?: string;
  id?: string;
  imageUrl?: string;
};

export type FcmSendResult = {
  success: boolean;
  sentCount: number;
  failureCount: number;
  invalidTokens: string[];
  skipped?: boolean;
  reason?: string;
};

/**
 * Send FCM push notifications to an array of device registration tokens.
 * Gracefully handles missing config, batching, and detects stale/unregistered tokens.
 */
export async function sendFcmPushToTokens(
  tokens: string[],
  payload: FcmPushPayload
): Promise<FcmSendResult> {
  const uniqueTokens = Array.from(new Set(tokens.filter(Boolean)));

  if (uniqueTokens.length === 0) {
    return {
      success: true,
      sentCount: 0,
      failureCount: 0,
      invalidTokens: [],
      skipped: true,
      reason: "No target device tokens provided",
    };
  }

  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    console.warn(
      "[FirebaseAdmin] Firebase Admin credentials not set. Push notification skipped for tokens:",
      uniqueTokens.length
    );
    return {
      success: true,
      sentCount: 0,
      failureCount: 0,
      invalidTokens: [],
      skipped: true,
      reason:
        "Firebase Admin credentials not configured in environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).",
    };
  }

  const messaging = getMessaging(adminApp);

  // FCM multicast payload
  const message: MulticastMessage = {
    tokens: uniqueTokens,
    notification: {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.imageUrl,
    },
    data: {
      title: payload.title,
      body: payload.body,
      url: payload.url || "/notifications",
      type: payload.type || "general",
      id: payload.id || `notif_${Date.now()}`,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // for Android notification handlers
    },
    android: {
      priority: "high",
      notification: {
        channelId: "wt_academy_main_channel",
        clickAction: payload.url || "/notifications",
        color: "#0284c7",
        defaultSound: true,
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    const invalidTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        const token = uniqueTokens[idx];
        if (
          error?.code === "messaging/registration-token-not-registered" ||
          error?.code === "messaging/invalid-registration-token" ||
          error?.code === "messaging/invalid-argument"
        ) {
          invalidTokens.push(token);
        }
      }
    });

    return {
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[FirebaseAdmin] FCM multicast error:", err);
    return {
      success: false,
      sentCount: 0,
      failureCount: uniqueTokens.length,
      invalidTokens: [],
      reason: message,
    };
  }
}
