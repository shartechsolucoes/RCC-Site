import { Calendar, Compass, Mic2, Newspaper, Users } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface NewsItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  category: { name: string };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_URL}/news/public`, { cache: "no-store" });
    if (!res.ok) return [];
    const news: NewsItem[] = await res.json();
    return news.slice(0, 3);
  } catch {
    return [];
  }
}

interface PublicPost {
  id: string;
  title: string | null;
  content: string;
  eventDate: string | null;
  createdAt: string;
  author: { member: { fullName: string } | null };
}

async function getPublicMural(): Promise<PublicPost[]> {
  try {
    const res = await fetch(`${API_URL}/mural/public`, { cache: "no-store" });
    if (!res.ok) return [];
    const posts: PublicPost[] = await res.json();
    return posts.slice(0, 3);
  } catch {
    return [];
  }
}

const FEATURES = [
  { title: "Missões", body: "Sede Sóbrio, Casais, Leigos e Juventude.", icon: Compass },
  { title: "Ministérios", body: "Teatro, Intercessão, Música e Comunicação.", icon: Mic2 },
  { title: "Eventos", body: "Inscrições, equipes e cronograma em um só lugar.", icon: Calendar },
  { title: "Comunidade", body: "Perfil, jornada e histórico de participação.", icon: Users },
];

export default async function Home() {
  const latestNews = await getLatestNews();
  const publicPosts = await getPublicMural();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden bg-zinc-900 px-6 pb-24 pt-40 text-center">
        <div className="absolute inset-0 bg-[url('/bg-hero.jpg')] bg-cover bg-center" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="light-glow" style={{ left: "38%", top: "-4%", width: "180px", height: "180px" }} />

          <div
            className="light-ray light-ray--1"
            style={{ left: "40%", top: "-5%", width: "170px", height: "85%" }}
          />
          <div
            className="light-ray light-ray--2"
            style={{ left: "48%", top: "-5%", width: "140px", height: "75%" }}
          />
          <div
            className="light-ray light-ray--3"
            style={{ left: "34%", top: "-5%", width: "110px", height: "65%" }}
          />

          <span className="dust-particle" style={{ left: "40%", top: "55%", width: "3px", height: "3px", animationDuration: "9s", animationDelay: "0s" }} />
          <span className="dust-particle" style={{ left: "45%", top: "60%", width: "2px", height: "2px", animationDuration: "11s", animationDelay: "2s" }} />
          <span className="dust-particle" style={{ left: "50%", top: "50%", width: "4px", height: "4px", animationDuration: "8s", animationDelay: "4s" }} />
          <span className="dust-particle" style={{ left: "43%", top: "65%", width: "2px", height: "2px", animationDuration: "10s", animationDelay: "1s" }} />
          <span className="dust-particle" style={{ left: "47%", top: "45%", width: "3px", height: "3px", animationDuration: "12s", animationDelay: "5s" }} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="relative flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-4xl text-4xl italic tracking-wide text-white sm:text-6xl" style={{ fontFamily: "Georgia, serif" }}>
            Jesus todo, todo de Jesus
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            Plataforma para conectar pessoas, formação, missões, ministérios e retiros da Fraternidade O Caminho.
          </p>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row">
        <div className="flex items-center bg-amber-500 px-8 py-6 sm:w-1/4">
          <p className="text-lg font-semibold text-zinc-900">Próximos Encontros</p>
        </div>
        <div className="grid flex-1 grid-cols-1 divide-y divide-zinc-100 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {publicPosts.length > 0 ? (
            publicPosts.map((post) => (
              <div key={post.id} className="flex flex-col justify-center gap-1 px-8 py-6">
                <p className="text-sm font-semibold tracking-wide text-zinc-900 line-clamp-1">{post.title || post.author?.member?.fullName || "Aviso"}</p>
                <p className="text-sm text-amber-600">{formatDate(post.eventDate || post.createdAt)}</p>
                <p className="text-xs tracking-wide text-zinc-500 line-clamp-3 whitespace-pre-line">{post.content}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col justify-center gap-1 px-8 py-6 sm:col-span-3">
              <p className="text-sm text-zinc-500">Nenhum aviso público no momento.</p>
            </div>
          )}
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Notícias</h2>
            <Link href="/noticias" className="text-sm font-medium text-amber-600 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {latestNews.map((item) => (
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
                  {item.publishedAt && (
                    <p className="mt-auto text-xs text-zinc-400">{formatDate(item.publishedAt)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-zinc-100 bg-zinc-50/60 px-5 py-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
                  <Icon size={16} />
                </span>
                <p className="mt-4 text-sm font-medium text-zinc-900">{feature.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
