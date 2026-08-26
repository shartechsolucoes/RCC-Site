import Link from "next/link";
import { SiteHeaderV2 } from "@/components/SiteHeaderV2";
import { SiteFooterV2 } from "@/components/SiteFooterV2";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface PublicPost {
  id: string;
  title: string | null;
  content: string;
  eventDate: string | null;
  createdAt: string;
  author: { member: { fullName: string } | null };
}

interface NewsItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  category: { name: string };
}

interface Mission {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
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

async function getMissions(): Promise<Mission[]> {
  try {
    const res = await fetch(`${API_URL}/missions`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
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

export default async function HomeV2() {
  const [publicPosts, latestNews, missions] = await Promise.all([
    getPublicMural(),
    getLatestNews(),
    getMissions(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bg-hero.jpg" alt="Fraternidade O Caminho" className="h-[620px] w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col">
          <SiteHeaderV2 variant="overlay" />

          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <h1 className="max-w-3xl text-4xl italic tracking-wide text-white sm:text-6xl" style={{ fontFamily: "Georgia, serif" }}>
              Jesus todo, todo de Jesus
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/85">
              Plataforma para conectar pessoas, formação, missões, ministérios e retiros da
              Fraternidade O Caminho.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tighter text-zinc-900">
            Mural
            <br />de Recados
          </h2>
          <p className="text-sm leading-6 text-zinc-500">
            Nossos avisos são pensados para manter você conectado à vida da comunidade. Confira
            abaixo os últimos recados do mural.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-zinc-200 pt-10 sm:grid-cols-3 sm:gap-10 sm:divide-x sm:divide-zinc-200">
          {publicPosts.length > 0 ? (
            publicPosts.map((post) => (
              <div key={post.id} className="flex flex-col gap-2 sm:pl-8 sm:first:pl-0">
                <p className="text-sm font-semibold text-zinc-900">
                  {formatDate(post.eventDate || post.createdAt)}
                </p>
                <p className="text-lg font-bold text-amber-700 line-clamp-1">
                  {post.title || post.author?.member?.fullName || "Aviso"}
                </p>
                <p className="text-xs leading-5 text-zinc-500 line-clamp-3 whitespace-pre-line">
                  {post.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 sm:col-span-3">Nenhum aviso público no momento.</p>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/eventos"
            className="rounded-sm bg-[#8a5a2b] px-6 py-2.5 text-xs font-medium tracking-wide text-white transition-colors hover:bg-[#71491f]"
          >
            VER TODOS OS AVISOS
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tighter text-zinc-900">
            Notícias
            <br />e Eventos
          </h2>
          <p className="text-sm leading-6 text-zinc-500">
            Confira as últimas novidades e eventos da nossa Fraternidade. Atualizamos
            regularmente informações sobre os próximos encontros e ficamos felizes em
            compartilhar o que acontece em nossa comunidade.
          </p>
        </div>

        {latestNews.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
            {latestNews.map((item) => (
              <div key={item.id} className="flex flex-col gap-3">
                <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImageUrl || "/bg-hero.jpg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  {item.publishedAt ? formatDate(item.publishedAt) : ""}
                </p>
                <p className="text-sm font-medium leading-6 text-zinc-900 line-clamp-2">
                  {item.title}
                </p>
                <Link
                  href={`/noticias/${item.slug}`}
                  className="mt-1 w-fit rounded-sm border border-[#8a5a2b]/50 px-6 py-2 text-xs font-medium tracking-wide text-[#8a5a2b] transition-colors hover:bg-[#8a5a2b] hover:text-white"
                >
                  LER MAIS
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-zinc-500">Nenhuma notícia publicada no momento.</p>
        )}
      </section>

      <section className="relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden px-6 text-center sm:min-h-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bg-hero.jpg" alt="Conheça a Fraternidade" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative flex flex-col items-center gap-4">
          <h2 className="text-3xl font-extrabold uppercase tracking-[0.2em] text-white sm:text-4xl">
            Conheça a Fraternidade
          </h2>
          <p className="max-w-md text-sm leading-6 text-white/80">
            Descubra a história, o carisma e a rotina de oração e vida em comunidade da
            Fraternidade O Caminho.
          </p>
          <Link
            href="/sobre"
            className="mt-2 rounded-sm bg-white px-8 py-3 text-xs font-medium tracking-wide text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Conhecer a Fraternidade
          </Link>
        </div>
      </section>

      <section className="w-full bg-white px-6 py-20">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tighter text-zinc-900">
            Missões
          </h2>
          <p className="text-sm leading-6 text-zinc-500">
            A Fraternidade O Caminho atua em diferentes frentes de missão, levando formação,
            acolhimento e evangelização a quem mais precisa.
          </p>
        </div>

        {missions.length > 0 ? (
          <div className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {missions.map((mission) => (
              <div key={mission.id} className="flex flex-col items-center gap-4 rounded-sm bg-[#8a5a2b] px-6 py-10 text-center">
                <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-white/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/bg-hero.jpg" alt={mission.name} className="h-full w-full object-cover" />
                </div>
                <p className="text-sm font-medium text-white">{mission.name}</p>
                {mission.description && (
                  <div
                    className="text-xs leading-5 text-white/80 line-clamp-4 [&_a]:underline [&_p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: mission.description }}
                  />
                )}
                <Link
                  href="/missoes"
                  className="mt-auto rounded-sm border border-white/60 px-6 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-white hover:text-[#8a5a2b]"
                >
                  SABER MAIS
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-10 max-w-6xl text-sm text-zinc-500">Nenhuma missão cadastrada ainda.</p>
        )}
      </section>

      <SiteFooterV2 />
    </div>
  );
}
