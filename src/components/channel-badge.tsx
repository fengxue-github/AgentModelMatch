import type { ChannelRef } from "@/types/model";

interface ChannelBadgeProps {
  channels: ChannelRef[];
}

export function ChannelBadge({ channels }: ChannelBadgeProps) {
  const hasAccessCN = channels.some((channel) => channel.accessCN);

  if (hasAccessCN) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-1 text-xs font-medium text-[var(--success-text)]">
        <span aria-hidden="true">⚡️</span>
        <span>国内直连</span>
      </span>
    );
  }

  if (channels.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--warning-border)] bg-[var(--warning-bg)] px-2 py-1 text-xs font-medium text-[var(--warning-text)]">
        <span aria-hidden="true">🌍</span>
        <span>需科学上网</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
      渠道待确认
    </span>
  );
}
