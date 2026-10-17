import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ModelPricing } from "../src/types/model";
import { normalizeModelsDevApi } from "./normalize";

const DATA_DIR = path.join(process.cwd(), ".data");
const OUTPUT_FILE = path.join(process.cwd(), "src", "data", "models-test.json");
const SAMPLE_SIZE = 5;

type UnknownRecord = Record<string, unknown>;

interface ModelSample {
  modelId: string;
  providerId: string;
  name: string;
  pricing: ModelPricing;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}

function getProviderModelCount(api: UnknownRecord): number {
  return Object.values(api).reduce<number>((total, provider) => {
    if (!isRecord(provider) || !isRecord(provider.models)) {
      return total;
    }

    return total + Object.keys(provider.models).length;
  }, 0);
}

function collectSamples(api: UnknownRecord, models: UnknownRecord): ModelSample[] {
  const samples: ModelSample[] = [];

  providerLoop: for (const [providerId, provider] of Object.entries(api)) {
    if (!isRecord(provider) || !isRecord(provider.models)) {
      continue;
    }

    for (const [providerModelId, rawModel] of Object.entries(provider.models)) {
      if (!isRecord(rawModel)) {
        continue;
      }

      const modelId =
        typeof rawModel.canonical_model_id === "string"
          ? rawModel.canonical_model_id
          : providerModelId;
      const metadata = isRecord(models[modelId]) ? models[modelId] : null;
      const name =
        typeof rawModel.name === "string"
          ? rawModel.name
          : typeof metadata?.name === "string"
            ? metadata.name
            : modelId;

      samples.push({
        modelId,
        providerId,
        name,
        pricing: normalizeModelsDevApi(rawModel),
      });

      if (samples.length === SAMPLE_SIZE) {
        break providerLoop;
      }
    }
  }

  return samples;
}

async function writeTestData(): Promise<void> {
  const [api, models] = await Promise.all([
    readJson(path.join(DATA_DIR, "api.json")),
    readJson(path.join(DATA_DIR, "models.json")),
  ]);

  if (!isRecord(api) || !isRecord(models)) {
    throw new Error("Models.dev data must contain JSON objects");
  }

  const samples = collectSamples(api, models);

  if (samples.length < SAMPLE_SIZE) {
    throw new Error(`Expected ${SAMPLE_SIZE} models, found ${samples.length}`);
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(samples, null, 2)}\n`, "utf8");

  console.log(`models.json model count: ${Object.keys(models).length}`);
  console.log(`api.json provider-model count: ${getProviderModelCount(api)}`);
  console.log(`Saved ${samples.length} normalized samples to ${OUTPUT_FILE}`);
}

writeTestData().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
