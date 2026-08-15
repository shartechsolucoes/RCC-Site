"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface ImageUploadProps {
  name: string;
  label?: string;
  shape?: "square" | "circle";
}

export function ImageUpload({ name, label, shape = "square" }: ImageUploadProps) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/uploads`, { method: "POST", body: formData });
    setUploading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message ?? "Falha no upload");
      return;
    }

    const data = await response.json();
    setUrl(data.url);
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-zinc-600">
      {label && <span>{label}</span>}
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className={`h-12 w-12 object-cover ${shape === "circle" ? "rounded-full" : "rounded-lg"}`}
          />
        ) : (
          <span
            className={`flex h-12 w-12 items-center justify-center bg-zinc-100 text-zinc-400 ${
              shape === "circle" ? "rounded-full" : "rounded-lg"
            }`}
          >
            <ImagePlus size={18} />
          </span>
        )}
        <label className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
          {uploading ? (
            <span className="flex items-center gap-1">
              <Loader2 size={13} className="animate-spin" /> Enviando...
            </span>
          ) : url ? (
            "Trocar foto"
          ) : (
            "Escolher foto"
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
