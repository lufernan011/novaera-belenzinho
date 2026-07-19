import Image from "next/image";
import type { Person } from "@/lib/content";

/** Grade de pessoas com foto, nome e função (diretoria, presidentes, trabalhadores). */
export default function PeopleGrid({
  people,
  columns = 3,
}: {
  people: Person[];
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-3 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={`grid grid-cols-1 gap-5 ${cols}`}>
      {people.map((p) => (
        <li
          key={p.id}
          className="overflow-hidden rounded-2xl border border-sand-200 bg-white text-center"
        >
          {p.photo ? (
            <Image
              src={p.photo}
              alt={`Foto de ${p.name}`}
              width={400}
              height={400}
              className="h-56 w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-sand-100 font-display text-4xl text-coral-500">
              {p.name.charAt(0)}
            </div>
          )}
          <div className="px-4 py-4">
            <p className="font-display text-lg leading-snug text-petrol-700">{p.name}</p>
            {p.role && <p className="mt-1 text-[15px] text-ink-600">{p.role}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
