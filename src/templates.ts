import type { Rng } from "./random.ts";
import {
  ANIMAL_FOOD,
  ANIMAL_HOME,
  PERSON_GENDER,
  PERSON_POSSESSION,
  VEHICLE_PLACE,
  VEHICLE_VERB,
} from "./relationships.ts";
import {
  ANIMALS,
  COLORS,
  FLAT_OBJECTS,
  OBJECTS,
  PLACES,
  VEHICLES,
} from "./vocabulary.ts";

export type Chunk = { sentences: string[] };

function one(...sentences: string[]): Chunk {
  return {
    sentences: sentences.map((s) => (s.endsWith(".") ? s : `${s}.`)),
  };
}

export function animalChunk(rng: Rng): Chunk {
  const a = rng.pick(ANIMALS);
  const food = ANIMAL_FOOD[a];
  const home = ANIMAL_HOME[a];
  const place = rng.pick(PLACES);
  const obj = rng.pick(OBJECTS);
  const color = rng.pick(COLORS);
  const templates: (() => Chunk)[] = [
    () => one(`the ${a} is an animal`),
    () => one(`a ${a} is an animal`),
    () => one(`this is a ${a}`),
    () => one(`the ${a} eats ${food}`),
    () => one(`a ${a} likes ${food}`),
    () => one(`the ${a} finds ${food}`),
    () => one(`${food} is food for the ${a}`),
    () => one(`the ${a} eats ${food} in the ${home.place}`),
    () => one(`the ${a} lives ${home.prep} the ${home.place}`),
    () => one(`a ${a} lives ${home.prep} the ${home.place}`),
    () => one(`the ${a} sleeps in the ${place}`),
    () => one(`the ${a} runs in the ${place}`),
    () => one(`the ${a} walks in the ${place}`),
    () => one(`the ${a} sees the ${obj}`),
    () => one(`the ${a} plays with a ${obj}`),
    () => one(`the ${a} is ${color}`),
    () => one(`the ${a} sits ${home.prep} the ${home.place}`),
    () => one(`the ${a} drinks water`),
    () => one(`the ${a} likes ${food} because ${food} is food`),
    () => one(`the ${a} comes from the ${home.place}`),
  ];
  return rng.pick(templates)();
}

export function peopleChunk(rng: Rng): Chunk {
  const p = rng.pick(PERSON_POSSESSION);
  const g = PERSON_GENDER[p.person];
  const place = rng.pick(PLACES);
  const isAnimal = p.kind === "animal";
  const food = isAnimal ? ANIMAL_FOOD[p.item] : undefined;
  const home = isAnimal ? ANIMAL_HOME[p.item] : undefined;
  const templates: (() => Chunk)[] = [
    () => one(`${p.person} has a ${p.item}`),
    () => one(`the ${p.item} belongs to ${p.person}`),
    () => one(`${p.person} sees ${g} ${p.item}`),
    () => one(`${p.person} likes ${g} ${p.item}`),
    () => one(`${p.person} and the ${p.item} walk in the ${place}`),
    () => one(`${p.person} goes to the ${place} with ${g} ${p.item}`),
    () => one(`${p.person} is at the ${place}`),
    () => one(`this is ${p.person}`),
    () => one(`${p.person} takes the ${p.item} to the ${place}`),
  ];
  if (isAnimal && food && home) {
    templates.push(
      () => one(`${p.person} gives ${food} to ${g} ${p.item}`),
      () => one(`${p.person} gives ${food} to the ${p.item}`),
      () => one(`the ${p.item} of ${p.person} eats ${food}`),
      () => one(`${p.person} sees ${g} ${p.item} in the ${home.place}`),
      () => one(`${p.person} finds ${food} and the ${p.item} eats the ${food}`),
    );
  }
  if (!isAnimal) {
    const vplace = VEHICLE_PLACE[p.item];
    const color = rng.pick(COLORS);
    templates.push(
      () => one(`the ${p.item} of ${p.person} is ${color}`),
      () => one(`${p.person} ${VEHICLE_VERB[p.item]} the ${p.item} on the ${vplace}`),
    );
  }
  return rng.pick(templates)();
}

export function vehicleChunk(rng: Rng): Chunk {
  const v = rng.pick(VEHICLES);
  const vplace = VEHICLE_PLACE[v];
  const color = rng.pick(COLORS);
  const person = rng.pick(PERSON_POSSESSION);
  const place = rng.pick(PLACES);
  const templates: (() => Chunk)[] = [
    () => one(`the ${v} is a vehicle`),
    () => one(`a ${v} is a vehicle`),
    () => one(`the ${v} is ${color}`),
    () => one(`the ${color} ${v} moves on the ${vplace}`),
    () => one(`the ${v} moves on the ${vplace}`),
    () => one(`a ${v} moves on the ${vplace}`),
    () => one(`${person.person} ${VEHICLE_VERB[v]} the ${color} ${v}`),
    () => one(`${person.person} ${VEHICLE_VERB[v]} the ${v}`),
    () => one(`${person.person} goes on the ${v}`),
    () => one(`the ${v} is near the ${place}`),
    () => one(`the ${color} ${v} is at the ${place}`),
    () => one(`this ${v} is ${color}`),
    () => one(`the ${v} comes from the ${place}`),
    () => one(`the ${v} moves on the ${vplace} and the ${v} is ${color}`),
  ];
  return rng.pick(templates)();
}

