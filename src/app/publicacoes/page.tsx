import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { formatDate, getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Publicações" };

export default async function Page() {
  const posts = await getPosts();

  return (
    <PageShell
      title="Publicações"
      intro="Registros de palestras, seminários e atividades da casa."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/publicacoes/${post.slug}/`}
            className="group overflow-hidden rounded-2xl border border-sand-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
          >
            {post.cover ? (
              <Image
                src={post.cover}
                alt=""
                width={640}
                height={360}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full bg-twilight-700" />
            )}
            <div className="px-5 py-4">
              <p className="text-xs tracking-wider text-coral-700 uppercase">
                {post.category || "Publicação"} · {formatDate(post.date)}
              </p>
              <h2 className="mt-1.5 font-display text-xl leading-snug text-twilight-700 group-hover:text-coral-600">
                {post.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
