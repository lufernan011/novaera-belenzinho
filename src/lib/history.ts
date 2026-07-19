import { desc, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

export type Revision = typeof schema.revisions.$inferSelect;

/** Últimas alterações (para o resumo no painel). */
export async function getRecentRevisions(limit: number): Promise<Revision[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.revisions)
    .orderBy(desc(schema.revisions.id))
    .limit(limit);
}

/** Página do histórico completo, com contagem total. */
export async function getRevisionsPage(
  page: number,
  perPage: number
): Promise<{ rows: Revision[]; total: number; pages: number }> {
  const db = await getDb();
  const countRows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.revisions);
  const total = countRows[0]?.n ?? 0;
  const rows = await db
    .select()
    .from(schema.revisions)
    .orderBy(desc(schema.revisions.id))
    .limit(perPage)
    .offset((page - 1) * perPage);
  return { rows, total, pages: Math.max(1, Math.ceil(total / perPage)) };
}

/** "há 5 min", "ontem", "há 3 dias" ou a data. */
export function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return date.toLocaleDateString("pt-BR");
}

/** Quem fez: nome da pessoa, ou "senha mestre" para o acesso de recuperação. */
export function authorLabel(author: string): string {
  if (!author) return "—";
  if (author === "Senha mestre" || author === "Recuperação") return "senha mestre";
  return author;
}
