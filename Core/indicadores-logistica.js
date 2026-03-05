/* ═══════════════════════════════════════════════════════
   BETA · INDICADORES · Logística
   8 indicadores com interdependências causais.
═══════════════════════════════════════════════════════ */

const IndicadoresLogistica = (() => {

    function aplicarInterdependencias(ind) {
        /* 1. Frota deteriorada → segurança cai (acidentes) */
        if (ind.frota <= 5 && ind.seguranca > 1) {
            ind.seguranca = Math.max(0, ind.seguranca - 2);
        }

        /* 2. Frota deteriorada → SLA cai (quebras causam atrasos) */
        if (ind.frota <= 4 && ind.sla > 1) {
            ind.sla = Math.max(0, ind.sla - 2);
        }

        /* 3. Segurança crítica → RH cai (motoristas pedem demissão) */
        if (ind.seguranca <= 4 && ind.rh > 1) {
            ind.rh = Math.max(0, ind.rh - 2);
        }

        /* 4. Segurança crítica → financeiro cai (multas, sinistros) */
        if (ind.seguranca <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
        }

        /* 5. Tecnologia baixa → SLA cai (operação cega não cumpre prazo) */
        if (ind.tecnologia <= 4 && ind.sla > 1) {
            ind.sla = Math.max(0, ind.sla - 2);
        }

        /* 6. SLA crítico → clientes caem (cláusulas de penalidade) */
        if (ind.sla <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        /* 7. SLA crítico + penalidades → financeiro cai */
        if (ind.sla <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 1);
        }

        /* 8. Tecnologia forte → SLA melhora gradualmente */
        if (ind.tecnologia >= 15 && ind.sla < 20) {
            ind.sla = Math.min(20, ind.sla + 1);
        }

        /* 9. Frota em ótimo estado + boa tecnologia → processos melhoram */
        if (ind.frota >= 14 && ind.tecnologia >= 12 && ind.processos < 20) {
            ind.processos = Math.min(20, ind.processos + 1);
        }
    }

    return { aplicarInterdependencias };
})();

export default IndicadoresLogistica;
