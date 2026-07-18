import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // URLs com barra final, iguais às do WordPress antigo (preserva SEO)
  trailingSlash: true,
  // PGlite (banco local de dev) carrega WASM — não pode ser empacotado
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
