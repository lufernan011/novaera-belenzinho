"use server";

import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDb, schema } from "@/db";
import type { Block } from "@/db/schema";
import { getSession, requireAdmin } from "@/lib/session";

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

// Proteção simples contra tentativa e erro (por instância)
const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a.padEnd(64, "\0"));
  const bb = Buffer.from(b.padEnd(64, "\0"));
  return crypto.timingSafeEqual(ba, bb) && a.length === b.length;
}

/** Hash de senha com scrypt (sem dependência externa). */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const userIdRaw = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("pin") ?? "").trim();
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  if (Date.now() < entry.lockedUntil) {
    return {
      error:
        "Muitas tentativas. Por segurança, aguarde 5 minutos e tente de novo.",
    };
  }

  const fail = () => {
    entry.count += 1;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCK_MS;
      entry.count = 0;
    }
    attempts.set(ip, entry);
    return { error: "Senha incorreta. Confira e tente novamente." };
  };

  let userId: number | undefined;
  let userName = "";

  if (userIdRaw === "master" || userIdRaw === "") {
    // Senha mestre: primeiro acesso (sem usuários) ou recuperação
    const expected = process.env.ADMIN_PIN ?? "";
    if (!expected || !safeEqual(password, expected)) return fail();
    userName = "Recuperação";
  } else {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, Number(userIdRaw)));
    const user = rows[0];
    if (!user || !verifyPassword(password, user.passwordHash)) return fail();
    userId = user.id;
    userName = user.name;
  }

  attempts.delete(ip);
  const session = await getSession();
  session.isAdmin = true;
  session.userId = userId;
  session.userName = userName;
  await session.save();
  redirect("/admin/");
}

/* ------------------------------------------------------------------ */
/* Pessoas com acesso                                                  */
/* ------------------------------------------------------------------ */

export async function createUser(
  name: string,
  password: string
): Promise<SaveResult> {
  await requireAdmin();
  if (!name.trim()) return { ok: false, message: "Escreva o nome da pessoa." };
  if (password.length < 4) {
    return { ok: false, message: "A senha precisa ter pelo menos 4 caracteres." };
  }
  const db = await getDb();
  await db.insert(schema.users).values({
    name: name.trim(),
    passwordHash: await hashPassword(password),
  });
  return { ok: true, message: `Pronto! ${name.trim()} já pode entrar.` };
}

export async function changeUserPassword(
  id: number,
  password: string
): Promise<SaveResult> {
  await requireAdmin();
  if (password.length < 4) {
    return { ok: false, message: "A senha precisa ter pelo menos 4 caracteres." };
  }
  const db = await getDb();
  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(schema.users.id, id));
  return { ok: true, message: "Senha trocada." };
}

export async function deleteUser(id: number): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.users).where(eq(schema.users.id, id));
  return { ok: true, message: "Acesso removido." };
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login/");
}

/* ------------------------------------------------------------------ */
/* Revisões (Desfazer)                                                 */
/* ------------------------------------------------------------------ */

async function saveRevision(entity: string, snapshot: unknown, label: string) {
  const db = await getDb();
  const session = await getSession();
  await db.insert(schema.revisions).values({
    entity,
    snapshot,
    label,
    author: session.userName ?? "",
  });
}

/** Publica na hora: invalida o cache de todas as páginas do site. */
function publish() {
  revalidatePath("/", "layout");
}

export type SaveResult = { ok: boolean; message: string };

const OK: SaveResult = { ok: true, message: "Pronto! Já está no ar." };

/* ------------------------------------------------------------------ */
/* Configurações (contato, doações, frases)                            */
/* ------------------------------------------------------------------ */

export async function saveSettings(
  values: Record<string, string>,
  label: string
): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db.select().from(schema.settings);
  await saveRevision("settings", current, label);
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  publish();
  return OK;
}

/* ------------------------------------------------------------------ */
/* Horários                                                            */
/* ------------------------------------------------------------------ */

export type ScheduleInput = {
  day: number;
  time: string;
  activity: string;
  mode: string;
};

export async function saveSchedule(items: ScheduleInput[]): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db.select().from(schema.scheduleItems);
  await saveRevision("schedule", current, "Horários");
  await db.delete(schema.scheduleItems);
  if (items.length > 0) {
    await db
      .insert(schema.scheduleItems)
      .values(items.map((s, i) => ({ ...s, sort: i })));
  }
  publish();
  return OK;
}

/* ------------------------------------------------------------------ */
/* Pessoas (diretoria, presidentes, trabalhadores)                     */
/* ------------------------------------------------------------------ */

export type PersonInput = { name: string; role: string; photo: string };

