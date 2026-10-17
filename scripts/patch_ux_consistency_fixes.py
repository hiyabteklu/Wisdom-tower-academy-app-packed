#!/usr/bin/env python3
"""UX consistency fixes (owner report 2026-10-17), all in one patch:

 1. Learning > Curriculum: the ECE card used the Semester 1 package (title + ece-sem-1.jpg) for the whole year.
    It now uses the same picture and title as the Home ECE card (ECE_TRACK_COVER_ASSET / ECE_TRACK_TITLE,
    new file ui/packages/EceTrackCover.kt). Packages tab and the semester chooser are unchanged.
 2. "Sign in" pill (new file ui/auth/SignInPill.kt) next to every signed-out "Sign in to ..." message that had
    no way to sign in: hub list ("Sign in to open"), Study Status, Settings > My Subjects, Competitions,
    Settings (sync and change-password messages). MainActivity registers SignInNavigator.open =
    handleGlobalNav("/login") (same route the Home and Learning Sign In buttons use).
 3. Password errors: SupabaseAccountClient.passwordFailure tested "password should be" BEFORE the same-password
    case, and Supabase's text "New password should be different from the old password" contains that phrase, so
    re-using the old password showed "must be at least 6 characters". The same-password case now comes first
    with its own accurate message; the length message only appears for a real length failure; any other weak-
    password failure says it is too weak. ForgotPasswordScreen local messages now match the Settings wording.

Safe to run twice (marker UX-CONSISTENCY-2026-10-17). Changes NOTHING if any anchor is missing or not unique.
"""
import sys
from pathlib import Path

ROOT = Path("app/src/main/java/com/wisdomtower/academy")
MARK = "UX-CONSISTENCY-2026-10-17"
PKG = "com.wisdomtower.academy"

EDITS = []  # (file, anchor, replacement)

# ---- 1. ECE cover in Learning
EDITS.append((
    "ui/learning/LearningScreen.kt",
    "                OpenCard(pkg.name, pkg.assetImage) { onSelectCourse(pkg) }\n",
    "                // " + MARK + ": the ECE card stands for the whole year, so it uses the Home picture and title\n"
    "                val isEceTrack = pkg.id.startsWith(\"ece\")\n"
    "                OpenCard(\n"
    "                    if (isEceTrack) " + PKG + ".ui.packages.ECE_TRACK_TITLE else pkg.name,\n"
    "                    if (isEceTrack) " + PKG + ".ui.packages.ECE_TRACK_COVER_ASSET else pkg.assetImage\n"
    "                ) { onSelectCourse(pkg) }\n",
))

# ---- 2. Sign in pills
EDITS.append((
    "MainActivity.kt",
    "                // Native Study Workspace (6 Learning Hubs Depth)\n",
    "                // " + MARK + ": every \"Sign in to ...\" pill opens the Account tab (native sign-in)\n"
    "                androidx.compose.runtime.SideEffect {\n"
    "                    " + PKG + ".ui.auth.SignInNavigator.open = { handleGlobalNav(\"/login\") }\n"
    "                }\n\n"
    "                // Native Study Workspace (6 Learning Hubs Depth)\n",
))
EDITS.append((
    "ui/study/HubItemListScreen.kt",
    "                !loggedIn -> item(key = \"hub_list_signin\") {\n"
    "                    MessageCard(\n"
    "                        title = \"Sign in to open\",\n"
    "                        message = \"Create a free account to unlock books, notes, questions, and exams. \" +\n"
    "                            \"No payment required for registered students.\",\n"
    "                        onRetry = null\n"
    "                    )\n"
    "                }\n",
    "                !loggedIn -> item(key = \"hub_list_signin\") {\n"
    "                    Column(horizontalAlignment = Alignment.CenterHorizontally) { // " + MARK + "\n"
    "                        MessageCard(\n"
    "                            title = \"Sign in to open\",\n"
    "                            message = \"Create a free account to unlock books, notes, questions, and exams. \" +\n"
    "                                \"No payment required for registered students.\",\n"
    "                            onRetry = null\n"
    "                        )\n"
    "                        " + PKG + ".ui.auth.SignInPill(modifier = Modifier.padding(top = 14.dp))\n"
    "                    }\n"
    "                }\n",
))
EDITS.append((
    "ui/study/NativeStatusScreen.kt",
    "                        \"Sign in or create an account to sync your study notes, targets, and course progress.\",\n"
    "                        fontSize = 13.sp,\n"
    "                        color = StSlate300,\n"
    "                        lineHeight = 19.sp\n"
    "                    )\n"
    "                }\n"
    "            } else if (loading) {\n",
    "                        \"Sign in or create an account to sync your study notes, targets, and course progress.\",\n"
    "                        fontSize = 13.sp,\n"
    "                        color = StSlate300,\n"
    "                        lineHeight = 19.sp\n"
    "                    )\n"
    "                    " + PKG + ".ui.auth.SignInPill() // " + MARK + "\n"
    "                }\n"
    "            } else if (loading) {\n",
))
EDITS.append((
    "ui/settings/MySubjectsSection.kt",
    "                        Text(\"Sign in to choose your subjects.\", fontSize = 12.sp, color = WisdomMuted)\n",
    "                        Text(\"Sign in to choose your subjects.\", fontSize = 12.sp, color = WisdomMuted)\n"
    "                        " + PKG + ".ui.auth.SignInPill() // " + MARK + "\n",
))
EDITS.append((
    "ui/competition/CompetitionsHubScreen.kt",
    "                Text(\n"
    "                    text = errorText ?: \"No competitions right now.\",\n"
    "                    color = MutedText,\n"
    "                    fontSize = 14.sp\n"
    "                )\n",
    "                Column(horizontalAlignment = Alignment.CenterHorizontally) { // " + MARK + "\n"
    "                    Text(\n"
    "                        text = errorText ?: \"No competitions right now.\",\n"
    "                        color = MutedText,\n"
    "                        fontSize = 14.sp\n"
    "                    )\n"
    "                    " + PKG + ".ui.auth.SignedOutSignInPill(topPadding = 14.dp)\n"
    "                }\n",
))
EDITS.append((
    "ui/settings/SettingsScreen.kt",
    "                                Text(text = passwordError.orEmpty(), fontSize = 11.5.sp, color = WisdomAccentRose, fontWeight = FontWeight.SemiBold)\n"
    "                            }\n"
    "                        }\n",
    "                                Text(text = passwordError.orEmpty(), fontSize = 11.5.sp, color = WisdomAccentRose, fontWeight = FontWeight.SemiBold)\n"
    "                            }\n"
    "                            " + PKG + ".ui.auth.SignedOutSignInPill() // " + MARK + "\n"
    "                        }\n",
))
EDITS.append((
    "ui/settings/SettingsScreen.kt",
    "                                    Text(text = syncMessage.orEmpty(), fontSize = 11.5.sp, color = tone, fontWeight = FontWeight.SemiBold)\n"
    "                                }\n"
    "                            }\n"
    "                        }\n",
    "                                    Text(text = syncMessage.orEmpty(), fontSize = 11.5.sp, color = tone, fontWeight = FontWeight.SemiBold)\n"
    "                                }\n"
    "                            }\n"
    "                            " + PKG + ".ui.auth.SignedOutSignInPill() // " + MARK + "\n"
    "                        }\n",
))

