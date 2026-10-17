import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI大模型智能选型导航 - 不看跑分看适合",
    template: "%s | AI大模型智能选型导航",
  },
  description:
    "对比主流 AI 大模型的真实价格、上下文、多模态能力与国内直连情况，按场景找到更适合你的模型。",
  keywords: [
    "AI大模型",
    "大模型选型",
    "模型价格",
    "上下文窗口",
    "多模态模型",
    "DeepSeek",
    "GPT",
    "Claude",
    "Qwen",
    "国内直连",
  ],
  applicationName: "AgentModelMatch",
  category: "technology",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AI大模型智能选型导航",
    title: "AI大模型智能选型导航 - 不看跑分看适合",
    description:
      "对比主流 AI 大模型的真实价格、上下文、多模态能力与国内直连情况。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
