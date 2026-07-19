import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import Blocks from "@/components/Blocks";
import { formatDate, getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Publicação" };
  const firstParagraph = post.blocks.find(
    (b): b is Extract<typeof b, { text: string }> => b.type === "paragraph"
  );
  const description = firstParagraph
    ? `${firstParagraph.text.slice(0, 152)}…`
    : `${post.title} — Centro Espírita Nova Era, Belenzinho.`;
  return {
    title: post.title,
    description,
    openGraph: post.cover ? { images: [post.cover] } : undefined,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.updatedAt,
    image: post.cover ? [`https://www.novaerabelenzinho.org.br${post.cover}`] : undefined,
    author: { "@type": "Organization", name: "Centro Espírita Nova Era" },
    publisher: { "@type": "Organization", name: "Centro Espírita Nova Era" },
  };

  return (
    <PageShell title={post.title} image={post.cover || undefined}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="-mt-4 mb-8 text-sm tracking-wider text-coral-700 uppercase">
        {post.category || "Publicação"} · {formatDate(post.date)}
      </p>
      <Blocks blocks={post.blocks} />
      <p className="mt-10">
        <Link
          href="/publicacoes/"
          className="text-coral-700 underline-offset-2 hover:underline"
        >
          ← Todas as publicações
        </Link>
      </p>
    </PageShell>
  );
}
