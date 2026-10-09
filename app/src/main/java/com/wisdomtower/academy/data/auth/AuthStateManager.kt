package com.wisdomtower.academy.data.auth

import android.content.Context
import android.content.SharedPreferences
import android.webkit.CookieManager
import android.webkit.WebView
import com.wisdomtower.academy.data.model.AuthUser
import com.wisdomtower.academy.data.model.StudentIdData
import com.wisdomtower.academy.data.model.StudentIdGenerator
import com.wisdomtower.academy.data.model.UserProfile
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

object AuthStateManager {
    private const val PREFS_NAME = "wt_academy_auth_prefs"
    private const val KEY_USER_ID = "auth_user_id"
    private const val KEY_EMAIL = "auth_email"
    private const val KEY_FULL_NAME = "auth_full_name"
    private const val KEY_ACCESS_TOKEN = "auth_access_token"
    private const val KEY_REFRESH_TOKEN = "auth_refresh_token"
    private const val KEY_CREATED_AT = "auth_created_at"
    private const val KEY_STUDENT_ID = "auth_student_id"
    private const val KEY_EDUCATION_LEVEL = "auth_education_level"
    private const val KEY_STREAM = "auth_stream"
    private const val KEY_SCHOOL_NAME = "auth_school_name"
    private const val KEY_TOWN_REGION = "auth_town_region"
    private const val KEY_AVATAR_PRESET = "auth_avatar_preset"
    private const val KEY_AVATAR_URL = "auth_avatar_url"

    private val _currentUser = MutableStateFlow<AuthUser?>(null)
    val currentUser: StateFlow<AuthUser?> = _currentUser.asStateFlow()

