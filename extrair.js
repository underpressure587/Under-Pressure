/**
 * extrair.js
 * Separa o bundle.js de volta nos arquivos fonte originais.
 * Uso: node extrair.js
 */

const fs   = require('fs');
const path = require('path');

// Mapeamento: marcador no bundle → caminho real do arquivo
const MAPA = {
  'core/state.js':                  'Core/state.js',
  'core/indicadores.js':            'Core/indicadores.js',
  'core/indicadores-tecnologia.js': 'Core/indicadores-tecnologia.js',
  'core/indicadores-varejo.js':     'Core/indicadores-varejo.js',
  'core/indicadores-logistica.js':  'Core/indicadores-logistica.js',
  'core/indicadores-industria.js':  'Core/indicadores-industria.js',
  'systems/impacto.js':             'systems/impacto.js',
  'systems/imprevisto.js':          'systems/imprevisto.js',
  'systems/feedback.js':            'systems/feedback.js',
  'systems/storyEngine.js':         'systems/storyEngine.js',
  'systems/protagonista.js':        'systems/protagonista.js',
  'empresas/tecnologia.js':         'empresas/tecnologia.js',
  'empresas/varejo.js':             'empresas/varejo.js',
  'empresas/logistica.js':          'empresas/logistica.js',
  'empresas/industria.js':          'empresas/industria.js',
  'rounds/tecnologia-rounds.js':    'empresas/tecnologia-rounds.js',
  'rounds/varejo-rounds.js':        'empresas/varejo-rounds.js',
  'rounds/logistica-rounds.js':     'empresas/logistica-rounds.js',
  'rounds/industria-rounds.js':     'empresas/industria-rounds.js',
  'core/engine.js':                 'Core/engine.js',
  'mainBeta.js':                    'mainBeta.js',
};

const bundle = fs.readFileSync('bundle.js', 'utf8');
const linhas = bundle.split('\n');

// Encontra onde cada seção começa
const secoes = [];
linhas.forEach((linha, i) => {
  const match = linha.match(/^\/\* --(.+?)-- \*\//);
  if (match) {
    secoes.push({ marcador: match[1], linha: i });
  }
});

console.log(`\n📦 ${secoes.length} arquivos encontrados no bundle.js\n`);

// Extrai cada seção e salva no arquivo correspondente
secoes.forEach((secao, idx) => {
  const inicio  = secao.linha + 1;
  const fim     = idx + 1 < secoes.length ? secoes[idx + 1].linha : linhas.length;
  const conteudo = linhas.slice(inicio, fim).join('\n').trimEnd() + '\n';

  const destino = MAPA[secao.marcador];
  if (!destino) {
    console.warn(`⚠️  Sem mapeamento para: ${secao.marcador}`);
    return;
  }

  // Garante que a pasta existe
  const pasta = path.dirname(destino);
  if (pasta !== '.' && !fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }

  fs.writeFileSync(destino, conteudo, 'utf8');
  console.log(`✅  ${secao.marcador.padEnd(38)} → ${destino}`);
});

console.log('\n🎉 Extração concluída! Todos os arquivos estão atualizados.\n');
