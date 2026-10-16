# UI MOTION PLAN (third live task, owner order 2026-10-16)

> Repo is PUBLIC: no secrets, no student data. Written by Claude (chat) as planner. AI Studio implements, one slice per chat (see `docs/AGENT_QUOTA_PROTOCOL.md`).
> This plan is ONLY about motion, transitions and feel. It does NOT change colors, layout, text, cards or navigation structure (G6). It does not touch competition logic.
> Owner rule 2026-10-16 (`docs/OWNER_RULE_WRITTEN_IS_DONE.md`) applies: written and pushed code counts as DONE; the owner reports problems himself.

## 0. How this fits the older rules
- `CLAUDE.md` and `HANDOFF.md` say the old UI polishing (T1 to T9) is archived. The owner has now ordered NEW motion work (below). That order overrides the "do not work on UI polishing" lines for MOTION ONLY. Everything else in the archive stays closed.
- Global constraints G1 to G9 of `docs/UI_POLISH_TASKS.md` stay in force: forbidden files (`.env.example`, `.github/**`, all Gradle files, manifest, legacy web shell, `website-reference/**`, branding), no new dependencies, no new hosts, no invented text or numbers, `MainActivity.kt` only through a patch script in `scripts/` plus `scripts/pack_mainactivity.py` (HANDOFF rule 10, `docs/EDITING_LARGE_FILES.md`).
- Compose animation APIs (`androidx.compose.animation.*`) are already used in the app, so NO new dependency is needed. Do not add Lottie, Accompanist or any library.
- Read `docs/BUILD_PITFALLS.md` before writing code (every `Modifier.xxx` needs its own import; no `rememberRipple`; named `onClick =` arguments; no `@Composable` calls inside `LazyColumn { }` builder scope).

## 1. Owner words (2026-10-16, kept as written)
1. "The bottom navigation buttons pill isn't that smooth, it looks flickering, the way it transitions doesn't feel iOS like, while its shape and design is good, the motion isn't premium, it just flashes or misbehaves."
2. "All page transition effects like all home page and others need some effects. Example the other resources section has some good transition. But all packages, home etc is just feels static page. The way cards appear, the way scroll paints the cards etc.. Should be something phenomenal."
3. "Also opening cards, switching pages etc should not be dry, it should be something amazing."
4. "Good example the account section, the pills the way clicking them the way they mark the way the forms retracted and expand is good, bad example settings section. Clicking a form opens it instantly no smooth expand, it's just dry."
5. "I'm not a coder ... you are the senior ui ux and developer here. When writing the transitions and effects plan, don't be limited to what I said. Plan all sections, and all things that need improvement. Push the plan and we'll start execution."

## 2. What was actually read (evidence) and what was NOT
Read from the repo on 2026-10-16: `HANDOFF.md`, `CLAUDE.md`, `docs/OWNER_RULE_WRITTEN_IS_DONE.md`, `docs/UI_POLISH_TASKS.md`, `docs/BUILD_PITFALLS.md`, `docs/SESSION_2026-10-13_F.md`, `docs/SESSION_2026-10-16_UI_M.md`, `scripts/patch_floating_nav.py` (the bottom nav code as written), `scripts/patch_t9_resources_motion.py` (the Other resources motion), `ui/settings/SettingsScreen.kt` (whole), `ui/theme/WisdomComponents.kt` (whole).
NOT read: the live `AliveBottomNav` and the tab-switch code inside `MainActivity.kt` (253 KB; the nav is known only from the patch script, which may have been edited since), `AccountScreen.kt`, `HomeScreen.kt`, `PackagesScreen.kt`, `PackageDetailScreen.kt`, `LearningScreen.kt`, `DrawerScreens.kt`, the competition screens, the study screens. Everything about those is a HYPOTHESIS until the slice's step 1 (inspect first, write the real cause in the session log, then fix, G3).

## 3. Root causes (verified = read in code; hypothesis = not yet proven)

