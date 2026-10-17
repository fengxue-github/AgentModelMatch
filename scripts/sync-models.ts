import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildPricing } from "./build-pricing";
import { buildRecommendations } from "./build-recommendations";

const DATA_DIR = path.join(process.cwd(), ".data");
const API_URL = "https://models.dev/api.json";
const MODELS_URL = "https://models.dev/models.json";

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function syncModels(): Promise<void> {
  const [api, models] = await Promise.all([fetchJson(API_URL), fetchJson(MODELS_URL)]);

  await mkdir(DATA_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(DATA_DIR, "api.json"), `${JSON.stringify(api, null, 2)}\n`, "utf8"),
    writeFile(
      path.join(DATA_DIR, "models.json"),
      `${JSON.stringify(models, null, 2)}\n`,
      "utf8",
    ),
  ]);

  console.log(`Saved Models.dev data to ${DATA_DIR}`);
  await buildPricing();
  await buildRecommendations();
}

syncModels().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
