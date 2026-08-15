"use client";

import { Eye, Link as LinkIcon, Newspaper } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface NewsItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  viewCount: number;
  category: { name: string };
  author: { email: string; member: { fullName: string } | null };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.24-1.37a9.9 9.9 0 0 0 4.8 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.8 14.24c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.03.26-3.4-.71-2.9-1.19-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.01-2.4.26-.29.57-.36.76-.36h.55c.18 0 .42-.03.64.49.24.58.82 2 .89 2.15.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.91 1.05.94 1.94 1.24 2.22 1.38.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.2.5.32.06.12.06.68-.18 1.36Z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.55-1.5H16.6V4.35C16.3 4.3 15.3 4.2 14.15 4.2c-2.4 0-4.05 1.46-4.05 4.15V10.5H7.6v3h2.5V21h3.4Z" />
    </svg>
  );
}

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsItem | null | "not-found">(null);
  const [otherNews, setOtherNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/news/public/${params.slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setNews)
      .catch(() => setNews("not-found"));
  }, [params.slug]);

  useEffect(() => {
    fetch(`${API_URL}/news/public`)
      .then((res) => (res.ok ? res.json() : []))
      .then((all: NewsItem[]) => setOtherNews(all.filter((item) => item.slug !== params.slug).slice(0, 5)));
  }, [params.slug]);

  if (news === "not-found") {
    return (
      <main className="flex flex-1 flex-col items-center">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-32 text-center">
          <p className="text-lg font-medium text-zinc-900">Notícia não encontrada</p>
          <Link href="/noticias" className="text-sm text-amber-600 hover:underline">← Voltar para notícias</Link>
        </div>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-32">
          <p className="text-sm text-zinc-500">Carregando...</p>
        </div>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-24 pt-8">
        <Link href="/noticias" className="text-sm text-zinc-400 hover:text-zinc-700">← Notícias</Link>

        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {news.category.name}
          </span>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{news.title}</h1>
          {news.subtitle && (
            <p className="max-w-2xl text-base leading-7 text-zinc-500">{news.subtitle}</p>
          )}
          <p className="flex items-center gap-3 text-sm text-zinc-500">
            {news.author.member?.fullName ?? news.author.email}
            {news.publishedAt && (
              <>
                <span>·</span>
                {formatDate(news.publishedAt)}
              </>
            )}
            <span className="flex items-center gap-1">
              <Eye size={13} /> {news.viewCount}
            </span>
          </p>
        </div>

        {news.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.coverImageUrl} alt={news.title} className="max-h-[520px] w-full rounded-2xl object-cover" />
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div
            className="flex flex-col gap-4 text-base leading-7 text-zinc-700 [&_a]:text-amber-700 [&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          <aside className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Compartilhar</p>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${news.title} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-amber-400 hover:text-amber-600"
                >
                  <WhatsappIcon className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar no Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-amber-400 hover:text-amber-600"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  aria-label="Copiar link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-amber-400 hover:text-amber-600"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {otherNews.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Outras notícias</p>
                <div className="flex flex-col gap-4">
                  {otherNews.map((item) => (
                    <Link key={item.id} href={`/noticias/${item.slug}`} className="flex items-center gap-3 group">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-400">
                        {item.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <Newspaper size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-amber-700">{item.title}</p>
                        {item.publishedAt && (
                          <p className="mt-0.5 text-xs text-zinc-400">{formatDate(item.publishedAt)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
