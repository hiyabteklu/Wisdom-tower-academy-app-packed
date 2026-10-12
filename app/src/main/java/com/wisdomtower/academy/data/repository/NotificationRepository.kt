package com.wisdomtower.academy.data.repository

import android.content.Context
import android.content.SharedPreferences
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
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

object NotificationRepository {
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val scope = CoroutineScope(Dispatchers.IO)

    // No invented items: the list only ever holds what the website API returned.
    private val _notifications = MutableStateFlow<List<NativeNotificationItem>>(emptyList())
    val notifications: StateFlow<List<NativeNotificationItem>> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    // Loading and error state so a screen/button can show real feedback.
    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    // Plain-language error of the last refresh, or null when it worked.
    private val _lastError = MutableStateFlow<String?>(null)
    val lastError: StateFlow<String?> = _lastError.asStateFlow()

    // N12: ids the student has read on this phone (the website keeps the same kind of list in localStorage).
    // Only ids are stored, never titles or text.
    private const val PREFS = "wt_native_notice_read"
    private const val KEY_IDS = "read_ids"
    private var prefs: SharedPreferences? = null
    private val readIds = mutableSetOf<String>()

    /** Call once at start (MainActivity.onCreate). Safe to call again. */
    @Synchronized
    fun init(context: Context) {
        if (prefs != null) return
        val p = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs = p
        readIds.clear()
        readIds.addAll(p.getStringSet(KEY_IDS, emptySet()).orEmpty())
    }

    @Synchronized
    private fun saveReadIds() {
        // Keep the set small: only the newest 500 ids matter.
        val toSave = readIds.toList().takeLast(500).toSet()
        prefs?.edit()?.putStringSet(KEY_IDS, toSave)?.apply()
    }

    @Synchronized
    private fun isRead(id: String, serverRead: Boolean): Boolean = serverRead || readIds.contains(id)

    fun refreshNotifications(userId: String? = null, email: String? = null) {
        if (_isRefreshing.value) return
        _isRefreshing.value = true
        scope.launch {
            try {
                val queryParams = mutableListOf<String>()
                if (!userId.isNullOrBlank()) queryParams.add("userId=" + URLEncoder.encode(userId, "UTF-8"))
                if (!email.isNullOrBlank()) queryParams.add("email=" + URLEncoder.encode(email, "UTF-8"))
                val qs = if (queryParams.isNotEmpty()) "?" + queryParams.joinToString("&") else ""
                val url = "https://www.wisdom-tower-academy.live/api/notifications$qs"

                val request = Request.Builder().url(url).build()
                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        _lastError.value = "Could not load notifications (error ${response.code}). Try again."
                        return@use
                    }
                    val body = response.body?.string().orEmpty()
                    val arr = if (body.isNotBlank()) JSONObject(body).optJSONArray("notifications") else null
                    if (arr == null) {
                        _lastError.value = "Could not read the notifications reply. Try again."
                        return@use
                    }
                    val list = mutableListOf<NativeNotificationItem>()
                    for (i in 0 until arr.length()) {
                        val item = arr.getJSONObject(i)
                        val id = item.optString("id", "notif_$i")
                        list.add(
                            NativeNotificationItem(
                                id = id,
                                title = item.optString("title", ""),
                                body = item.optString("body", ""),
                                type = item.optString("type", "general"),
                                target = item.optString("target", "all"),
                                url = item.optString("url", "/learning"),
                                createdAt = item.optString("createdAt", ""),
                                read = isRead(id, item.optBoolean("read", false))
                            )
                        )
                    }
                    // An empty list from the server really means "no notifications".
                    _notifications.value = list
                    _unreadCount.value = list.count { !it.read }
                    _lastError.value = null
                }
            } catch (_: Exception) {
                // Keep what we already have; tell the user instead of failing silently.
                _lastError.value = "Check your internet connection and try again."
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    /** Marks one notification as read (screen: tap on a card). */
    fun markRead(id: String) {
        synchronized(this) {
            readIds.add(id)
            saveReadIds()
        }
        val updated = _notifications.value.map { if (it.id == id) it.copy(read = true) else it }
        _notifications.value = updated
        _unreadCount.value = updated.count { !it.read }
    }

    fun markAllRead() {
        synchronized(this) {
            _notifications.value.forEach { readIds.add(it.id) }
            saveReadIds()
        }
        val updated = _notifications.value.map { it.copy(read = true) }
        _notifications.value = updated
        _unreadCount.value = 0
    }
}
