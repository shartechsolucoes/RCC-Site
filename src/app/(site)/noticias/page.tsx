import { Eye, Newspaper } from "lucide-react";
import Link from "next/link";

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

async function getNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_URL}/news/public`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NoticiasPage() {
  const news = await getNews();

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-24">
        <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-zinc-900">Notícias</h1>

        {news.length === 0 && <p className="text-sm text-zinc-500">Nenhuma notícia publicada ainda.</p>}

        {news.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/noticias/${item.slug}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 transition-shadow hover:shadow-md"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-zinc-100 text-zinc-400">
                  {item.coverImageUrl ? (
                    <>
                      {/* Capas costumam ser fotos verticais: a de trás preenche o
                          quadro desfocada, a da frente aparece inteira. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverImageUrl}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="relative h-full w-full object-contain"
                      />
                    </>
                  ) : (
                    <Newspaper size={28} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                  <span className="w-fit rounded-full bg-[#8a5a2b]/10 px-2.5 py-1 text-xs font-medium text-[#8a5a2b]">
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
