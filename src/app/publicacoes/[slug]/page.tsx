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
  return { title: post?.title ?? "Publicação" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  return (
    <PageShell title={post.title}>
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
