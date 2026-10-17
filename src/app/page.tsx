import { ArrowRight, BookOpen, Globe2, Landmark, Sparkles } from "lucide-react";
import Link from "next/link";

import { ModelCard } from "@/components/model-card";
import { domesticModels, internationalModels } from "@/lib/models";
import type { ModelRecord } from "@/types/model";

export const dynamic = "force-static";

interface ModelSectionProps {
  title: string;
  countLabel: string;
  models: ModelRecord[];
  icon: typeof Globe2;
}

function ModelSection({ title, countLabel, models, icon: Icon }: ModelSectionProps) {
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Icon aria-hidden="true" className="size-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          </div>
          <span className="text-sm text-slate-500">{countLabel}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const totalModels = internationalModels.length + domesticModels.length;

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-slate-950 text-white">
                  <BookOpen aria-hidden="true" className="size-5" />
                </span>
                <span className="text-sm font-medium text-slate-500">
                  AgentModelMatch
                </span>
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                模型大白话百科
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                一页看懂主流模型的价格、基础能力和多模态支持。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-l-0 border-slate-200 md:border-l md:pl-8">
              <div>
                <p className="text-2xl font-semibold text-slate-950">{totalModels}</p>
                <p className="mt-1 text-xs text-slate-500">全部模型</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">
                  {internationalModels.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">海外模型</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">
                  {domesticModels.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">国内模型</p>
              </div>
            </div>
          </div>

          <Link
            href="/match"
            className="group mt-8 flex flex-col gap-4 rounded-lg bg-slate-950 px-5 py-4 text-white transition hover:bg-slate-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/10 text-white">
                <Sparkles aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="font-semibold">不知道选哪个？</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  按场景快速匹配合适的模型与推荐理由。
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              点击进行场景智能匹配
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-sm bg-emerald-500" />
              绿色代表便宜
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-sm bg-amber-500" />
              黄色代表中等
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-sm bg-rose-500" />
              红色代表偏贵
            </span>
            <span>价格单位：USD / M tokens</span>
          </div>
        </div>
      </header>

      <ModelSection
        title="海外模型"
        countLabel={`${internationalModels.length} 个模型`}
        models={internationalModels}
        icon={Globe2}
      />
      <ModelSection
        title="国内模型"
        countLabel={`${domesticModels.length} 个模型`}
        models={domesticModels}
        icon={Landmark}
      />
    </main>
  );
}
