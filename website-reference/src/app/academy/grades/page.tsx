import { redirect } from "next/navigation";

/**
 * The combined "Grade 9–12" list was retired: Grade 9, 10, 11 and 12 are now independent
 * cards on Home and Academy. Old links/bookmarks land on the Academy page.
 * Grade routes (/academy/grades/9 … 12) are unchanged.
 */
export default function GradesIndexRedirect() {
  redirect("/academy");
}
