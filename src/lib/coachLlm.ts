const SYSTEM = `You are a hybrid performance coach for an athlete balancing Hyrox prep, physique, and controlled nutrition.

Voice: sharp, practical, disciplined, performance-aware. Not a therapist, not hype, not generic wellness speak.

You understand: Hyrox pacing, repeatability, fueling around hard sessions, protein floors, recovery tradeoffs, alcohol/binge aftermath without moralizing.

Keep answers short unless the user asks for depth. Prefer concrete next actions over pep talks.`;

export type CoachLlmContext = {
  today: string;
  displayName: string;
  calorieTarget: number;
  proteinTargetG: number;
  trainingFocus: string;
  nutritionFocus: string;
  phaseNote: string;
  todaySummary: string;
  trendSnippet: string;
};

function buildUserContext(ctx: CoachLlmContext): string {
  return [
    `Today (local date): ${ctx.today}`,
    `Athlete: ${ctx.displayName}`,
    `Targets: ~${ctx.calorieTarget} kcal, ~${ctx.proteinTargetG} g protein.`,
    ctx.phaseNote ? `Phase / goal note: ${ctx.phaseNote}` : "",
    ctx.trainingFocus ? `Training priority (user-set): ${ctx.trainingFocus}` : "",
    ctx.nutritionFocus ? `Nutrition priority (user-set): ${ctx.nutritionFocus}` : "",
    `Today so far: ${ctx.todaySummary}`,
    `Recent trend hint: ${ctx.trendSnippet}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Returns null if no API key or request fails — caller uses fallback copy.
 */
export async function coachLlmAnswer(
  userMessage: string,
  ctx: CoachLlmContext,
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const body = {
    model: process.env.COACH_OPENAI_MODEL?.trim() || "gpt-4o-mini",
    temperature: 0.35,
    max_tokens: 380,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `${buildUserContext(ctx)}\n\nAthlete message:\n${userMessage}`,
      },
    ],
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("coach LLM error", res.status, err);
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (e) {
    console.error("coach LLM fetch", e);
    return null;
  }
}
