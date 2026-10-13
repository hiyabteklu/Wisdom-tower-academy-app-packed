package com.wisdomtower.academy.data.content

import android.util.Log
import com.wisdomtower.academy.BuildConfig
import com.wisdomtower.academy.data.auth.AuthStateManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.util.concurrent.TimeUnit

/** The three lock modes of the website (`HubLockMode` in `data/content-availability.ts`). */
enum class HubLockMode { Open, RequirePurchase, ComingSoon }

/** What the app does when a student taps a learning hub of a course. */
enum class HubGate {
    /** Go on (open the hub). */
    Open,

    /** Show the website's "Coming soon" message. */
    ComingSoon,

    /** Signed in but the package is not owned: show a message, NO purchase button, NO price. */
    PackageRequired
}

/**
 * Access state of one course (its six learning hubs), the native version of the website's
 * `ResourceHubGrid` rules: `open` = free for everybody, `coming_soon` = closed for everybody,
 * `require_purchase` = open only for a signed-in student who owns the package.
 *
 * A signed-OUT student on a `require_purchase` course is NOT blocked here: the native screens show their own
 * "Sign in to open" message (owner rule: real content needs a signed-in student).
 *
 * [unlockIds] are the package ids that open this course. [gate] asks [ContentAccess.ownsNow] again every time it
 * is read, so a code the student entered a moment ago counts at once, without the screen having to re-resolve.
 */
data class CourseAccess(
    val mode: HubLockMode,
    val signedIn: Boolean,
    val owned: Boolean,
    val unlockIds: List<String> = emptyList()
) {
    val gate: HubGate
        get() = when (mode) {
            HubLockMode.Open -> HubGate.Open
            HubLockMode.ComingSoon -> HubGate.ComingSoon
            HubLockMode.RequirePurchase -> when {
                !signedIn -> HubGate.Open
                owned -> HubGate.Open
                ContentAccess.ownsNow(unlockIds) -> HubGate.Open
                else -> HubGate.PackageRequired
            }
        }

    /** The `isUnlocked` check of plan step N9. */
    val isUnlocked: Boolean get() = gate == HubGate.Open
}

