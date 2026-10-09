import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createServiceClient } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

type ExplainBody = {
  questionId?: string;
  question?: string;
  choices?: string[];
  studentAnswer?: string;
  correctAnswer?: string;
  subject?: string;
  difficulty?: string;
};

const FALLBACK = "Wisdom Tower AI is currently unavailable.";

const GROQ_MODELS = [
  process.env.AI_EXPLAIN_MODEL,
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
].filter((m): m is string => Boolean(m && m.trim()));

const GATEWAY_MODEL = process.env.AI_EXPLAIN_MODEL || "openai/gpt-4o-mini";
const PER_ATTEMPT_TIMEOUT_MS = 8000;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function buildPrompt(input: {
  question: string;
  choices: string[];
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  difficulty: string;
}) {
  const choicesList = input.choices
    .map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`)
    .join("\n");
  return `You are a patient tutor for Ethiopian university / secondary students on Wisdom Tower Academy.

Subject: ${input.subject}
Difficulty: ${input.difficulty}

Question:
${input.question}

Choices:
${choicesList}

Student's answer: ${input.studentAnswer}
Correct answer: ${input.correctAnswer}

Write a concise educational explanation (max ~180 words):
- Explain why the correct answer is right.
- If the student was wrong, briefly say why their choice does not fit (no shame).
- Teach the underlying idea so they can solve similar questions.
- For math, use LaTeX with delimiters \\(...\\) for inline and \\[...\\] for display.
- Do NOT only restate the answer. No markdown headings. Plain paragraphs only.`;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message.slice(0, 400);
  return String(e).slice(0, 400);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

async function groqChat(model: string, prompt: string, key: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq ${res.status} (${model}): ${raw.slice(0, 220)}`);
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Groq returned invalid JSON (${model})`);
  }

  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error(`Groq returned empty content (${model})`);
  return text;
}

async function generateWithGroq(prompt: string): Promise<{ text: string; model: string }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const tried: string[] = [];
  let lastErr = "";

  for (const model of GROQ_MODELS) {
    if (tried.includes(model)) continue;
    tried.push(model);
    try {
      const text = await withTimeout(
        groqChat(model, prompt, key),
        PER_ATTEMPT_TIMEOUT_MS,
        `Groq ${model}`
      );
      return { text, model: `groq/${model}` };
    } catch (e) {
      lastErr = errorMessage(e);
      console.warn("[explain] Groq model failed:", lastErr);
    }
  }

  throw new Error(lastErr || "All Groq models failed");
}

async function generateWithGateway(prompt: string): Promise<{ text: string; model: string }> {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY not configured");
  }

  const { text } = await withTimeout(
    generateText({
      model: GATEWAY_MODEL,
      prompt,
      temperature: 0.4,
    }),
    PER_ATTEMPT_TIMEOUT_MS,
    `Gateway ${GATEWAY_MODEL}`
  );

  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("AI Gateway returned empty content");
  return { text: trimmed, model: GATEWAY_MODEL };
}

export async function POST(req: NextRequest) {
  let body: ExplainBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questionId = typeof body.questionId === "string" ? body.questionId.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const choices = Array.isArray(body.choices) ? body.choices.map(String) : [];
  const studentAnswer =
    typeof body.studentAnswer === "string" ? body.studentAnswer.trim() : "";
  const correctAnswer =
    typeof body.correctAnswer === "string" ? body.correctAnswer.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "General";
  const difficulty =
    typeof body.difficulty === "string" ? body.difficulty.trim() : "medium";

  if (!questionId || !question || choices.length < 2 || !studentAnswer || !correctAnswer) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: questionId, question, choices (≥2), studentAnswer, correctAnswer",
      },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const ip = clientIp(req);
  const rate = await checkRateLimit(supabase, `explain:${ip}`);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Try again later.",
        explanation: FALLBACK,
        cached: false,
        fallback: true,
        resetAt: rate.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rate.resetAt),
        },
      }
    );
  }

  if (supabase) {
    try {
      const { data: cached } = await supabase
        .from("question_explanations")
        .select("explanation")
        .eq("question_id", questionId)
        .maybeSingle();

      if (cached?.explanation) {
        return NextResponse.json({
          explanation: cached.explanation,
          cached: true,
          fallback: false,
        });
      }
    } catch (e) {
      console.warn("[explain] cache read failed:", e);
    }
  }

  const prompt = buildPrompt({
    question,
    choices,
    studentAnswer,
    correctAnswer,
    subject,
    difficulty,
  });

  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY);

  if (!hasGroq && !hasGateway) {
    return NextResponse.json({
      explanation: FALLBACK,
      cached: false,
      fallback: true,
    });
  }

  let lastError = "";

  if (hasGroq) {
    try {
      const result = await generateWithGroq(prompt);

      if (supabase) {
        try {
          await supabase.from("question_explanations").upsert({
            question_id: questionId,
            explanation: result.text,
            subject,
            difficulty,
            model: result.model,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("[explain] cache write failed:", e);
        }
      }

      return NextResponse.json({
        explanation: result.text,
        cached: false,
        fallback: false,
        model: result.model,
      });
    } catch (e) {
      lastError = errorMessage(e);
      console.error("[explain] Groq failed:", lastError);
    }
  }

  if (hasGateway) {
    try {
      const result = await generateWithGateway(prompt);

      if (supabase) {
        try {
          await supabase.from("question_explanations").upsert({
            question_id: questionId,
            explanation: result.text,
            subject,
            difficulty,
            model: result.model,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("[explain] cache write failed:", e);
        }
      }

      return NextResponse.json({
        explanation: result.text,
        cached: false,
        fallback: false,
        model: result.model,
      });
    } catch (e) {
      lastError = errorMessage(e);
      console.error("[explain] Gateway failed:", lastError);
    }
  }

  return NextResponse.json({
    explanation: FALLBACK,
    cached: false,
    fallback: true,
  });
}