export async function savePeople(
  kind: "board" | "president" | "worker",
  items: PersonInput[]
): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.kind, kind));
  await saveRevision(`people:${kind}`, current, "Pessoas");
  await db.delete(schema.people).where(eq(schema.people.kind, kind));
  if (items.length > 0) {
    await db
      .insert(schema.people)
      .values(items.map((p, i) => ({ ...p, kind, sort: i })));
  }
  publish();
  return OK;
}

/* ------------------------------------------------------------------ */
/* Páginas                                                             */
/* ------------------------------------------------------------------ */

export async function savePageBlocks(
  slug: string,
  blocks: Block[]
): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db
    .select()
    .from(schema.pages)
    .where(eq(schema.pages.slug, slug));
  if (!current[0]) return { ok: false, message: "Página não encontrada." };
  await saveRevision(`page:${slug}`, current[0], `Página ${slug}`);
  await db
    .update(schema.pages)
    .set({ blocks, updatedAt: new Date() })
    .where(eq(schema.pages.slug, slug));
  publish();
  return OK;
}

/* ------------------------------------------------------------------ */
/* Publicações                                                         */
/* ------------------------------------------------------------------ */

export type PostInput = {
  title: string;
  date: string;
  category: string;
  cover: string;
  blocks: Block[];
  published: boolean;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function createPost(input: PostInput): Promise<SaveResult & { id?: number }> {
  await requireAdmin();
  if (!input.title.trim()) return { ok: false, message: "Dê um título à publicação." };
  const db = await getDb();
  let slug = slugify(input.title);
  const clash = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug));
  if (clash.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
  const inserted = await db
    .insert(schema.posts)
    .values({ ...input, slug })
    .returning({ id: schema.posts.id });
  publish();
  return { ...OK, id: inserted[0].id };
}

export async function savePost(id: number, input: PostInput): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  if (!current[0]) return { ok: false, message: "Publicação não encontrada." };
  await saveRevision(`post:${id}`, current[0], `Publicação ${current[0].title}`);
  await db
    .update(schema.posts)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.posts.id, id));
  publish();
  return OK;
}

export async function deletePost(id: number): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  if (!current[0]) return { ok: false, message: "Publicação não encontrada." };
  await saveRevision(`post:${id}`, current[0], `Publicação excluída ${current[0].title}`);
  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  publish();
  return { ok: true, message: "Publicação removida do site." };
}

/* ------------------------------------------------------------------ */
/* Desfazer                                                            */
/* ------------------------------------------------------------------ */

export async function undo(entity: string): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const revs = await db
    .select()
    .from(schema.revisions)
    .where(eq(schema.revisions.entity, entity))
    .orderBy(desc(schema.revisions.id))
    .limit(1);
  const rev = revs[0];
  if (!rev) return { ok: false, message: "Não há nada para desfazer." };

  const snap = rev.snapshot;
  if (entity === "settings") {
    const rows = snap as Array<{ key: string; value: string }>;
    for (const { key, value } of rows) {
      await db
        .insert(schema.settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
    }
  } else if (entity === "schedule") {
    const rows = snap as Array<typeof schema.scheduleItems.$inferInsert>;
    await db.delete(schema.scheduleItems);
    if (rows.length > 0) {
      await db.insert(schema.scheduleItems).values(
        rows.map(({ day, time, activity, mode, sort }) => ({ day, time, activity, mode, sort }))
      );
    }
  } else if (entity.startsWith("people:")) {
    const kind = entity.split(":")[1];
    const rows = snap as Array<typeof schema.people.$inferInsert>;
    await db.delete(schema.people).where(eq(schema.people.kind, kind));
    if (rows.length > 0) {
      await db.insert(schema.people).values(
        rows.map(({ name, role, photo, sort }) => ({ kind, name, role, photo, sort }))
      );
    }
  } else if (entity.startsWith("page:")) {
    const row = snap as typeof schema.pages.$inferSelect;
    await db
      .update(schema.pages)
      .set({ blocks: row.blocks, updatedAt: new Date() })
      .where(eq(schema.pages.slug, row.slug));
  } else if (entity.startsWith("post:")) {
    const row = snap as typeof schema.posts.$inferSelect;
    const existing = await db.select().from(schema.posts).where(eq(schema.posts.id, row.id));
    const { id: _id, ...data } = row;
    if (existing.length > 0) {
      await db.update(schema.posts).set(data).where(eq(schema.posts.id, row.id));
    } else {
      await db.insert(schema.posts).values(row);
    }
  } else {
    return { ok: false, message: "Tipo de conteúdo desconhecido." };
  }

  await db.delete(schema.revisions).where(eq(schema.revisions.id, rev.id));
  publish();
  return { ok: true, message: "Pronto! Voltou como estava antes." };
}
