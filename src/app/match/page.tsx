import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { ModelCard } from "@/components/model-card";
import { recommendationScenarios } from "@/lib/recommendations";
import type { ScenarioId } from "@/rules/scenarios";

export const dynamic = "force-static";

const SCENARIO_ICONS: Record<ScenarioId, LucideIcon> = {
  "write-with-image": ImageIcon,
  "cheap-long-doc": FileText,
  "free-direct-cn": MessageCircle,
};

export default function MatchPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            返回模型列表
          </Link>

          <div className="mt-7 max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Sparkles aria-hidden="true" className="size-4" />
              场景智能匹配
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              先说你要做什么，再选模型
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              结果由静态规则预先计算，只保留最贴合场景的 3 个模型。
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="scenario-switcher">
          {recommendationScenarios.map((scenario, index) => (
            <input
              key={scenario.id}
              id={`scenario-${scenario.id}`}
              type="radio"
              name="scenario"
              className="scenario-radio"
              defaultChecked={index === 0}
            />
          ))}

          <div className="scenario-tab-list grid gap-3 md:grid-cols-3">
            {recommendationScenarios.map((scenario) => {
              const Icon = SCENARIO_ICONS[scenario.id];

              return (
                <label
                  key={scenario.id}
                  htmlFor={`scenario-${scenario.id}`}
                  data-scenario={scenario.id}
                  className="scenario-tab flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  <span className="font-semibold">{scenario.title}</span>
                </label>
              );
            })}
          </div>

          {recommendationScenarios.map((scenario) => (
            <div
              key={scenario.id}
              data-scenario={scenario.id}
              className="scenario-panel pt-8"
            >
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {scenario.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    {scenario.description}
                  </p>
                </div>
                <span className="text-sm text-slate-500">
                  {scenario.recommendations.length} 个匹配
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {scenario.recommendations.map(({ model, reason }) => (
                  <ModelCard key={model.id} model={model} reason={reason} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
