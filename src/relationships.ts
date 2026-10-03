import type { Animal, Color, Food, Person, Place, Vehicle } from "./vocabulary.ts";
import { ANIMALS, PEOPLE, VEHICLES } from "./vocabulary.ts";

export const ANIMAL_FOOD: Readonly<Record<string, Food>> = {
  cat: "fish",
  dog: "meat",
  bird: "seeds",
  duck: "seeds",
  horse: "grass",
  cow: "grass",
  rabbit: "carrot",
  mouse: "bread",
  fish: "seeds",
};

export const ANIMAL_HOME: Readonly<Record<string, { place: string; prep: "in" | "on" }>> = {
  cat: { place: "house", prep: "in" },
  dog: { place: "house", prep: "in" },
  bird: { place: "tree", prep: "in" },
  horse: { place: "farm", prep: "on" },
  cow: { place: "farm", prep: "on" },
  duck: { place: "lake", prep: "in" },
  rabbit: { place: "garden", prep: "in" },
  mouse: { place: "kitchen", prep: "in" },
  fish: { place: "water", prep: "in" },
};

export const VEHICLE_PLACE: Readonly<Record<string, string>> = {
  car: "road",
  bus: "road",
  truck: "road",
  bike: "road",
  boat: "water",
  train: "railway",
};

export type Possession = {
  person: Person;
  kind: "animal" | "vehicle";
  item: Animal | Vehicle;
};

export const PERSON_POSSESSION: readonly Possession[] = [
  { person: "john", kind: "animal", item: "cat" },
  { person: "mary", kind: "animal", item: "dog" },
  { person: "alice", kind: "animal", item: "bird" },
  { person: "bob", kind: "vehicle", item: "car" },
  { person: "anna", kind: "vehicle", item: "bike" },
  { person: "tom", kind: "animal", item: "horse" },
];

export const PERSON_GENDER: Readonly<Record<string, "his" | "her">> = {
  john: "his",
  mary: "her",
  alice: "her",
  bob: "his",
  anna: "her",
  tom: "his",
};

export const VEHICLE_VERB: Readonly<Record<string, "drives" | "rides">> = {
  car: "drives",
  bus: "drives",
  truck: "drives",
  bike: "rides",
  train: "rides",
  boat: "rides",
};

export const ANIMAL_COLOR_OK: ReadonlySet<Animal> = new Set<Animal>([
  "bird", "fish", "duck", "cat", "dog", "horse", "cow", "rabbit",
]);

export function foodOf(animal: Animal): Food {
  return ANIMAL_FOOD[animal];
}

export function homeOf(animal: Animal): { place: string; prep: "in" | "on" } {
  return ANIMAL_HOME[animal];
}

export function vehiclePlaceOf(vehicle: Vehicle): string {
  return VEHICLE_PLACE[vehicle];
}

export const ALL_ANIMALS: readonly Animal[] = ANIMALS;
export const ALL_PEOPLE: readonly Person[] = PEOPLE;
export const ALL_VEHICLES: readonly Vehicle[] = VEHICLES;
export type ColorName = Color;
