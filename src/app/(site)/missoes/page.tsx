import { Compass } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface Mission {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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

export default async function MissoesPage() {
  const missions = await getMissions();

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-24">
        <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-zinc-900">Missões</h1>

        {missions.length === 0 && <p className="text-sm text-zinc-500">Nenhuma missão cadastrada ainda.</p>}

        {missions.length > 0 && (
          <div className="flex flex-col divide-y divide-zinc-100 rounded-2xl border border-zinc-100">
            {missions.map((mission) => (
              <div key={mission.id} className="flex items-start gap-3 px-5 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                  <Compass size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{mission.name}</p>
                  {mission.description && (
                    <div
                      className="mt-2 flex flex-col gap-3 text-sm leading-6 text-zinc-500 [&_a]:text-[#8a5a2b] [&_a]:underline [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_strong]:font-semibold [&_strong]:text-zinc-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: mission.description }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
