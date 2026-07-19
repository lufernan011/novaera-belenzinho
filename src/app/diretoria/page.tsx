import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PersonAvatar from "@/components/PersonAvatar";
import { getPeople, type Person } from "@/lib/content";
import { effectiveBoardGroup } from "@/lib/people";

export const metadata: Metadata = {
  title: "Diretoria",
  description: "O corpo diretivo atual do Centro Espírita Nova Era — Belenzinho, São Paulo.",
};

export default async function Page() {
  const board = await getPeople("board");

  // grupos na ordem em que aparecem na lista (definida no admin)
  const order: string[] = [];
  const byGroup = new Map<string, Person[]>();
  for (const person of board) {
    const group = effectiveBoardGroup(person);
    if (!byGroup.has(group)) {
      byGroup.set(group, []);
      order.push(group);
    }
    byGroup.get(group)!.push(person);
  }

  return (
    <PageShell
      title="Diretoria"
      image="/acervo/2017_10_reforma-concluida-1.jpg"
      intro="Dedicamos esta seção a honrar e homenagear nosso corpo diretivo, cujo esforço mantém viva a nossa casa. Agradecemos também a todos que passaram pelo quadro de diretores desde a fundação."
    >
      <div className="mx-auto max-w-3xl space-y-10">
        {order.map((group) => (
          <section key={group}>
            <h2 className="mb-5 text-center text-sm font-medium tracking-[0.2em] text-coral-700 uppercase">
              {group}
            </h2>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-6">
              {byGroup.get(group)!.map((p) => (
                <li key={p.id} className="w-40 text-center">
                  <div className="flex justify-center">
                    <PersonAvatar name={p.name} photo={p.photo} size={96} />
                  </div>
                  <p className="mt-3 font-display text-[17px] leading-snug text-petrol-700">
                    {p.name}
                  </p>
                  {p.role && (
                    <p className="mt-0.5 text-[14px] text-ink-600">{p.role}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
