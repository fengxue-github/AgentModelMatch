export interface ModelPricing {
  /** Lowest input price in USD per million tokens. */
  lowestInputPerM: number | null;
  /** Lowest output price in USD per million tokens. */
  lowestOutputPerM: number | null;
  freeTierAvailable: boolean;
}

export interface ChannelRef {
  id: string;
  name: string;
  accessCN: boolean;
}

export interface ModelLabel {
  modelId: string;
  oneLiner: string;
  translations: Record<string, string>;
  tags: string[];
  caveats: string[];
  source: "human" | "generated";
  reviewed: boolean;
}

export type ModelRegion = "domestic" | "international";

export interface ModelModalities {
  input: string[];
  output: string[];
}

export interface ModelRecord {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  region: ModelRegion;
  description: string;
  pricing: ModelPricing;
  modalities: ModelModalities;
  channels: ChannelRef[];
  contextWindow: number | null;
  maxOutputTokens: number | null;
  releaseDate: string | null;
  reasoning: boolean;
  toolCall: boolean;
  openWeights: boolean;
}
