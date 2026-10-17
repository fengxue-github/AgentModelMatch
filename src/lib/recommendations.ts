import recommendationsData from "@/data/recommendations.json";

import type { ScenarioRule } from "@/rules/scenarios";
import type { ModelRecord } from "@/types/model";

export interface ScenarioRecommendation extends ScenarioRule {
  recommendations: {
    model: ModelRecord;
    reason: string;
  }[];
}

export const recommendationScenarios =
  recommendationsData.scenarios as ScenarioRecommendation[];
