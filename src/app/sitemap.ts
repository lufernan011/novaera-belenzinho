import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";

const BASE = "https://www.novaerabelenzinho.org.br";

const STATIC_PATHS = [
  { path: "/", priority: 1.0 },
  { path: "/espiritismo/", priority: 0.8 },
  { path: "/o-centro/", priority: 0.7 },
  { path: "/nossa-historia/", priority: 0.8 },
  { path: "/trabalhos-realizados/", priority: 0.9 },
  { path: "/presidentes/", priority: 0.6 },
  { path: "/diretoria/", priority: 0.6 },
  { path: "/trabalhadores/", priority: 0.6 },
  { path: "/horarios/", priority: 0.9 },
  { path: "/publicacoes/", priority: 0.8 },
  { path: "/fale-conosco/", priority: 0.8 },
  { path: "/ajude-o-nova-era/", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${BASE}${p.path}`,
      priority: p.priority,
      changeFrequency: "weekly" as const,
    })),
    ...posts.map((post) => ({
      url: `${BASE}/publicacoes/${post.slug}/`,
      lastModified: post.updatedAt,
      priority: 0.5,
      changeFrequency: "monthly" as const,
    })),
  ];
}
