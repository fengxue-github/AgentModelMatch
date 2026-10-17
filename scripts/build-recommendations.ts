import Decimal from "decimal.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { scenarioRules, type ScenarioRule } from "../src/rules/scenarios";
import type { ModelRecord } from "../src/types/model";

interface ScoredModel {
  model: ModelRecord;
  score: Decimal;
}

const MODELS_FILE = path.join(process.cwd(), "src", "data", "models.json");
const OUTPUT_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "recommendations.json",
);
const RECOMMENDATIONS_PER_SCENARIO = 3;

function formatPrice(price: number | null): string {
  if (price === null) {
    return "价格未知";
  }

  return price < 0.1
    ? `$${new Decimal(price).toFixed(3)} / M tokens`
    : `$${new Decimal(price).toFixed(2)} / M tokens`;
}

function formatTokens(tokens: number | null): string {
  return tokens === null
    ? "上下文未知"
    : `${new Intl.NumberFormat("zh-CN").format(tokens)} tokens`;
}

function matchesRule(model: ModelRecord, rule: ScenarioRule): boolean {
  if (
    !rule.requiresInput.every((modality) =>
      model.modalities.input.includes(modality),
    )
  ) {
    return false;
  }

  if (
    !rule.requiresOutput.every((modality) =>
      model.modalities.output.includes(modality),
    )
  ) {
    return false;
  }

  if (rule.maxPrice !== null) {
    if (model.pricing.lowestInputPerM === null) {
      return false;
    }

    if (
      new Decimal(model.pricing.lowestInputPerM).greaterThan(rule.maxPrice)
    ) {
      return false;
    }
  }

  if (
    rule.minContextWindow !== null &&
    (model.contextWindow === null ||
      model.contextWindow < rule.minContextWindow)
  ) {
    return false;
  }

  if (rule.accessCN && !model.channels.some((channel) => channel.accessCN)) {
    return false;
  }

  if (rule.requiresFreeTier && !model.pricing.freeTierAvailable) {
    return false;
  }

  return true;
}

function scoreModel(model: ModelRecord, rule: ScenarioRule): Decimal {
  const input = new Decimal(model.pricing.lowestInputPerM ?? 999);
  const output = new Decimal(model.pricing.lowestOutputPerM ?? 999);
  const context = new Decimal(model.contextWindow ?? 0).dividedBy(1_000_000);
  const contextWeight = rule.id === "cheap-long-doc" ? 0.45 : 0.15;
  const freeBonus = model.pricing.freeTierAvailable
    ? new Decimal(0.3)
    : new Decimal(0);

  return input
    .plus(output.dividedBy(4))
    .minus(context.times(contextWeight))
    .minus(freeBonus);
}

function rankModels(models: ModelRecord[], rule: ScenarioRule): ScoredModel[] {
  return models
    .filter((model) => matchesRule(model, rule))
    .map((model) => ({ model, score: scoreModel(model, rule) }))
    .sort((left, right) => left.score.comparedTo(right.score))
    .slice(0, RECOMMENDATIONS_PER_SCENARIO);
}

function buildReason(model: ModelRecord, rule: ScenarioRule): string {
  const directAccessNote = model.channels.some((channel) => channel.accessCN)
    ? " 无需折腾网络，国内直接可用。"
    : "";

  if (rule.id === "write-with-image") {
    return `支持图片输入，输入价 ${formatPrice(
      model.pricing.lowestInputPerM,
    )}，适合把截图或照片直接变成文字内容。${directAccessNote}`;
  }

  if (rule.id === "cheap-long-doc") {
    return `上下文 ${formatTokens(
      model.contextWindow,
    )}，输入价 ${formatPrice(
      model.pricing.lowestInputPerM,
    )}，长文档分析成本低。${directAccessNote}`;
  }

  const channelNames = model.channels
    .filter((channel) => channel.accessCN)
    .map((channel) => channel.name)
    .join("、");

  return `有免费额度，且可通过 ${channelNames} 国内直连，日常闲聊不折腾。${directAccessNote}`;
}

async function readModels(): Promise<ModelRecord[]> {
  const parsed = JSON.parse(await readFile(MODELS_FILE, "utf8")) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("models.json must contain an array");
  }

  return parsed as ModelRecord[];
}

export async function buildRecommendations(): Promise<void> {
  const models = await readModels();
  const scenarios = scenarioRules.map((rule) => {
    const rankedModels = rankModels(models, rule);

    if (rankedModels.length < 2) {
      throw new Error(`Scenario ${rule.id} has fewer than 2 matches`);
    }

    return {
      ...rule,
      recommendations: rankedModels.map(({ model }) => ({
        model,
        reason: buildReason(model, rule),
      })),
    };
  });

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(
    OUTPUT_FILE,
    `${JSON.stringify({ scenarios }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Saved ${scenarios.length} scenarios to ${OUTPUT_FILE}: ${scenarios
      .map((scenario) => `${scenario.id}=${scenario.recommendations.length}`)
      .join(", ")}`,
  );
}

if (
  process.argv[1]
    ?.replaceAll("\\", "/")
    .endsWith("/scripts/build-recommendations.ts")
) {
  buildRecommendations().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
