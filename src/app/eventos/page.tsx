"use client";

import { Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface EventItem {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  location: string | null;
  startDate: string;
}

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function EventCard({ event, isPast }: { event: EventItem; isPast: boolean }) {
  const date = new Date(event.startDate);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="flex items-start gap-4 px-5 pt-5">
        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-amber-500 px-3 py-2 leading-none text-zinc-900 shadow-sm">
          <span className="text-2xl font-extrabold">{date.getDate()}</span>
          <span className="mt-1 text-[10px] font-semibold tracking-widest">{MONTHS[date.getMonth()]}</span>
        </div>
        <div className="flex flex-col gap-1.5 pt-0.5">
          <p className="text-sm font-medium leading-snug text-zinc-900">{event.name}</p>
          {event.location && (
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin size={11} /> {event.location}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex h-36 items-center justify-center bg-zinc-100 text-zinc-400">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt={event.name} className="h-full w-full object-cover" />
        ) : (
          <Calendar size={26} />
        )}
      </div>

      <details className="border-t border-zinc-100 text-xs font-medium [&_summary]:list-none">
        <summary className="flex divide-x divide-zinc-100 cursor-pointer">
          {!isPast && (
            <a
              href="/inscricao"
              onClick={(event) => event.stopPropagation()}
              className="flex-1 px-4 py-3 text-center text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Inscrever-se
            </a>
          )}
          {event.description && (
            <span className="flex-1 px-4 py-3 text-center text-zinc-500 transition-colors hover:bg-zinc-50">
              Mais info
            </span>
          )}
        </summary>
        {event.description && (
          <p className="border-t border-zinc-100 px-5 py-3 text-xs leading-5 text-zinc-500">{event.description}</p>
        )}
      </details>
    </div>
  );
}

export default function EventosPage() {
  const [events, setEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setEvents);
  }, []);

  const now = Date.now();
  const upcoming = events?.filter((event) => new Date(event.startDate).getTime() >= now) ?? [];
  const past = events?.filter((event) => new Date(event.startDate).getTime() < now).reverse() ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Eventos</h1>
        <p className="max-w-xl text-base leading-7 text-zinc-500">
          Encontros, retiros e atividades acontecem ao longo do ano. Confira o que vem por aí e o que já rolou.
        </p>

        {events === null && <p className="mt-6 text-sm text-zinc-500">Carregando...</p>}
        {events?.length === 0 && <p className="mt-6 text-sm text-zinc-500">Nenhum evento público no momento.</p>}

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
