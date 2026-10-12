package com.wisdomtower.academy.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.BrandLogo
import com.wisdomtower.academy.data.auth.AuthFailureKind
import com.wisdomtower.academy.data.auth.SupabaseAuthClient
import com.wisdomtower.academy.data.auth.SupabaseAuthResult
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import kotlinx.coroutines.launch

/**
 * Native copy of the website login page (website-reference/src/app/login/page.tsx).
 * Texts, field order and colours follow that page. This screen only collects input and calls
 * [SupabaseAuthClient]; storing the session and telling the WebView is done by the caller
 * through [onSuccess] (S2c / S2d in STATUS.md).
 *
 * "Forgot password?" now opens the native [ForgotPasswordScreen] inside this screen (N13, session
 * log BB), so the caller needs no change. [onForgotPassword] is kept only so existing callers still
 * compile; it is no longer called.
 *
 * STATUS: written, NOT yet compiled or tested on a device.
 */
enum class AuthMode { SIGN_IN, SIGN_UP }

// Same list as ACADEMIC_LEVEL_OPTIONS in website-reference/src/lib/academic-levels.ts
private val ACADEMIC_LEVEL_OPTIONS = listOf(
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Remedial",
    "Freshman",
    "3rd Year (ECE)",
    "Other"
)

private val Slate200 = Color(0xFFE2E8F0)
private val Slate300 = Color(0xFFCBD5E1)
private val Slate400 = Color(0xFF94A3B8)
private val CyanLight = Color(0xFF67E8F9)
private val FieldBackground = Color(0xE6020617)
private val FieldBorder = Color(0x33FFFFFF)

private class AuthNotice(
    val text: String,
    val actionLabel: String? = null,
    val onAction: (() -> Unit)? = null
)

private class LinkSpec(val label: String, val action: () -> Unit)

