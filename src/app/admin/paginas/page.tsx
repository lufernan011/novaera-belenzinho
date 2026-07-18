import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getDb, schema } from "@/db";

// Páginas cujo texto faz sentido editar por blocos
const EDITABLE: Record<string, string> = {
  espiritismo: "Espiritismo",
  "nossa-historia": "Nossa História",
  "trabalhos-realizados": "Trabalhos Realizados",
  trabalhadores: "Trabalhadores (texto de abertura)",
};

export default async function Page() {
  await requireAdmin();
  const db = await getDb();
  const pages: Array<typeof schema.pages.$inferSelect> = await db
    .select()
    .from(schema.pages);
  const editable = pages.filter((p) => p.slug in EDITABLE);
  editable.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-6">
        <Link
          href="/admin/"
          className="mb-4 inline-flex items-center gap-2 text-[16px] text-coral-700 hover:underline"
        >
          <span aria-hidden>←</span> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl text-twilight-700">Textos das páginas</h1>
        <p className="mt-2 text-[16px] text-ink-600">
          Escolha a página que você quer atualizar. Horários, contato, diretoria
          e doações têm botões próprios no painel.
        </p>
      </header>

      <ul className="space-y-3">
        {editable.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/paginas/${p.slug}/`}
              className="flex items-center justify-between rounded-2xl border border-sand-300 bg-white p-5 transition hover:border-coral-500"
            >
              <span className="font-display text-xl text-twilight-700">
                {EDITABLE[p.slug]}
              </span>
              <span className="text-[15px] text-coral-700">editar →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
