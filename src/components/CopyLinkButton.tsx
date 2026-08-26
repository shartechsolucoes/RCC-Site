"use client";

import { Link as LinkIcon } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(url)}
      aria-label="Copiar link"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-amber-400 hover:text-amber-600"
    >
      <LinkIcon className="h-4 w-4" />
    </button>
  );
}