@Composable
fun NativeSignInScreen(
    onSuccess: (SupabaseAuthResult.Success) -> Unit,
    modifier: Modifier = Modifier,
    initialMode: AuthMode = AuthMode.SIGN_IN,
    initialIdentifier: String = "",
    onForgotPassword: () -> Unit = {},
    onOpenTerms: () -> Unit = {},
    onOpenPrivacy: () -> Unit = {},
    onClose: (() -> Unit)? = null
) {
    var mode by remember { mutableStateOf(initialMode) }
    var identifier by remember { mutableStateOf(initialIdentifier) }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var educationLevel by remember { mutableStateOf("Freshman") }
    var customLevel by remember { mutableStateOf("") }
    var levelPickerOpen by remember { mutableStateOf(false) }
    var showPassword by remember { mutableStateOf(false) }
    var agreedToTerms by remember { mutableStateOf(true) }
    var loading by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf<AuthNotice?>(null) }
    var showReset by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()
    val focus = LocalFocusManager.current

    fun switchMode(target: AuthMode) {
        mode = target
        notice = null
        levelPickerOpen = false
    }

    fun submit() {
        if (loading) return
        notice = null
        val id = identifier.trim()
        if (id.isEmpty()) {
            notice = AuthNotice("Please enter your email or phone number.")
            return
        }

        if (mode == AuthMode.SIGN_IN) {
            if (password.isEmpty()) {
                notice = AuthNotice("Please enter your password.")
                return
            }
            focus.clearFocus()
            loading = true
            scope.launch {
                when (val result = SupabaseAuthClient.signIn(id, password)) {
                    is SupabaseAuthResult.Success -> onSuccess(result)
                    is SupabaseAuthResult.Failure -> {
                        loading = false
                        notice = AuthNotice(result.message)
                    }
                }
            }
            return
        }

        // Create Account
        if (fullName.trim().isEmpty()) {
            notice = AuthNotice("Please enter your full legal name.")
            return
        }
        if (password.length < 6) {
            notice = AuthNotice("Password must be at least 6 characters.")
            return
        }
        if (password != confirmPassword) {
            notice = AuthNotice("Passwords do not match.")
            return
        }
        if (!agreedToTerms) {
            notice = AuthNotice("Please accept the Terms of Service to continue.")
            return
        }
        val finalLevel =
            if (educationLevel == "Other") customLevel.trim().ifEmpty { "Other" } else educationLevel
        focus.clearFocus()
        loading = true
        scope.launch {
            when (val result = SupabaseAuthClient.signUp(fullName.trim(), id, password, finalLevel)) {
                is SupabaseAuthResult.Success -> onSuccess(result)
                is SupabaseAuthResult.Failure -> {
                    loading = false
                    when (result.kind) {
                        AuthFailureKind.USER_EXISTS -> {
                            mode = AuthMode.SIGN_IN
                            notice = AuthNotice(
                                "An account with this email or phone already exists. Please enter your password to sign in."
                            )
                        }
                        AuthFailureKind.CONFIRM_EMAIL_SENT -> {
                            mode = AuthMode.SIGN_IN
                            notice = AuthNotice(result.message)
                        }
                        else -> notice = AuthNotice(result.message)
                    }
                }
            }
        }
    }

    // Native password reset (N13): shown instead of the form until the student goes back.
    if (showReset) {
        ForgotPasswordScreen(
            initialEmail = identifier.trim().takeIf { SupabaseAuthClient.looksLikeEmail(it) }.orEmpty(),
            onBackToSignIn = { showReset = false },
            onPasswordChanged = { changedEmail ->
                if (changedEmail.isNotEmpty()) identifier = changedEmail
                password = ""
                mode = AuthMode.SIGN_IN
                notice = AuthNotice("Your password has been successfully changed.")
                showReset = false
            },
            modifier = modifier,
            onClose = onClose
        )
        return
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header branding
            BrandLogo(size = 60.dp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Wisdom Tower Academy",
                color = Color.White,
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Auth card
            val cardShape = RoundedCornerShape(24.dp)
            Box(
                modifier = Modifier
                    .widthIn(max = 448.dp)
                    .fillMaxWidth()
                    .clip(cardShape)
                    .border(BorderStroke(1.dp, Color(0x33FFFFFF)), cardShape)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFF131F38), Color(0xFF0E172A), Color(0xFF0A101D))
                        )
                    )
            ) {
                // Top radiant highlight
                Box(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .fillMaxWidth()
                        .height(4.dp)
                        .background(
                            Brush.horizontalGradient(
                                listOf(WisdomCyan, Color(0xFF7DD3FC), WisdomCyan)
                            )
                        )
                )

                Column(modifier = Modifier.padding(start = 24.dp, end = 24.dp, top = 28.dp, bottom = 20.dp)) {
                    // Mode tabs
                    val tabsShape = RoundedCornerShape(16.dp)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(tabsShape)
                            .border(BorderStroke(1.dp, Color(0x26FFFFFF)), tabsShape)
                            .background(Color(0xCC020617))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        ModeTab(
                            label = "Sign In",
                            selected = mode == AuthMode.SIGN_IN,
                            onClick = { switchMode(AuthMode.SIGN_IN) },
                            modifier = Modifier.weight(1f)
                        )
                        ModeTab(
                            label = "Create Account",
                            selected = mode == AuthMode.SIGN_UP,
                            onClick = { switchMode(AuthMode.SIGN_UP) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Spacer(modifier = Modifier.height(24.dp))

                    // Full legal name (sign up only)
                    if (mode == AuthMode.SIGN_UP) {
                        AuthField(
                            label = "Full Legal Name",
                            value = fullName,
                            onValueChange = { fullName = it },
                            placeholder = "e.g. Abebe Bikila",
                            leadingIcon = Icons.Filled.School
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Email or phone
                    AuthField(
                        label = "Email or Phone Number",
                        value = identifier,
                        onValueChange = { identifier = it },
                        placeholder = "name@email.com or 09xxxxxxxx",
                        leadingIcon = if (identifier.contains("@")) Icons.Filled.Email else Icons.Filled.Phone,
                        keyboardType = KeyboardType.Email
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Academic level (sign up only)
                    if (mode == AuthMode.SIGN_UP) {
                        Text(
                            text = "ACADEMIC LEVEL",
                            color = Slate200,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        val pickerShape = RoundedCornerShape(12.dp)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(pickerShape)
                                .border(BorderStroke(1.dp, FieldBorder), pickerShape)
                                .background(FieldBackground)
                                .clickable { levelPickerOpen = !levelPickerOpen }
                                .padding(horizontal = 14.dp, vertical = 16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Filled.School,
                                contentDescription = null,
                                tint = Slate400,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = educationLevel,
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.weight(1f)
                            )
                            Icon(
                                imageVector = Icons.Filled.KeyboardArrowDown,
                                contentDescription = null,
                                tint = if (levelPickerOpen) CyanLight else Slate400,
                                modifier = Modifier
                                    .size(20.dp)
                                    .rotate(if (levelPickerOpen) 180f else 0f)
                            )
                        }
                        if (levelPickerOpen) {
                            Spacer(modifier = Modifier.height(6.dp))
                            val listShape = RoundedCornerShape(16.dp)
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(listShape)
                                    .border(BorderStroke(1.dp, Color(0x33FFFFFF)), listShape)
                                    .background(Color(0xFF0C1527))
                                    .padding(vertical = 6.dp)
                            ) {
                                ACADEMIC_LEVEL_OPTIONS.forEach { option ->
                                    val isSelected = option == educationLevel
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(if (isSelected) Color(0x3306B6D4) else Color.Transparent)
                                            .clickable {
                                                educationLevel = option
                                                levelPickerOpen = false
                                            }
                                            .padding(horizontal = 16.dp, vertical = 12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = option,
                                            color = if (isSelected) CyanLight else Slate200,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Medium,
                                            modifier = Modifier.weight(1f)
                                        )
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Filled.Check,
                                                contentDescription = null,
                                                tint = CyanLight,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))

                        if (educationLevel == "Other") {
                            AuthField(
                                label = "Specify your academic level",
                                value = customLevel,
                                onValueChange = { customLevel = it },
                                placeholder = "e.g. Master's, College Diploma, Self-learner...",
                                leadingIcon = Icons.Filled.School
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }

                    // Password
                    AuthField(
                        label = "Password",
                        value = password,
                        onValueChange = { password = it },
                        placeholder = "••••••••",
                        leadingIcon = Icons.Filled.Lock,
                        keyboardType = KeyboardType.Password,
                        imeAction = if (mode == AuthMode.SIGN_IN) ImeAction.Done else ImeAction.Next,
                        onImeAction = { submit() },
                        isPassword = true,
                        showPassword = showPassword,
                        onTogglePassword = { showPassword = !showPassword },
                        labelTrailing = if (mode == AuthMode.SIGN_IN) {
                            {
                                Text(
                                    text = "Forgot password?",
                                    color = Slate400,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.clickable { showReset = true }
                                )
                            }
                        } else null
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Confirm password + terms (sign up only)
                    if (mode == AuthMode.SIGN_UP) {
                        AuthField(
                            label = "Confirm Password",
                            value = confirmPassword,
                            onValueChange = { confirmPassword = it },
                            placeholder = "••••••••",
                            leadingIcon = Icons.Filled.Lock,
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done,
                            onImeAction = { submit() },
                            isPassword = true,
                            showPassword = showPassword
                        )
                        Spacer(modifier = Modifier.height(16.dp))

                        val termsShape = RoundedCornerShape(12.dp)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(termsShape)
                                .border(BorderStroke(1.dp, Color(0x1AFFFFFF)), termsShape)
                                .background(Color(0x05FFFFFF))
                                .padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = agreedToTerms,
                                onCheckedChange = { agreedToTerms = it },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = WisdomCyan,
                                    uncheckedColor = Slate400,
                                    checkmarkColor = WisdomDarkOnCyan
                                )
                            )
                            TappableText(
                                text = "I agree to the Terms of Service and Privacy Policy.",
                                links = listOf(
                                    LinkSpec("Terms of Service") { onOpenTerms() },
                                    LinkSpec("Privacy Policy") { onOpenPrivacy() }
                                ),
                                baseColor = Slate300,
                                fontSize = 12.sp,
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(end = 8.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Notice box
                    notice?.let { n ->
                        val noticeShape = RoundedCornerShape(12.dp)
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(noticeShape)
                                .border(BorderStroke(1.dp, Color(0x1AFFFFFF)), noticeShape)
                                .background(Color(0xCC0F172A))
                                .padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = n.text,
                                color = Slate300,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                            if (n.actionLabel != null && n.onAction != null) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = n.actionLabel + " →",
                                    color = WisdomCyan,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    textDecoration = TextDecoration.Underline,
                                    modifier = Modifier.clickable { n.onAction.invoke() }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Submit button
                    val submitEnabled = !loading && !(mode == AuthMode.SIGN_UP && !agreedToTerms)
                    val buttonShape = RoundedCornerShape(12.dp)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(buttonShape)
                            .background(if (submitEnabled) WisdomCyan else WisdomCyan.copy(alpha = 0.5f))
                            .clickable(enabled = submitEnabled) { submit() }
                            .padding(horizontal = 24.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (loading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = WisdomDarkOnCyan
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (mode == AuthMode.SIGN_IN) "Signing In..." else "Creating Account...",
                                color = WisdomDarkOnCyan,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        } else {
                            Text(
                                text = if (mode == AuthMode.SIGN_IN) "Sign In" else "Create Account",
                                color = WisdomDarkOnCyan,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = WisdomDarkOnCyan,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    // Footer: switch mode
                    Spacer(modifier = Modifier.height(20.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(Color(0x1AFFFFFF))
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    if (mode == AuthMode.SIGN_IN) {
                        TappableText(
                            text = "Don't have an account? Create a free account",
                            links = listOf(LinkSpec("Create a free account") { switchMode(AuthMode.SIGN_UP) }),
                            baseColor = Slate400,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    } else {
                        TappableText(
                            text = "Already have an account? Sign in",
                            links = listOf(LinkSpec("Sign in") { switchMode(AuthMode.SIGN_IN) }),
                            baseColor = Slate400,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }

        if (onClose != null) {
            IconButton(
                onClick = onClose,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .statusBarsPadding()
                    .padding(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Close,
                    contentDescription = "Close",
                    tint = Slate300
                )
            }
        }
    }
}

@Composable
private fun ModeTab(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(12.dp)
    Box(
        modifier = modifier
            .clip(shape)
            .background(if (selected) Color(0x26FFFFFF) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (selected) Color.White else Slate400,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

/** `internal` (was private) so [ForgotPasswordScreen] in the same package reuses the same field look. */
@Composable
internal fun AuthField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    leadingIcon: ImageVector,
    modifier: Modifier = Modifier,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Next,
    onImeAction: () -> Unit = {},
    isPassword: Boolean = false,
    showPassword: Boolean = false,
    onTogglePassword: (() -> Unit)? = null,
    labelTrailing: (@Composable () -> Unit)? = null
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label.uppercase(),
                color = Slate200,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.8.sp
            )
            labelTrailing?.invoke()
        }
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            placeholder = { Text(text = placeholder, fontSize = 14.sp) },
            leadingIcon = {
                Icon(
                    imageVector = leadingIcon,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
            },
            trailingIcon = if (isPassword && onTogglePassword != null) {
                {
                    IconButton(onClick = onTogglePassword) {
                        Icon(
                            imageVector = if (showPassword) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            contentDescription = if (showPassword) "Hide password" else "Show password",
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            } else null,
            visualTransformation = if (isPassword && !showPassword) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = imeAction),
            keyboardActions = KeyboardActions(onDone = { onImeAction() }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedContainerColor = FieldBackground,
                unfocusedContainerColor = FieldBackground,
                focusedBorderColor = WisdomCyan,
                unfocusedBorderColor = FieldBorder,
                cursorColor = WisdomCyan,
                focusedLeadingIconColor = Slate400,
                unfocusedLeadingIconColor = Slate400,
                focusedTrailingIconColor = Slate400,
                unfocusedTrailingIconColor = Slate400,
                focusedPlaceholderColor = Slate400,
                unfocusedPlaceholderColor = Slate400
            )
        )
    }
}

/**
 * Plain text where the given labels are cyan, underlined and tappable. Uses only stable APIs
 * (tap position -> text offset) so it does not depend on the Compose version.
 */
@Composable
private fun TappableText(
    text: String,
    links: List<LinkSpec>,
    baseColor: Color,
    modifier: Modifier = Modifier,
    fontSize: TextUnit = 12.sp,
    textAlign: TextAlign = TextAlign.Start
) {
    var layout by remember { mutableStateOf<TextLayoutResult?>(null) }
    val currentLinks by rememberUpdatedState(links)
    val annotated = buildAnnotatedString {
        append(text)
        links.forEach { link ->
            val start = text.indexOf(link.label)
            if (start >= 0) {
                addStyle(
                    SpanStyle(
                        color = WisdomCyan,
                        fontWeight = FontWeight.SemiBold,
                        textDecoration = TextDecoration.Underline
                    ),
                    start,
                    start + link.label.length
                )
            }
        }
    }
    Text(
        text = annotated,
        color = baseColor,
        fontSize = fontSize,
        textAlign = textAlign,
        onTextLayout = { layout = it },
        modifier = modifier.pointerInput(text) {
            detectTapGestures { position ->
                val result = layout ?: return@detectTapGestures
                val offset = result.getOffsetForPosition(position)
                currentLinks.firstOrNull { link ->
                    val start = text.indexOf(link.label)
                    start >= 0 && offset >= start && offset < start + link.label.length
                }?.action?.invoke()
            }
        }
    )
}
