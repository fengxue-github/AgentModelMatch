import Decimal from "decimal.js";

import type { ModelPricing } from "../src/types/model";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePrice(value: unknown): Decimal | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  try {
    const price = new Decimal(value);

    if (!price.isFinite() || price.isNegative()) {
      return null;
    }

    return price;
  } catch {
    return null;
  }
}

export function normalizeModelsDevApi(raw: unknown): ModelPricing {
  const cost = isRecord(raw) && isRecord(raw.cost) ? raw.cost : null;
  const input = parsePrice(cost?.input);
  const output = parsePrice(cost?.output);

  return {
    lowestInputPerM: input?.toNumber() ?? null,
    lowestOutputPerM: output?.toNumber() ?? null,
    freeTierAvailable:
      input !== null && output !== null && input.isZero() && output.isZero(),
  };
}
