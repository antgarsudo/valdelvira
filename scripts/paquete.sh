#!/bin/sh
# Crea el ZIP para subir a mano. Uso: npm run paquete | npm run paquete:preview
set -eu
TARGET=${1:-production}
DEPLOY_TARGET=$TARGET npm run -s build
mkdir -p entregas
FILE="$PWD/entregas/valdelvira-$TARGET-$(date +%Y%m%d-%H%M).zip"
(cd dist && zip -qr -X "$FILE" . -x '*.DS_Store' -x 'api/.data/*')
echo "Paquete listo: $FILE"
