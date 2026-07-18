import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { getDb, schema } from "@/db";
import PostEditor from "@/components/admin/PostEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, Number(id)));
  const post = rows[0];
  if (!post) notFound();

  return (
    <PostEditor
      id={post.id}
      initial={{
        title: post.title,
        date: post.date,
        category: post.category,
        cover: post.cover,
        blocks: post.blocks,
        published: post.published,
      }}
    />
  );
}
