import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { generateDataset } from "./generator.ts";

export type CliOptions = {
  seed: number;
  targetWords: number;
  outDir: string;
};

export function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    seed: 123,
    targetWords: 40000,
    outDir: join(import.meta.dirname ?? ".", "..", "data"),
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = argv[++i];
    switch (arg) {
      case "--seed":
        options.seed = Number.parseInt(value, 10);
        if (!Number.isInteger(options.seed)) throw new Error(`invalid --seed: ${value}`);
        break;
      case "--words":
        options.targetWords = Number.parseInt(value, 10);
        if (!Number.isInteger(options.targetWords) || options.targetWords <= 0) {
          throw new Error(`invalid --words: ${value}`);
        }
        break;
      case "--tokens": {
        const tokens = Number.parseInt(value, 10);
        if (!Number.isInteger(tokens) || tokens <= 0) {
          throw new Error(`invalid --tokens: ${value}`);
        }
        options.targetWords = Math.round(tokens * 0.8);
        break;
      }
      case "--out":
        options.outDir = value;
        break;
      default:
        throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

export function writeDataset(outDir: string, text: string, stats: unknown): void {
  const dir = resolve(outDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "mini-world.txt"), text, "utf8");
  writeFileSync(join(dir, "mini-world-stats.json"), JSON.stringify(stats, null, 2) + "\n", "utf8");
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const { text, stats } = generateDataset({
    seed: options.seed,
    targetWords: options.targetWords,
  });
  writeDataset(options.outDir, text, stats);

  console.log(`wrote ${join(options.outDir, "mini-world.txt")}`);
  console.log(`wrote ${join(options.outDir, "mini-world-stats.json")}`);
  console.log(
    `seed=${stats.seed} sentences=${stats.sentenceCount} words=${stats.wordCount} uniqueWords=${stats.uniqueWords}`,
  );
  for (const warning of stats.warnings) {
    console.warn(`WARNING: ${warning}`);
  }
}

if (process.argv[1] && import.meta.filename === resolve(process.argv[1])) {
  main();
}
