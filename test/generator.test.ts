import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { countWords, generateDataset, normalizeWord } from "../src/generator.ts";
import { parseArgs, writeDataset } from "../src/index.ts";
import { ANIMAL_FOOD } from "../src/relationships.ts";
import {
  animalChunk,
  CHUNK_BUILDERS,
  mixedChunk,
  peopleChunk,
  placeObjectChunk,
  storyChunk,
  vehicleChunk,
} from "../src/templates.ts";
import { ALL_WORDS } from "../src/vocabulary.ts";
import { Rng } from "../src/random.ts";

test("relationship consistency: animal foods are as specified", () => {
  assert.equal(ANIMAL_FOOD.cat, "fish");
  assert.equal(ANIMAL_FOOD.dog, "meat");
  assert.equal(ANIMAL_FOOD.bird, "seeds");
  assert.equal(ANIMAL_FOOD.horse, "grass");
  assert.equal(ANIMAL_FOOD.cow, "grass");
  assert.equal(ANIMAL_FOOD.rabbit, "carrot");
});

test("relationship consistency: animals only eat their defined food", () => {
  const { text } = generateDataset({ seed: 7, targetWords: 8000 });
  for (const line of text.split("\n")) {
    const m = line.match(/^the (\w+) eats (?:the |a )?(\w+)/);
    if (m && ANIMAL_FOOD[m[1]]) {
      assert.equal(m[2], ANIMAL_FOOD[m[1]], `bad food in: ${line}`);
    }
    const likes = line.match(/the (\w+) likes (?:the |a )?(\w+)/);
    if (likes && ANIMAL_FOOD[likes[1]]) {
      assert.equal(likes[2], ANIMAL_FOOD[likes[1]], `bad food in: ${line}`);
    }
  }
});

test("relationship consistency: vehicles only move on their defined place", () => {
  const { text } = generateDataset({ seed: 11, targetWords: 8000 });
  const expected: Record<string, string> = {
    car: "road", bus: "road", truck: "road", bike: "road",
    boat: "water", train: "railway",
  };
  for (const line of text.split("\n")) {
    const m = line.match(/the (\w+) moves on the (\w+)/g);
    if (!m) continue;
    for (const part of m) {
      const [, v, place] = part.match(/the (\w+) moves on the (\w+)/)!;
      if (expected[v]) {
        assert.equal(place, expected[v], `bad place in: ${line}`);
      }
    }
  }
});

test("deterministic: same seed produces identical output", () => {
  const a = generateDataset({ seed: 123, targetWords: 5000 });
  const b = generateDataset({ seed: 123, targetWords: 5000 });
  assert.equal(a.text, b.text);
  assert.deepEqual(a.stats, b.stats);
});

test("deterministic: different seeds produce different output", () => {
  const a = generateDataset({ seed: 1, targetWords: 2000 });
  const b = generateDataset({ seed: 2, targetWords: 2000 });
  assert.notEqual(a.text, b.text);
});

test("target word count is met or exceeded", () => {
  const target = 3000;
  const { text, stats } = generateDataset({ seed: 42, targetWords: target });
  assert.ok(stats.wordCount >= target, `${stats.wordCount} < ${target}`);
  assert.equal(stats.wordCount, countWords(text));
});

test("reasonable vocabulary size (50-150 unique words)", () => {
  const { stats } = generateDataset({ seed: 123, targetWords: 10000 });
  assert.ok(stats.uniqueWords >= 50, `too few: ${stats.uniqueWords}`);
  assert.ok(stats.uniqueWords <= 150, `too many: ${stats.uniqueWords}`);
  assert.equal(stats.warnings.length, 0, stats.warnings.join("; "));
});

test("no undefined/null/NaN strings in dataset", () => {
  const { text } = generateDataset({ seed: 99, targetWords: 10000 });
  assert.ok(!/undefined|null|NaN/.test(text));
});

test("every word used is in the declared vocabulary", () => {
  const { text } = generateDataset({ seed: 5, targetWords: 10000 });
  for (const raw of text.split(/\s+/)) {
    const w = normalizeWord(raw);
    if (w.length === 0) continue;
    assert.ok(ALL_WORDS.has(w), `unexpected word: ${w}`);
  }
});

test("templates generate valid sentences", () => {
  const rng = new Rng(2024);
  const builders = [
    animalChunk, peopleChunk, vehicleChunk,
    placeObjectChunk, storyChunk, mixedChunk,
  ];
  for (const build of builders) {
    for (let i = 0; i < 200; i++) {
      const chunk = build(rng);
      assert.ok(chunk.sentences.length >= 1);
      for (const s of chunk.sentences) {
        assert.ok(s.length > 0, "empty sentence");
        assert.ok(s.endsWith("."), `missing period: ${s}`);
        assert.ok(countWords(s) >= 2, `too short: ${s}`);
        assert.ok(!/undefined|null|NaN|\$\{/.test(s), `bad token in: ${s}`);
      }
    }
  }
  assert.equal(Object.keys(CHUNK_BUILDERS).length, 6);
});

test("output files are created", () => {
  const dir = mkdtempSync(join(tmpdir(), "mini-world-"));
  try {
    const { text, stats } = generateDataset({ seed: 123, targetWords: 1000 });
    writeDataset(dir, text, stats);
    const txtPath = join(dir, "mini-world.txt");
    const jsonPath = join(dir, "mini-world-stats.json");
    assert.ok(existsSync(txtPath));
    assert.ok(existsSync(jsonPath));
    const parsed = JSON.parse(readFileSync(jsonPath, "utf8"));
    assert.equal(parsed.seed, 123);
    assert.equal(parsed.wordCount, stats.wordCount);
    assert.ok(parsed.frequencies.cat > 0);
    assert.equal(readFileSync(txtPath, "utf8"), text);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("category distribution roughly matches weights", () => {
  const { stats } = generateDataset({ seed: 3, targetWords: 20000 });
  const total = Object.values(stats.categoryCounts).reduce((a, b) => a + b, 0);
  assert.ok(stats.categoryCounts.animal / total > 0.15, "animal share too low");
  assert.ok(stats.categoryCounts.story / total > 0.05, "story share too low");
});

test("parseArgs handles --words, --seed, --tokens", () => {
  const a = parseArgs(["--words", "40000", "--seed", "123"]);
  assert.equal(a.targetWords, 40000);
  assert.equal(a.seed, 123);
  const b = parseArgs(["--tokens", "50000"]);
  assert.equal(b.targetWords, 40000);
  assert.throws(() => parseArgs(["--seed", "abc"]));
  assert.throws(() => parseArgs(["--nope"]));
});
