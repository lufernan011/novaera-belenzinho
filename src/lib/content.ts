import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Block } from "@/db/schema";

export type { Block };

/** Todas as configurações como objeto chave → valor. */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const db = await getDb();
  const rows = await db.select().from(schema.settings);
  return Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
});

export type ScheduleItem = typeof schema.scheduleItems.$inferSelect;

export const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/** Grade completa ordenada por dia e horário. */
export const getSchedule = cache(async (): Promise<ScheduleItem[]> => {
  const db = await getDb();
  return db
    .select()
    .from(schema.scheduleItems)
    .orderBy(asc(schema.scheduleItems.day), asc(schema.scheduleItems.time), asc(schema.scheduleItems.sort));
});

/** Dia da semana atual em São Paulo (0=domingo). */
export function todayInSaoPaulo(): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

export type Person = typeof schema.people.$inferSelect;

export const getPeople = cache(async (kind: "board" | "president" | "worker"): Promise<Person[]> => {
  const db = await getDb();
  return db
    .select()
    .from(schema.people)
    .where(eq(schema.people.kind, kind))
    .orderBy(asc(schema.people.sort));
});

export type Page = typeof schema.pages.$inferSelect;

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const db = await getDb();
  const rows = await db.select().from(schema.pages).where(eq(schema.pages.slug, slug));
  return rows[0] ?? null;
});

export type Post = typeof schema.posts.$inferSelect;

export const getPosts = cache(async (): Promise<Post[]> => {
  const db = await getDb();
  const rows: Post[] = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.published, true));
  return rows.sort((a, b) => b.date.localeCompare(a.date));
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const db = await getDb();
  const rows = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug));
  return rows[0] ?? null;
});

/** Data ISO → "2 de setembro de 2018". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}
