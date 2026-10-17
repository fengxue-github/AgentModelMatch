import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bot,
  Check,
  FileText,
  MessageSquareQuote,
  Minus,
  Tags,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ChannelBadge } from "@/components/channel-badge";
import { ModalityIcons } from "@/components/modality-icons";
import { PriceScale } from "@/components/price-scale";
import { getVisibleModelLabel } from "@/lib/labels";
import { getAllModels, getModelBySlug } from "@/lib/models";
import type { ModelLabel, ModelRecord } from "@/types/model";

interface ModelPageProps {
  params: Promise<{ id: string }>;
}

const MATRIX_ROWS = [
  { key: "text", label: "文本" },
  { key: "image", label: "图像" },
  { key: "audio", label: "音频" },
  { key: "video", label: "视频" },
  { key: "pdf", label: "PDF 文档" },
] as const;

const TAG_STYLES = [
  "border-sky-200 bg-sky-50 text-sky-700",
  "border-emerald-200 bg-emerald-50 text-emerald-700",
  "border-amber-200 bg-amber-50 text-amber-800",
  "border-violet-200 bg-violet-50 text-violet-700",
  "border-slate-200 bg-slate-100 text-slate-700",
] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllModels().map((model) => ({ id: model.slug }));
}

export async function generateMetadata({
  params,
}: ModelPageProps): Promise<Metadata> {
  const { id } = await params;
  const model = getModelBySlug(id);

  if (!model) {
    return { title: "模型未找到 | AgentModelMatch" };
  }

  return {
    title: `${model.name} | 模型大白话百科`,
    description: model.description,
  };
}

function formatTokens(value: number | null): string {
  if (value === null) {
    return "未提供";
  }

  return `${new Intl.NumberFormat("zh-CN").format(value)} tokens`;
}

function formatBoolean(value: boolean): string {
  return value ? "支持" : "不支持";
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-l border-slate-200 pl-4">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-medium text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function CapabilityMark({ supported }: { supported: boolean }) {
  return supported ? (
    <span className="inline-grid size-7 place-items-center rounded-md bg-emerald-50 text-emerald-700">
      <Check aria-hidden="true" className="size-4" />
      <span className="sr-only">支持</span>
    </span>
  ) : (
    <span className="inline-grid size-7 place-items-center rounded-md bg-slate-100 text-slate-400">
      <Minus aria-hidden="true" className="size-4" />
      <span className="sr-only">不支持</span>
    </span>
  );
}

function CapabilityMatrix({ model }: { model: ModelRecord }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <th scope="col" className="px-5 py-3 font-medium">
              能力
            </th>
            <th scope="col" className="w-28 px-5 py-3 text-center font-medium">
              输入
            </th>
            <th scope="col" className="w-28 px-5 py-3 text-center font-medium">
              输出
            </th>
          </tr>
        </thead>
        <tbody>
          {MATRIX_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 last:border-b-0">
              <th scope="row" className="px-5 py-3 text-sm font-medium text-slate-800">
                {row.label}
              </th>
              <td className="px-5 py-3 text-center">
                <CapabilityMark supported={model.modalities.input.includes(row.key)} />
              </td>
              <td className="px-5 py-3 text-center">
                <CapabilityMark supported={model.modalities.output.includes(row.key)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabelSection({ label }: { label: ModelLabel }) {
  const isGenerated = label.source === "generated";

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            {isGenerated ? (
              <Bot aria-hidden="true" className="size-4 text-sky-600" />
            ) : (
              <BadgeCheck aria-hidden="true" className="size-4 text-emerald-600" />
            )}
            {isGenerated ? "AI 生成" : "人工撰写"}
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
            已校对
          </span>
        </div>
        <p className="mt-4 text-base font-medium leading-7 text-slate-900 sm:text-lg">
          {label.oneLiner}
        </p>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="口碑标签">
          {label.tags.map((tag, index) => (
            <span
              key={tag}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                TAG_STYLES[index % TAG_STYLES.length]
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <Tags aria-hidden="true" className="size-4 text-slate-500" />
          参数翻译
        </h3>
        <dl className="mt-3 divide-y divide-slate-100">
          {Object.entries(label.translations).map(([term, translation]) => (
            <div
              key={term}
              className="grid gap-1.5 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-6"
            >
              <dt className="text-sm font-medium text-slate-800">{term}</dt>
              <dd className="text-sm leading-6 text-slate-600">{translation}</dd>
            </div>
          ))}
        </dl>
      </div>

      {label.caveats.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-rose-900">
            <AlertTriangle aria-hidden="true" className="size-4" />
            说点大实话（缺点提示）
          </h3>
          <ul className="mt-4 space-y-3">
            {label.caveats.map((caveat) => (
              <li
                key={caveat}
                className="flex gap-3 text-sm leading-6 text-rose-900"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-500" />
                <span>{caveat}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { id } = await params;
  const model = getModelBySlug(id);

  if (!model) {
    notFound();
  }

  const label = getVisibleModelLabel(model.id);

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            返回模型列表
          </Link>

          <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
                  {model.region === "domestic" ? "国内模型" : "海外模型"}
                </span>
                <span className="text-slate-500">{model.vendor}</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {model.name}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                {model.description}
              </p>
              <div className="mt-4">
                <ModalityIcons items={model.modalities.input} />
              </div>
            </div>

            <div className="w-full max-w-xs border-t border-slate-200 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <PriceScale pricing={model.pricing} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-950">基础信息</h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="厂商" value={model.vendor} />
            <InfoItem label="模型 ID" value={model.id} />
            <InfoItem label="发布日期" value={model.releaseDate ?? "未提供"} />
            <InfoItem label="上下文窗口" value={formatTokens(model.contextWindow)} />
            <InfoItem label="最大输出" value={formatTokens(model.maxOutputTokens)} />
            <InfoItem label="推理能力" value={formatBoolean(model.reasoning)} />
            <InfoItem label="工具调用" value={formatBoolean(model.toolCall)} />
            <InfoItem label="开放权重" value={formatBoolean(model.openWeights)} />
            <InfoItem
              label="网络访问"
              value={<ChannelBadge channels={model.channels} />}
            />
          </dl>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">多模态能力矩阵</h2>
          <p className="mt-2 text-sm text-slate-500">
            快速查看模型可以接收和输出哪些内容形式。
          </p>
          <div className="mt-5">
            <CapabilityMatrix model={model} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">大白话翻译机</h2>
          {label ? (
            <LabelSection label={label} />
          ) : (
            <div className="mt-5 flex min-h-44 flex-col items-start justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6">
              <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <MessageSquareQuote aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                大白话解读正在准备中
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                这里将用更直白的语言说明模型擅长什么、不适合什么，以及适合怎样的使用场景。
              </p>
            </div>
          )}
        </section>

        <div className="flex items-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
          <FileText aria-hidden="true" className="size-3.5" />
          数据来源：Models.dev
        </div>
      </div>
    </main>
  );
}
