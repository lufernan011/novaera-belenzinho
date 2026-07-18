import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getPage } from "@/lib/content";
import PageEditor from "@/components/admin/PageEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return <PageEditor slug={page.slug} title={page.title} initial={page.blocks} />;
}
