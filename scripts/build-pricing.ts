import Decimal from "decimal.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  ChannelRef,
  ModelModalities,
  ModelPricing,
  ModelRecord,
  ModelRegion,
} from "../src/types/model";
import { normalizeModelsDevApi } from "./normalize";

interface ModelSelection {
  id: string;
  vendor: string;
  region: ModelRegion;
}

interface ProviderModelMatch {
  providerId: string;
  rawModel: UnknownRecord;
}

type UnknownRecord = Record<string, unknown>;

const DATA_DIR = path.join(process.cwd(), ".data");
const OUTPUT_FILE = path.join(process.cwd(), "src", "data", "models.json");
const CHANNELS_FILE = path.join(process.cwd(), "src", "data", "channels.json");

const MODEL_SELECTION: ModelSelection[] = [
  { id: "openai/gpt-5.4", vendor: "OpenAI", region: "international" },
  { id: "openai/gpt-5-mini", vendor: "OpenAI", region: "international" },
  { id: "openai/gpt-4o", vendor: "OpenAI", region: "international" },
  { id: "openai/o4-mini", vendor: "OpenAI", region: "international" },
  { id: "anthropic/claude-opus-4-5", vendor: "Anthropic", region: "international" },
  { id: "anthropic/claude-sonnet-4-5", vendor: "Anthropic", region: "international" },
  { id: "anthropic/claude-haiku-4-5", vendor: "Anthropic", region: "international" },
  { id: "google/gemini-3.6-flash", vendor: "Google", region: "international" },
  { id: "google/gemini-2.5-flash", vendor: "Google", region: "international" },
  { id: "google/gemini-2.5-pro", vendor: "Google", region: "international" },
  {
    id: "meta/llama-4-maverick-17b-instruct",
    vendor: "Meta",
    region: "international",
  },
  { id: "meta/llama-4-scout-17b-instruct", vendor: "Meta", region: "international" },
  { id: "mistral/mistral-large-4", vendor: "Mistral AI", region: "international" },
  {
    id: "mistral/mistral-medium-latest",
    vendor: "Mistral AI",
    region: "international",
  },
  { id: "xai/grok-4.5", vendor: "xAI", region: "international" },
  { id: "xai/grok-4.7", vendor: "xAI", region: "international" },
  { id: "cohere/command-a-03-2025", vendor: "Cohere", region: "international" },
  { id: "amazon/nova-pro", vendor: "Amazon", region: "international" },
  { id: "deepseek/deepseek-v4-pro", vendor: "深度求索 DeepSeek", region: "domestic" },
  {
    id: "deepseek/deepseek-v4-flash",
    vendor: "深度求索 DeepSeek",
    region: "domestic",
  },
  { id: "deepseek/deepseek-r1", vendor: "深度求索 DeepSeek", region: "domestic" },
  { id: "alibaba/qwen3.8-max", vendor: "阿里云 Qwen", region: "domestic" },
  { id: "alibaba/qwen3.5-flash", vendor: "阿里云 Qwen", region: "domestic" },
  { id: "alibaba/qwen3.8-flash", vendor: "阿里云 Qwen", region: "domestic" },
  {
    id: "alibaba/qwen3-vl-235b-a22b-instruct",
    vendor: "阿里云 Qwen",
    region: "domestic",
  },
  { id: "moonshotai/kimi-k3", vendor: "月之暗面 Kimi", region: "domestic" },
  { id: "moonshotai/kimi-k2.5", vendor: "月之暗面 Kimi", region: "domestic" },
  {
    id: "moonshotai/kimi-k2-thinking",
    vendor: "月之暗面 Kimi",
    region: "domestic",
  },
  { id: "zhipuai/glm-5.3", vendor: "智谱 AI", region: "domestic" },
  { id: "zhipuai/glm-5", vendor: "智谱 AI", region: "domestic" },
  { id: "zhipuai/glm-4.7", vendor: "智谱 AI", region: "domestic" },
  {
    id: "bytedance-seed/seed-2.1-pro",
    vendor: "字节跳动 Seed",
    region: "domestic",
  },
  {
    id: "bytedance-seed/seed-2.0-lite",
    vendor: "字节跳动 Seed",
    region: "domestic",
  },
  { id: "minimax/MiniMax-M2.5", vendor: "MiniMax", region: "domestic" },
  { id: "tencent/hy4-preview", vendor: "腾讯混元", region: "domestic" },
  {
    id: "baidu/ernie-4.5-vl-424b-a47b",
    vendor: "百度文心",
    region: "domestic",
  },
];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function createSlug(modelId: string): string {
  return modelId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findProviderModels(
  api: UnknownRecord,
  modelId: string,
): ProviderModelMatch[] {
  const matches: ProviderModelMatch[] = [];

  for (const [providerId, provider] of Object.entries(api)) {
    if (!isRecord(provider) || !isRecord(provider.models)) {
      continue;
    }

    for (const [providerModelId, rawModel] of Object.entries(provider.models)) {
      if (!isRecord(rawModel)) {
        continue;
      }

      if (rawModel.canonical_model_id === modelId || providerModelId === modelId) {
        matches.push({ providerId, rawModel });
      }
    }
  }

  return matches;
}

function updateLowest(current: Decimal | null, value: Decimal): Decimal {
  return current === null || value.lessThan(current) ? value : current;
}

function aggregatePricing(providerModels: ProviderModelMatch[]): ModelPricing {
  let lowestInput: Decimal | null = null;
  let lowestOutput: Decimal | null = null;
  let freeTierAvailable = false;

  for (const { rawModel } of providerModels) {
    const normalized = normalizeModelsDevApi(rawModel);
    const input =
      normalized.lowestInputPerM === null
        ? null
        : new Decimal(normalized.lowestInputPerM);
    const output =
      normalized.lowestOutputPerM === null
        ? null
        : new Decimal(normalized.lowestOutputPerM);

    if (normalized.freeTierAvailable) {
      freeTierAvailable = true;
    }

    if (input !== null && input.greaterThan(0)) {
      lowestInput = updateLowest(lowestInput, input);
    }

    if (output !== null && output.greaterThan(0)) {
      lowestOutput = updateLowest(lowestOutput, output);
    }
  }

  return {
    lowestInputPerM: lowestInput?.toNumber() ?? (freeTierAvailable ? 0 : null),
    lowestOutputPerM: lowestOutput?.toNumber() ?? (freeTierAvailable ? 0 : null),
    freeTierAvailable,
  };
}

function readChannels(raw: unknown): Map<string, ChannelRef> {
  if (!Array.isArray(raw)) {
    throw new Error("Channel data must be an array");
  }

  const channels = new Map<string, ChannelRef>();

  for (const item of raw) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.accessCN !== "boolean"
    ) {
      throw new Error("Invalid channel record");
    }

    channels.set(item.id, {
      id: item.id,
      name: item.name,
      accessCN: item.accessCN,
    });
  }

  return channels;
}