# ---- 3. Password messages
EDITS.append((
    "data/auth/SupabaseAccountClient.kt",
    "            code == \"weak_password\" || msg.contains(\"password should be\") ->\n"
    "                AccountCallResult.Failure(\"Password must be at least 6 characters.\")\n"
    "\n"
    "            code == \"same_password\" || msg.contains(\"different from the old password\") ->\n"
    "                AccountCallResult.Failure(\"New password should be different from the old password.\")\n",
    "            // " + MARK + ": the same-password case MUST be tested first. Supabase words it \"New password should be\n"
    "            // different from the old password\", which also contains \"password should be\".\n"
    "            code == \"same_password\" || msg.contains(\"different from the old password\") ||\n"
    "                msg.contains(\"same as the old password\") ->\n"
    "                AccountCallResult.Failure(\"Your new password can't be the same as your old password. Please choose a different one.\")\n"
    "\n"
    "            (code == \"weak_password\" || msg.contains(\"password should be\")) &&\n"
    "                (msg.contains(\"at least\") || msg.contains(\"characters\")) ->\n"
    "                AccountCallResult.Failure(\"Password must be at least 6 characters.\")\n"
    "\n"
    "            code == \"weak_password\" || msg.contains(\"password should be\") ->\n"
    "                AccountCallResult.Failure(\"That password is too weak or too easy to guess. Please choose a stronger one.\")\n",
))
EDITS.append((
    "ui/auth/ForgotPasswordScreen.kt",
    "            error = \"Password must be at least 6 characters\"\n",
    "            error = \"Password must be at least 6 characters.\" // " + MARK + ": same wording as Settings\n",
))
EDITS.append((
    "ui/auth/ForgotPasswordScreen.kt",
    "            error = \"Passwords do not match\"\n",
    "            error = \"Passwords do not match. Please re-enter.\"\n",
))

NEW_FILES = ["ui/auth/SignInPill.kt", "ui/packages/EceTrackCover.kt"]


def main() -> int:
    for rel in NEW_FILES:
        if not (ROOT / rel).exists():
            print(f"ERROR: new file {rel} is missing (push it before running this patch)")
            return 1
    texts = {}
    for rel, anchor, new in EDITS:
        p = ROOT / rel
        if rel not in texts:
            if not p.exists():
                print(f"ERROR: {rel} not found; nothing changed")
                return 1
            texts[rel] = p.read_text(encoding="utf-8")
    if all(MARK in t for t in texts.values()):
        print("already patched, nothing to do")
        return 0
    for rel, anchor, new in EDITS:
        n = texts[rel].count(anchor)
        if n != 1:
            print(f"ERROR: anchor in {rel} found {n} times (need exactly 1); nothing changed:\n{anchor[:160]}")
            return 1
    for rel, anchor, new in EDITS:
        texts[rel] = texts[rel].replace(anchor, new)
    for rel, text in texts.items():
        (ROOT / rel).write_text(text, encoding="utf-8")
    print(f"patched {len(texts)} files, {len(EDITS)} edits")
    return 0


if __name__ == "__main__":
    sys.exit(main())
