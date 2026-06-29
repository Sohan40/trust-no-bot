"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

type ShareResultButtonProps = {
  shareText: string;
};

export function ShareResultButton({ shareText }: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(): Promise<void> {
    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
          title: "Trust No Bot result",
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
      onClick={() => void handleShare()}
      type="button"
    >
      <Share2 className="size-4" aria-hidden="true" />
      {copied ? "Copied" : "Share Result"}
    </button>
  );
}
