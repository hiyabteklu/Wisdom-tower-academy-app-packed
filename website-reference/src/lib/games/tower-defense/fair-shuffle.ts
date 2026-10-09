/**
 * Runtime fairness shuffler for multiple-choice questions
 * Honors absolute positional choices (e.g. "all of the above", "both A and B")
 */

const NON_SHUFFLEABLE_PATTERNS = [
  /all\s+of\s+the\s+above/i,
  /none\s+of\s+the\s+above/i,
  /both\s+[a-d]\s+and\s+[a-d]/i,
  /both\s+[a-d]\s+&\s+[a-d]/i,
  /neither\s+[a-d]\s+nor\s+[a-d]/i,
  /either\s+[a-d]\s+or\s+[a-d]/i,
  /^[a-d]\s+and\s+[a-d]$/i,
  /all\s+choices\s+are\s+correct/i,
  /none\s+of\s+these/i,
];

export function shouldPreserveChoiceOrder(choices: string[]): boolean {
  if (!choices || choices.length <= 1) return true;
  return choices.some((choice) =>
    NON_SHUFFLEABLE_PATTERNS.some((pattern) => pattern.test(choice.trim()))
  );
}

export function fairShuffleChoices(
  choices: string[],
  correctIndex: number
): { shuffledChoices: string[]; shuffledCorrectIndex: number } {
  if (!choices || choices.length <= 1) {
    return { shuffledChoices: [...choices], shuffledCorrectIndex: correctIndex };
  }

  // Preserve order if relative position phrases exist
  if (shouldPreserveChoiceOrder(choices)) {
    return {
      shuffledChoices: [...choices],
      shuffledCorrectIndex: Math.max(0, Math.min(correctIndex, choices.length - 1)),
    };
  }

  // Fisher-Yates shuffle with index tracking
  const indexed = choices.map((choice, originalIndex) => ({
    choice,
    originalIndex,
  }));

  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = indexed[i];
    indexed[i] = indexed[j];
    indexed[j] = temp;
  }

  const shuffledChoices = indexed.map((item) => item.choice);
  const shuffledCorrectIndex = indexed.findIndex(
    (item) => item.originalIndex === correctIndex
  );

  return {
    shuffledChoices,
    shuffledCorrectIndex: shuffledCorrectIndex !== -1 ? shuffledCorrectIndex : 0,
  };
}
