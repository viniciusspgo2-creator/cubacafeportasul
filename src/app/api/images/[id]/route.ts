import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Serve imagens armazenadas no banco (uploads do painel admin).
 * GET /api/images/[id]        → imagem principal
 * GET /api/images/[id]?t=1    → thumbnail
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await db.uploadedImage.findUnique({ where: { id } });
    if (!image) return new NextResponse('Not found', { status: 404 });

    const wantThumb = req.nextUrl.searchParams.get('t') === '1';
    const base64 = wantThumb && image.thumbData ? image.thumbData : image.data;
    const bytes = Buffer.from(base64, 'base64');

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': image.mime || 'image/webp',
        'Content-Length': String(bytes.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Erro ao carregar imagem', { status: 500 });
  }
}
