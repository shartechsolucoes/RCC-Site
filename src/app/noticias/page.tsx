"use client";

import { Eye, Newspaper } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface NewsItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  viewCount: number;
  category: { name: string };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/news/public`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setNews);
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Notícias</h1>

        {news === null && <p className="text-sm text-zinc-500">Carregando...</p>}

        {news?.length === 0 && <p className="text-sm text-zinc-500">Nenhuma notícia publicada ainda.</p>}

        {news && news.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/noticias/${item.slug}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 transition-shadow hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-zinc-100 text-zinc-400">
                  {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <Newspaper size={28} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                  <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {item.category.name}
                  </span>
                  <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{item.title}</p>
                  {item.subtitle && (
                    <p className="line-clamp-2 text-xs text-zinc-500">{item.subtitle}</p>
                  )}
                  <p className="mt-auto flex items-center justify-between text-xs text-zinc-400">
                    {item.publishedAt && formatDate(item.publishedAt)}
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {item.viewCount}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
