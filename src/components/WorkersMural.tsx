"use client";

import { useMemo, useState } from "react";
import PersonAvatar from "@/components/PersonAvatar";
import { workerTags } from "@/lib/people";

type Worker = { id: number; name: string; role: string; photo: string };

/** Mural de gratidão: filtro por trabalho + avatares compactos. */
export default function WorkersMural({ workers }: { workers: Worker[] }) {
  const [active, setActive] = useState<string | null>(null);

  const tags = useMemo(() => {
    const count = new Map<string, number>();
    for (const w of workers) {
      for (const tag of workerTags(w.role)) {
        count.set(tag, (count.get(tag) ?? 0) + 1);
      }
    }
    return [...count.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(([tag]) => tag);
  }, [workers]);

  const visible = active
    ? workers.filter((w) => workerTags(w.role).includes(active))
    : workers;

  const chip = (selected: boolean) =>
    `rounded-full px-4 py-2 text-[15px] transition ${
      selected
        ? "bg-twilight-700 text-white"
        : "border border-sand-300 bg-white text-ink-600 hover:border-coral-500"
    }`;

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button type="button" className={chip(active === null)} onClick={() => setActive(null)}>
          Todos · {workers.length}
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={chip(active === tag)}
            onClick={() => setActive(active === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-5">
        {visible.map((w) => (
          <li key={w.id} className="text-center">
            <div className="flex justify-center">
              <PersonAvatar name={w.name} photo={w.photo} size={72} />
            </div>
            <p className="mt-2 text-[15px] font-medium leading-snug text-twilight-700">
              {w.name}
            </p>
            {w.role && (
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">{w.role}</p>
            )}
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p className="text-center text-ink-500">Ninguém com esse trabalho ainda.</p>
      )}
    </div>
  );
}
