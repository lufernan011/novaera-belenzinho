import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redireciona URLs de imagens do WordPress antigo para o acervo migrado,
 * preservando links antigos do Google Imagens, Facebook e e-mails.
 * /wp-content/uploads/2017/10/foto.jpg → /acervo/2017_10_foto.jpg
 */
export default function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(
    /^\/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)$/
  );
  if (match) {
    const [, year, month, file] = match;
    const url = request.nextUrl.clone();
    url.pathname = `/acervo/${year}_${month}_${decodeURIComponent(file).replace(/\//g, "_")}`;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/wp-content/:path*"],
};
