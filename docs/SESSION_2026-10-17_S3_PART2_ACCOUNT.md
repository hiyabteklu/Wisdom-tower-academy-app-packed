# SESSION 2026-10-17 — S3 part 2, step 4: Account (TalkBack)

- 2026-10-17 | Claude (chat, owner on free plan) | Owner: "Continue". **DONE (written, NOT compiled here, CI not seen), commit `e19cbc3`:** `ui/account/AccountScreen.kt` resent whole, edits only in these places:
  1. `StepAccordionCard` header (the 3 profile steps): `Role.Button` + spoken "Expanded" / "Collapsed".
  2. University field: `Role.DropdownList` + "Expanded" / "Collapsed"; each university row: `Role.RadioButton`, "selected" state, minimum height 48 dp.
  3. `PillOption` (education level and region pills): `Role.RadioButton`, "selected" state, 48 dp touch target (`minimumInteractiveComponentSize()`, the pill itself looks the same; the wrapped rows may sit a few dp further apart).
  4. `SaveProfileButton` and `LogOutButton`: `Role.Button`.
  5. Imports: `minimumInteractiveComponentSize`, `semantics.Role`, `semantics.selected`, `semantics.semantics`, `semantics.stateDescription`; a header comment line.
  Not changed: the text fields (they have visible labels), icons beside text (decorative), the completion gauge (reads "30%, COMPLETE").
- NOT CHECKED YET (other files of the Account tab): `ui/auth/NativeSignInScreen.kt` (about 5 plain clickables: tabs, forgot password, terms / privacy links, eye icon, close X), `AdminEntryButton` (admin only), `ui/competition/CompetitionPointsCard.kt`. Do them as part 2b before Settings.
- UNSURE: not compiled. Watch `.semantics { this.selected = selected }` (the receiver property on the left, the parameter on the right) and `clickable(role = Role.DropdownList, onClick = ...)`.
- TEST (TalkBack on): Account signed in: "Legal Identity ... collapsed, button"; in step 2 each level and region pill says its name, "radio button" and "selected" or "not selected"; university field "dropdown list, collapsed"; "Save Profile Changes, button"; "Log Out, button".
- NEXT: S3 part 2b = `NativeSignInScreen.kt` (sign-in tabs, links, eye icon), then Settings (patch script).
