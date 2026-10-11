package com.wisdomtower.academy.data.repository

import com.wisdomtower.academy.data.model.EnrolledPackageRecord
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

    /**
     * NOTE: this is a deliberate "Free Academic Mode" placeholder, NOT real enrollment data.
     * The website also keeps enrollments locally (applyDefaultPackagesForLevel), so there is
     * no server table to read yet. Replace once a real enrollments source exists.
     */
    fun getEnrolledPackages(isLoggedIn: Boolean): List<EnrolledPackageRecord> {
        if (!isLoggedIn) return emptyList()
        // In Free Mode, all primary curriculum tracks are unlocked for registered students
        return listOf(
            EnrolledPackageRecord("freshman", "Freshman Academic Core", "Free Academic Mode", true),
            EnrolledPackageRecord("grade-9-12", "Grade 9–12 Secondary Track", "Free Academic Mode", true),
            EnrolledPackageRecord("ece-y3-sem-1", "Electrical & Computer Eng (Sem 1)", "Free Academic Mode", true),
            EnrolledPackageRecord("ece-y3-sem-2", "Electrical & Computer Eng (Sem 2)", "Free Academic Mode", true),
            EnrolledPackageRecord("uat", "University Admission Test (UAT)", "Free Academic Mode", true),
            EnrolledPackageRecord("exit-exam", "National University Exit Exam", "Free Academic Mode", true)
        )
    }

    private fun JSONObject.optNullableString(key: String, fallback: String? = null): String? {
        if (!has(key) || isNull(key)) return fallback
        val v = optString(key)
        return if (v.isBlank() || v == "null") fallback else v
    }
}
