#!/bin/sh
# Uso: npm run deploy | npm run deploy:preview | sh scripts/deploy.sh production --primera-vez
set -eu
TARGET=${1:-production}
FLAG=${2:-}
[ -f .env.deploy ] || { echo "Falta .env.deploy: copia .env.deploy.example y rellénalo."; exit 1; }
. ./.env.deploy
case "$TARGET" in
  production) DEST=$DEPLOY_PATH ;;
  preview) DEST=$PREVIEW_PATH ;;
  *) echo "Destino desconocido: $TARGET"; exit 1 ;;
esac
run() { if [ "$DEPLOY_HOST" = local ]; then sh -c "$1"; else ssh "$DEPLOY_HOST" "$1"; fi; }
remote() { if [ "$DEPLOY_HOST" = local ]; then printf '%s' "$1"; else printf '%s:%s' "$DEPLOY_HOST" "$1"; fi; }

# rsync borra lo que no esté en la web nueva: nunca debe arrasar WordPress sin pedirlo expresamente.
PREFIX=$TARGET
if run "test -f '$DEST/wp-config.php'"; then
  if [ "$FLAG" != "--primera-vez" ]; then
    echo "ATENCIÓN: $DEST contiene WordPress. Esta publicación lo sustituiría."
    echo "Haz antes una copia de la base de datos y repite con: sh scripts/deploy.sh $TARGET --primera-vez"
    exit 1
  fi
  PREFIX=wordpress-original
fi
if [ "$TARGET" = production ] && [ -t 0 ]; then
  printf 'Vas a publicar en PRODUCCIÓN (%s). Escribe SI para continuar: ' "$DEST"
  read -r answer
  [ "$answer" = SI ] || { echo "Cancelado."; exit 1; }
fi

DEPLOY_TARGET=$TARGET npm run -s build

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$BACKUP_DIR/$PREFIX-$STAMP.tgz"
run "mkdir -p '$BACKUP_DIR' '$DEST' && tar czf '$BACKUP' --exclude='./api/.data' -C '$DEST' ."
echo "Copia guardada: $BACKUP"

rsync -az --delete --exclude 'api/.data/' dist/ "$(remote "$DEST/")"

# Conserva las 10 copias más recientes de este destino; la copia de WordPress no se borra nunca.
run "ls -1t '$BACKUP_DIR'/$TARGET-*.tgz 2>/dev/null | tail -n +11 | xargs rm -f --" || true
echo "Publicado en $TARGET. Para volver atrás: npm run rollback -- $(basename "$BACKUP") $TARGET"
