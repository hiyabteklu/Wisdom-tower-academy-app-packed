package com.wisdomtower.academy.data.repository

import com.wisdomtower.academy.data.model.LearningResourceItem
import com.wisdomtower.academy.ui.packages.CATALOG_PACKAGES
import com.wisdomtower.academy.ui.packages.NativePackage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object AcademyRepository {
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val _packages = MutableStateFlow(CATALOG_PACKAGES)
    val packages: StateFlow<List<NativePackage>> = _packages.asStateFlow()

    /**
     * Intentionally a no-op. The website has NO `/api/content/catalog` route
     * (checked against hiyabteklu/Wisdom-tower-academy on 2026-10-11; only
     * `content/pdf` and `content/resources` exist), so the old call always 404'd,
     * and even a 200 only toggled items on/off. The catalog comes from the
     * static CATALOG_PACKAGES seed until the website exposes a real catalog route
     * or the app reads Supabase directly. Signature kept so callers still compile.
     */
    fun refreshCatalog() {
        // no network call on purpose
    }

    suspend fun fetchLearningResources(scopePath: String, hub: String? = null): List<LearningResourceItem> {
        return try {
            val qs = StringBuilder("scopePath=$scopePath&publishedOnly=true")
            if (!hub.isNullOrBlank()) {
                qs.append("&hub=$hub")
            }
            val url = "https://www.wisdom-tower-academy.live/api/content/resources?$qs"
            val request = Request.Builder().url(url).build()
            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string().orEmpty()
                if (body.isNotBlank()) {
                    val root = JSONObject(body)
                    val arr = root.optJSONArray("items")
                    if (arr != null) {
                        val list = mutableListOf<LearningResourceItem>()
                        for (i in 0 until arr.length()) {
                            val obj = arr.getJSONObject(i)
                            list.add(
                                LearningResourceItem(
                                    id = obj.optString("id"),
                                    packageId = obj.optString("packageId"),
                                    scopePath = obj.optString("scopePath"),
                                    hub = obj.optString("hub"),
                                    title = obj.optString("title"),
                                    chapter = if (obj.has("chapter") && !obj.isNull("chapter")) obj.optInt("chapter") else null,
                                    sortOrder = obj.optInt("sortOrder", 0),
                                    contentType = obj.optNullableString("contentType"),
                                    storagePath = obj.optNullableString("storagePath"),
                                    bodyMd = obj.optNullableString("bodyMd"),
                                    published = obj.optBoolean("published", true)
                                )
                            )
                        }
                        return list
                    }
                }
            }
            emptyList()
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun resolveAppwriteUrl(storagePath: String?): String? {
        if (storagePath.isNullOrBlank()) return null
        if (!storagePath.startsWith("appwrite:")) return storagePath
        val fileId = storagePath.removePrefix("appwrite:").substringBefore("|")
        return "https://www.wisdom-tower-academy.live/api/content/pdf?path=appwrite:$fileId"
    }

    // S4 item d: the invented `getEnrolledPackages()` ("Free Academic Mode" list of 6 packages with
    // made-up names such as "Grade 9–12 Secondary Track", "National University Exit Exam") was removed.
    // grep showed no caller. The website keeps enrollments only in the browser
    // (`applyDefaultPackagesForLevel`, localStorage key `wt_enrolled_courses_v2`), so there is no real
    // server source; see STATUS.md S6. The model class `EnrolledPackageRecord` was left in place.

    private fun JSONObject.optNullableString(key: String, fallback: String? = null): String? {
        if (!has(key) || isNull(key)) return fallback
        val v = optString(key)
        return if (v.isBlank() || v == "null") fallback else v
    }
}
