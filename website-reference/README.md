# Wisdom Tower Academy

Isolated education platform — Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways.

Sister product: [Wisdom-tower-digital](https://github.com/hiyabteklu/Wisdom-tower-digital)  
Live Digital: https://wisdomtower.tech  
Live Academy: https://wisdom-tower-academy.live

## Stack
- Next.js 15 + TypeScript + Tailwind (website)
- Supabase (use a **new** project — do not reuse Digital keys)
- Vercel (new project)
- **Android app (production):** WebView shell — [Wisdom-tower-academy-app](https://github.com/hiyabteklu/Wisdom-tower-academy-app)  
  (Long-term pure Compose vision: [docs/NATIVE-ANDROID.md](docs/NATIVE-ANDROID.md))

## Setup (website)
```bash
npm install
cp .env.example .env.local   # fill NEW Supabase keys + NEXT_PUBLIC_DIGITAL_URL
npm run dev
```

## Free resources (public)

| Path | Content |
|------|---------|
| `/academy/success-stories` | Admin / DB listings |
| `/academy/scholarships` | Admin / DB scholarship cards + intro |
| `/academy/universities` | Hard-coded guides + optional admin notes |
| `/academy/departments` | Hard-coded + notes |
| `/academy/campus-life` | Hard-coded guide + PageNotes |
| `/academy/study-techniques` | Hard-coded guide + PageNotes |

## For agents / other developers

**Start here so UI and app chrome stay consistent:**

→ **[docs/AGENT-NOTES.md](docs/AGENT-NOTES.md)**  
→ App architecture: [ARCHITECTURE.md in the app repo](https://github.com/hiyabteklu/Wisdom-tower-academy-app/blob/main/ARCHITECTURE.md)

### Critical areas that have regressed before

| Area | Location | Required behaviour |
|------|----------|--------------------|
| Scholarships / free resources | `src/app/academy/scholarships`, `src/lib/free-resources.ts` | Wire to Supabase; no permanent Coming soon when content is published |
| Campus Life / Study Techniques | `src/components/academy/*Page.tsx` | Full guides — never leave as PLACEHOLDER |
| Flashcards | `src/components/learning/FlashcardViewer.tsx` + `.fc-*` CSS | 3D flip, distinct back colour, swipe next/prev |
| App header | App repo `MainActivity.kt` | Fixed bar; notifications → `/notifications` only |

## Android app

Production client is the WebView shell:

→ https://github.com/hiyabteklu/Wisdom-tower-academy-app

**Download debug APK:** GitHub Actions → [Build Debug APK](https://github.com/hiyabteklu/Wisdom-tower-academy-app/actions/workflows/build-apk.yml) → latest green run → artifact **Wisdom-Tower-Academy-debug**.

Website content changes appear in the app automatically. Only native chrome / offline vault changes need a new APK.
