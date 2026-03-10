/* ═══════════════════════════════════════════════════════
   BETA · INDICADORES · Varejo
   8 indicadores com interdependências causais.
   Espelha a lógica de indicadores-tecnologia.js
═══════════════════════════════════════════════════════ */

const IndicadoresVarejo = (() => {

    function aplicarInterdependencias(ind) {
        /* 1. Giro de estoque ruim → pressão financeira (capital imobilizado)
              e ruptura de estoque → clientes insatisfeitos */
        if (ind.estoque <= 5 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 1);
        }
        if (ind.estoque <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        /* 2. Margem crítica → pressão sobre financeiro */
        if (ind.margem <= 4 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
        }

        /* 3. Marca fraca → digital sofre (sem diferencial, canal perde para marketplaces) */
        if (ind.marca <= 5 && ind.digital > 1) {
            ind.digital = Math.max(0, ind.digital - 1);
        }

        /* 4. Digital baixo → clientes caem (38% do canal comprometido) */
        if (ind.digital <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        /* 5. Crise de marca → clientes caem diretamente */
        if (ind.marca <= 3 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        /* 6. RH fraco → clientes sofrem via atendimento em loja */
        if (ind.rh <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 1);
        }

        /* 7. Canal digital forte + marca forte → melhora clientes */
        if (ind.digital >= 15 && ind.marca >= 14 && ind.clientes < 20) {
            ind.clientes = Math.min(20, ind.clientes + 1);
        }

        /* 8. Margem forte → folga para investir → processos melhoram */
        if (ind.margem >= 16 && ind.processos < 20) {
            ind.processos = Math.min(20, ind.processos + 1);
        }
    }

    return { aplicarInterdependencias };
})();
