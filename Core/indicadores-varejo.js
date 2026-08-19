

const IndicadoresVarejo = (() => {

    function aplicarInterdependencias(ind) {
        
        if (ind.estoque <= 5 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 1);
        }
        if (ind.estoque <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        
        if (ind.margem <= 4 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
        }

        
        if (ind.marca <= 5 && ind.digital > 1) {
            ind.digital = Math.max(0, ind.digital - 1);
        }

        
        if (ind.digital <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        
        if (ind.marca <= 3 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
        }

        
        if (ind.rh <= 4 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 1);
        }

        
        if (ind.digital >= 15 && ind.marca >= 14 && ind.clientes < 20) {
            ind.clientes = Math.min(20, ind.clientes + 1);
        }

        
        if (ind.margem >= 16 && ind.processos < 20) {
            ind.processos = Math.min(20, ind.processos + 1);
        }
    }

    return { aplicarInterdependencias };
})();
