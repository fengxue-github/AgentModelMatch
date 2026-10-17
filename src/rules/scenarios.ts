export type ScenarioId =
  | "write-with-image"
  | "cheap-long-doc"
  | "free-direct-cn";

export interface ScenarioRule {
  id: ScenarioId;
  title: string;
  description: string;
  requiresInput: string[];
  requiresOutput: string[];
  maxPrice: number | null;
  minContextWindow: number | null;
  accessCN: boolean;
  requiresFreeTier: boolean;
}

export const scenarioRules: ScenarioRule[] = [
  {
    id: "write-with-image",
    title: "看图写作",
    description: "需要读懂图片，再写文案、报告或脚本，适合把视觉素材直接变成文字。",
    requiresInput: ["image"],
    requiresOutput: ["text"],
    maxPrice: 1.0,
    minContextWindow: null,
    accessCN: false,
    requiresFreeTier: false,
  },
  {
    id: "cheap-long-doc",
    title: "便宜读长文",
    description: "预算有限，但需要把长报告、合同或代码库一次性交给模型分析。",
    requiresInput: ["text"],
    requiresOutput: ["text"],
    maxPrice: 1.0,
    minContextWindow: 200_000,
    accessCN: false,
    requiresFreeTier: false,
  },
  {
    id: "free-direct-cn",
    title: "国内免费闲聊",
    description: "想找一个有免费额度、国内可直连、适合日常对话的中文模型。",
    requiresInput: ["text"],
    requiresOutput: ["text"],
    maxPrice: 0.5,
    minContextWindow: null,
    accessCN: true,
    requiresFreeTier: true,
  },
];
