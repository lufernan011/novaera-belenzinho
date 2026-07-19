import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // URLs com barra final, iguais às do WordPress antigo (preserva SEO)
  trailingSlash: true,
  // PGlite (banco local de dev) carrega WASM — não pode ser empacotado
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    // fotos enviadas pelo admin ficam no Vercel Blob
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    // mantém as telas já visitadas no cache do navegador — navegar de volta
    // não refaz a requisição (conteúdo muda pouco e é revalidado no servidor)
    staleTimes: {
      static: 300,
      dynamic: 120,
    },
  },
};

export default nextConfig;
