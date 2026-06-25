/* ═══════════════════════════════════════════════════════
   BETA · INDICADORES · Helpers de nível e avaliação
   v5.0 — pesos por setor, labels novos indicadores
═══════════════════════════════════════════════════════ */

const BetaIndicadores = (() => {

    const LABELS = {
        // Padrão (todos os setores)
        financeiro:    "💰 Financeiro",
        rh:            "👥 RH",
        clientes:      "⭐ Clientes",
        processos:     "⚙️ Processos",
        // Varejo
        margem:        "📊 Margem Operacional",
        estoque:       "📦 Giro de Estoque",
        marca:         "🏷️ Força da Marca",
        digital:       "🖥️ Canal Digital",
        // Logística
        sla:           "⏱️ Cumprimento de SLA",
        frota:         "🚛 Estado da Frota",
        seguranca:     "🦺 Segurança Operacional",
        tecnologia:    "📡 TMS / Tecnologia",
        // Indústria
        // seguranca (reaproveitado com mesmo emoji)
        manutencao:    "🔧 Manutenção de Ativos",
        qualidade:     "🎯 Controle de Qualidade",
        conformidade:  "📋 Conformidade Regulatória",
        // Tecnologia
        clima:         "🧑‍💻 Clima Organizacional",
        satisfacao:    "⭐ Satisfação do Cliente",
        produtividade: "⚡ Produtividade",
        reputacao:     "📣 Reputação de Mercado",
        inovacao:      "🔬 Inovação",
    };

    // Pesos por setor (soma = 1.0 em cada)
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

    /**
     * Avalia a decisão de forma contextual — considera:
     *   A) Urgência dos indicadores afetados (impacto relativo ao estado atual)
     *   B) Fase da empresa (crise exige mais, expansão é mais tolerante)
     *   C) Tendência recente (sequência de ruins torna neutros insuficientes)
     *
     * Retorna { avaliacao: 'boa'|'media'|'ruim', contexto: string }
     * O campo `contexto` explica o que influenciou o veredito além dos efeitos brutos.
     */
    function avaliarDecisaoContextual(effects, indicators, situacao, state) {
        const positivos = Object.entries(effects).filter(([, v]) => v > 0);
        const negativos = Object.entries(effects).filter(([, v]) => v < 0);

        // ── A) Score ponderado pela urgência dos indicadores ──────────────────
        // Indicadores baixos têm urgência maior — prejudicá-los custa mais,
        // ajudá-los vale mais.
        const _urgencia = (k) => {
            const v = indicators[k] ?? 10;
            if (v <= 3)  return 3.0;  // crítico — peso máximo
            if (v <= 6)  return 2.0;  // baixo
            if (v <= 10) return 1.2;  // médio
            if (v <= 14) return 0.9;  // bom — peso reduzido (não precisa tanto)
            return 0.6;               // excelente — ajudar pouco importa
        };

        const somaPosUrgente = positivos.reduce((a, [k, v]) =>  a + v * _urgencia(k), 0);
        const somaNegUrgente = negativos.reduce((a, [k, v]) =>  a + Math.abs(v) * _urgencia(k), 0);
        let scoreA = somaPosUrgente - somaNegUrgente;

        // ── B) Limiar ajustado pela fase da empresa ───────────────────────────
        // Em crise: precisa de score mais alto para ser "boa"
        // Em expansão/consolidação: mais tolerante
        const fase = state?.storyState?.faseEmpresa || 'crescimento';
        const limiares = {
            crise:         { boa: 6,  media: 2  },  // exige mais
            crescimento:   { boa: 4,  media: 0  },  // padrão
            fundacao:      { boa: 3,  media: -1 },  // início: mais tolerante
            consolidacao:  { boa: 4,  media: 0  },
            expansao:      { boa: 3,  media: -1 },  // indo bem: mais tolerante
        };
        const lim = limiares[fase] || limiares.crescimento;

        // ── C) Penalidade por tendência negativa recente ──────────────────────
        // Se as últimas 3 decisões foram ruins ou médias, decisões neutras não bastam
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
            // Sequência positiva — pequeno bônus por consistência
            penTendencia = +1;
        }

        const scoreTotal = scoreA + penTendencia;

        // ── Determina veredito ────────────────────────────────────────────────
        let avaliacao;
        if      (scoreTotal >= lim.boa)   avaliacao = 'boa';
        else if (scoreTotal >= lim.media) avaliacao = 'media';
        else                               avaliacao = 'ruim';

        // ── Monta string de contexto (explicação complementar) ────────────────
        const partes = [];

        // Contexto de fase
        if (fase === 'crise') {
            partes.push('A empresa está em crise — o padrão exigido é mais alto');
        } else if (fase === 'expansao') {
            partes.push('A empresa está em expansão — há mais margem para trade-offs');
        } else if (fase === 'fundacao') {
            partes.push('Fase de fundação — ainda há espaço para ajustes');
        }

        // Contexto de indicadores críticos ajudados/prejudicados
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

        // Contexto de tendência
        if (contextoTendencia) partes.push(contextoTendencia.charAt(0).toUpperCase() + contextoTendencia.slice(1));

        const contexto = partes.join('. ') + (partes.length ? '.' : '');

        return { avaliacao, contexto };
    }

    function isGameOver(indicators) {
        // FIX: threshold <= 0 — game over apenas quando indicador realmente zera,
        // consistente com o tutorial ("Se um indicador zerar, é game over") e
        // com a mensagem de resultado ("Um indicador zerou").
        // Antes era <= 1, o que encerrava o jogo com indicador ainda visível em 1.
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
