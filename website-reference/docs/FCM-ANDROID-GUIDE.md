# Firebase Cloud Messaging (FCM) Push Notifications Setup

This guide documents the native FCM push notification integration for **Wisdom Tower Academy**.

Backend Endpoint: `POST https://wisdom-tower-academy.live/api/fcm-token`

---

## 1. Dependencies (`app/build.gradle.kts`)

Add the Firebase Cloud Messaging dependency:

```kotlin
dependencies {
    // Firebase BoM & Messaging
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
}
```

Ensure `google-services` plugin is applied:

```kotlin
plugins {
    id("com.android.application")
    id("com.google.gms.google-services")
}
```

---

## 2. AndroidManifest.xml

Add `POST_NOTIFICATIONS` permission and register the service inside `<application>`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Android 13+ Notification Permission -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application ...>

        <!-- Custom Firebase Messaging Service -->
        <service
            android:name=".WisdomFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Optional: default notification channel & icon -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="wta_notifications" />

    </application>
</manifest>
```

---

## 3. Drop-in Files

The source files are located in `/android-fcm/`:
1. `WisdomFirebaseMessagingService.kt` — handles incoming messages, creates high-priority system notifications, and sends refreshed tokens to `/api/fcm-token`.
2. `MainActivityNotificationIntegration.kt` — permission helper, token retriever on app start, and deep-link click handler that navigates WebView to the target URL (defaulting to `/notifications`).

---

## 4. MainActivity.kt Integration

In your `MainActivity.kt`:

```kotlin
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var requestNotifPermission: () -> Unit

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Setup notification permission for Android 13+
        requestNotifPermission = MainActivityNotificationHelper.setupNotificationPermission(this)

        // 2. Fetch FCM token and register with backend quietly
        MainActivityNotificationHelper.registerFcmTokenOnStart(this)

        // 3. Request permission at an appropriate time (e.g. after intro or on start)
        requestNotifPermission()

        // 4. Handle notification tap if opened from a push notification
        MainActivityNotificationHelper.handleNotificationIntent(intent, webView)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        // Handle notification tap while app is already in memory
        MainActivityNotificationHelper.handleNotificationIntent(intent, webView)
    }
}
```

---

## 5. Notification Tap Behavior

When a notification is tapped:
- If `url` or `path` is specified in the push payload (e.g. `/academy/freshman`), the WebView navigates directly to that page.
- Otherwise, it smoothly defaults to `/notifications`.
