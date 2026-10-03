import { Rng } from "./random.ts";
import {
  CATEGORY_WEIGHTS,
  CHUNK_BUILDERS,
  type CategoryName,
} from "./templates.ts";
import { ALL_WORDS } from "./vocabulary.ts";

export type GenerateOptions = {
  seed: number;
  targetWords: number;
};

export type DatasetStats = {
  seed: number;
  sentenceCount: number;
  wordCount: number;
  uniqueWords: number;
  targetWords: number;
  categoryCounts: Record<CategoryName, number>;
  frequencies: Record<string, number>;
  warnings: string[];
};

export type Dataset = {
  text: string;
  stats: DatasetStats;
};

const WEIGHTED_CATEGORIES: CategoryName[] = (
  Object.keys(CATEGORY_WEIGHTS) as CategoryName[]
).flatMap((name) => Array<CategoryName>(CATEGORY_WEIGHTS[name]).fill(name));

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z]/g, "");
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

export function generateDataset(options: GenerateOptions): Dataset {
  const { seed, targetWords } = options;
  if (!Number.isInteger(targetWords) || targetWords <= 0) {
    throw new Error(`targetWords must be a positive integer, got ${targetWords}`);
  }
  const rng = new Rng(seed);
  const chunks: string[][] = [];
  const categoryCounts = Object.fromEntries(
    Object.keys(CATEGORY_WEIGHTS).map((k) => [k, 0]),
  ) as Record<CategoryName, number>;

  let wordCount = 0;
  let guard = 0;
  const maxIterations = targetWords * 10;
  while (wordCount < targetWords) {
    if (++guard > maxIterations) {
      throw new Error("generation did not converge; check templates");
    }
    const category = rng.pick(WEIGHTED_CATEGORIES);
    const chunk = CHUNK_BUILDERS[category](rng);
    if (chunk.sentences.length === 0) continue;
    categoryCounts[category]++;
    chunks.push(chunk.sentences);
    wordCount += chunk.sentences.reduce((n, s) => n + countWords(s), 0);
  }

  rng.shuffle(chunks);

  const lines: string[] = [];
  for (const sentences of chunks) {
    if (sentences.length > 1 && lines.length > 0) lines.push("");
    lines.push(...sentences);
  }
  const text = lines.join("\n") + "\n";

  const stats = computeStats(text, seed, targetWords, categoryCounts);
  validate(text, stats);
  return { text, stats };
}

export function computeStats(
  text: string,
  seed: number,
  targetWords: number,
  categoryCounts: Record<CategoryName, number>,
): DatasetStats {
  const frequencies: Record<string, number> = {};
  let sentenceCount = 0;
  let wordCount = 0;
  const unique = new Set<string>();

  for (const raw of text.split(/\s+/)) {
    if (raw.length === 0) continue;
    wordCount++;
    const word = normalizeWord(raw);
    if (word.length === 0) continue;
    unique.add(word);
    frequencies[word] = (frequencies[word] ?? 0) + 1;
    if (raw.endsWith(".")) sentenceCount++;
  }

  const unknown = [...unique].filter((w) => !ALL_WORDS.has(w));
  const warnings: string[] = [];
  if (unknown.length > 0) {
    warnings.push(`words outside vocabulary list: ${unknown.join(", ")}`);
  }
  if (unique.size < 50 || unique.size > 150) {
    warnings.push(
      `unique word count ${unique.size} is outside the recommended range 50-150`,
    );
  }

  return {
    seed,
    sentenceCount,
    wordCount,
    uniqueWords: unique.size,
    targetWords,
    categoryCounts,
    frequencies,
    warnings,
  };
}

export function validate(text: string, stats: DatasetStats): void {
  if (/\b(undefined|null|NaN)\b/.test(text)) {
    throw new Error("dataset contains 'undefined', 'null' or 'NaN' strings");
  }
  if (stats.wordCount < stats.targetWords) {
    throw new Error(
      `word count ${stats.wordCount} is below target ${stats.targetWords}`,
    );
  }
  for (const line of text.split("\n")) {
    if (line.length === 0) continue;
    if (!line.endsWith(".")) {
      throw new Error(`sentence does not end with a period: ${line}`);
    }
  }
}
