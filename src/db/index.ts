import * as schema from "./schema";

/**
 * Cliente do banco: Neon (Postgres serverless) quando DATABASE_URL está
 * definida (produção/preview), PGlite local (./.data/pglite) no dev.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

export async function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (url) {
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { neon } = await import("@neondatabase/serverless");
    _db = drizzle(neon(url), { schema });
  } else {
    const { drizzle } = await import("drizzle-orm/pglite");
    const { PGlite } = await import("@electric-sql/pglite");
    const globalAny = globalThis as { __pglite?: InstanceType<typeof PGlite> };
    globalAny.__pglite ??= new PGlite("./.data/pglite");
    _db = drizzle(globalAny.__pglite, { schema });
  }
  return _db;
}

export { schema };
