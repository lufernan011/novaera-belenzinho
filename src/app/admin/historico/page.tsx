import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getRevisionsPage } from "@/lib/history";
import HistoryList from "@/components/admin/HistoryList";

const PER_PAGE = 10;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  await requireAdmin();
  const { p } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const { rows, total, pages } = await getRevisionsPage(page, PER_PAGE);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-6">
        <Link
          href="/admin/"
          className="mb-4 inline-flex items-center gap-2 text-[16px] text-coral-700 hover:underline"
        >
          <span aria-hidden>←</span> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl text-petrol-700">
          Histórico de alterações
        </h1>
        <p className="mt-2 text-[16px] text-ink-600">
          Tudo o que foi mudado no site, do mais recente ao mais antigo.
          {total > 0 && ` ${total} no total.`}
        </p>
      </header>

      <div className="rounded-2xl border border-sand-300 bg-white px-5 py-2">
        <HistoryList rows={rows} />
      </div>

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between" aria-label="Páginas">
          {page > 1 ? (
            <Link
              href={`/admin/historico/?p=${page - 1}`}
              className="rounded-full border border-sand-300 bg-white px-5 py-2.5 text-[15px] text-petrol-700 hover:border-coral-500"
            >
              ← Mais recentes
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[14px] text-ink-500">
            Página {page} de {pages}
          </span>
          {page < pages ? (
            <Link
              href={`/admin/historico/?p=${page + 1}`}
              className="rounded-full border border-sand-300 bg-white px-5 py-2.5 text-[15px] text-petrol-700 hover:border-coral-500"
            >
              Mais antigas →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
