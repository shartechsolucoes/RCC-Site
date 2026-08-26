import { EventCard } from "./EventCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface EventItem {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  location: string | null;
  startDate: string;
}

async function getEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch(`${API_URL}/events`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function splitByDate(events: EventItem[]) {
  const now = Date.now();
  return {
    upcoming: events.filter((event) => new Date(event.startDate).getTime() >= now),
    past: events.filter((event) => new Date(event.startDate).getTime() < now).reverse(),
  };
}

export default async function EventosPage() {
  const events = await getEvents();
  const { upcoming, past } = splitByDate(events);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-24">
        <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-zinc-900">Eventos</h1>
        <p className="max-w-xl text-base leading-7 text-zinc-500">
          Encontros, retiros e atividades acontecem ao longo do ano. Confira o que vem por aí e o que já rolou.
        </p>

        {events.length === 0 && <p className="mt-6 text-sm text-zinc-500">Nenhum evento público no momento.</p>}

        {upcoming.length > 0 && (
          <section className="mt-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-900">Próximos eventos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} isPast={false} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="mt-10 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-900">Eventos passados</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
