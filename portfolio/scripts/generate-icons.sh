#!/usr/bin/env bash
# Generate favicon + OG assets from the brand mark on a dark tile.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$ROOT/public"
TMP="$ROOT/tmp/icons"
mkdir -p "$TMP"

# Mark bbox center is (21, 32) in the canonical 48×48 viewBox — shift to canvas center.
MARK_CENTERED='<g transform="translate(3 -8)">
  <circle cx="8" cy="32" r="6" fill="#f5f5f5"/>
  <line x1="16" y1="46" x2="28" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/>
  <line x1="28" y1="46" x2="40" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/>
</g>'

cat > "$TMP/favicon-tile.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#0a0b0d"/>
  ${MARK_CENTERED}
</svg>
EOF

cp "$TMP/favicon-tile.svg" "$PUBLIC/favicon.svg"

# Raster sizes
magick -background none "$TMP/favicon-tile.svg" -resize 32x32 "$PUBLIC/favicon-32x32.png"
magick -background none "$TMP/favicon-tile.svg" -resize 180x180 "$PUBLIC/apple-touch-icon.png"
magick -background none "$TMP/favicon-tile.svg" -resize 192x192 "$PUBLIC/icon-192.png"
magick -background none "$TMP/favicon-tile.svg" -resize 16x16 "$TMP/favicon-16.png"
magick -background none "$TMP/favicon-tile.svg" -resize 32x32 "$TMP/favicon-32.png"
magick "$TMP/favicon-16.png" "$TMP/favicon-32.png" "$PUBLIC/favicon.ico"

# OG 1200×630 — mark vertically centered beside wordmark
cat > "$TMP/og.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0b0d"/>
  <g transform="translate(120 219) scale(4)">
    <circle cx="8" cy="32" r="6" fill="#f5f5f5"/>
    <line x1="16" y1="46" x2="28" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/>
    <line x1="28" y1="46" x2="40" y2="18" stroke="#e54600" stroke-width="4" stroke-linecap="round"/>
  </g>
  <text x="360" y="300" fill="#f5f5f5" font-family="Syne, IBM Plex Sans, sans-serif" font-size="64" font-weight="600">Omar Hosam</text>
  <text x="360" y="360" fill="#a3a3a3" font-family="IBM Plex Sans, sans-serif" font-size="32">Software Engineer</text>
</svg>
EOF

magick "$TMP/og.svg" -resize 1200x630 "$PUBLIC/og.png"

cat > "$PUBLIC/site.webmanifest" <<'EOF'
{
  "name": "Omar Hosam",
  "short_name": "Omar Hosam",
  "description": "Software engineer — freelance, consultation, and training.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0b0d",
  "theme_color": "#0a0b0d",
  "icons": [
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
EOF

echo "icons: wrote favicon.svg, favicon.ico, favicon-32x32.png, icon-192.png, apple-touch-icon.png, og.png, site.webmanifest"
