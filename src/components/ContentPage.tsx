import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import Blocks from "@/components/Blocks";
import { getPage } from "@/lib/content";

/** Página institucional genérica: título + blocos do acervo. */
export default async function ContentPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();

  // remove heading inicial repetindo o título da página
  const blocks = page.blocks.filter(
    (b, i) =>
      !(
        i < 2 &&
        (b.type === "heading" || b.type === "subheading") &&
        b.text.trim().toLowerCase() === page.title.trim().toLowerCase()
      )
  );

  return (
    <PageShell title={page.title}>
      <Blocks blocks={blocks} />
    </PageShell>
  );
}
