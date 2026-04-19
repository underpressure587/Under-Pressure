#!/bin/bash
# ════════════════════════════════════════════════════
#  Under Pressure — Deploy com Cache Busting Automático
#  Uso: bash deploy.sh
# ════════════════════════════════════════════════════

set -e  # Para imediatamente se qualquer comando falhar

# ── 1. Gera a versão a partir do hash do último commit do Git
#       Ex: "a3f8c21" — único para cada push, nunca se repete
VERSION=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)
HASH=$(git rev-parse HEAD 2>/dev/null || echo "$VERSION")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "🔖 Versão: $VERSION"

# ── 2. Gera o bundle.js a partir dos arquivos fonte
node build.js
echo "✅ Bundle gerado"

# ── 3. Substitui CACHE_VERSION em index.html pela versão real
sed -i "s/\?v=[A-Za-z0-9_-]*/\?v=$VERSION/g" index.html
echo "✅ Cache busting aplicado em index.html"

# ── 4. Gera version.json (usado pelo jogo para detectar atualizações)
echo "{\"hash\":\"$HASH\",\"versao\":\"v$VERSION\",\"deployedAt\":\"$TIMESTAMP\"}" > version.json
echo "✅ version.json gerado: v$VERSION"

# ── 5. Faz o push para o GitHub (inclui todos os arquivos gerados)
git add index.html bundle.js version.json
git commit -m "deploy: cache bust $VERSION" --allow-empty
git push
echo "✅ Push concluído"

# ── 6. Deploy no Firebase (apenas hosting — não toca no Firestore)
firebase deploy --only hosting
echo ""
echo "🚀 Deploy concluído! Versão $VERSION no ar."
