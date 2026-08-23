#!/usr/bin/env bash
# Install Omar Hosam Post-Production into the Linux App Launcher (~/.local)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHARE="${XDG_DATA_HOME:-$HOME/.local/share}/omar-hosam-post"
BIN_DIR="${XDG_BIN_HOME:-$HOME/.local/bin}"
APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
ICON_BASE="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor"

echo "→ Building UI"
(cd "$ROOT/ui" && bun run build)

echo "→ Generating desktop assets"
(cd "$ROOT" && bun run scripts/generate-assets.ts)

echo "→ Installing to $SHARE"
rm -rf "$SHARE"
mkdir -p "$SHARE"/{bin,server,ui,assets,scripts,tmp}

# App payload (portable tree)
cp -a "$ROOT/package.json" "$SHARE/"
cp -a "$ROOT/PRODUCT.md" "$ROOT/DESIGN.md" "$ROOT/README.md" "$SHARE/" 2>/dev/null || true
cp -a "$ROOT/assets" "$SHARE/"
cp -a "$ROOT/server" "$SHARE/"
cp -a "$ROOT/ui/dist" "$SHARE/ui/"
cp -a "$ROOT/ui/package.json" "$SHARE/ui/" 2>/dev/null || true
# Prefer workspace node_modules for hono via bun from source; also vendor server deps
mkdir -p "$SHARE/node_modules"
if [[ -d "$ROOT/node_modules" ]]; then
  # Copy only what server needs — use bun install in share for reliability
  (cd "$SHARE" && bun install --production 2>/dev/null || bun install)
fi

install -m 755 "$ROOT/scripts/omar-post-production" "$SHARE/bin/omar-post-production"
install -m 755 "$ROOT/scripts/omar-post-production" "$BIN_DIR/omar-post-production"

# Rewrite launcher to pin OMAR_POST_HOME
cat > "$BIN_DIR/omar-post-production" <<EOF
#!/usr/bin/env bash
export OMAR_POST_HOME="$SHARE"
export OMAR_POST_OPEN=1
exec "$SHARE/bin/omar-post-production"
EOF
chmod 755 "$BIN_DIR/omar-post-production"

# Also keep share launcher self-contained
cat > "$SHARE/bin/omar-post-production" <<EOF
#!/usr/bin/env bash
set -euo pipefail
export OMAR_POST_HOME="$SHARE"
export OMAR_POST_OPEN="\${OMAR_POST_OPEN:-1}"
export PORT="\${PORT:-8787}"
cd "\$OMAR_POST_HOME"
if command -v bun >/dev/null 2>&1; then
  exec bun "\$OMAR_POST_HOME/server/src/index.ts"
fi
echo "Bun is required (https://bun.sh)" >&2
exit 1
EOF
chmod 755 "$SHARE/bin/omar-post-production"

# Optional: compile standalone binary beside the script
if bun build --compile "$ROOT/server/src/index.ts" --outfile "$SHARE/bin/omar-post-server" 2>/dev/null; then
  echo "→ Compiled standalone server binary"
  cat > "$SHARE/bin/omar-post-production" <<EOF
#!/usr/bin/env bash
set -euo pipefail
export OMAR_POST_HOME="$SHARE"
export OMAR_POST_OPEN="\${OMAR_POST_OPEN:-1}"
export PORT="\${PORT:-8787}"
exec "$SHARE/bin/omar-post-server"
EOF
  chmod 755 "$SHARE/bin/omar-post-production"
fi

# Desktop entry
mkdir -p "$APP_DIR"
sed "s|^Exec=.*|Exec=$BIN_DIR/omar-post-production|" \
  "$ROOT/assets/desktop/omar-hosam-post.desktop" > "$APP_DIR/omar-hosam-post.desktop"
chmod 644 "$APP_DIR/omar-hosam-post.desktop"

# Icons
for size in 16 24 32 48 64 128 256 512; do
  dir="$ICON_BASE/${size}x${size}/apps"
  mkdir -p "$dir"
  src="$ROOT/assets/desktop/icons/omar-hosam-post-${size}.png"
  if [[ -f "$src" ]]; then
    install -m 644 "$src" "$dir/omar-hosam-post.png"
  fi
done
mkdir -p "$ICON_BASE/scalable/apps"
install -m 644 "$ROOT/assets/desktop/icon.svg" "$ICON_BASE/scalable/apps/omar-hosam-post.svg"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APP_DIR" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f -t "${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor" 2>/dev/null || true
fi

echo ""
echo "Installed."
echo "  Launcher:  Omar Hosam Post-Production (App Grid / Activities)"
echo "  Command:   omar-post-production"
echo "  Share:     $SHARE"
echo "  Exports:   ~/Videos/Omar Hosam/processed"
