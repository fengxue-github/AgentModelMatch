import type { ModelLabel } from "@/types/model";

export const deepseekV4ProLabel: ModelLabel = {
  modelId: "deepseek/deepseek-v4-pro",
  oneLiner:
    "百万上下文、开放权重和低付费价凑在一起，适合把长代码库与长任务链一次交给它慢慢啃。",
  translations: {
    "100 万 tokens 上下文":
      "大约能把一套中型项目的核心代码、需求文档和讨论记录一起摊开来读。",
    "38.4 万 tokens 最大输出":
      "不只给结论，还能连续写出很长的代码、报告或迁移方案。",
    "输入 $0.2088 / 输出 $0.4176（每百万 tokens）":
      "按本次数据中的最低付费价，长上下文任务也不至于很快烧穿预算。",
    "开放权重":
      "模型权重可以自部署，对数据敏感、要求私有化的团队更友好。",
  },
  tags: ["长上下文", "代码代理", "开放权重", "高性价比", "中文友好"],
  caveats: [
    "目前只接收文本，图片、扫描 PDF 和音频需要先转成文字。",
    "开放权重不等于开箱即用，自部署还要算显卡、部署和运维成本。",
    "上下文能装下很多东西，不代表每个细节都能稳定记住，关键约束仍要重复确认。",
  ],
  source: "human",
  reviewed: true,
};
