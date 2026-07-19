import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

// Fotos de site não precisam de resolução de câmera. 1600px no lado maior
// cobre até telas retina; reduz um JPEG de iPhone (~4 MB) para ~200–400 KB.
const MAX_SIDE = 1600;
const JPEG_QUALITY = 80;

/**
 * Upload de fotos do admin. Redimensiona e recomprime antes de guardar
 * (economiza armazenamento e acelera a otimização na hora de servir).
 * Produção (Vercel): grava no Vercel Blob. Dev: grava em public/uploads.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie uma imagem (JPG ou PNG)" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Foto muito grande (máx. 25 MB)" }, { status: 400 });
  }

  const original = Buffer.from(await file.arrayBuffer());

  let optimized: Buffer;
  try {
    optimized = await sharp(original)
      .rotate() // respeita a orientação EXIF (fotos de celular vêm giradas)
      .resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();
  } catch {
    // formato exótico que o sharp não decodifica: guarda o original
    optimized = original;
  }

  const name = `foto-${Date.now().toString(36)}.jpg`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, optimized, {
      access: "public",
      contentType: "image/jpeg",
    });
    return NextResponse.json({ url: blob.url });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), optimized);
  return NextResponse.json({ url: `/uploads/${name}` });
}
