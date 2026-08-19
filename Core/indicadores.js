

const BetaIndicadores = (() => {

    const LABELS = {
        
        financeiro:    "💰 Financeiro",
        rh:            "👥 RH",
        clientes:      "⭐ Clientes",
        processos:     "⚙️ Processos",
        
        margem:        "📊 Margem Operacional",
        estoque:       "📦 Giro de Estoque",
        marca:         "🏷️ Força da Marca",
        digital:       "🖥️ Canal Digital",
        
        sla:           "⏱️ Cumprimento de SLA",
        frota:         "🚛 Estado da Frota",
        seguranca:     "🦺 Segurança Operacional",
        tecnologia:    "📡 TMS / Tecnologia",
        
        
        manutencao:    "🔧 Manutenção de Ativos",
        qualidade:     "🎯 Controle de Qualidade",
        conformidade:  "📋 Conformidade Regulatória",
        
        clima:         "🧑‍💻 Clima Organizacional",
        satisfacao:    "⭐ Satisfação do Cliente",
        produtividade: "⚡ Produtividade",
        reputacao:     "📣 Reputação de Mercado",
        inovacao:      "🔬 Inovação",
    };

    
    const PESOS = {
        tecnologia: {
            financeiro: 0.20, clima: 0.10, satisfacao: 0.15,
            qualidade:  0.13, produtividade: 0.12, reputacao: 0.12,
            inovacao:   0.10, seguranca: 0.08
        },
        varejo: {
            financeiro: 0.18, rh: 0.12, clientes: 0.20, processos: 0.10,
            margem:     0.18, estoque: 0.08, marca: 0.09, digital: 0.05
        },
        logistica: {
            financeiro: 0.15, rh: 0.12, clientes: 0.18, processos: 0.10,
            sla:        0.20, frota: 0.10, seguranca: 0.10, tecnologia: 0.05
        },
        industria: {
            financeiro: 0.15, rh: 0.12, clientes: 0.15, processos: 0.12,
            seguranca:  0.18, manutencao: 0.12, qualidade: 0.10, conformidade: 0.06
        },
        default: {
            financeiro: 0.30, rh: 0.25, clientes: 0.25, processos: 0.20
        }
    };

    function nivel(value) {
        if (value <= 3)  return "critico";
        if (value <= 6)  return "baixo";
        if (value <= 12) return "medio";
        if (value <= 16) return "bom";
        return "excelente";
    }

    function corNivel(value) {
        return {
            critico:   "#ef4444",
            baixo:     "#f97316",
            medio:     "#f59e0b",
            bom:       "#22c55e",
            excelente: "#00d4ff",
        }[nivel(value)];
    }

    function labelNivel(value) {
        return {
            critico:   "CRÍTICO",
            baixo:     "BAIXO",
            medio:     "MÉDIO",
            bom:       "BOM",
            excelente: "EXCELENTE",
        }[nivel(value)];
    }

    function resumoEstado(indicators) {
        const vals  = Object.values(indicators);
        const media = vals.reduce((a, b) => a + b, 0) / vals.length;
        if (media <= 4)  return "em colapso";
        if (media <= 7)  return "em crise severa";
        if (media <= 10) return "em crise";
        if (media <= 13) return "estável";
        if (media <= 16) return "saudável";
        return "em expansão";
    }

    
    function avaliarDecisaoContextual(effects, indicators, situacao, state) {
        const positivos = Object.entries(effects).filter(([, v]) => v > 0);
        const negativos = Object.entries(effects).filter(([, v]) => v < 0);

        
        
        
        const _urgencia = (k) => {
            const v = indicators[k] ?? 10;
            if (v <= 3)  return 3.0;  
            if (v <= 6)  return 2.0;  
            if (v <= 10) return 1.2;  
            if (v <= 14) return 0.9;  
            return 0.6;               
        };

        const somaPosUrgente = positivos.reduce((a, [k, v]) =>  a + v * _urgencia(k), 0);
        const somaNegUrgente = negativos.reduce((a, [k, v]) =>  a + Math.abs(v) * _urgencia(k), 0);
        let scoreA = somaPosUrgente - somaNegUrgente;

        
        
        
        const fase = state?.storyState?.faseEmpresa || 'crescimento';
        const limiares = {
            crise:         { boa: 6,  media: 2  },  
            crescimento:   { boa: 4,  media: 0  },  
            fundacao:      { boa: 3,  media: -1 },  
            consolidacao:  { boa: 4,  media: 0  },
            expansao:      { boa: 3,  media: -1 },  
        };
        const lim = limiares[fase] || limiares.crescimento;

        
        
        const historico = state?.history || [];
        const ultimas3  = historico.slice(-3);
        const qtdRuins  = ultimas3.filter(h => h.avaliacao === 'ruim').length;
        const qtdMedias = ultimas3.filter(h => h.avaliacao === 'media').length;

        let penTendencia = 0;
        let contextoTendencia = '';
        if (qtdRuins >= 2) {
            penTendencia = -3;
            contextoTendencia = 'sequência de decisões ruins pesa no resultado';
        } else if (qtdRuins >= 1 && qtdMedias >= 1) {
            penTendencia = -1.5;
            contextoTendencia = 'histórico recente exige uma virada mais clara';
        } else if (qtdRuins === 0 && qtdMedias === 0 && ultimas3.length >= 2) {
            
            penTendencia = +1;
        }

        const scoreTotal = scoreA + penTendencia;

        
        let avaliacao;
        if      (scoreTotal >= lim.boa)   avaliacao = 'boa';
        else if (scoreTotal >= lim.media) avaliacao = 'media';
        else                               avaliacao = 'ruim';

        
        const partes = [];

        
        if (fase === 'crise') {
            partes.push('A empresa está em crise — o padrão exigido é mais alto');
        } else if (fase === 'expansao') {
            partes.push('A empresa está em expansão — há mais margem para trade-offs');
        } else if (fase === 'fundacao') {
            partes.push('Fase de fundação — ainda há espaço para ajustes');
        }

        
        const criticosAjudados  = positivos.filter(([k]) => nivel(indicators[k] ?? 10) === 'critico');
        const criticosPrejudicados = negativos.filter(([k]) => nivel(indicators[k] ?? 10) === 'critico');
        if (criticosAjudados.length > 0) {
            const nomes = criticosAjudados.map(([k]) => LABELS[k] || k).join(', ');
            partes.push(`Ação decisiva em indicador crítico: ${nomes}`);
        }
        if (criticosPrejudicados.length > 0) {
            const nomes = criticosPrejudicados.map(([k]) => LABELS[k] || k).join(', ');
            partes.push(`Risco: ${nomes} já está crítico e foi prejudicado`);
        }

        
        if (contextoTendencia) partes.push(contextoTendencia.charAt(0).toUpperCase() + contextoTendencia.slice(1));

        const contexto = partes.join('. ') + (partes.length ? '.' : '');

        return { avaliacao, contexto };
    }

    function isGameOver(indicators) {
        
        
        
        
        return Object.values(indicators).some(v => v <= 0);
    }

    function scoreTotal(indicators, sector = null) {
        const pesos = PESOS[sector] || PESOS.default;
        return Object.entries(pesos).reduce((acc, [k, p]) => {
            return acc + (indicators[k] ?? 0) * p;
        }, 0);
    }

    return {
        LABELS, PESOS,
        nivel, corNivel, labelNivel, resumoEstado,
        avaliarDecisaoContextual, isGameOver, scoreTotal
    };
})();
