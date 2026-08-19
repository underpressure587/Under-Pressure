

const IndicadoresLogistica = (() => {

    function aplicarInterdependencias(ind) {
        
        if (ind.frota <= 5 && ind.seguranca > 1) {
            ind.seguranca = Math.max(0, ind.seguranca - 2);
        }

        
        if (ind.frota <= 4 && ind.sla > 1) {
            ind.sla = Math.max(0, ind.sla - 2);
        }

        
        if (ind.seguranca <= 4 && ind.rh > 1) {
            ind.rh = Math.max(0, ind.rh - 2);
        }

        
        if (ind.seguranca <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
        }

        
        if (ind.tecnologia <= 4 && ind.sla > 1) {
            ind.sla = Math.max(0, ind.sla - 2);
        }

        
        if (ind.sla <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        
        if (ind.sla <= 3 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 1);
        }

        
        if (ind.tecnologia >= 15 && ind.sla < 20) {
            ind.sla = Math.min(20, ind.sla + 1);
        }

        
        if (ind.frota >= 14 && ind.tecnologia >= 12 && ind.processos < 20) {
            ind.processos = Math.min(20, ind.processos + 1);
        }
    }

    return { aplicarInterdependencias };
})();
