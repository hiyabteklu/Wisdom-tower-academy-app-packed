# SESSION 2026-10-16 UI_AF: M11 slice 6, M4 coverage check and gaps filled (Home, Learning)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AE.md`. Owner said: "Read HANDOFF and status and continue."

## Step 1: what the code really does (read from `main`, G3)
`wisdomReveal` (`ui/theme/WisdomReveal.kt`) is used by `openGrid` in `ui/packages/OpenCard.kt`. Every screen that lays cards out with `openGrid` therefore already rises in once per app session:
- **Home**: the 12 program cards (`openGrid("programs", ...)`). The 6 "Other resources" tiles have their own entrance inside `ResourceTile` (kept, not changed).
- **Packages**: all three grids (grades, branches, specials). Only the title and the three section headings are static text (left as they are, the cards carry the motion).
- **Learning**: the curriculum cards (`openGrid("curriculum", ...)`).
So the answer to "did M4 reach Home, Learning and Packages" is: YES for every card grid, NO for the loose items listed below. A search for `wisdomReveal` finds no direct call in these three files because the call sits inside `openGrid`.

## Gaps found (loose items with no entrance)
Home: the account line (`HeroSection`), the "Open Learning" card (the 3-argument `OpenCard` does not go through `openGrid`), the "Other resources" heading.
Learning: the header card, the guest banner, the Study Tools card, the Curriculum header row, the empty-curriculum card.

## Changed (written and pushed; CI NOT seen)
- `HomeScreen.kt` (whole file resent, about 17 KB): one new import `com.wisdomtower.academy.ui.theme.wisdomReveal`; `.wisdomReveal("home_hero", 0)` on the account line Row; the Open Learning card wrapped in a `Box` with `.wisdomReveal("home_welcome_card", 0)`; `.wisdomReveal("home_resources_header", 0)` on the heading. Everything else copied unchanged.
- `LearningScreen.kt` (whole file resent, about 28 KB): same import; `wisdomReveal` on the header card (key `learning_header`, index 0), guest banner (1), Study Tools card (2), Curriculum header row (3), empty-curriculum card (4). Everything else copied unchanged (tool screens, BackHandlers, C10 tutor lock untouched).
- `docs/UI_MOTION_PLAN.md` section 7, M11 row only.

Only `graphicsLayer` is used by the helper, so no recomposition per frame and taps work from the first frame. No new text, colours, layout or dependencies. Keys are unique per screen and play once per app session (never replay on scroll back or tab return).

## Limits (hypotheses, not proven)
- Row 0 of the Home program grid and the Open Learning card both start with 0 ms delay, so on the very first frame they rise together. If the owner wants a strict top-to-bottom order, give `openGrid` an optional index offset in a later slice.
- Nothing was compiled or run. `wisdomReveal` is `@Composable Modifier.wisdomReveal(key, index)`; it is called only in composable scopes (`item { }` bodies and `HeroSection`).

## Open for M11 (still)
Drawer screen push / pop transition (patch script on `MainActivity.kt`), trophy shimmer while a contest is live (needs a live-contest signal in the top bar, also `MainActivity.kt`), dialogs in other files, and the phone check of Home / Learning / Packages.

## Next
M11 slice 7: code search for dialogs without motion (`AlertDialog`, `Dialog(`, `DropdownMenu`) in files other than `MainActivity.kt`, and give them the `WisdomOverlayMotion` enter / exit; or the drawer screen push / pop patch script. Owner can say which.

## Owner should look at (phone)
Open the app: Home account line, Open Learning card and the "Other resources" heading fade up once; Learning tab: header, Study Tools card and Curriculum header fade up once; go to another tab and back: nothing replays. Switch the phone to "Remove animations": everything still shows instantly.
