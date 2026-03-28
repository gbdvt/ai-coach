export type GoalPatch = {
  training_focus?: string;
  nutrition_focus?: string;
  phase_note?: string;
};

export function parseGoalUpdateLine(text: string): GoalPatch | null {
  const t = text.trim();
  const tf = t.match(/^training\s*focus\s*:\s*(.+)$/i);
  if (tf) return { training_focus: tf[1].trim() };
  const nf = t.match(/^nutrition\s*focus\s*:\s*(.+)$/i);
  if (nf) return { nutrition_focus: nf[1].trim() };
  const ph = t.match(/^phase\s*:\s*(.+)$/i);
  if (ph) return { phase_note: ph[1].trim() };
  const g = t.match(/^goal\s*:\s*(.+)$/i);
  if (g) return { phase_note: g[1].trim() };
  return null;
}
