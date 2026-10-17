Default background of the whole app: tutor_bg.jpg (this folder, app/src/main/assets/backgrounds/).
Every screen and the app shell draw it through AtmosphereBackground (ui/theme/WisdomComponents.kt) with a dark scrim
so text stays readable; the local pages (notes, flashcards, quiz, competition exam and review) are see-through
(ui/theme/AppBackdrop.kt). The AI Tutor screen used it first.
If the file is missing, every screen keeps the old dark look with the two soft glow orbs.
Tip: use an already soft/blurred, dark picture, portrait, about 1080 px wide, under 300 KB (the current one is larger).
