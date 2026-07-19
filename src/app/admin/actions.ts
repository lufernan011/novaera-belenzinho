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

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a.padEnd(64, "\0"));
  const bb = Buffer.from(b.padEnd(64, "\0"));
  return crypto.timingSafeEqual(ba, bb) && a.length === b.length;
}

/** Senha de acesso: exatamente 6 dígitos numéricos. */
function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/* Rate limiting persistente (Postgres): sobrevive entre instâncias
   serverless, ao contrário de um contador em memória.

   A chave é IP + identidade (usuário ou "master"): bloquear as tentativas
   de uma pessoa NÃO afeta as outras nem a senha mestre de recuperação,
   mesmo que estejam no mesmo wifi. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function attemptRow(db: any, key: string) {
  const rows = await db
    .select()
    .from(schema.loginAttempts)
    .where(eq(schema.loginAttempts.ip, key));
  return rows[0] as
    | { ip: string; count: number; lockedUntil: Date | null; updatedAt: Date }
    | undefined;
}

async function isLocked(key: string): Promise<boolean> {
  const db = await getDb();
  const row = await attemptRow(db, key);
  return !!row?.lockedUntil && row.lockedUntil.getTime() > Date.now();
}

async function recordFailure(key: string): Promise<void> {
  const db = await getDb();
  const row = await attemptRow(db, key);
  const now = Date.now();
  const windowMs = LOCK_MINUTES * 60_000;
  // recomeça a contagem se o bloqueio anterior já passou ou se a última
  // tentativa foi há muito tempo — assim, após esperar, ganha 5 tentativas
  // novas em vez de re-bloquear no primeiro erro
  const fresh =
    !row ||
    (!!row.lockedUntil && row.lockedUntil.getTime() <= now) ||
    now - row.updatedAt.getTime() > windowMs;
  const count = (fresh ? 0 : row.count) + 1;
  const lockedUntil =
    count >= MAX_ATTEMPTS ? new Date(now + windowMs) : null;
  await db
    .insert(schema.loginAttempts)
    .values({ ip: key, count, lockedUntil, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.loginAttempts.ip,
      set: { count, lockedUntil, updatedAt: new Date() },
    });
}

async function clearAttempts(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.ip, key));
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

  // bloqueio por pessoa (não por wifi): trancar uma não tranca as outras
  const identity = userIdRaw === "master" || userIdRaw === "" ? "master" : userIdRaw;
  const key = `${ip}|${identity}`;

  if (await isLocked(key)) {
    return {
      error: `Muitas tentativas. Por segurança, aguarde ${LOCK_MINUTES} minutos e tente de novo.`,
    };
  }

  const fail = async () => {
    await recordFailure(key);
    return { error: "Senha incorreta. Confira e tente novamente." };
  };

  let userId: number | undefined;
  let userName = "";

  if (userIdRaw === "master" || userIdRaw === "") {
    // Senha mestre: primeiro acesso (sem usuários) ou recuperação
    const expected = process.env.ADMIN_PIN ?? "";
    if (!expected || !safeEqual(password, expected)) return fail();
    userName = "Senha mestre";
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

  await clearAttempts(key);
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
  if (!isValidPin(password)) {
    return { ok: false, message: "A senha precisa ter 6 números (ex.: 194712)." };
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
  if (!isValidPin(password)) {
    return { ok: false, message: "A senha precisa ter 6 números (ex.: 194712)." };
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

type RevAction = "Edição" | "Criação" | "Exclusão";

async function saveRevision(
  entity: string,
  snapshot: unknown,
  label: string,
  action: RevAction = "Edição"
) {
  const db = await getDb();
  const session = await getSession();
  await db.insert(schema.revisions).values({
    entity,
    snapshot,
    label,
    action,
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

export async function saveSchedule(
  items: ScheduleInput[],
  note: string
): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const current = await db.select().from(schema.scheduleItems);
  const currentNote = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "schedule_note"));
  await saveRevision(
    "schedule",
    { items: current, note: currentNote[0]?.value ?? "" },
    "Horários"
  );
  await db.delete(schema.scheduleItems);
  if (items.length > 0) {
    await db
      .insert(schema.scheduleItems)
      .values(items.map((s, i) => ({ ...s, sort: i })));
  }
  await db
    .insert(schema.settings)
    .values({ key: "schedule_note", value: note })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: note } });
  publish();
  return OK;
}

/* ------------------------------------------------------------------ */
/* Pessoas (diretoria, presidentes, trabalhadores)                     */
/* ------------------------------------------------------------------ */

export type PersonInput = { name: string; role: string; photo: string; group?: string };

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
  const peopleLabel =
    kind === "board" ? "Diretoria" : kind === "president" ? "Presidentes" : "Trabalhadores";
  await saveRevision(`people:${kind}`, current, peopleLabel);
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
  await saveRevision(`page:${slug}`, current[0], `Página ${current[0].title}`);
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
  await saveRevision(
    `post:${inserted[0].id}`,
    { __created: true },
    `Publicação ${input.title.trim()}`,
    "Criação"
  );
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
  await saveRevision(`post:${id}`, current[0], `Publicação ${current[0].title}`, "Exclusão");
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
    // snapshots antigos eram só a lista; novos são { items, note }
    type Row = typeof schema.scheduleItems.$inferInsert;
    const data = Array.isArray(snap)
      ? { items: snap as Row[], note: null }
      : (snap as { items: Row[]; note: string | null });
    await db.delete(schema.scheduleItems);
    if (data.items.length > 0) {
      await db.insert(schema.scheduleItems).values(
        data.items.map(({ day, time, activity, mode, sort }) => ({ day, time, activity, mode, sort }))
      );
    }
    if (data.note !== null) {
      await db
        .insert(schema.settings)
        .values({ key: "schedule_note", value: data.note })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value: data.note } });
    }
  } else if (entity.startsWith("people:")) {
    const kind = entity.split(":")[1];
    const rows = snap as Array<typeof schema.people.$inferInsert>;
    await db.delete(schema.people).where(eq(schema.people.kind, kind));
    if (rows.length > 0) {
      await db.insert(schema.people).values(
        rows.map(({ name, role, photo, group, sort }) => ({ kind, name, role, photo, group: group ?? "", sort }))
      );
    }
  } else if (entity.startsWith("page:")) {
    const row = snap as typeof schema.pages.$inferSelect;
    await db
      .update(schema.pages)
      .set({ blocks: row.blocks, updatedAt: new Date() })
      .where(eq(schema.pages.slug, row.slug));
  } else if (entity.startsWith("post:")) {
    const postId = Number(entity.split(":")[1]);
    if (snap && (snap as { __created?: boolean }).__created) {
      // desfazer uma criação = remover a publicação recém-criada
      await db.delete(schema.posts).where(eq(schema.posts.id, postId));
    } else {
      const row = snap as typeof schema.posts.$inferSelect;
      const existing = await db.select().from(schema.posts).where(eq(schema.posts.id, row.id));
      const { id: _id, ...data } = row;
      if (existing.length > 0) {
        await db.update(schema.posts).set(data).where(eq(schema.posts.id, row.id));
      } else {
        await db.insert(schema.posts).values(row);
      }
    }
  } else {
    return { ok: false, message: "Tipo de conteúdo desconhecido." };
  }

  await db.delete(schema.revisions).where(eq(schema.revisions.id, rev.id));
  publish();
  return { ok: true, message: "Pronto! Voltou como estava antes." };
}