export function placeObjectChunk(rng: Rng): Chunk {
  const o = rng.pick(OBJECTS);
  const o2 = rng.pick(FLAT_OBJECTS);
  const place = rng.pick(PLACES);
  const color = rng.pick(COLORS);
  const person = rng.pick(PERSON_POSSESSION);
  const templates: (() => Chunk)[] = [
    () => one(`the ${o} is in the ${place}`),
    () => one(`a ${o} is in the ${place}`),
    () => one(`the ${o} is on the ${o2}`),
    () => one(`the ${o} is under the ${o2}`),
    () => one(`the ${o} is near the ${o2}`),
    () => one(`the ${o} is ${color}`),
    () => one(`the ${color} ${o} is in the ${place}`),
    () => one(`the ${place} has a ${o}`),
    () => one(`the ${place} has a ${color} ${o}`),
    () => one(`${person.person} finds the ${o} in the ${place}`),
    () => one(`${person.person} takes the ${o}`),
    () => one(`${person.person} gives the ${o} to ${rng.pick(PERSON_POSSESSION).person}`),
    () => one(`this is the ${place}`),
    () => one(`the ${place} is in the ${rng.pick(["city", "village"] as const)}`),
    () => one(`the door is in the ${place}`),
    () => one(`the window is in the ${place}`),
    () => one(`${person.person} sits on the ${o2} in the ${place}`),
    () => one(`the book is on the table and the ball is under the table`),
  ];
  return rng.pick(templates)();
}

export function storyChunk(rng: Rng): Chunk {
  const p = rng.pick(PERSON_POSSESSION);
  const g = PERSON_GENDER[p.person];
  const place = rng.pick(PLACES);
  const color = rng.pick(COLORS);
  const obj = rng.pick(OBJECTS);
  const stories: (() => Chunk)[] = [];

  if (p.kind === "animal") {
    const food = ANIMAL_FOOD[p.item];
    const home = ANIMAL_HOME[p.item];
    stories.push(
      () => one(
        `${p.person} has a ${p.item}`,
        `the ${p.item} likes ${food}`,
        `the ${p.item} sleeps in the ${place}`,
      ),
      () => one(
        `${p.person} has a ${p.item}`,
        `the ${p.item} sees a ${food}`,
        `the ${p.item} eats the ${food}`,
      ),
      () => one(
        `${p.person} has a ${p.item}`,
        `${p.person} gives ${food} to ${g} ${p.item}`,
        `the ${p.item} eats the ${food}`,
      ),
      () => one(
        `the ${p.item} lives ${home.prep} the ${home.place}`,
        `${p.person} sees the ${p.item}`,
        `the ${p.item} belongs to ${p.person}`,
      ),
      () => one(
        `${p.person} walks with the ${p.item} in the ${place}`,
        `the ${p.item} sees a ${obj}`,
        `the ${p.item} plays with the ${obj}`,
      ),
      () => one(
        `${p.person} has a ${p.item}`,
        `the ${p.item} likes ${food}`,
      ),
    );
  } else {
    const vplace = VEHICLE_PLACE[p.item];
    stories.push(
      () => one(
        `the ${p.item} is ${color}`,
        `${p.person} ${VEHICLE_VERB[p.item]} the ${color} ${p.item}`,
      ),
      () => one(
        `${p.person} has a ${p.item}`,
        `the ${p.item} is ${color}`,
        `the ${p.item} moves on the ${vplace}`,
      ),
      () => one(
        `the ${p.item} is at the ${place}`,
        `${p.person} goes on the ${p.item}`,
        `the ${p.item} moves on the ${vplace}`,
      ),
    );
  }

  stories.push(
    () => one(
      `the ${obj} is in the ${place}`,
      `${p.person} finds the ${obj}`,
      `${p.person} takes the ${obj}`,
    ),
    () => one(
      `${p.person} is in the ${place}`,
      `${p.person} sees the ${obj}`,
      `the ${obj} is ${color}`,
    ),
  );

  return rng.pick(stories)();
}

export function mixedChunk(rng: Rng): Chunk {
  const a = rng.pick(ANIMALS);
  const v = rng.pick(VEHICLES);
  const food = ANIMAL_FOOD[a];
  const vplace = VEHICLE_PLACE[v];
  const home = ANIMAL_HOME[a];
  const person = rng.pick(PERSON_POSSESSION);
  const place = rng.pick(PLACES);
  const color = rng.pick(COLORS);
  const obj = rng.pick(OBJECTS);
  const templates: (() => Chunk)[] = [
    () => one(
      `the ${a} is an animal and the ${v} is a vehicle`,
    ),
    () => one(
      `the ${a} eats ${food} and the ${v} moves on the ${vplace}`,
    ),
    () => one(
      `${person.person} sees the ${a} near the ${v}`,
    ),
    () => one(
      `the ${a} lives ${home.prep} the ${home.place} but the ${v} is on the ${vplace}`,
    ),
    () => one(
      `the ${color} ${v} is near the ${place} and the ${a} is in the ${place}`,
    ),
    () => one(
      `${person.person} likes the ${a} and the ${v}`,
    ),
    () => one(
      `the ${a} sees the ${obj} and the ${a} plays with the ${obj}`,
    ),
    () => one(
      `the ${a} is an animal but the ${v} is a vehicle`,
    ),
    () => one(
      `${person.person} gives ${food} to the ${a} because the ${a} likes ${food}`,
    ),
    () => one(
      `the ${a} comes from the ${home.place} and goes to the ${place}`,
    ),
  ];
  return rng.pick(templates)();
}

export const CHUNK_BUILDERS = {
  animal: animalChunk,
  people: peopleChunk,
  vehicle: vehicleChunk,
  placeObject: placeObjectChunk,
  story: storyChunk,
  mixed: mixedChunk,
} as const;

export type CategoryName = keyof typeof CHUNK_BUILDERS;

export const CATEGORY_WEIGHTS: Readonly<Record<CategoryName, number>> = {
  animal: 25,
  people: 20,
  vehicle: 15,
  placeObject: 15,
  story: 15,
  mixed: 10,
};
