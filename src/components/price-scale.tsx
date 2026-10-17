import type { ModelPricing } from "@/types/model";

interface PriceTier {
  max: number;
  activeSegments: number;
  colorClass: string;
  textClass: string;
  label: string;
}

const PRICE_TIERS: PriceTier[] = [
  {
    max: 0.5,
    activeSegments: 1,
    colorClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    label: "极低价",
  },
  {
    max: 1,
    activeSegments: 2,
    colorClass: "bg-lime-500",
    textClass: "text-lime-700",
    label: "低价",
  },
  {
    max: 3,
    activeSegments: 3,
    colorClass: "bg-amber-500",
    textClass: "text-amber-700",
    label: "中等价",
  },
  {
    max: 8,
    activeSegments: 4,
    colorClass: "bg-orange-500",
    textClass: "text-orange-700",
    label: "偏高",
  },
  {
    max: Number.POSITIVE_INFINITY,
    activeSegments: 5,
    colorClass: "bg-rose-500",
    textClass: "text-rose-700",
    label: "高价",
  },
];

const FREE_TIER: PriceTier = {
  max: 0,
  activeSegments: 1,
  colorClass: "bg-emerald-500",
  textClass: "text-emerald-700",
  label: "有免费额度",
};

const UNKNOWN_TIER: PriceTier = {
  max: 0,
  activeSegments: 1,
  colorClass: "bg-slate-400",
  textClass: "text-slate-500",
  label: "价格待补充",
};

function resolveTier(pricing: ModelPricing): PriceTier {
  if (pricing.freeTierAvailable) {
    return FREE_TIER;
  }

  const representativePrice = pricing.lowestInputPerM ?? pricing.lowestOutputPerM;

  if (representativePrice === null) {
    return UNKNOWN_TIER;
  }

  return (
    PRICE_TIERS.find((tier) => representativePrice <= tier.max) ?? UNKNOWN_TIER
  );
}

function formatPrice(price: number | null): string {
  if (price === null) {
    return "—";
  }

  if (price === 0) {
    return "免费";
  }

  return price < 0.1 ? `$${price.toFixed(3)}` : `$${price.toFixed(2)}`;
}

interface PriceScaleProps {
  pricing: ModelPricing;
}

export function PriceScale({ pricing }: PriceScaleProps) {
  const tier = resolveTier(pricing);

  return (
    <div
      aria-label={`输入 ${formatPrice(pricing.lowestInputPerM)}，输出 ${formatPrice(
        pricing.lowestOutputPerM,
      )}，${tier.label}`}
    >
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>输入 {formatPrice(pricing.lowestInputPerM)}</span>
        <span>输出 {formatPrice(pricing.lowestOutputPerM)}</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-sm ${
              index < tier.activeSegments ? tier.colorClass : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className={`font-medium ${tier.textClass}`}>{tier.label}</span>
        <span className="text-slate-400">USD / M tokens</span>
      </div>
    </div>
  );
}
