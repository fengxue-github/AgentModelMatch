import modelsData from "@/data/models.json";

import type { ModelRecord } from "@/types/model";

const models = modelsData as ModelRecord[];

export const internationalModels = models.filter(
  (model) => model.region === "international",
);

export const domesticModels = models.filter(
  (model) => model.region === "domestic",
);

export function getModelBySlug(slug: string): ModelRecord | undefined {
  return models.find((model) => model.slug === slug);
}

export function getAllModels(): ModelRecord[] {
  return models;
}
