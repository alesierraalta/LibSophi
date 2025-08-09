import { NextRequest } from 'next/server'

// Simple dynamic placeholder that returns a lightweight SVG at any width/height
// Usage: /api/placeholder/40/40

export async function GET(
  _req: NextRequest,
  context: { params: { width?: string; height?: string } }
) {
  const { width: widthParam, height: heightParam } = context.params || {}

  const width = Math.max(1, Math.min(512, Number(widthParam) || 40))
  const height = Math.max(1, Math.min(512, Number(heightParam) || 40))

  const radius = Math.min(width, height) * 0.2

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="placeholder">
    <rect width="100%" height="100%" rx="${radius}" ry="${radius}" fill="#f3f4f6"/>
    <g opacity="0.5">
      <rect x="${width * 0.2}" y="${height * 0.22}" width="${width * 0.6}" height="${height * 0.12}" rx="${radius * 0.25}" fill="#e5e7eb" />
      <rect x="${width * 0.18}" y="${height * 0.42}" width="${width * 0.64}" height="${height * 0.12}" rx="${radius * 0.25}" fill="#e5e7eb" />
      <rect x="${width * 0.16}" y="${height * 0.62}" width="${width * 0.68}" height="${height * 0.12}" rx="${radius * 0.25}" fill="#e5e7eb" />
    </g>
  </svg>`

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}


