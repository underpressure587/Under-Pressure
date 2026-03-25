#!/bin/bash
# ════════════════════════════════════════════════════
#  Under Pressure — Deploy com Cache Busting Automático
#  Uso: bash deploy.sh
# ════════════════════════════════════════════════════

set -e  # Para imediatamente se qualquer comando falhar

# ── 1. Gera a versão a partir do hash do último commit do Git
#       Ex: "a3f8c21" — único para cada push, nunca se repete
VERSION=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)
echo "🔖 Versão: $VERSION"

# ── 2. Substitui CACHE_VERSION em index.html pela versão real
#       Isso faz os browsers tratar bundle.js?v=a3f8c21 como arquivo novo
#       sem precisar apagar o cache manualmente
sed -i "s/\?v=[A-Za-z0-9_-]*/\?v=$VERSION/g" index.html
echo "✅ Cache busting aplicado em index.html"

# ── 3. Gera o bundle.js a partir dos 21 arquivos fonte
node build.js
echo "✅ Bundle gerado"

# ── 4. Faz o push para o GitHub (inclui bundle.js atualizado)
git add index.html bundle.js
git commit -m "deploy: cache bust $VERSION" --allow-empty
git push
echo "✅ Push concluído"

# ── 5. Deploy no Firebase (apenas hosting — não toca no Firestore)
firebase deploy --only hosting
echo ""
echo "🚀 Deploy concluído! Versão $VERSION no ar."
