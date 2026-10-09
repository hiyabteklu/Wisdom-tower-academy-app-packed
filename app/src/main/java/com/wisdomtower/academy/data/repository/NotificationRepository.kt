package com.wisdomtower.academy.data.repository

import com.wisdomtower.academy.data.model.NativeNotificationItem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object NotificationRepository {
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val scope = CoroutineScope(Dispatchers.IO)

    private val _notifications = MutableStateFlow<List<NativeNotificationItem>>(
        listOf(
            NativeNotificationItem(
                id = "notif_welcome_system",
                title = "Welcome to Wisdom Tower Academy",
                body = "Explore comprehensive learning tracks, solved model exams, and lecture notes. All content is unlocked for registered scholars!",
                type = "admin",
                target = "all",
                url = "/learning",
                createdAt = "Just now",
                read = false
            )
        )
    )
    val notifications: StateFlow<List<NativeNotificationItem>> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow(1)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    fun refreshNotifications(userId: String? = null, email: String? = null) {
        scope.launch {
            try {
                val queryParams = mutableListOf<String>()
                if (!userId.isNullOrBlank()) queryParams.add("userId=$userId")
                if (!email.isNullOrBlank()) queryParams.add("email=$email")
                val qs = if (queryParams.isNotEmpty()) "?" + queryParams.joinToString("&") else ""
                val url = "https://www.wisdom-tower-academy.live/api/notifications$qs"

                val request = Request.Builder().url(url).build()
                val response = httpClient.newCall(request).execute()
                if (response.isSuccessful) {
                    val body = response.body?.string().orEmpty()
                    if (body.isNotBlank()) {
                        val root = JSONObject(body)
                        val arr = root.optJSONArray("notifications")
                        if (arr != null && arr.length() > 0) {
                            val list = mutableListOf<NativeNotificationItem>()
                            for (i in 0 until arr.length()) {
                                val item = arr.getJSONObject(i)
                                list.add(
                                    NativeNotificationItem(
                                        id = item.optString("id", "notif_$i"),
                                        title = item.optString("title", "Academy Notice"),
                                        body = item.optString("body", ""),
                                        type = item.optString("type", "general"),
                                        target = item.optString("target", "all"),
                                        url = item.optString("url", "/learning"),
                                        createdAt = item.optString("createdAt", ""),
                                        read = item.optBoolean("read", false)
                                    )
                                )
                            }
                            _notifications.value = list
                            _unreadCount.value = list.count { !it.read }
                        }
                    }
                }
            } catch (_: Exception) {
                // Offline fallback maintains current notifications
            }
        }
    }

    fun markAllRead() {
        val updated = _notifications.value.map { it.copy(read = true) }
        _notifications.value = updated
        _unreadCount.value = 0
    }
}
