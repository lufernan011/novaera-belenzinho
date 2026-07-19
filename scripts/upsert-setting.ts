/** Insere/atualiza uma configuração. Uso: npx tsx scripts/upsert-setting.ts <chave> <valor> */
import { getDb, schema } from "../src/db";

async function main() {
  const [key, value] = process.argv.slice(2);
  if (!key) throw new Error("informe a chave");
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key, value: value ?? "" })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: value ?? "" } });
  console.log("ok:", key);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
