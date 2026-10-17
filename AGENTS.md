## 数据层
- 模型事实数据只从 src/data/models/ 读取，禁止在组件中直接 fetch Models.dev。
- 所有价格统一为 USD / M tokens；新增数据源必须先经过 scripts/normalize.ts，
  使用高精度十进制解析，禁止 float 乘法。
- 最低价推导只在 scripts/build-pricing.ts 中实现；前端卡片只消费 ModelPricing
  的 lowestInputPerM / lowestOutputPerM / freeTierAvailable，禁止在组件内比较
  provider 价格。

## 标签层
- 人工标签文件（无前缀）与生成标签文件（generated- 前缀）共用 ModelLabel 类型。
- 生成标签默认 reviewed: false，不进入用户可见文案；校对通过 PR 修改 reviewed
  字段完成，禁止在校对流程之外手动删除 generated 文件。
- 修改 ModelLabel 类型时，必须同步更新 scripts/prompts/translate-label.md 的
  输出 schema。

## 推荐引擎
- 场景规则只在 src/rules/ 中定义；页面组件不包含过滤或排序逻辑。
- “国内直连”只从 Channel.accessCN 读取，禁止根据模型名或厂商名推断。

## 静态优先
- V1.0 所有页面必须通过 generateStaticParams 预渲染，禁止引入运行时数据库查询。
- V1.0 不接入对话式推荐 API；V1.5 之前不新增需要客户端状态管理的功能。