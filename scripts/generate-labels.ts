import OpenAI from "openai";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ModelLabel, ModelRecord } from "../src/types/model";

type UnknownRecord = Record<string, unknown>;

const MODELS_FILE = path.join(process.cwd(), "src", "data", "models.json");
const LABELS_DIR = path.join(process.cwd(), "src", "data", "labels");
const PROMPT_FILE = path.join(
  process.cwd(),
  "scripts",
  "prompts",
  "translate-label.md",
);
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown, field: string): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((item): item is string => typeof item === "string")
  ) {
    throw new Error(`Generated label has an invalid ${field} field`);
  }

  return value;
}

function toExportName(slug: string): string {
  const suffix = slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join("");

  return `generated${suffix}Label`;
}

function parseGeneratedLabel(content: string | null, model: ModelRecord): ModelLabel {
  if (!content) {
    throw new Error(`Model returned empty content for ${model.id}`);
  }

  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(trimmed) as unknown;

  if (
    !isRecord(parsed) ||
    typeof parsed.oneLiner !== "string" ||
    !isRecord(parsed.translations)
  ) {
    throw new Error(`Model returned an invalid label for ${model.id}`);
  }

  const translations = Object.fromEntries(
    Object.entries(parsed.translations).map(([term, value]) => {
      if (typeof value !== "string") {
        throw new Error(`Generated label translation must be a string`);
      }

      return [term, value];
    }),
  );

  return {
    modelId: model.id,
    oneLiner: parsed.oneLiner,
    translations,
    tags: readStringArray(parsed.tags, "tags"),
    caveats: readStringArray(parsed.caveats, "caveats"),
    source: "generated",
    reviewed: false,
  };
}

async function readModels(): Promise<ModelRecord[]> {
  const parsed = JSON.parse(await readFile(MODELS_FILE, "utf8")) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("models.json must contain an array");
  }

  return parsed as ModelRecord[];
}

async function readExistingLabelState(): Promise<{
  modelIds: Set<string>;
  filenames: Set<string>;
}> {
  const files = await readdir(LABELS_DIR, { withFileTypes: true });
  const modelIds = new Set<string>();
  const filenames = new Set<string>();

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(".ts")) {
      continue;
    }

    filenames.add(file.name);
    const source = await readFile(path.join(LABELS_DIR, file.name), "utf8");
    const modelIdMatch = source.match(/modelId:\s*["']([^"']+)["']/);

    if (modelIdMatch?.[1]) {
      modelIds.add(modelIdMatch[1]);
    }
  }

  return { modelIds, filenames };
}

async function generateLabel(
  client: OpenAI,
  prompt: string,
  apiModel: string,
  model: ModelRecord,
): Promise<ModelLabel> {
  const completion = await client.chat.completions.create({
    model: apiModel,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: JSON.stringify(
          {
            task: "Generate one ModelLabel object from these model facts.",
            model,
          },
          null,
          2,
        ),
      },
    ],
  });

  return parseGeneratedLabel(completion.choices[0]?.message.content ?? null, model);
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const models = await readModels();
  const existing = await readExistingLabelState();
  const pending = models.filter((model) => {
    const filename = `generated-${model.slug}.ts`;

    return !existing.modelIds.has(model.id) && !existing.filenames.has(filename);
  });

  if (dryRun) {
    console.log(`Models needing labels: ${pending.length}`);
    console.log(pending.map((model) => model.id).join("\n"));
    return;
  }

  if (pending.length === 0) {
    console.log("All models already have label files.");
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is required. Set it and optionally OPENAI_BASE_URL / OPENAI_MODEL.",
    );
  }

  const baseURL = process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL;
  const apiModel = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  const prompt = await readFile(PROMPT_FILE, "utf8");
  const client = new OpenAI({ apiKey, baseURL });
  let failures = 0;

  await mkdir(LABELS_DIR, { recursive: true });

  for (const model of pending) {
    try {
      const label = await generateLabel(client, prompt, apiModel, model);
      const exportName = toExportName(model.slug);
      const filename = `generated-${model.slug}.ts`;
      const source = `import type { ModelLabel } from "@/types/model";\n\nexport const ${exportName}: ModelLabel = ${JSON.stringify(
        label,
        null,
        2,
      )};\n`;

      await writeFile(path.join(LABELS_DIR, filename), source, "utf8");
      console.log(`Generated ${filename}`);
    } catch (error) {
      failures += 1;
      console.error(`Failed to generate label for ${model.id}`, error);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
