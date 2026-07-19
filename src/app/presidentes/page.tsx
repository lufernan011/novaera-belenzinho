import type { Metadata } from "next";
import Image from "next/image";
import PageShell from "@/components/PageShell";
import { getPeople } from "@/lib/content";

export const metadata: Metadata = { title: "Presidentes" };

export default async function Page() {
  const presidents = await getPeople("president");

  return (
    <PageShell
      title="Presidentes"
      intro="As gestões que conduziram o Nova Era ao longo das décadas. Pedimos desculpas antecipadas por eventuais omissões."
    >
      <ol className="relative mx-auto max-w-2xl border-l-2 border-sand-300 pl-8">
        {presidents.map((p) => (
          <li key={p.id} className="relative mb-8 last:mb-0">
            <span
              aria-hidden
              className="absolute -left-[41px] top-8 h-4 w-4 rounded-full border-[3px] border-sand-50 bg-amber-500"
            />
            <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-sand-200 bg-white p-5">
              {p.photo ? (
                <Image
                  src={p.photo}
                  alt={`Foto de ${p.name}`}
                  width={440}
                  height={220}
                  className="h-20 w-auto shrink-0"
                />
              ) : null}
              <div className="min-w-40">
                <p className="font-display text-xl leading-snug text-twilight-700">
                  {p.name}
                </p>
                {p.role && (
                  <p className="mt-1 text-[15px] text-ink-600">{p.role}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
