# PLAY_STORE_LISTING.md: draft store texts and corrections (session AW, 2026-10-12)

> Repo is PUBLIC: no secrets. Texts below use ONLY features found in the app code and docs. Owner: review, change anything you dislike, then paste into Play Console. Nothing here is submitted.

## Correction to `PLAY_STORE_CHECKLIST.md` section 5

- **Blocker 1 (account deletion) is resolved in code, not yet phone-tested.** Verified 2026-10-12 by reading: website API route `src/app/api/account/delete/route.ts`, website page `src/app/delete-account/`, the website privacy page links to it and to "Settings > Security" in the app, and the app has `ui/settings/AccountDeletionSection.kt` (type DELETE, signs out afterwards). For the Play Console "Delete account URL" use: `https://www.wisdom-tower-academy.live/delete-account`. Still to do: owner tries it once with a TEST account (never a real student).
- Blockers 2 to 6 are unchanged and not checked today.

## Short description (max 80 characters, this one is 74)

Notes, flashcards, question banks and exams for Grades 9–12 and university.

## Full description (draft)

Wisdom Tower Academy is a study app for Ethiopian students. Sign in with the same account you use on the Wisdom Tower Academy website and study from one place.

Pathways
- Grades 9, 10, 11 and 12
- Freshman (first-year university courses)
- Remedial
- Entrance Questions
- COC, UAT, GAT and Exit Exam
- ECE Engineering (Year 3, Semester 1 and Semester 2)

In every course
- Books: read PDF books in the app and remember your last page
- Short Notes: clean, readable notes with maths formulas
- Flashcards: flip, and mark cards Known, Learning or Again
- Question Banks and Exams: answer, see solutions, and keep your results
- Explain with AI on questions, and an AI tutor

Study tools and guides
- GPA calculator
- Your profile, student ID card and study goals
- Guides: universities, departments, scholarships, study techniques, campus life and success stories

Offline
- Download books, notes, flashcards and questions to your phone and open them without a connection. Remove them any time.

Your account
- You can delete your account and personal data from Settings > Security.

(Not in this text on purpose: videos and "Life Savers", because no content exists for them yet; prices and purchases, because the app has none; any user numbers.)

## Data Safety form: answers drawn from the code (confirm each before submitting)

- Collected: name, e-mail address, phone number; profile details (academic level, stream, school, region, bio, target exam, study goal); study progress and exam results; push-notification token.
- Shared with third parties: text typed into the AI tutor or "Explain with AI" (goes through the website server to AI providers). Confirm the providers named in the website privacy page.
- Encrypted in transit: yes (HTTPS only). Sign-in tokens are stored encrypted on the phone.
- Deletion: yes, in app and by the web link above.
- Permissions: internet, network state, notifications only. No location, camera, microphone or storage.
- Ads: none known. STILL TO CONFIRM: look at the dependencies in `app/build.gradle.kts` for an ad SDK before answering "no ads".
- Payments: none in the app (free mode). Redo the form if paid packages return.

## Content rating and audience

- Educational app; answer the IARC questions honestly (no violence, no user-to-user chat known; confirm there is no user-generated public content).
- Target audience 13 and older (Grades 9 to 12 and university).

## Still needed from the owner (agent cannot make these)

1. App icon 512 x 512 PNG and feature graphic 1024 x 500.
2. At least 2 phone screenshots (suggest: Home, a Learning hub list, a flashcard, a quiz question, Settings).
3. A Play Console account, 12 testers for 14 days, and the signing secrets in GitHub (see checklist section 1). Not verified whether the secrets are set.
