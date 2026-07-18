import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/** Bloco de conteúdo das páginas e publicações. */
export type Block =
  | { type: "heading" | "subheading" | "paragraph"; text: string }
  | { type: "image"; src: string; alt?: string };

/** Configurações editáveis (telefone, endereço, doações, frases...). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

/** Grade de horários. day: 0=domingo ... 6=sábado. */
export const scheduleItems = pgTable("schedule_items", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  time: text("time").notNull(),
  activity: text("activity").notNull(),
  mode: text("mode").notNull().default("presencial"),
  sort: integer("sort").notNull().default(0),
});

/** Pessoas: diretoria, presidentes e trabalhadores homenageados. */
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // 'board' | 'president' | 'worker'
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  photo: text("photo").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

/** Páginas institucionais com conteúdo em blocos. */
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  blocks: jsonb("blocks").$type<Block[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Publicações (acervo do blog + novas). */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  category: text("category").notNull().default(""),
  cover: text("cover").notNull().default(""),
  blocks: jsonb("blocks").$type<Block[]>().notNull().default([]),
  published: boolean("published").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Snapshot de cada salvamento — alimenta o botão "Desfazer". */
export const revisions = pgTable("revisions", {
  id: serial("id").primaryKey(),
  entity: text("entity").notNull(), // 'settings' | 'schedule' | 'people:board' | 'page:slug' | 'post:id' ...
  snapshot: jsonb("snapshot").notNull(),
  label: text("label").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
