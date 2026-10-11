package com.wisdomtower.academy.data.auth

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Keeps the full Supabase session JSON (it contains the access and refresh tokens) encrypted with
 * an AES-GCM key that lives in the Android Keystore. The key never leaves the device's secure
 * hardware/keystore, so the tokens are NOT readable in plain text from app storage.
 *
 * No extra library needed (uses only android.security.keystore + javax.crypto).
 * If anything fails, [save] returns false and [load] returns null: the student is then simply asked
 * to sign in again. Tokens are NEVER logged and NEVER written in plain text as a fallback.
 *
 * STATUS: written, NOT yet compiled or tested on a device.
 */
object SecureSessionStore {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "wt_academy_session_key_v1"
    private const val PREFS_NAME = "wt_academy_secure_session"
    private const val PREF_BLOB = "session_blob"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val IV_BYTES = 12
    private const val TAG_BITS = 128

    private fun secretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        val existing = keyStore.getKey(KEY_ALIAS, null)
        if (existing is SecretKey) return existing
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        generator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return generator.generateKey()
    }

    fun save(context: Context, sessionJson: String): Boolean {
        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey())
            val encrypted = cipher.doFinal(sessionJson.toByteArray(Charsets.UTF_8))
            val packed = Base64.encodeToString(cipher.iv + encrypted, Base64.NO_WRAP)
            context.applicationContext
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(PREF_BLOB, packed)
                .apply()
            true
        } catch (_: Exception) {
            false
        }
    }

    fun load(context: Context): String? {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val packed = prefs.getString(PREF_BLOB, null) ?: return null
        return try {
            val bytes = Base64.decode(packed, Base64.NO_WRAP)
            if (bytes.size <= IV_BYTES) return null
            val iv = bytes.copyOfRange(0, IV_BYTES)
            val body = bytes.copyOfRange(IV_BYTES, bytes.size)
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, secretKey(), GCMParameterSpec(TAG_BITS, iv))
            String(cipher.doFinal(body), Charsets.UTF_8)
        } catch (_: Exception) {
            // Unreadable (for example the keystore key was reset): forget it, ask for sign-in again.
            prefs.edit().remove(PREF_BLOB).apply()
            null
        }
    }

    fun clear(context: Context) {
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(PREF_BLOB)
            .apply()
    }
}