/**
 * Plan step N9 (`docs/NATIVE_CONTENT_PLAN.md`): decides whether the hubs of a course can be opened.
 * Ports, from the website:
 *  - `data/content-availability.ts` (static rules per path, package ids per path, the two texts);
 *  - `lib/content-locks.ts` `resolveEffectiveLock` (admin locks in `public.content_locks`, public read with the
 *    anon key; priority scope lock, then package lock, then the static rule; the website grid passes no hub,
 *    so neither does this);
 *  - `lib/ownership.ts` (free mode and the free-for-registered package list).
 *
 * Free mode (owner, 2026-10-11): `IS_FREE_MODE` is true on the website, so every signed-in student owns every
 * package. [IS_FREE_MODE] below MUST be kept equal to the website value. The app never shows a price or a
 * purchase button.
 *
 * Paid mode (activation codes, owner request 2026-10-13, plan step N9b): when [IS_FREE_MODE] is false a student owns
 * a package if it is free for registered students, or if the database has an enrollment, a verified order or an
 * access grant for them (read by [ActivationClient.fetchOwnedPackageIds], same sources as the website). A student
 * can add an enrollment by typing an activation code ([redeem]). Nothing in the app tells the student where or how
 * to pay: codes are sold outside the app.
 *
 * Offline or server trouble: the last answer is reused, else the static rule applies (never a crash, never a
 * silent lock-out because of a network error).
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object ContentAccess {
    private const val TAG = "ContentAccess"
    private const val CACHE_MS = 30_000L

    /** Mirror of `IS_FREE_MODE` in `website-reference/src/lib/ownership.ts`. */
    val IS_FREE_MODE: Boolean = true

    /** Texts copied from `data/content-availability.ts`. */
    const val COMING_SOON_TITLE = "Coming soon"
    const val COMING_SOON_BODY = "Materials for this section are not available yet. Check back soon."
    const val COMING_SOON_BUTTON = "Got it: check back later"
    const val PURCHASE_TITLE = "Package required"
    const val PURCHASE_BODY = "Unlock this pathway with the matching package to access study materials."
    const val PURCHASE_BUTTON = "Keep exploring"

    /** Activation code box texts (neutral on purpose: no price, no "buy", no payment instructions). */
    const val CODE_PROMPT = "Have an activation code?"
    const val CODE_HINT = "Enter your code"
    const val CODE_BUTTON = "Activate"
    const val CODE_SUCCESS = "Unlocked. You can open it now."

    /** `ALL_PACKAGES_ID` of `lib/access-grants.ts`: a grant that opens every package. */
    private const val ALL_PACKAGES_ID = "__all__"

    /** `FREE_FOR_REGISTERED_PACKAGE_IDS` of `lib/ownership.ts` (used only when free mode is off). */
    private val FREE_FOR_REGISTERED = setOf(
        "ece-y3-sem-1", "ece-y3-sem-2", "freshman",
        "grade-9", "grade-10", "grade-11", "grade-12",
        "entrance-questions"
    )

    private val HUB_IDS = setOf(
        "books", "short-notes", "references", "flashcards",
        "question-banks", "exams", "life-savers", "videos"
    )

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    private val http = OkHttpClient.Builder()
        .connectTimeout(6, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .callTimeout(10, TimeUnit.SECONDS)
        .build()

    private val cache = HashMap<String, Pair<Long, HubLockMode?>>()

    /** Packages the signed-in student owns (paid mode only), with the student and the time they were read. */
    private class Owned(val userId: String, val ids: Set<String>, val at: Long)

    @Volatile
    private var owned: Owned? = null

    /**
     * The access state of the course at [basePath] (a website route such as `/academy/freshman/physics`;
     * a trailing hub id is ignored). Reads the admin locks from Supabase (cached 30 s).
     */
    suspend fun resolve(basePath: String, signedIn: Boolean): CourseAccess {
        val base = normalize(basePath)
        val unlockIds = unlockPackageIds(base)
        val inferred = inferPackageAndScope(base, unlockIds)
        val keys = listOfNotNull(
            inferred.second?.let { "scope:$it" },
            inferred.first?.let { "package:$it" }
        )
        val dynamic = if (keys.isEmpty()) null else dynamicMode(keys)
        val mode = dynamic ?: staticLockMode(base)
        if (signedIn && !IS_FREE_MODE) refreshOwnership(false)
        return CourseAccess(mode, signedIn, ownsAny(signedIn, unlockIds), unlockIds)
    }

    /** Same as [resolve] without the network: the static rule only (used until the first answer arrives). */
    fun staticAccess(basePath: String, signedIn: Boolean): CourseAccess {
        val base = normalize(basePath)
        val unlockIds = unlockPackageIds(base)
        return CourseAccess(staticLockMode(base), signedIn, ownsAny(signedIn, unlockIds), unlockIds)
    }

    /** `isUnlocked(package)` of the plan: true when the hubs of the course at [basePath] may be opened now. */
    suspend fun isUnlocked(basePath: String, signedIn: Boolean): Boolean =
        resolve(basePath, signedIn).isUnlocked

    // ---------- ownership ----------

    /**
     * Does the student own one of [unlockIds]? Free mode: every signed-in student owns everything.
     * Paid mode: the free-for-registered packages, plus whatever the database says the student owns
     * (enrollment, verified order, access grant or an activation code), as last read by [refreshOwnership].
     */
    private fun ownsAny(signedIn: Boolean, unlockIds: List<String>): Boolean {
        if (!signedIn) return false
        if (IS_FREE_MODE) return true
        if (unlockIds.any { it in FREE_FOR_REGISTERED }) return true
        return ownsNow(unlockIds)
    }

    /** True when the last known purchases, grants or codes of the signed-in student cover one of [unlockIds]. */
    internal fun ownsNow(unlockIds: List<String>): Boolean {
        if (unlockIds.isEmpty()) return false
        val ids = currentOwned()
        return ALL_PACKAGES_ID in ids || unlockIds.any { it in ids }
    }

    private fun currentOwned(): Set<String> {
        val uid = AuthStateManager.currentUser.value?.id
        val snapshot = owned
        return if (uid != null && snapshot != null && snapshot.userId == uid) snapshot.ids else emptySet()
    }

    /** Reads what the student owns from Supabase (cached 30 s). Keeps the old answer if the read fails. */
    private suspend fun refreshOwnership(force: Boolean) {
        val uid = AuthStateManager.currentUser.value?.id ?: return
        val now = System.currentTimeMillis()
        val snapshot = owned
        if (!force && snapshot != null && snapshot.userId == uid && now - snapshot.at < CACHE_MS) return
        try {
            AuthStateManager.refreshIfNeeded()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "token refresh failed: ${e.javaClass.simpleName}")
        }
        val token = AuthStateManager.currentUser.value?.accessToken
        if (token.isNullOrBlank()) return
        val ids = ActivationClient.fetchOwnedPackageIds(token) ?: return
        owned = Owned(uid, ids, now)
    }

    /**
     * Activation code entry: sends [code] to the server with the student's own login. On success the new packages
     * count at once (the local answer is updated before the server is read again).
     */
    suspend fun redeem(code: String): RedeemResult {
        val uid = AuthStateManager.currentUser.value?.id
            ?: return RedeemResult.Failure("Please sign in first.", true)
        AuthStateManager.refreshIfNeeded()
        var token = AuthStateManager.currentUser.value?.accessToken
        if (token.isNullOrBlank()) {
            return RedeemResult.Failure("Your session expired. Please sign in again.", true)
        }
        var result = ActivationClient.redeem(code, token)
        val first = result
        if (first is RedeemResult.Failure && first.sessionExpired && AuthStateManager.refreshIfNeeded(force = true)) {
            token = AuthStateManager.currentUser.value?.accessToken
            if (!token.isNullOrBlank()) result = ActivationClient.redeem(code, token)
        }
        val done = result
        if (done is RedeemResult.Success) {
            owned = Owned(uid, currentOwned() + done.packageIds, System.currentTimeMillis())
            refreshOwnership(true)
        }
        return result
    }

    // ---------- static rules (website `data/content-availability.ts`) ----------

    /**
     * `getHubLockMode` of the website. One deliberate difference: a path the website rules do not know is
     * treated as Open here (the website says coming soon), so an unusual native path can never be blocked
     * by mistake; only GAT and Exit Exam are closed by the static rule.
     */
    internal fun staticLockMode(base: String): HubLockMode {
        if (base.contains("/academy/gat") || base.contains("/academy/exit-exam")) return HubLockMode.ComingSoon
        val known = base.contains("/academy/grades/") ||
            base.contains("/academy/entrance-questions") ||
            base.contains("/academy/freshman") ||
            base.contains("/academy/uat") ||
            base.contains("/academy/coc") ||
            base.contains("/academy/remedial") ||
            base.contains("/special-packages")
        return if (known) HubLockMode.RequirePurchase else HubLockMode.Open
    }

    /** `unlockPackageIdsForPath` of the website. */
    internal fun unlockPackageIds(base: String): List<String> = when {
        base.contains("/academy/freshman") -> listOf("freshman")
        base.contains("/academy/grades/9") -> listOf("grade-9")
        base.contains("/academy/grades/10") -> listOf("grade-10")
        base.contains("/academy/grades/11") -> listOf("grade-11")
        base.contains("/academy/grades/12") -> listOf("grade-12")
        base.contains("/academy/entrance-questions") -> listOf("entrance-questions")
        base.contains("/academy/uat") -> listOf("uat")
        base.contains("/academy/coc") -> listOf("coc")
        base.contains("/academy/remedial") -> listOf("remedial")
        base.contains("/special-packages/electrical-computer-engineering") ||
            base.contains("/special-packages/ece") -> listOf("ece-y3-sem-1", "ece-y3-sem-2")
        else -> emptyList()
    }

    private val RE_FRESHMAN = Regex("/academy/freshman/([^/]+)")
    private val RE_GRADE = Regex("/academy/grades/(9|10|11|12)/([^/]+)")
    private val RE_REMEDIAL = Regex("/academy/remedial/([^/]+)")
    private val RE_ECE = Regex("/special-packages/(?:electrical-computer-engineering|ece)/(sem-[12])/([^/]+)")

    /** `inferPackageAndScope` of `components/ResourceHubGrid.tsx`: (package id, lock scope path). */
    private fun inferPackageAndScope(base: String, unlockIds: List<String>): Pair<String?, String?> {
        var pkg: String? = unlockIds.firstOrNull()
        var scope: String? = null

        val fresh = RE_FRESHMAN.find(base)
        if (fresh != null) {
            if (pkg == null) pkg = "freshman"
            scope = "freshman/${fresh.groupValues[1]}"
        }
        val grade = RE_GRADE.find(base)
        if (grade != null) {
            if (pkg == null) pkg = "grade-${grade.groupValues[1]}"
            scope = "grade/${grade.groupValues[1]}/${grade.groupValues[2]}"
        }
        val rem = RE_REMEDIAL.find(base)
        if (rem != null) {
            if (pkg == null) pkg = "remedial"
            scope = "remedial/${rem.groupValues[1]}"
        }
        val ece = RE_ECE.find(base)
        if (ece != null) {
            if (pkg == null) pkg = if (ece.groupValues[1] == "sem-1") "ece-y3-sem-1" else "ece-y3-sem-2"
            scope = "ece/${ece.groupValues[1]}/${ece.groupValues[2]}"
        }
        for (root in listOf("coc", "uat", "gat", "exit-exam")) {
            if (base.endsWith("/academy/$root")) {
                if (pkg == null) pkg = root
                if (scope == null) scope = root
            }
        }
        return Pair(pkg, scope)
    }

    /** Route without scheme/host/query, without a trailing slash and without a trailing hub id. */
    private fun normalize(basePath: String): String {
        var base = basePath.trim()
        val schemeEnd = base.indexOf("://")
        if (schemeEnd >= 0) {
            val slash = base.indexOf('/', schemeEnd + 3)
            base = if (slash >= 0) base.substring(slash) else "/"
        }
        base = base.substringBefore('?').substringBefore('#').trimEnd('/')
        if (base.substringAfterLast('/') in HUB_IDS) base = base.substringBeforeLast('/')
        return if (base.isEmpty()) "/academy" else base
    }

    // ---------- admin locks (`public.content_locks`) ----------

    /** First known lock found for [keys] in priority order, or null when no row exists / nothing could be read. */
    private suspend fun dynamicMode(keys: List<String>): HubLockMode? = withContext(Dispatchers.IO) {
        val cacheKey = keys.joinToString("|")
        val now = System.currentTimeMillis()
        val hit = synchronized(cache) { cache[cacheKey] }
        if (hit != null && now - hit.first < CACHE_MS) return@withContext hit.second
        try {
            val modes = fetchModes(keys)
            var found: HubLockMode? = null
            for (k in keys) {
                val m = modes[k]
                if (m != null) {
                    found = m
                    break
                }
            }
            synchronized(cache) { cache[cacheKey] = Pair(now, found) }
            found
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "locks read failed: ${e.javaClass.simpleName}")
            hit?.second
        }
    }

    private fun fetchModes(keys: List<String>): Map<String, HubLockMode> {
        val inList = keys.joinToString(",", prefix = "in.(", postfix = ")") { "\"$it\"" }
        val url = "$supabaseUrl/rest/v1/content_locks".toHttpUrl().newBuilder()
            .addQueryParameter("select", "lock_key,mode")
            .addQueryParameter("lock_key", inList)
            .build().toString()
        val request = Request.Builder()
            .url(url)
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $anonKey")
            .addHeader("Accept", "application/json")
            .get()
            .build()
        val text = http.newCall(request).execute().use { resp ->
            val body = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IllegalStateException("HTTP ${resp.code}")
            body
        }
        val rows = JSONArray(text)
        val out = HashMap<String, HubLockMode>()
        for (i in 0 until rows.length()) {
            val row = rows.optJSONObject(i) ?: continue
            val mode = parseMode(row.optString("mode")) ?: continue
            out[row.optString("lock_key")] = mode
        }
        return out
    }

    /** `toHubLockMode` of the website: the internal mode `locked` shows as coming soon. */
    private fun parseMode(raw: String): HubLockMode? = when (raw) {
        "open" -> HubLockMode.Open
        "require_purchase" -> HubLockMode.RequirePurchase
        "coming_soon", "locked" -> HubLockMode.ComingSoon
        else -> null
    }
}