    private val _currentProfile = MutableStateFlow<UserProfile?>(null)
    val currentProfile: StateFlow<UserProfile?> = _currentProfile.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.IO)
    private var appContext: Context? = null

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    fun init(context: Context) {
        appContext = context.applicationContext
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val uid = prefs.getString(KEY_USER_ID, null)
        if (!uid.isNullOrBlank()) {
            val user = AuthUser(
                id = uid,
                email = prefs.getString(KEY_EMAIL, null),
                fullName = prefs.getString(KEY_FULL_NAME, null),
                accessToken = prefs.getString(KEY_ACCESS_TOKEN, null),
                refreshToken = prefs.getString(KEY_REFRESH_TOKEN, null),
                createdAt = prefs.getString(KEY_CREATED_AT, null)
            )
            val profile = UserProfile(
                id = uid,
                email = prefs.getString(KEY_EMAIL, null),
                fullName = prefs.getString(KEY_FULL_NAME, null),
                educationLevel = prefs.getString(KEY_EDUCATION_LEVEL, null),
                stream = prefs.getString(KEY_STREAM, null),
                schoolName = prefs.getString(KEY_SCHOOL_NAME, null),
                townRegion = prefs.getString(KEY_TOWN_REGION, null),
                avatarPreset = prefs.getString(KEY_AVATAR_PRESET, null),
                avatarUrl = prefs.getString(KEY_AVATAR_URL, null),
                studentIdNumber = prefs.getString(KEY_STUDENT_ID, null),
                createdAt = prefs.getString(KEY_CREATED_AT, null)
            )
            _currentUser.value = user
            _currentProfile.value = profile
            _isLoggedIn.value = true
        }
    }

    /**
     * Called by the WebView JS bridge when localStorage['wt-academy-auth-v1'] changes
     */
    fun syncAuthSession(rawJson: String?) {
        if (rawJson.isNullOrBlank() || rawJson == "null" || rawJson == "undefined" || rawJson == "{}") {
            clearSession()
            return
        }

        try {
            val obj = JSONObject(rawJson)
            val userObj = obj.optJSONObject("user")
            if (userObj == null) {
                clearSession()
                return
            }

            val uid = userObj.optString("id")
            if (uid.isBlank()) {
                clearSession()
                return
            }

            val email = userObj.optString("email", null)
            val meta = userObj.optJSONObject("user_metadata")
            val fullName = meta?.optString("full_name")?.takeIf { it.isNotBlank() }
                ?: meta?.optString("name")?.takeIf { it.isNotBlank() }
                ?: email?.substringBefore("@")
                ?: "Student Scholar"

            val accessToken = obj.optString("access_token", null)
            val refreshToken = obj.optString("refresh_token", null)
            val createdAt = userObj.optString("created_at", null)

            val authUser = AuthUser(
                id = uid,
                email = email,
                fullName = fullName,
                accessToken = accessToken,
                refreshToken = refreshToken,
                createdAt = createdAt
            )

            // Keep existing profile metadata if available, otherwise bootstrap default
            val existing = _currentProfile.value
            val profile = UserProfile(
                id = uid,
                email = email,
                fullName = fullName,
                educationLevel = existing?.educationLevel ?: meta?.optString("education_level", null),
                stream = existing?.stream ?: meta?.optString("stream", null),
                schoolName = existing?.schoolName ?: meta?.optString("school_name", null),
                townRegion = existing?.townRegion ?: meta?.optString("town_region", null),
                avatarPreset = existing?.avatarPreset ?: meta?.optString("avatar_preset", null),
                avatarUrl = existing?.avatarUrl ?: meta?.optString("avatar_url", null),
                studentIdNumber = existing?.studentIdNumber ?: meta?.optString("student_id_number", null),
                createdAt = createdAt
            )

            _currentUser.value = authUser
            _currentProfile.value = profile
            _isLoggedIn.value = true

            saveToPrefs(authUser, profile)

            // Asynchronously fetch full student profile from website API / Supabase
            scope.launch {
                fetchFullProfile(uid, accessToken)
            }
        } catch (_: Exception) {
            // Non-fatal parse error; keep current state
        }
    }

    private fun saveToPrefs(user: AuthUser, profile: UserProfile) {
        val ctx = appContext ?: return
        val prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString(KEY_USER_ID, user.id)
            putString(KEY_EMAIL, user.email)
            putString(KEY_FULL_NAME, user.fullName)
            putString(KEY_ACCESS_TOKEN, user.accessToken)
            putString(KEY_REFRESH_TOKEN, user.refreshToken)
            putString(KEY_CREATED_AT, user.createdAt)
            putString(KEY_STUDENT_ID, profile.studentIdNumber)
            putString(KEY_EDUCATION_LEVEL, profile.educationLevel)
            putString(KEY_STREAM, profile.stream)
            putString(KEY_SCHOOL_NAME, profile.schoolName)
            putString(KEY_TOWN_REGION, profile.townRegion)
            putString(KEY_AVATAR_PRESET, profile.avatarPreset)
            putString(KEY_AVATAR_URL, profile.avatarUrl)
            apply()
        }
    }

    fun clearSession() {
        _currentUser.value = null
        _currentProfile.value = null
        _isLoggedIn.value = false
        val ctx = appContext ?: return
        val prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }

    fun signOut(webView: WebView?) {
        clearSession()
        webView?.post {
            webView.evaluateJavascript(
                "(function(){try{" +
                    "localStorage.removeItem('wt-academy-auth-v1');" +
                    "for(var i=localStorage.length-1;i>=0;i--){" +
                    "  var k=localStorage.key(i);" +
                    "  if(k&&(k.indexOf('sb-')===0||k.indexOf('auth')!==-1))localStorage.removeItem(k);" +
                    "}" +
                    "window.dispatchEvent(new CustomEvent('wta-auth-change'));" +
                "}catch(e){}})();",
                null
            )
        }
    }

    private suspend fun fetchFullProfile(userId: String, token: String?) {
        try {
            // Attempt query against website API endpoint or Supabase
            val url = "https://www.wisdom-tower-academy.live/api/account/profile?userId=$userId"
            val reqBuilder = Request.Builder().url(url)
            if (!token.isNullOrBlank()) {
                reqBuilder.addHeader("Authorization", "Bearer $token")
            }
            val resp = httpClient.newCall(reqBuilder.build()).execute()
            if (resp.isSuccessful) {
                val body = resp.body?.string().orEmpty()
                if (body.isNotBlank()) {
                    val root = JSONObject(body)
                    val pObj = root.optJSONObject("profile") ?: root
                    val updated = UserProfile(
                        id = userId,
                        email = pObj.optString("email", _currentProfile.value?.email),
                        fullName = pObj.optString("full_name", _currentProfile.value?.fullName),
                        firstName = pObj.optString("first_name", null),
                        lastName = pObj.optString("last_name", null),
                        phone = pObj.optString("phone", null),
                        educationLevel = pObj.optString("education_level", _currentProfile.value?.educationLevel),
                        schoolName = pObj.optString("school_name", _currentProfile.value?.schoolName),
                        townRegion = pObj.optString("town_region", _currentProfile.value?.townRegion),
                        stream = pObj.optString("stream", _currentProfile.value?.stream),
                        bio = pObj.optString("bio", null),
                        targetExam = pObj.optString("target_exam", null),
                        targetScore = pObj.optString("target_score", null),
                        dailyStudyGoalMinutes = pObj.optInt("daily_study_goal_minutes", 45),
                        avatarPreset = pObj.optString("avatar_preset", _currentProfile.value?.avatarPreset),
                        avatarUrl = pObj.optString("avatar_url", _currentProfile.value?.avatarUrl),
                        studentIdNumber = pObj.optString("student_id_number", _currentProfile.value?.studentIdNumber),
                        createdAt = pObj.optString("created_at", _currentUser.value?.createdAt)
                    )
                    _currentProfile.value = updated
                    _currentUser.value?.let { saveToPrefs(it, updated) }
                }
            }
        } catch (_: Exception) {
            // Offline or private endpoint; keep deterministic student card
        }
    }

    fun getStudentIdData(): StudentIdData {
        val user = _currentUser.value
        val profile = _currentProfile.value
        return StudentIdGenerator.computeStudentId(
            userId = user?.id,
            profile = profile,
            createdAtStr = user?.createdAt
        )
    }
}
