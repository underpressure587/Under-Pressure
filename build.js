/**
 * build.js
 * Junta todos os arquivos fonte e gera o bundle.js.
 * Uso: node build.js
 */

const fs   = require('fs');
const path = require('path');

// Ordem exata dos arquivos para o bundle
const ORDEM = [
  { marcador: 'core/state.js',                  arquivo: 'Core/state.js' },
  { marcador: 'core/indicadores.js',            arquivo: 'Core/indicadores.js' },
  { marcador: 'core/indicadores-tecnologia.js', arquivo: 'Core/indicadores-tecnologia.js' },
  { marcador: 'core/indicadores-varejo.js',     arquivo: 'Core/indicadores-varejo.js' },
  { marcador: 'core/indicadores-logistica.js',  arquivo: 'Core/indicadores-logistica.js' },
  { marcador: 'core/indicadores-industria.js',  arquivo: 'Core/indicadores-industria.js' },
  { marcador: 'systems/impacto.js',             arquivo: 'systems/impacto.js' },
  { marcador: 'systems/imprevisto.js',          arquivo: 'systems/imprevisto.js' },
  { marcador: 'systems/feedback.js',            arquivo: 'systems/feedback.js' },
  { marcador: 'systems/storyEngine.js',         arquivo: 'systems/storyEngine.js' },
  { marcador: 'systems/protagonista.js',        arquivo: 'systems/protagonista.js' },
  { marcador: 'empresas/tecnologia.js',         arquivo: 'empresas/tecnologia.js' },
  { marcador: 'empresas/varejo.js',             arquivo: 'empresas/varejo.js' },
  { marcador: 'empresas/logistica.js',          arquivo: 'empresas/logistica.js' },
  { marcador: 'empresas/industria.js',          arquivo: 'empresas/industria.js' },
  { marcador: 'rounds/tecnologia-rounds.js',    arquivo: 'empresas/tecnologia-rounds.js' },
  { marcador: 'rounds/varejo-rounds.js',        arquivo: 'empresas/varejo-rounds.js' },
  { marcador: 'rounds/logistica-rounds.js',     arquivo: 'empresas/logistica-rounds.js' },
  { marcador: 'rounds/industria-rounds.js',     arquivo: 'empresas/industria-rounds.js' },
  { marcador: 'core/engine.js',                 arquivo: 'Core/engine.js' },
  { marcador: 'maintenance.js',                 arquivo: 'maintenance.js' },
  { marcador: 'mainBeta.js',                    arquivo: 'mainBeta.js' },
  { marcador: 'sala-mode-new.js',               arquivo: 'sala-mode-new.js' },
];

console.log('\n🔨 Gerando bundle.js...\n');

let resultado = '';
let ok = 0;
let erros = 0;

ORDEM.forEach(({ marcador, arquivo }) => {
  if (!fs.existsSync(arquivo)) {
    console.error(`❌  Arquivo não encontrado: ${arquivo}`);
    erros++;
    return;
  }

  const conteudo = fs.readFileSync(arquivo, 'utf8');
  resultado += `/* --${marcador}-- */\n${conteudo.trimEnd()}\n`;
  console.log(`✅  ${arquivo}`);
  ok++;
});

if (erros > 0) {
  console.error(`\n⚠️  ${erros} arquivo(s) faltando. bundle.js não foi gerado.\n`);
  process.exit(1);
}

// Backup do bundle anterior
if (fs.existsSync('bundle.js')) {
  fs.copyFileSync('bundle.js', 'bundle.backup.js');
  console.log('\n💾 Backup salvo em bundle.backup.js');
}

fs.writeFileSync('bundle.js', resultado, 'utf8');
console.log(`\n🎉 bundle.js gerado com sucesso! (${ok} arquivos)\n`);
