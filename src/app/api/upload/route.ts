import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 8;

/**
 * Upload de imagens do painel — armazenamento no BANCO (PostgreSQL/Neon),
 * compatível com ambientes serverless (Vercel) onde o filesystem é read-only.
 * As imagens são servidas por /api/images/[id].
 */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files?.length) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    if (files.length > MAX_IMAGES) return NextResponse.json({ error: `Máximo de ${MAX_IMAGES} imagens` }, { status: 400 });

    const urls: string[] = [];
    const thumbs: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `Imagem muito grande (máx. ${MAX_SIZE_MB}MB)` }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const id = randomUUID().slice(0, 12);

      // WebP otimizado principal (max 1200px)
      const main = await sharp(buffer)
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      // Thumbnail 400px
      const thumb = await sharp(buffer)
        .rotate()
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      await db.uploadedImage.create({
        data: {
          id,
          mime: 'image/webp',
          data: main.toString('base64'),
          thumbData: thumb.toString('base64'),
        },
      });

      urls.push(`/api/images/${id}`);
      thumbs.push(`/api/images/${id}?t=1`);
    }

    if (!urls.length) return NextResponse.json({ error: 'Nenhuma imagem válida' }, { status: 400 });
    return NextResponse.json({ urls, thumbs }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro no upload', detail: String(e) }, { status: 500 });
  }
}
