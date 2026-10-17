# Translate Model Label

Generate a concise, plain-language label for one model using only supplied model facts.

## Output schema

Return one JSON object with this exact shape:

```json
{
  "modelId": "provider/model-id",
  "oneLiner": "一句话推荐理由",
  "translations": {
    "参数名或事实": "大白话解释"
  },
  "tags": ["口碑标签"],
  "caveats": ["需要提醒用户的限制或风险"],
  "source": "generated",
  "reviewed": false
}
```

## Rules

- `modelId` must match the canonical model ID.
- `translations` maps selected parameters or facts to plain-language explanations.
- `tags` and `caveats` must be grounded in the supplied model facts.
- `source` must be `"generated"`.
- `reviewed` defaults to `false`; only human review may change it to `true`.
- Do not invent benchmark scores, parameter counts, or capabilities that are absent from the input.
