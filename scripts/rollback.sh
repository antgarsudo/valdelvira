#!/bin/sh
# Uso: npm run rollback  (lista copias) | npm run rollback -- <copia.tgz> [production|preview]
set -eu
[ -f .env.deploy ] || { echo "Falta .env.deploy."; exit 1; }
. ./.env.deploy
run() { if [ "$DEPLOY_HOST" = local ]; then sh -c "$1"; else ssh "$DEPLOY_HOST" "$1"; fi; }
if [ $# -eq 0 ]; then
  echo "Copias disponibles (la más reciente primero):"
  run "ls -1t '$BACKUP_DIR'"
  exit 0
fi
NAME=$(basename "$1")
case "${2:-production}" in production) DEST=$DEPLOY_PATH ;; preview) DEST=$PREVIEW_PATH ;; *) echo "Destino desconocido"; exit 1 ;; esac
run "test -f '$BACKUP_DIR/$NAME'" || { echo "No existe la copia $NAME"; exit 1; }
if [ -t 0 ]; then
  printf 'Restaurar %s en %s. Escribe SI para continuar: ' "$NAME" "$DEST"
  read -r answer
  [ "$answer" = SI ] || { echo "Cancelado."; exit 1; }
fi
run "set -e; T=\$(mktemp -d); tar xzf '$BACKUP_DIR/$NAME' -C \"\$T\"; rsync -a --delete --exclude 'api/.data/' \"\$T/\" '$DEST/'; rm -rf \"\$T\""
echo "Restaurada $NAME en $DEST."
