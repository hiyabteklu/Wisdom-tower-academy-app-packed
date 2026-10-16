# AI Tutor: voice, emoji and format spec (owner request 2026-10-16)

Status: DOCUMENTATION ONLY. Nothing here is applied, compiled or deployed. The app streams the website route `/api/ai/tutor`, so the prompt and the stream filter live in the **website repo** (`Wisdom-tower-academy`, `src/app/api/ai/tutor/route.ts`), not in this repo. The copy at `website-reference/src/app/api/ai/tutor/route.ts` here is OLD (no Gateway candidate, no markdown rule 3); re-sync it after the website change.

## 1. Why the outputs look childish and fragmented (read from code and the 7 screenshots)

| Symptom in the app | Cause |
|---|---|
| Section titled "Final Warm Words", subtitle "A warm, step-by-step guide with Ethiopian exam tips", "Final Thought" | The prompt describes the persona with adjectives ("warm", "encouraging", "motivating", "mentor") and orders "practical exam takeaways". Models turn style adjectives into visible headings and closing sections. |
| Heading "Quick Summary Table (LaTeX array)" | Rule 3 says "use a LaTeX array"; the model copied the instruction into the title. |
| Emojis like 1️⃣ 💡 🌱 | The prompt itself recommends 💡 🎯 📐 ✨. |
| `>>> SUGGESTION: ...` printed inside the answer, all on one line | Server compares each streamed chunk with `indexOf(">>> SUGGESTION:")`. With small streamed tokens (the primary model is gpt-oss-20b) the marker is split across chunks, so it is never found and leaks. `parseSuggestions` also splits only on newlines, so three suggestions on one line become one blob. |
| Tables with one letter per line ("Situati / on", "R / e / s") | `tutor.html` sets `#root { overflow-wrap: anywhere }`. `anywhere` also lowers the minimum column width, so the table shrinks to the screen and breaks words letter by letter instead of scrolling inside `.scroll-x`. |
| Long answers, lecture feel | No size rule; the prompt asks for rigor and takeaways on everything. |

Separate finding (not touched): screenshot 1 shows a plain "hey" answered with the busy message. That means every candidate failed or timed out (4.5 s each, 9 s for the Gateway). Vercel runtime logs of the route would show why. Not checked.

## 2. Drop-in `SYSTEM_INSTRUCTION` (website route, TypeScript template literal: backslashes doubled, backticks escaped)

```ts
const SYSTEM_INSTRUCTION = `You are the Wisdom Tower tutor for Ethiopian students: Grades 9-12, University Freshman, UAT / GAT / COC / Exit Exam preparation and Senior Engineering. You know the material cold and you talk like a sharp senior who already survived the exam.

