import type { ChannelRef } from "@/types/model";

interface ChannelBadgeProps {
  channels: ChannelRef[];
}

export function ChannelBadge({ channels }: ChannelBadgeProps) {
  const hasAccessCN = channels.some((channel) => channel.accessCN);

  if (hasAccessCN) {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        ⚡️ 国内直连
      </span>
    );
  }

  if (channels.length > 0) {
    return (
      <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
        🌍 需科学上网
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
      渠道待确认
    </span>
  );
}
