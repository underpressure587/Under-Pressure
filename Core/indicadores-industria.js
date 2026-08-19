

const IndicadoresIndustria = (() => {

    function aplicarInterdependencias(ind) {
        
        if (ind.manutencao <= 4 && ind.seguranca > 1) {
            ind.seguranca = Math.max(0, ind.seguranca - 2);
        }

        
        if (ind.manutencao <= 5 && ind.qualidade > 1) {
            ind.qualidade = Math.max(0, ind.qualidade - 1);
        }

        
        if (ind.seguranca <= 4 && ind.rh > 1) {
            ind.rh = Math.max(0, ind.rh - 2);
        }

        
        if (ind.seguranca <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
        }

        
        if (ind.qualidade <= 5 && ind.conformidade > 1) {
            ind.conformidade = Math.max(0, ind.conformidade - 2);
        }

        
        if (ind.conformidade <= 3 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        
        if (ind.conformidade <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 1);
        }

        
        if (ind.seguranca >= 15 && ind.qualidade >= 14 && ind.clientes < 20) {
            ind.clientes = Math.min(20, ind.clientes + 1);
        }

        
        if (ind.manutencao >= 14 && ind.processos < 20) {
            ind.processos = Math.min(20, ind.processos + 1);
        }
    }

    return { aplicarInterdependencias };
})();
