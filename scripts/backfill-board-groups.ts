/** Preenche people.group da diretoria a partir do cargo (regra antiga). */
import { eq, and } from "drizzle-orm";
import { getDb, schema } from "../src/db";
import { BOARD_GROUPS, boardGroup } from "../src/lib/people";

async function main() {
  const db = await getDb();
  const board = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.kind, "board"));
  for (const p of board) {
    if (p.group) continue;
    const label = BOARD_GROUPS.find((g) => g.key === boardGroup(p.role))!.label;
    await db
      .update(schema.people)
      .set({ group: label })
      .where(eq(schema.people.id, p.id));
  }
  console.log("backfill ok:", board.length, "pessoas");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
