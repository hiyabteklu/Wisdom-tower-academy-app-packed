# SESSION 2026-10-16 COVER A: Learning screen cleanup and Cover Page Generator

> Repo is PUBLIC: no secrets, no student data. Written by Claude (chat). Status of ALL code below: `[~]` written, NOT compiled by the author, CI NOT seen, not seen on a device.

## Owner order (2026-10-16, in the owner's words)
"Look at my github projects wisdom tower academy app packed and read the handoff and status... and continue. Remove the name, ID and email on the learning section above the tool kit, and replace the 'courses' from the tool kit and replace it by something phenomenal. Cover page generator. Can we prepare 5 A4 templates. Where user can insert logo, university name, department, group (individual), group members list, submitted to, submission date. Then download the rendered PDF?"

This order is outside the competition stages and the admin slices of `HANDOFF.md` section 0 rule 3; the owner's explicit order in the chat overrides that rule (same as the 2026-10-15 admin order).

## What was read
`HANDOFF.md`, `docs/COMPETITION_STATUS.md` (its board stops at 2026-10-15; the `docs/SESSION_2026-10-16_UI_AF.md` file exists and is newer), `docs/BUILD_PITFALLS.md`, `app/build.gradle.kts` and `gradle/libs.versions.toml` (activity-compose 1.10.1, material3 from BOM 2024.09.00, material-icons-extended present, minSdk 24), and the whole `ui/learning/LearningScreen.kt`.

## What changed (ONE commit)
1. `ui/learning/LearningScreen.kt` (whole file resent, 28 KB): the header card (avatar, name, student ID, email) above the Study Tools dock is REMOVED, with the three values it used (`displayName`, `email`, `studentId`) and the imports only it used (`StudentIdGenerator`, `FontFamily`). The "Courses" tile is replaced by `StudyToolTile("cover", "Cover Page", Icons.Default.Description, ...)`; its click opens `NativeCoverPageScreen` in place of the Learning screen (same pattern as Timer, Planner...; Back returns). The tile has a cyan edge and icon plate (`highlight`). Function parameters `userName` and `userEmail` are kept (MainActivity passes them; `userName` still feeds the status screen). "All Courses" in the Curriculum header still opens `/packages`. `wisdomReveal` indexes were not renumbered (the guest banner keeps 1, the dock 2).
2. NEW `ui/study/CoverPageRenderer.kt`: one function `drawCoverPage` paints an A4 page (595 x 842 pt) with `android.graphics.Canvas`; used for the on-screen preview (a Bitmap) and for the PDF (`android.graphics.pdf.PdfDocument`, built into Android: NO new dependency, NO permission). 5 templates: Classic (framed, serif), Banner (colour header, logo on a white badge), Sidebar (colour band), Elegant (cream, triple border, diamonds, serif italics), Bold (heavy title, colour footer). 6 accent colours.
3. NEW `ui/study/NativeCoverPageScreen.kt`: template strip with live thumbnails, colour dots, live preview, logo picker (`GetContent`, image shrunk to about 900 px), university, department, optional title, Group / Individual switch (group name + members rows with full name and ID, up to 20; or one student), submitted to, submission date (calendar button, today by default), Clear, Download PDF (`CreateDocument`, the system Save-as screen: no storage permission). Typed values live in the object `CoverForm` until the app closes.

## Rules checked
- Forbidden files (HANDOFF rule 12) NOT touched: no manifest, no gradle, no `.github/`, no `.env.example`. Rule 13: no dependency, no new network host, nothing deleted or renamed.
- No invented text: in the PDF an empty field is left out; in the preview an empty field shows a faint grey hint ("University name"). Labels (SUBMITTED TO, SUBMISSION DATE, GROUP MEMBERS, STUDENT, FULL NAME, ID NUMBER, No.) are printed only when their field has a value.
- Build pitfalls: no `rememberRipple`; icons used are `Description` (extended set), `CalendarMonth`, `Close`; trailing lambdas only where the lambda is the last parameter (`CoverPill(text, filled, modifier, onClick)` has no defaults); every `Modifier` extension was imported; no `@Composable` call inside a `LazyListScope` builder (only inside `item { }`).

## Agent choices the owner may want to change (not in the owner's list)
- an optional "Assignment or course title" field (a cover page usually has one),
- the 6 colours, the live thumbnails, the date pre-filled with today.

## UNSURE / hypotheses (not verified)
- Not compiled. Most likely compile risks: the `Icons.Default.Description` import, `OutlinedTextFieldDefaults.colors` parameter names (written for Material3 1.3 of BOM 2024.09), `ActivityResultContracts.CreateDocument(String)` (needs activity 1.7+, the project has 1.10.1), `StaticLayout.Builder` (API 23, minSdk is 24). If CI is red, the owner pastes the line that starts with `e: file:///`.
- A logo with a white (non-transparent) background looks fine on Classic, Elegant and Bold; on Banner and Sidebar it sits on a white badge on purpose.
- The PDF uses the phone's built-in fonts (serif and sans); not the bundled Tinos.
- Photos with EXIF rotation are not rotated.

## Next, in order
1. The owner reports the CI result of this commit (green = start the phone test below).
2. Phone test: Learning tab shows no name/ID/email card; the dock's last tile is "Cover Page"; open it; pick each template and colour; add a logo; fill the fields; add and remove members; switch to Individual; pick a date; Download PDF, open the saved file and compare it with the preview.
3. Possible follow-ups (only if the owner asks): remember university, department and logo between app launches; an entry for the drawer menu; a Share button (needs a FileProvider, i.e. a manifest change, which is a forbidden file without the owner's order); more templates.
