export const ANIMALS = [
  "cat", "dog", "bird", "horse", "cow", "fish", "duck", "mouse", "rabbit",
] as const;

export const PEOPLE = ["john", "mary", "alice", "bob", "anna", "tom"] as const;

export const VEHICLES = ["car", "bus", "truck", "boat", "train", "bike"] as const;

export const PLACES = [
  "house", "garden", "park", "farm", "school", "road",
  "river", "lake", "city", "village", "room", "kitchen",
] as const;

export const FOODS = [
  "fish", "meat", "seeds", "bread", "apple", "grass",
  "carrot", "water", "milk",
] as const;

export const OBJECTS = [
  "ball", "book", "table", "chair", "bed", "box", "door", "window", "bag",
] as const;

export const FLAT_OBJECTS = ["table", "chair", "bed", "box"] as const;

export const COLORS = [
  "red", "blue", "green", "yellow", "black", "white", "brown",
] as const;

export const VERBS = [
  "is", "has", "likes", "eats", "drinks", "sees", "finds", "takes",
  "gives", "runs", "walks", "sleeps", "sits", "drives", "rides",
  "moves", "goes", "comes", "plays", "lives",
] as const;

export const GRAMMAR_WORDS = [
  "the", "a", "an", "in", "on", "at", "to", "from", "with", "near",
  "under", "over", "and", "but", "because", "this", "that", "his", "her",
] as const;

export const EXTRA_WORDS = [
  "animal", "vehicle", "food", "belongs", "railway", "tree", "for", "of", "walk",
] as const;

export type Animal = (typeof ANIMALS)[number];
export type Person = (typeof PEOPLE)[number];
export type Vehicle = (typeof VEHICLES)[number];
export type Place = (typeof PLACES)[number];
export type Food = (typeof FOODS)[number];
export type Color = (typeof COLORS)[number];
export type Obj = (typeof OBJECTS)[number];

export const ALL_WORDS: ReadonlySet<string> = new Set<string>([
  ...ANIMALS, ...PEOPLE, ...VEHICLES, ...PLACES, ...FOODS, ...OBJECTS,
  ...COLORS, ...VERBS, ...GRAMMAR_WORDS, ...EXTRA_WORDS,
]);
