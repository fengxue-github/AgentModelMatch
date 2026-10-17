import { deepseekV4ProLabel } from "@/data/labels/deepseek-v4-pro";
import { gpt54GeneratedLabel } from "@/data/labels/generated-gpt-5-4";
import { gpt5MiniLabel } from "@/data/labels/gpt-5-mini";
import type { ModelLabel } from "@/types/model";

const modelLabels: ModelLabel[] = [
  deepseekV4ProLabel,
  gpt5MiniLabel,
  gpt54GeneratedLabel,
];

export function getVisibleModelLabel(modelId: string): ModelLabel | undefined {
  const label = modelLabels.find((item) => item.modelId === modelId);

  return label?.reviewed ? label : undefined;
}
