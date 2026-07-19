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
};

export default nextConfig;
