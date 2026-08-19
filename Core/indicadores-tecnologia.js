

const IndicadoresTecnologia = (() => {

    
    const LABELS = {
        financeiro:   "💰 Financeiro",
        rh:           "👥 RH",
        clientes:     "⭐ Clientes",
        qualidade:    "🎯 Controle de Qualidade",
        produtividade:"⚡ Produtividade",
        reputacao:    "📣 Reputação de Mercado",
        inovacao:     "🔬 Inovação",
        seguranca:    "🦺 Segurança Operacional"
    };

    
    const PESOS = {
        financeiro:    0.20,
        rh:         0.10,
        clientes:    0.15,
        qualidade:     0.13,
        produtividade: 0.12,
        reputacao:     0.12,
        inovacao:      0.10,
        seguranca:     0.08
    };

    
    const VALORES_INICIAIS = {
        financeiro:    10,
        rh:         10,
        clientes:    10,
        qualidade:     10,
        produtividade: 10,
        reputacao:     10,
        inovacao:      10,
        seguranca:     10
    };

    
    function aplicarInterdependencias(ind) {
        const log = [];

        
        if (ind.rh <= 5 && ind.produtividade > 1) {
            ind.produtividade = Math.max(0, ind.produtividade - 2);
            log.push("🌡️ Clima crítico drena a produtividade do time.");
        }

        
        if (ind.produtividade <= 5 && ind.qualidade > 1) {
            ind.qualidade = Math.max(0, ind.qualidade - 2);
            log.push("⚡ Baixa produtividade compromete a qualidade das entregas.");
        }

        
        if (ind.qualidade <= 5 && ind.clientes > 1) {
            ind.clientes = Math.max(0, ind.clientes - 2);
            log.push("🛠️ Produto instável deteriora a satisfação dos clientes.");
        }

        
        if (ind.clientes <= 5 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
            log.push("⭐ Churn alto corrói a saúde financeira.");
        }

        
        if (ind.inovacao >= 15 && ind.reputacao < 20) {
            ind.reputacao = Math.min(20, ind.reputacao + 1);
            log.push("🔬 Alta inovação eleva a reputação de mercado.");
        }

        
        if (ind.seguranca <= 4) {
            if (ind.reputacao > 1) {
                ind.reputacao = Math.max(0, ind.reputacao - 3);
                log.push("🔒 Falha crítica de segurança destrói a reputação.");
            }
            if (ind.clientes > 1) {
                ind.clientes = Math.max(0, ind.clientes - 2);
                log.push("🔒 Clientes perdem confiança após incidente de segurança.");
            }
        }

        
        if (ind.financeiro <= 5 && ind.inovacao > 1) {
            ind.inovacao = Math.max(0, ind.inovacao - 2);
            log.push("💰 Caixa apertado congela investimentos em inovação.");
        }

        
        if (ind.reputacao >= 16 && ind.clientes < 20) {
            ind.clientes = Math.min(20, ind.clientes + 1);
            log.push("📣 Reputação forte aumenta confiança e retém clientes.");
        }

        return log; 
    }

    
    function scoreTotal(indicators) {
        return Object.entries(PESOS).reduce((acc, [k, p]) => {
            return acc + (indicators[k] ?? 0) * p;
        }, 0);
    }

    
    function resumoEstado(indicators) {
        const vals  = Object.values(indicators);
        const media = vals.reduce((a, b) => a + b, 0) / vals.length;
        const criticos = vals.filter(v => v <= 3).length;

        if (criticos >= 3)  return "em colapso sistêmico";
        if (criticos >= 1)  return "em crise severa";
        if (media <= 6)     return "em crise";
        if (media <= 9)     return "sob pressão";
        if (media <= 12)    return "estável";
        if (media <= 15)    return "em crescimento saudável";
        return "referência de mercado";
    }

    
    function indicadorMaisCritico(indicators) {
        return Object.entries(indicators).reduce((min, [k, v]) => {
            return v < min[1] ? [k, v] : min;
        }, ["", Infinity]);
    }

    return {
        LABELS,
        PESOS,
        VALORES_INICIAIS,
        aplicarInterdependencias,
        scoreTotal,
        resumoEstado,
        indicadorMaisCritico
    };
})();
