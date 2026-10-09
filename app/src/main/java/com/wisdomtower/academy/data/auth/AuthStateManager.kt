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
    fun syncAuthSession(rawJson: String?, isExplicitSignOut: Boolean = false) {
        if (rawJson.isNullOrBlank() || rawJson == "null" || rawJson == "undefined" || rawJson == "{}") {
            if (isExplicitSignOut) {
                clearSession()
            }
            return
        }

        try {
            val obj = JSONObject(rawJson)
            val userObj = obj.optJSONObject("user")
            if (userObj == null) {
                if (isExplicitSignOut) clearSession()
                return
            }

            val uid = userObj.optString("id")
            if (uid.isBlank()) {
                if (isExplicitSignOut) clearSession()
                return
            }

            val email = userObj.optNullableString("email")
            val meta = userObj.optJSONObject("user_metadata")
            val fullName = meta?.optNullableString("full_name")
                ?: meta?.optNullableString("name")
                ?: email?.substringBefore("@")
                ?: "Student Scholar"

            val accessToken = obj.optNullableString("access_token")
            val refreshToken = obj.optNullableString("refresh_token")
            val createdAt = userObj.optNullableString("created_at")

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
                educationLevel = existing?.educationLevel ?: meta?.optNullableString("education_level"),
                stream = existing?.stream ?: meta?.optNullableString("stream"),
                schoolName = existing?.schoolName ?: meta?.optNullableString("school_name"),
                townRegion = existing?.townRegion ?: meta?.optNullableString("town_region"),
                avatarPreset = existing?.avatarPreset ?: meta?.optNullableString("avatar_preset"),
                avatarUrl = existing?.avatarUrl ?: meta?.optNullableString("avatar_url"),
                studentIdNumber = existing?.studentIdNumber ?: meta?.optNullableString("student_id_number"),
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

    /**
     * Generates a valid JSON session string matching Supabase wt-academy-auth-v1 format
     * for injection into the WebView so web handoffs inherit the authenticated session.
     */
    fun getAuthSessionJson(): String {
        val user = _currentUser.value ?: return ""
        val profile = _currentProfile.value
        return try {
            val userMeta = JSONObject().apply {
                put("full_name", user.fullName ?: profile?.fullName ?: "Student Scholar")
                put("name", user.fullName ?: profile?.fullName ?: "Student Scholar")
                profile?.educationLevel?.let { put("education_level", it) }
                profile?.stream?.let { put("stream", it) }
                profile?.schoolName?.let { put("school_name", it) }
                profile?.townRegion?.let { put("town_region", it) }
                profile?.avatarPreset?.let { put("avatar_preset", it) }
                profile?.avatarUrl?.let { put("avatar_url", it) }
                profile?.studentIdNumber?.let { put("student_id_number", it) }
            }
            val userObj = JSONObject().apply {
                put("id", user.id)
                put("email", user.email ?: "")
                put("created_at", user.createdAt ?: "")
                put("user_metadata", userMeta)
            }
            val root = JSONObject().apply {
                put("access_token", user.accessToken ?: "")
                put("refresh_token", user.refreshToken ?: "")
                put("user", userObj)
            }
            root.toString()
        } catch (_: Exception) {
            ""
        }
    }

    /**
     * Injects the active native session into the WebView localStorage so handoffs are already signed in.
     */
    fun injectSessionIntoWebView(webView: WebView?) {
        val json = getAuthSessionJson()
        if (json.isBlank()) return
        val escaped = JSONObject.quote(json)
        val profile = _currentProfile.value
        val user = _currentUser.value
        val eduLevel = JSONObject.quote(profile?.educationLevel ?: "")
        val stream = JSONObject.quote(profile?.stream ?: "")
        val fullName = JSONObject.quote(profile?.fullName ?: user?.fullName ?: "")
        val email = JSONObject.quote(profile?.email ?: user?.email ?: "")
        val studentId = JSONObject.quote(profile?.studentIdNumber ?: "")
        val js = """
            (function(){
              try {
                var cur = localStorage.getItem('wt-academy-auth-v1');
                var shouldSet = !cur || cur === 'null' || cur === '{}' || cur.length < 15;
                if (!shouldSet) {
                  try {
                    var parsed = JSON.parse(cur);
                    if (!parsed.access_token || !parsed.user) shouldSet = true;
                  } catch(e) { shouldSet = true; }
                }
                if (shouldSet) {
                  localStorage.setItem('wt-academy-auth-v1', $escaped);
                  if ($eduLevel && $eduLevel !== '""') localStorage.setItem('wt_student_academic_level', $eduLevel);
                  if ($stream && $stream !== '""') localStorage.setItem('wt_student_academic_stream', $stream);
                  if ($fullName && $fullName !== '""') localStorage.setItem('wt_user_name', $fullName);
                  if ($email && $email !== '""') localStorage.setItem('wt_user_email', $email);
                  if ($studentId && $studentId !== '""') localStorage.setItem('wt_student_id', $studentId);
                  window.dispatchEvent(new CustomEvent('wta-auth-change'));
                }
              } catch(e) {}
            })();
        """.trimIndent()
        webView?.post {
            webView.evaluateJavascript(js, null)
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
                        email = pObj.optNullableString("email", _currentProfile.value?.email),
                        fullName = pObj.optNullableString("full_name", _currentProfile.value?.fullName),
                        firstName = pObj.optNullableString("first_name"),
                        lastName = pObj.optNullableString("last_name"),
                        phone = pObj.optNullableString("phone"),
                        educationLevel = pObj.optNullableString("education_level", _currentProfile.value?.educationLevel),
                        schoolName = pObj.optNullableString("school_name", _currentProfile.value?.schoolName),
                        townRegion = pObj.optNullableString("town_region", _currentProfile.value?.townRegion),
                        stream = pObj.optNullableString("stream", _currentProfile.value?.stream),
                        bio = pObj.optNullableString("bio"),
                        targetExam = pObj.optNullableString("target_exam"),
                        targetScore = pObj.optNullableString("target_score"),
                        dailyStudyGoalMinutes = pObj.optInt("daily_study_goal_minutes", 45),
                        avatarPreset = pObj.optNullableString("avatar_preset", _currentProfile.value?.avatarPreset),
                        avatarUrl = pObj.optNullableString("avatar_url", _currentProfile.value?.avatarUrl),
                        studentIdNumber = pObj.optNullableString("student_id_number", _currentProfile.value?.studentIdNumber),
                        createdAt = pObj.optNullableString("created_at", _currentUser.value?.createdAt)
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

    private fun JSONObject.optNullableString(key: String, fallback: String? = null): String? {
        if (!has(key) || isNull(key)) return fallback
        val v = optString(key)
        return if (v.isBlank() || v == "null") fallback else v
    }
}