function buildModelRecord(
  selection: ModelSelection,
  api: UnknownRecord,
  models: UnknownRecord,
  channels: Map<string, ChannelRef>,
): ModelRecord {
  const metadata = models[selection.id];

  if (!isRecord(metadata)) {
    throw new Error(`Missing metadata for ${selection.id}`);
  }

  const providerModels = findProviderModels(api, selection.id);

  if (providerModels.length === 0) {
    throw new Error(`Missing provider pricing for ${selection.id}`);
  }

  const limits = isRecord(metadata.limit) ? metadata.limit : {};
  const modalities = isRecord(metadata.modalities) ? metadata.modalities : {};
  const normalizedModalities: ModelModalities = {
    input: readStringArray(modalities.input),
    output: readStringArray(modalities.output),
  };
  const modelChannels = Array.from(
    new Set(providerModels.map((match) => match.providerId)),
  ).flatMap((providerId) => {
    const channel = channels.get(providerId);
    return channel ? [channel] : [];
  });

  return {
    id: selection.id,
    slug: createSlug(selection.id),
    name: readString(metadata.name, selection.id).replace(/\s*\(latest\)$/i, "").trim(),
    vendor: selection.vendor,
    region: selection.region,
    description: readString(metadata.description, "暂无模型介绍"),
    pricing: aggregatePricing(providerModels),
    modalities: normalizedModalities,
    channels: modelChannels,
    contextWindow: readNumber(limits.context),
    maxOutputTokens: readNumber(limits.output),
    releaseDate: readString(metadata.release_date) || null,
    reasoning: metadata.reasoning === true,
    toolCall: metadata.tool_call === true,
    openWeights: metadata.open_weights === true,
  };
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}

export async function buildPricing(): Promise<void> {
  const [api, models, channelData] = await Promise.all([
    readJson(path.join(DATA_DIR, "api.json")),
    readJson(path.join(DATA_DIR, "models.json")),
    readJson(CHANNELS_FILE),
  ]);

  if (!isRecord(api) || !isRecord(models)) {
    throw new Error("Models.dev data must contain JSON objects");
  }

  const channels = readChannels(channelData);
  const records = MODEL_SELECTION.map((selection) =>
    buildModelRecord(selection, api, models, channels),
  );
  const uniqueSlugs = new Set(records.map((model) => model.slug));

  if (uniqueSlugs.size !== records.length) {
    throw new Error("Model slugs must be unique");
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(records, null, 2)}\n`, "utf8");

  const domesticCount = records.filter((model) => model.region === "domestic").length;
  const internationalCount = records.length - domesticCount;
  console.log(
    `Saved ${records.length} models (${internationalCount} international, ${domesticCount} domestic) to ${OUTPUT_FILE}`,
  );
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/scripts/build-pricing.ts")) {
  buildPricing().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