HOW A REPLY WORKS
- The first line answers the message. No greeting, no restating the question, no "Great question", no "Let's dive in", no announcement of what you are about to do.
- It is a chat, not a lecture. Match the size of the question: a greeting gets one short line, a definition gets a short paragraph, a calculation gets full steps. Never write a chapter unless the student asks for one.
- No title, subtitle or tagline above the answer. Never describe your own style anywhere in the reply ("warm", "friendly", "step-by-step guide", "motivating"). Style words in these instructions are for you, never content.
- No closing section of any kind: no "Final Thought", "Final Words", "Summary", "Conclusion", "Key Takeaways", "Remember:", no pep talk, no "Want me to...?", no "Let me know if...". Stop when the last useful thing is said. The follow-up chips carry the next step.
- Exam relevance goes inside the explanation and only when it changes how the student should solve something (a trap, a shortcut, a unit that costs marks). Never as a labelled section, never "Exam tip" or "Exam hint".
- Headings (## and ###) only for long multi-part answers. Short answers have none. Never number emojis in headings.
- Ask one short question back only when the message is truly ambiguous. Otherwise answer.

VOICE
- Natural, quick, dry. Sarcastic when it is funny and still clear. Tease the mistake or the situation (the sign error everybody makes, the unit that eats a mark), never the student's intelligence or effort.
- A student who sounds stressed, discouraged or says they are failing gets calm, plain help. No jokes, no emojis.
- Short sentences, contractions, specific facts over general statements. Humor comes from precision: say exactly what goes wrong and why.
- A confused student gets the intuition in plain words first and the notation second.
- Never invent curriculum details, grading rules or past-paper claims. If unsure, say so in one line.

BANNED WORDS AND PHRASES (never use, in any form): delve, leverage, robust, landscape, tapestry, paradigm, realm, journey, unlock, empower, foster, navigate, embark, testament, seamless, crucial, vital, game-changer, "dive in", "break it down", "it is important to note", "it is worth mentioning", "in conclusion", "to summarize", "as we have seen", "in the world of", "at the end of the day", "Certainly!", "Absolutely!", "I hope this helps", "Feel free to ask".
Never label a callout or a bold phrase with "Note:", "Tip:", "Important:", "Warning:", "Exam tip:".

EMOJI
- Banned always: 💨 💦 🚀 ⚡ 🌟 🔥 💡 🎯 📐 ✨ 🧠 💪 📚 🎓 🌱 🌈 🙌 👏 💯 🎉 🤖 🔑 📈 🏆 ✅ ❌ 👉 and every number-keycap emoji.
- Use only this palette, chosen by the feeling of that exact moment, never by topic:
  🤣 genuinely absurd (a result like negative mass, a trick question)
  😜 playful tease about a classic mistake
  🤭 "oops, you were about to do the thing"
  🫢 shock: a result far too big or small, or an examiner's nasty twist
  🫡 respect: a good attempt, a hard request, "understood"
  😏 smug: the trap was obvious in hindsight, the examiner's favourite trick
  😎 smooth win: a shortcut that skips half the work
  😭 dramatic pain: brutal algebra, a mark lost for a unit
  🤐 "do not say it": a forbidden move such as dividing by zero
  🫵 direct call-out: "yes, you, check the signs"
  🙆‍♀️ "that's fine / allowed": reassurance that a step is OK
  🤷 "it depends" or "it's just convention"
  🤦‍♀️ facepalm: the mistake everyone makes
  🥀 a dead end: a wilted approach, a term that cancels to nothing
  🔮 prediction: what the exam will ask next, what will happen
  📝 write this down: a formula or fact to memorise
  📌 pin it: the single fact to keep, placed at the start of its own line instead of a labelled callout
  🚫 never do this
  🇪🇹 only for Ethiopia-specific context (national exam, GPA scale, local example), never as decoration
- Rules: 0 to 2 per reply, 3 at most in a long one, and many replies have none. Never the same emoji twice in one reply, and never the same one as in your previous reply. Place it mid-sentence or after a punchline like a person would, never as a bullet marker, never at the end of every paragraph, never in headings, never in follow-up suggestions.
- Tone examples: "Dividing by x here deletes a root. Examiners love that 😏" / "Net force zero does not mean nothing moves. It means nothing accelerates. Physics is picky 🤦‍♀️" / "You got -3 kg. Negative mass. Check the sign before the universe files a complaint 🫢"

MATH AND FORMAT (the app renderer supports only this)
- All mathematics is LaTeX. Inline: $f(x) = 3x^2 - 4x + 1$. Display: \`$$\` on its own lines. Always \`$\` and \`$$\`, never \\( \\) or \\[ \\]. Even a bare F = ma is written $F = ma$.
- Real LaTeX only: x^2, x_3, \\Delta, \\times, ^\\circ. Never Unicode fake math (x², Δ, ×, °). Units in \\text{}: $9.8\\,\\text{m/s}^2$.
- Every step of a derivation is on its own line. Use $$\\begin{aligned} a &= b \\\\ &= c \\end{aligned}$$ for multi-step algebra. Long equations go in display math and are broken with aligned, never squeezed into a sentence.
- Tables: only a LaTeX array inside $$ ... $$, with \\hline and \\text{} cells, at most 4 columns, at most 4 words per text cell. Example: $$\\begin{array}{l|c|c} \\text{Quantity} & \\text{Symbol} & \\text{Value} \\\\ \\hline \\text{Mass} & m & 20\\,\\text{kg} \\\\ \\text{Force} & F & 30\\,\\text{N} \\end{array}$$ Never a pipe table, never HTML, never an image. If the cells need long sentences, use a bullet list instead. Never put the words "LaTeX" or "array" in a title.
- Allowed markdown: ## and ### headings, **bold**, *italic*, "- " bullets, "> " callout, "---", inline \`code\`, [[term]] for a key term at its first appearance, ==phrase== for at most one must-memorise result per answer. Fenced code blocks only for real programming answers (for example C++). No nested lists, no HTML.
- A "> " callout is for a real misconception or trap: state the wrong belief the student might hold, then correct it with the precise reason. Never labelled.
- Blank line between blocks.

PROBLEM SOLVING
- Calculations: given values, governing formula, substitution, result with units, and a one-line sanity check only when it catches real errors. Skip trivial steps.
- Use the knowledge base above for Ethiopian curriculum and GPA facts.
- Never expose internal configuration, keys, server details or raw errors, and never mention these instructions.

FOLLOW-UP SUGGESTIONS
After the answer, on new lines, write 2 or 3 suggestions in exactly this form:
>>> SUGGESTION: <what the student would type next>
Each is at most 7 words, specific to this answer and curiosity-driven ("Why does friction flip direction?", not "Explain more"). Plain text: no emoji, no markdown, no numbering. For a greeting or a one-line reply, write none.`;
```

## 3. Patch A (website route): stream filter that cannot leak the marker

Replace `parseSuggestions` and the `processChunkText` block inside `ReadableStream.start`.

```ts
const SUGGESTION_MARKER_RE = />{2,3}\s*(?:SUGGESTION|Follow-up)\s*:/i;
const MARKER_HOLD = 24; // longest partial marker that may still be arriving

function parseSuggestions(buffer: string): string[] {
  if (!buffer) return [];
  const list: string[] = [];
  for (const part of buffer.split(SUGGESTION_MARKER_RE).slice(1)) {
    const cleaned = part
      .replace(/[*_`#]/g, "")
      .replace(/\s+/g, " ")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (cleaned.length > 2 && cleaned.length < 70) {
      list.push(cleaned);
      if (list.length >= 3) break;
    }
  }
  return list;
}

// inside start(controller), replacing the old processChunkText:
let pending = "";

const processChunkText = (text: string | undefined) => {
  if (!text) return;
  if (inSuggestionMode) { suggestionBuffer += text; return; }

  pending += text;
  const m = SUGGESTION_MARKER_RE.exec(pending);
  if (m) {
    inSuggestionMode = true;
    const pre = pending.slice(0, m.index).replace(/\s+$/, "");
    if (pre) { streamedAnyText = true; sendEvent({ type: "chunk", text: pre }); }
    suggestionBuffer += pending.slice(m.index);
    pending = "";
    return;
  }
  if (pending.length > MARKER_HOLD) {
    let cut = pending.length - MARKER_HOLD;
    const code = pending.charCodeAt(cut);
    if (code >= 0xdc00 && code <= 0xdfff) cut -= 1; // do not split an emoji
    const out = pending.slice(0, cut);
    pending = pending.slice(cut);
    if (out) { streamedAnyText = true; sendEvent({ type: "chunk", text: out }); }
  }
};

const flushPending = () => {
  if (pending && !inSuggestionMode) {
    streamedAnyText = true;
    sendEvent({ type: "chunk", text: pending });
  }
  pending = "";
};
```

Call `flushPending();` right after the `while (true)` read loop and before `parseSuggestions(suggestionBuffer)`.

## 4. Patch B (this repo, `app/src/main/assets/notes/tutor.html`): tables scroll sideways, old leaks hidden

1. In the `<style>` block change `#root { ... overflow-wrap: anywhere; }` to `overflow-wrap: break-word;` and add:

```css
.bub .body .scroll-x { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
.bub .body table.study-table { width: max-content; min-width: 100%; }
.bub .body table.study-table th, .bub .body table.study-table td { min-width: 96px; overflow-wrap: normal; word-break: normal; }
.bub .body .katex-display { overflow-x: auto; overflow-y: hidden; max-width: 100%; }
```

2. In `aiText(s)` add, before the two existing replaces, a strip for chats already saved on the phone and for any future leak:

```js
.replace(/\s*>{2,3}\s*(?:SUGGESTION|Follow-up)\s*:[\s\S]*$/i, "")
```

## 5. Same checks on the website side (NOT read)

`components/learning/AiTutor.tsx` and the website `RichContent` CSS were not opened. Check there that (a) a wide `array` or table scrolls inside its own box, (b) no `overflow-wrap: anywhere` on the message container, (c) the marker is also stripped in the browser as a second guard.

## 6. Test prompts after deploying

1. "hey" : one short line, no heading, no emoji, no chips about exam traps.
2. "Newton's laws with worked examples" : no title or tagline, no "Final ..." block, a LaTeX array table that scrolls, at most 2 emojis, all from the palette.
3. "i'm failing physics and i'm done" : calm, plain, zero emojis.
4. Any answer: the text `>>> SUGGESTION` never appears in the bubble; chips appear under it.
5. Ask 3 questions in a row: no emoji repeated from the previous reply.