### 3.1 Bottom nav pill flicker (item 1)
Verified in the patch script (`FloatingPillNav v1`):
- Five separate `animateFloatAsState` values (one per tab) animate the tab WIDTHS for 420 ms, and the pill position and width are computed from them in composition, so the whole nav recomposes on every frame of the slide.
- The selected tab's label uses `AnimatedVisibility` with `expandHorizontally` / `shrinkHorizontally` (320 / 240 ms). That is a SECOND animation that also changes the tab width while the first one is changing it. Two clocks fighting over one width is a classic cause of visible jitter.
- The tap sets `pending`, waits `delay(70)`, then calls `onItemSelected`, which switches the whole page. The page switch (heavy composition) therefore lands inside the 420 ms slide.
Hypotheses (to confirm in slice M2 step 1): (a) the dropped frames at the moment of the page switch are the visible "flash"; (b) the tab content is swapped with no transition (no `AnimatedContent` exists in `MainActivity.kt`'s imports list except what the search showed; the old page vanishes and the new one appears in one frame); (c) the coloured `shadow` on a very round capsule is redrawn every frame.

### 3.2 Settings forms open instantly (item 4)
Verified: `SettingsAccordionCard` in `SettingsScreen.kt` shows the body with a plain `if (isExpanded) { Box { content() } }`. There is no `AnimatedVisibility`, no height animation, and the chevron `KeyboardArrowDown` never rotates. Six cards use it (Study Goals, Notifications, Game Sound, Reading & Display, Offline Data, Security) plus `MySubjectsSection`. The selection chips in the same file (study minutes, study window, font size) switch colour instantly (no `animateColorAsState`). The controls built with plain `.clickable { }` have no press feedback (only `WisdomModernCard(onClick)` and the Wisdom buttons use `wisdomPressScale`).

### 3.3 Static pages (items 2 and 3)
Verified: `WisdomComponents.kt` has only `wisdomPressScale` (press-in) and the glow background. There is no shared entrance animation, no shared screen transition, no shared expand component. Good motion exists in only three places, each written separately: the sign-in tabs and form reveal (`NativeSignInScreen.kt`: `expandVertically(tween 280) + fadeIn`, conceal `shrinkVertically(220) + fadeOut(160)`), the Other resources sliding spring pill (`GuidesScreen.kt`, spring damping 0.72 / stiffness 380) with `animateContentSize(spring 0.85 / 300)`, and the onboarding pager. Hypothesis: Home, Packages, Learning, package details, hubs and lists simply compose in one frame.

## 4. The motion language ("Wisdom Motion"): one kit, used everywhere
NEW file `app/src/main/java/com/wisdomtower/academy/ui/theme/WisdomMotion.kt` (adding a file is allowed; deleting or renaming is not). Everything below lives there so every screen feels like one product. Values are STARTING values; tune on the phone.

| Token | Starting value | Use |
|---|---|---|
| Reveal (open) | expand + fade, 280 ms | accordions, forms, any section that opens (copy of the approved sign-in motion) |
| Conceal (close) | shrink + fade, 220 / 160 ms | quicker than open, always |
| Slide spring | damping 0.8, stiffness 400 | moving pills and indicators (slightly springy, settles like iOS) |
| Press spring | damping 0.6, stiffness 500 | already exists as `wisdomPressScale`; reuse, do not duplicate |
| Entrance | fade 0 to 1, rise 24 dp to 0, scale 0.96 to 1, 320 ms ease-out | first appearance of cards |
| Stagger | 45 ms per item, first 8 items only | cards entering together; the rest appear without delay |
| Screen push | new screen slides in from the right and fades, old screen moves 30% left and dims | going deeper (package, hub, list, reader) |
| Screen pop | exact reverse | back |
| Tab change | fade-through: old fades out 90 ms, new fades in 210 ms with a 10 dp rise | bottom tabs (iOS tab bars dissolve, they do not slide) |
| Overlay | slide up 40 dp + fade, scrim fades | tools, dialogs, sheets |

Shared helpers to write once (names are proposals):
- `WisdomExpandable(visible, content)`: the Reveal / Conceal pair above, wrapped around `AnimatedVisibility`.
- `Modifier.wisdomChevron(expanded)`: rotates the arrow 180 degrees with the slide spring.
- `Modifier.wisdomReveal(index, key)`: the Entrance + Stagger. Plays ONCE per item per app session (remember the seen keys), so scrolling back, returning to a tab, or recomposing never replays it. Uses only `graphicsLayer` (alpha, translationY, scale) read inside the layer block, so it costs no recomposition per frame.
- `WisdomScreenTransition`: one `AnimatedContent` transition spec with push / pop direction, plus `contentKey` so state is kept.
- `Modifier.wisdomScrollDepth(listState)` (optional polish, slice M4): cards just entering at the bottom edge are 2 percent smaller and a little transparent and settle as they reach the middle. `graphicsLayer` only.

Performance and safety rules for EVERY slice:
1. Animate with `graphicsLayer` (alpha, translation, scale, rotation) or `Modifier.offset { }` lambdas wherever possible; avoid animating layout size per frame except for the one expanding section.
2. One animation clock per moving thing. Never two animations on the same width, height or position (the cause of 3.1).
3. Animation must never delay access: content is tappable from the first frame; no entrance longer than 400 ms; total stagger under 600 ms.
4. Heavy work (page composition, network) must not start in the middle of a slide: start it first, or after the first 120 ms (see M2, M3).
5. Compose follows the phone's "Remove animations" setting by itself (hypothesis: verify once); do not add a separate switch.
6. Exam, timer, submit and close controls are never animated away or delayed. Exam screens are the LAST slice.
7. No new text, no invented numbers. A number never counts up (it would show wrong values for a moment) unless the owner asks for it; progress gauges may ease to the REAL value.
8. Do not change back handling, `selectedIndex` ownership or the WebView lifecycle (BUILD_PITFALLS, Phase D). Native `selectedIndex` stays the only source of truth.

## 5. Inventory: every area and what it needs

| Area | Today (V = verified, H = hypothesis) | Target |
|---|---|---|
| Bottom nav pill | V: five width animations plus label expand plus 70 ms delay (3.1) | One clock, pill glides with the slide spring, label fades (no width animation), page switch after the glide starts; keep shape, colors, haptic |
| Tab change (Home, Learning, Packages, Account, Settings) | H: instant swap | Fade-through tab transition, state kept per tab |
| Home | H: static | Hero fades up first, then the 12 program cards stagger in on first visit, soft depth while scrolling, press-in on every card (exists on `WisdomModernCard`) |
| Packages and package details | H: static | Same card entrance; opening a card = screen push with the old screen moving back; semester / stream pills use the sliding pill like Other resources |
| Learning | H: static | Course cards entrance; progress bars and rings ease from 0 to the REAL value once |
| Hubs and item lists (notes, flashcards, banks, exams) | H: static; V: `DownloadGauge` exists | Rows stagger (first 8), press-in, gauge eases between real values, check mark pops with a short spring |
| Readers (PDF, notes) | V: notes reveal handled in T6 | Keep; only the push transition into and out of them |
| Account | Owner says GOOD (pills, expand / retract) | Reference. Do not change; make it use the shared kit only if identical in feel |
| Settings | V: instant accordions (3.2) | `WisdomExpandable` + chevron + header highlight + chips color animation + press feedback; Study Goals, Notifications, Game Sound, Reading & Display, Offline Data, Security, My Subjects, Account deletion block |
| Other resources (guides) | Owner says GOOD | Reference. Do not touch |
| Drawer | V: opens with `AnimatedVisibility` (per BUILD_PITFALLS) | Rows stagger in 30 ms apart, scrim fade matched to the panel |
| Top bar | H: title swaps instantly | Title cross-fades on tab change; notification bell badge pops with a spring when the count changes; trophy gets a slow soft shimmer only when a contest is live |
| Tools overlay (AI Tutor, Calculator, Timer, Planner, Notebook, Targets, Status) | H: appears instantly at `zIndex(120)` | Overlay motion (slide up + fade), same reverse on close |
| Notifications screen | H: static list | Rows stagger, new items slide in, swipe or tap feedback |
| Sign in / Create account | Owner says GOOD (login motion) | Reference. Untouched |
| Onboarding / splash handoff | H: splash disappears abruptly | Splash fades and scales into Home |
| Dialogs (hub gate, exit dialog, confirmations) | H: appear without motion | Scale 0.94 to 1 + fade, scrim fade |
| Flashcards | H: card change is a cut | Flip in 3D (`graphicsLayer rotationY`), swipe away on next, spring back on cancel |
| Quiz and exam runner | H: question change is a cut | Next / previous slide with a short fade, option select pulse, low-time timer pulse (visual only), submit to results fade-through. LAST slice, motion minimal and safe |
| Competition (trophy, list, leaderboard) | H: static | Rows stagger, top 3 cards rise in order 2-1-3, ranks 4 to 10 expand with `WisdomExpandable`, own row highlights once |
| Admin console | It is the WEBSITE page in a WebView (repo `Wisdom-tower-academy`) | OUT OF SCOPE here. Needs the owner's separate OK |

## 6. Slices (ONE per chat; the owner says "do M<n>"; if he says nothing, do the next open one)
Every slice: step 1 inspect the live code and write the real cause or the current motion in a `docs/SESSION_*.md` log (G3), step 2 change only the listed files, step 3 log commit ids, what is left, what the owner should look at. Update the status table in section 7 in the same commit.

- **M1. Motion kit + Settings accordions.** New `WisdomMotion.kt` (Reveal / Conceal, chevron, press helper reuse). In `SettingsScreen.kt` replace the `if (isExpanded)` in `SettingsAccordionCard` with `WisdomExpandable`, rotate the chevron, tint the header icon and card edge cyan while open, animate the chip colors (study minutes, study window, font size), add press feedback to the plain `.clickable` boxes, apply the same to `MySubjectsSection.kt` and `AccountDeletionSection.kt` if they use their own open / close. `SettingsScreen.kt` is 67 KB: use a small patch script with exact anchors (see `docs/EDITING_LARGE_FILES.md`) or resend whole if the agent can. Owner sees: every Settings card opens and closes smoothly like Account.
- **M2. Bottom nav pill.** Patch script replacing the `AliveBottomNav` block (marker `FloatingPillNav v2`, same pattern as `scripts/patch_floating_nav.py`). One animation clock for pill and widths, drawn with `offset { }` / `graphicsLayer` (no per-frame recomposition), label fades instead of expanding, page switch starts when the glide is under way (not 70 ms of waiting, not in the middle of it), keep haptic, shape, colors, 52 dp track. Step 1: read the LIVE function first, it may differ from the script.
- **M3. Tab change transition.** Find the tab switch site in `MainActivity.kt`, wrap it in the fade-through transition with state kept per tab (`rememberSaveableStateHolder` hypothesis). Patch script. Must not touch back handling or `selectedIndex` ownership.
- **M4. Entrance choreography on the tab screens.** `wisdomReveal` on Home, Packages, Learning (one file each, whole file resend if small), optional scroll depth. Hero first, cards staggered.
- **M5. Opening cards and screen pushes.** Package card to package detail to hub to list to reader, and the study workspace; push / pop transition with the old screen receding. Tool overlay and dialog enter / exit. Where the switch lives in `MainActivity.kt` (the back chain `activeWorkspace`, `selectedPackage`, `activeStudyUrl`, `activeGuideSlug`, `activeDrawerScreen`), use a patch script and do not reorder the chain.
- **M6. Hubs and lists.** Row stagger, gauge easing, check mark pop, progress bars ease to real values, skeleton or placeholder to content cross-fade instead of a spinner flash.
- **M7. Drawer, top bar, notifications, splash handoff, dialogs.**
- **M8. Flashcards flip and swipe.**
- **M9. Competition screens and leaderboard.** Visual only; no change to timing logic, grading, or the C10 security hooks.
- **M10. Quiz and exam runner.** Last and the most careful: motion only on question change, select pulse and results; timer, submit, close stay instant and reachable.
- **M11. Consistency pass.** One sweep: find any screen still without the kit, fix feel differences between screens, update the phone checklist. No new features.

## 7. Status table (update in the same commit as each slice)
| Slice | State |
|---|---|
| Plan | WRITTEN and pushed 2026-10-16 |
| M1 to M11 | NOT STARTED |

## 8. Owner decisions
Nothing blocks M1 to M3. Defaults chosen by the planner (the owner can change them):
1. Style: calm and premium (iOS), not bouncy or playful.
2. Settings cards: several can stay open at once, as today (no behavior change).
3. Numbers never count up (G4).
4. Admin console motion is left to a separate website task.

## 9. Phone checklist after every slice (on top of `HANDOFF.md` section 9)
Tap each of the 5 tabs quickly and slowly: pill glides, no flash, page does not jump. Scroll Home and Packages: cards appear once and never replay when scrolling back. Open and close a package, a hub, a note, a book and press Back: motion reverses. Open and close every Settings card. Switch the phone to "Remove animations": the app still works instantly. Exam timer, submit, close still reachable and instant.
