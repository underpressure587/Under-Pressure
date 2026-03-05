/* ═══════════════════════════════════════════════════════
   BETA · INDICADORES · Indústria
   8 indicadores com interdependências causais.
═══════════════════════════════════════════════════════ */

const IndicadoresIndustria = (() => {

    function aplicarInterdependencias(ind) {
        /* 1. Manutenção crítica → segurança cai (equipamentos velhos causam acidentes) */
        if (ind.manutencao <= 4 && ind.seguranca > 1) {
            ind.seguranca = Math.max(0, ind.seguranca - 2);
        }

        /* 2. Manutenção ruim → qualidade cai (maquinário desgastado produz fora da especificação) */
        if (ind.manutencao <= 5 && ind.qualidade > 1) {
            ind.qualidade = Math.max(0, ind.qualidade - 1);
        }

        /* 3. Segurança crítica → RH cai (afastamentos, clima de medo) */
        if (ind.seguranca <= 4 && ind.rh > 1) {
            ind.rh = Math.max(0, ind.rh - 2);
        }

        /* 4. Segurança crítica → financeiro cai (multas MTE, afastamentos) */
        if (ind.seguranca <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
        }

        /* 5. Qualidade baixa → conformidade cai (não-conformidades violam ISO) */
        if (ind.qualidade <= 5 && ind.conformidade > 1) {
            ind.conformidade = Math.max(0, ind.conformidade - 2);
        }

        /* 6. Conformidade crítica → clientes caem (clientes exigindo ISO cancelam) */
        if (ind.conformidade <= 3 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        /* 7. Conformidade crítica → financeiro cai (multas e penalidades contratuais) */
        if (ind.conformidade <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 1);
        }

        /* 8. Segurança excelente + qualidade alta → clientes melhoram (reputação) */
        if (ind.seguranca >= 15 && ind.qualidade >= 14 && ind.clientes < 20) {
            ind.clientes = Math.min(20, ind.clientes + 1);
        }

        /* 9. Boa manutenção → processos melhoram (menos paradas imprevistas) */
        if (ind.manutencao >= 14 && ind.processos < 20) {
            ind.processos = Math.min(20, ind.processos + 1);
        }
    }

    return { aplicarInterdependencias };
})();

export default IndicadoresIndustria;
