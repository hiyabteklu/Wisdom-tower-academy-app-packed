#!/usr/bin/env python3
"""S5 (docs/PLAY_STORE_UI_PLAN.md): one Sign in look.

Home, the Learning guest banner and Notifications each had their own sign-in button style. They now use the shared
cyan pill `SignInPill` (ui/auth/SignInPill.kt). Pure refactor: same texts, same targets (Home "Sign in", Learning
"Sign In", Notifications "Sign In to Account"), the Sign Up / Create Account buttons stay as they are.
  - ui/home/HomeScreen.kt                    : amber outlined "Sign in" button -> SignInPill
  - ui/learning/LearningScreen.kt            : white "Sign In" pill -> SignInPill; "Create Account" keeps its glass look
                                               and gets side padding (it no longer shares the row width by weight)
  - ui/notifications/NotificationsScreen.kt  : sky-blue "Sign In to Account" box -> SignInPill
Safe to run twice (marker S5-signin). If any anchor is not found exactly once, NOTHING is written.
"""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy")
MARK = "S5-signin"
IMPORT = "import com.wisdomtower.academy.ui.auth.SignInPill\n"
errors = []


def swap(src, name, old, new):
    n = src.count(old)
    if n != 1:
        errors.append(f"{name}: anchor found {n} times (need exactly 1)")
        return src
    return src.replace(old, new)


def load(rel):
    p = BASE / rel
    return p, p.read_text(encoding="utf-8")


home_p, home = load("ui/home/HomeScreen.kt")
learn_p, learn = load("ui/learning/LearningScreen.kt")
notif_p, notif = load("ui/notifications/NotificationsScreen.kt")

if MARK in home and MARK in learn and MARK in notif:
    print("already patched, nothing to do")
    sys.exit(0)

# ---- Home -------------------------------------------------------------------------------------------------------
if MARK not in home:
    old = (
        "            WisdomSecondaryButton(\n"
        "                text = \"Sign in\",\n"
        "                onClick = onSignIn,\n"
        "                borderColor = WisdomAccentAmber.copy(alpha = 0.45f),\n"
        "                textColor = WisdomAccentAmber,\n"
        "                icon = {\n"
        "                    Icon(\n"
        "                        imageVector = Icons.AutoMirrored.Filled.Login,\n"
        "                        contentDescription = null,\n"
        "                        tint = WisdomAccentAmber,\n"
        "                        modifier = Modifier.size(16.dp)\n"
        "                    )\n"
        "                }\n"
        "            )\n"
    )
    new = "            SignInPill(onClick = onSignIn) // S5-signin: the shared Sign in pill\n"
    home = swap(home, "Home sign in button", old, new)
    if IMPORT in home:
        errors.append("Home: SignInPill import already present (script needs an update)")
    home = swap(home, "Home import", "import com.wisdomtower.academy.ui.packages.ENTRANCE_BASE_PATH\n",
                IMPORT + "import com.wisdomtower.academy.ui.packages.ENTRANCE_BASE_PATH\n")

# ---- Learning ---------------------------------------------------------------------------------------------------
if MARK not in learn:
    old_in = (
        "                                Box(\n"
        "                                    modifier = Modifier\n"
        "                                        .weight(1f)\n"
        "                                        .minimumInteractiveComponentSize()\n"
        "                                        .clip(RoundedCornerShape(20.dp))\n"
        "                                        .background(Color.White)\n"
        "                                        .clickable(role = Role.Button) { onNavigateToUrl(\"/login\") }\n"
        "                                        .padding(vertical = 8.dp),\n"
        "                                    contentAlignment = Alignment.Center\n"
        "                                ) {\n"
        "                                    Text(text = \"Sign In\", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Black)\n"
        "                                }\n"
    )
    new_in = (
        "                                SignInPill(label = \"Sign In\", onClick = { onNavigateToUrl(\"/login\") }) // S5-signin\n"
    )
    learn = swap(learn, "Learning sign in pill", old_in, new_in)

    old_up = (
        "                                Box(\n"
        "                                    modifier = Modifier\n"
        "                                        .weight(1f)\n"
        "                                        .minimumInteractiveComponentSize()\n"
        "                                        .clip(RoundedCornerShape(20.dp))\n"
        "                                        .background(WisdomGlassFillStrong)\n"
        "                                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)), RoundedCornerShape(20.dp))\n"
        "                                        .clickable(role = Role.Button) { onNavigateToUrl(\"/signup\") }\n"
        "                                        .padding(vertical = 8.dp),\n"
    )
    new_up = (
        "                                Box(\n"
        "                                    modifier = Modifier\n"
        "                                        .minimumInteractiveComponentSize()\n"
        "                                        .clip(RoundedCornerShape(50))\n"
        "                                        .background(WisdomGlassFillStrong)\n"
        "                                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)), RoundedCornerShape(50))\n"
        "                                        .clickable(role = Role.Button) { onNavigateToUrl(\"/signup\") }\n"
        "                                        .padding(horizontal = 20.dp, vertical = 9.dp), // S5-signin: same size as the Sign In pill\n"
    )
    learn = swap(learn, "Learning create account", old_up, new_up)
    if IMPORT in learn:
        errors.append("Learning: SignInPill import already present (script needs an update)")
    learn = swap(learn, "Learning import", "import com.wisdomtower.academy.data.model.UserProfile\n",
                 "import com.wisdomtower.academy.data.model.UserProfile\n" + IMPORT)

# ---- Notifications ----------------------------------------------------------------------------------------------
if MARK not in notif:
    old = (
        "                        Box(\n"
        "                            modifier = Modifier\n"
        "                                .clip(RoundedCornerShape(12.dp))\n"
        "                                .background(WisdomAccentSky)\n"
        "                                .clickable { onSignIn() }\n"
        "                                .padding(horizontal = 20.dp, vertical = 9.dp)\n"
        "                        ) {\n"
        "                            Text(\"Sign In to Account\", color = WisdomDarkOnCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)\n"
        "                        }\n"
    )
    new = "                        SignInPill(label = \"Sign In to Account\", onClick = onSignIn) // S5-signin\n"
    notif = swap(notif, "Notifications sign in", old, new)
    if IMPORT in notif:
        errors.append("Notifications: SignInPill import already present (script needs an update)")
    notif = swap(notif, "Notifications import",
                 "import com.wisdomtower.academy.data.repository.NotificationRepository\n",
                 "import com.wisdomtower.academy.data.repository.NotificationRepository\n" + IMPORT)

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

home_p.write_text(home, encoding="utf-8")
learn_p.write_text(learn, encoding="utf-8")
notif_p.write_text(notif, encoding="utf-8")
print("patched: HomeScreen.kt, LearningScreen.kt, NotificationsScreen.kt")
