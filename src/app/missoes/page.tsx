"use client";

import { Compass } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface Mission {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function MissoesPage() {
  const [missions, setMissions] = useState<Mission[] | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/missions`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setMissions);
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Missões</h1>

        {missions === null && <p className="text-sm text-zinc-500">Carregando...</p>}

        {missions && (
          <div className="flex flex-col divide-y divide-zinc-100 rounded-2xl border border-zinc-100">
            {missions.map((mission) => (
              <div key={mission.id} className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                  <Compass size={16} />
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{mission.name}</p>
                  {mission.description && <p className="text-sm text-zinc-500">{mission.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
