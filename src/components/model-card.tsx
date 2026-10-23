import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ChannelBadge } from "@/components/channel-badge";
import { ModalityIcons } from "@/components/modality-icons";
import { PriceScale } from "@/components/price-scale";
import type { ModelRecord } from "@/types/model";

interface ModelCardProps {
  model: ModelRecord;
  reason?: string;
}

export function ModelCard({ model, reason }: ModelCardProps) {
  return (
    <Link
      href={`/models/${model.slug}`}
      className="group block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:ring-offset-2"
    >
      <article className="flex h-full min-h-72 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--text-faint)] group-hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold leading-6 text-[var(--text-primary)]">
              {model.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{model.vendor}</p>
            <div className="mt-2">
              <ChannelBadge channels={model.channels} />
            </div>
          </div>
          <ModalityIcons items={model.modalities.input} />
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
          {model.description}
        </p>

        {reason ? (
          <p className="mt-3 rounded-md bg-[var(--info-bg)] px-3 py-2 text-xs leading-5 text-[var(--info-text)]">
            <span className="font-semibold">为什么推荐：</span>
            {reason}
          </p>
        ) : null}

        <div className="mt-auto border-t border-[var(--border-subtle)] pt-4">
          <PriceScale pricing={model.pricing} />
          <div className="mt-4 flex items-center justify-end gap-1 text-sm font-medium text-[var(--text-primary)]">
            <span>查看详情</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
