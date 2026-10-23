import {
  AudioLines,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Type,
  Video,
  type LucideIcon,
} from "lucide-react";

interface ModalityDefinition {
  label: string;
  icon: LucideIcon;
}

const MODALITIES: Record<string, ModalityDefinition> = {
  text: { label: "文本", icon: Type },
  image: { label: "图像", icon: ImageIcon },
  audio: { label: "音频", icon: AudioLines },
  video: { label: "视频", icon: Video },
  pdf: { label: "PDF", icon: FileText },
};

const FALLBACK_MODALITY: ModalityDefinition = {
  label: "其他能力",
  icon: Sparkles,
};

interface ModalityIconsProps {
  items: string[];
  className?: string;
}

export function ModalityIcons({ items, className = "" }: ModalityIconsProps) {
  const uniqueItems = Array.from(new Set(items));

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {uniqueItems.map((item) => {
        const modality = MODALITIES[item] ?? FALLBACK_MODALITY;
        const Icon = modality.icon;

        return (
          <span
            key={item}
            title={modality.label}
            className="grid size-7 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]"
          >
            <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            <span className="sr-only">{modality.label}</span>
          </span>
        );
      })}
    </div>
  );
}
