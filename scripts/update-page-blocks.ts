/** Substitui os blocos de uma página. Uso: npx tsx scripts/update-page-blocks.ts <slug> <arquivo.json> */
import fs from "node:fs";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../src/db";

async function main() {
  const [slug, file] = process.argv.slice(2);
  const blocks = JSON.parse(fs.readFileSync(file, "utf-8"));
  const db = await getDb();
  await db
    .update(schema.pages)
    .set({ blocks, updatedAt: new Date() })
    .where(eq(schema.pages.slug, slug));
  console.log("ok:", slug, blocks.length, "blocos");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
