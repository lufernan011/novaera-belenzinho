import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/content";
import { getDb, schema } from "@/db";

export default async function Page() {
  await requireAdmin();
  const db = await getDb();
  const posts: Array<typeof schema.posts.$inferSelect> = await db
    .select()
    .from(schema.posts);
  posts.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-6">
        <Link
          href="/admin/"
          className="mb-4 inline-flex items-center gap-2 text-[16px] text-coral-700 hover:underline"
        >
          <span aria-hidden>←</span> Voltar ao painel
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-twilight-700">Publicações</h1>
          <Link
            href="/admin/publicacoes/nova/"
            className="rounded-full bg-amber-500 px-6 py-3 text-[16px] font-medium text-ink-900 hover:bg-amber-300"
          >
            + Escrever nova publicação
          </Link>
        </div>
      </header>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/admin/publicacoes/${post.id}/`}
              className="flex items-center gap-4 rounded-2xl border border-sand-300 bg-white p-4 transition hover:border-coral-500"
            >
              {post.cover ? (
                <Image
                  src={post.cover}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-xl bg-twilight-700" />
              )}
              <span className="min-w-0">
                <span className="block truncate font-display text-lg text-twilight-700">
                  {post.title}
                </span>
                <span className="block text-[14px] text-ink-500">
                  {post.category || "Publicação"} · {formatDate(post.date)}
                  {!post.published && " · fora do ar"}
                </span>
              </span>
              <span className="ml-auto text-[15px] text-coral-700">editar →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
