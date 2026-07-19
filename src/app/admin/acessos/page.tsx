import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getSession, requireAdmin } from "@/lib/session";
import AccessEditor from "@/components/admin/AccessEditor";

export default async function Page() {
  await requireAdmin();
  const session = await getSession();
  const db = await getDb();
  const users: Array<{ id: number; name: string }> = await db
    .select({ id: schema.users.id, name: schema.users.name })
    .from(schema.users)
    .orderBy(asc(schema.users.name));

  return <AccessEditor users={users} currentUserId={session.userId} />;
}
