/**
 * Popula o banco com o acervo extraído do WordPress (data/seed/).
 * Uso: npx tsx scripts/seed.ts
 * Idempotente: limpa e re-insere (só use em setup inicial ou reset).
 */
import fs from "node:fs";
import path from "node:path";
import { getDb, schema } from "../src/db";

const SEED = path.join(process.cwd(), "data", "seed");
const read = (f: string) =>
  JSON.parse(fs.readFileSync(path.join(SEED, f), "utf-8"));

// Categoria de cada post do acervo (do WordPress original)
const POST_CATEGORIES: Record<string, string> = {
  "dialogo-espirita-com-o-seculo-xxi": "Seminário",
  "criancas-assistencia-social-19-08-2018": "Assistência Social",
  "seminario-150-anos-de-a-genese": "Seminário",
  "palestra-perispirito": "Palestra",
  "palestra-fundamentalismo-religioso": "Palestra",
  "seminario-revolucao-espirita": "Seminário",
  "inteligencia-artificial-pos-prova-psicografia-de-chico-xavier": "Matéria",
};

async function main() {
  const db = await getDb();

  console.log("limpando tabelas...");
  await db.delete(schema.revisions);
  await db.delete(schema.posts);
  await db.delete(schema.pages);
  await db.delete(schema.people);
  await db.delete(schema.scheduleItems);
  await db.delete(schema.settings);

  console.log("settings...");
  const settings = read("settings.json") as Record<string, string>;
  await db
    .insert(schema.settings)
    .values(Object.entries(settings).map(([key, value]) => ({ key, value })));

  console.log("horários...");
  const scheduleRows = (read("schedule.json") as Array<{
    day: number; time: string; activity: string; mode: string;
  }>).map((s, i) => ({ ...s, sort: i }));
  await db.insert(schema.scheduleItems).values(scheduleRows);

  console.log("pessoas...");
  type Person = { name: string; role: string; photo: string };
  const people: Array<typeof schema.people.$inferInsert> = [];
  (read("board_members.json") as Person[]).forEach((p, i) =>
    people.push({ kind: "board", sort: i, ...p })
  );
  (read("presidents.json") as Person[]).forEach((p, i) =>
    people.push({ kind: "president", sort: i, ...p })
  );
  (read("workers.json") as Person[]).forEach((p, i) =>
    people.push({ kind: "worker", sort: i, ...p })
  );
  await db.insert(schema.people).values(people);

  console.log("páginas...");
  type PageSeed = { slug: string; title: string; blocks: unknown[] };
  const pages = (read("pages.json") as PageSeed[]).map((p) => ({
    slug: p.slug,
    title: p.title,
    blocks: p.blocks as (typeof schema.pages.$inferInsert)["blocks"],
  }));
  await db.insert(schema.pages).values(pages);

  console.log("publicações...");
  type PostSeed = {
    slug: string; title: string; date: string; blocks: Array<{ type: string; src?: string }>;
  };
  const posts = (read("posts.json") as PostSeed[]).map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: POST_CATEGORIES[p.slug] ?? "",
    cover: p.blocks.find((b) => b.type === "image")?.src ?? "",
    blocks: p.blocks as (typeof schema.posts.$inferInsert)["blocks"],
    published: true,
  }));
  await db.insert(schema.posts).values(posts);

  const counts = {
    settings: Object.keys(settings).length,
    horarios: scheduleRows.length,
    pessoas: people.length,
    paginas: pages.length,
    publicacoes: posts.length,
  };
  console.log("seed ok:", counts);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
