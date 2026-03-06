/* --core/state.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · STATE · Estado centralizado do jogo beta
   v5.0 — 8 indicadores por setor, situações filtradas por setor
═══════════════════════════════════════════════════════ */

const BetaState = (() => {
    let _state = null;

    function _indicadoresBase(sector) {
        const BASE = {
            tecnologia: {
                financeiro: 9, clima: 4, satisfacao: 7,
                qualidade: 6, produtividade: 5, reputacao: 8,
                inovacao: 7, seguranca: 6
            },
            varejo: {
                financeiro: 6, rh: 7, clientes: 8, processos: 5,
                margem: 5, estoque: 7, marca: 8, digital: 4
            },
            logistica: {
                financeiro: 7, rh: 6, clientes: 7, processos: 4,
                sla: 5, frota: 7, seguranca: 8, tecnologia: 4
            },
            industria: {
                financeiro: 8, rh: 6, clientes: 7, processos: 5,
                seguranca: 4, manutencao: 5, qualidade: 7, conformidade: 8
            },
        };
        return { ...(BASE[sector] || { financeiro: 7, rh: 6, clientes: 7, processos: 6 }) };
    }

    function init(sector, groupName, companyName) {
        _state = {
            sector,
            groupName,
            companyName,

            indicators: _indicadoresBase(sector),

            currentRound:  0,
            totalRounds:   15,
            gameRounds:    [],
            situacaoAtual: null,
            companyInfo:   null,
            introIndex:    0,

            history:      [],
            activeEvents: [],

            phase: "intro",

            gestor: {
                reputacaoInterna: 5,
                capitalPolitico:  7,
                esgotamento:      2,
            },

            // Evolução da crise inicial: null | "melhorando" | "resolvida" | "piorando"
            situacaoStatus: null,

            stakeholderLog: [],

            storyState: {
                faseEmpresa:      "fundacao",
                estiloGestao:     [],
                reputacaoMercado: "boa",
                flags:            [],
                conquistas:       [],
                traumas:          [],
                flagMotivos:      {},   // guarda o motivo textual de cada flag
            }
        };
        return _state;
    }

    function get()           { return _state; }
    function getIndicators() { return _state.indicators; }

    function applyEffects(effects) {
        const ind = _state.indicators;
        Object.entries(effects).forEach(([k, v]) => {
            if (ind[k] !== undefined)
                ind[k] = Math.max(0, Math.min(20, ind[k] + v));
        });
    }

    function addHistory(entry) { _state.history.push(entry); }
    function addEvent(ev)      { _state.activeEvents.push(ev); }

    function removeExpiredEvents() {
        _state.activeEvents = _state.activeEvents.filter(ev =>
            ev.expiresAt === undefined || _state.currentRound <= ev.expiresAt
        );
    }

    function nextRound() {
        _state.currentRound++;
        removeExpiredEvents();
    }

    function setPhase(phase) { _state.phase = phase; }

    function addFlag(flag, motivo = null) {
        if (!_state.storyState.flags.includes(flag)) {
            _state.storyState.flags.push(flag);
            if (motivo) _state.storyState.flagMotivos[flag] = motivo;
        }
    }

    function setFase(fase)           { _state.storyState.faseEmpresa = fase; }
    function setReputacao(valor)     { _state.storyState.reputacaoMercado = valor; }
    function addEstiloGestao(estilo) { _state.storyState.estiloGestao.push(estilo); }

    function addConquista(conquista) {
        if (!_state.storyState.conquistas.includes(conquista))
            _state.storyState.conquistas.push(conquista);
    }

    function addTrauma(trauma) {
        if (!_state.storyState.traumas.includes(trauma))
            _state.storyState.traumas.push(trauma);
    }

    function applyGestorEffects(effects) {
        const g = _state.gestor;
        Object.entries(effects).forEach(([k, v]) => {
            if (g[k] !== undefined)
                g[k] = Math.max(0, Math.min(10, g[k] + v));
        });
    }

    function addStakeholderLog(entry) { _state.stakeholderLog.push(entry); }
    function getGestor()              { return _state.gestor; }
    function setSituacaoStatus(s)     { _state.situacaoStatus = s; }

    return {
        init, get, getIndicators, applyEffects,
        applyGestorEffects, getGestor, addStakeholderLog,
        addHistory, addEvent, nextRound, setPhase,
        addFlag, setFase, setReputacao, addEstiloGestao,
        addConquista, addTrauma, setSituacaoStatus,
    };
})();


/* --core/indicadores.js-- */
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

    function avaliarDecisaoContextual(effects, indicators, situacao) {
        const positivos = Object.entries(effects).filter(([, v]) => v > 0);
        const negativos = Object.entries(effects).filter(([, v]) => v < 0);
        const somaPos   = positivos.reduce((a, [, v]) => a + v, 0);
        const somaNeg   = Math.abs(negativos.reduce((a, [, v]) => a + v, 0));
        const netScore  = somaPos - somaNeg;

        const penCritico = negativos.some(([k]) => nivel(indicators[k] ?? 10) === "critico") ? -2 : 0;
        const bonCritico = positivos.some(([k]) => nivel(indicators[k] ?? 10) === "critico") ? +1.5 : 0;

        const score = netScore + penCritico + bonCritico;

        if (score >= 3)  return "boa";
        if (score >= 0)  return "media";
        return "ruim";
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


/* --core/indicadores-tecnologia.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · INDICADORES · Tecnologia
   Sistema expandido e interdependente para o setor de TI.
   8 indicadores com lógica de efeito em cadeia.

   MAPEAMENTO (antigo → novo):
     rh         → clima        (Clima Organizacional)
     clientes   → satisfacao   (Satisfação do Cliente)
     processos  → qualidade    (Qualidade do Produto)
     [novos]    → produtividade, reputacao, inovacao, seguranca
═══════════════════════════════════════════════════════ */

const IndicadoresTecnologia = (() => {

    /* ── Rótulos exibidos na sidebar / feedback ──────── */
    const LABELS = {
        financeiro:   "💰 Financeiro",
        clima:        "🧑‍💻 Clima Organizacional",
        satisfacao:   "⭐ Satisfação do Cliente",
        qualidade:    "🛠️ Qualidade do Produto",
        produtividade:"⚡ Produtividade",
        reputacao:    "📣 Reputação de Mercado",
        inovacao:     "🔬 Inovação",
        seguranca:    "🔒 Segurança da Informação"
    };

    /* ── Pesos para score final (soma = 1.0) ─────────── */
    const PESOS = {
        financeiro:    0.20,
        clima:         0.10,
        satisfacao:    0.15,
        qualidade:     0.13,
        produtividade: 0.12,
        reputacao:     0.12,
        inovacao:      0.10,
        seguranca:     0.08
    };

    /* ── Valores iniciais ────────────────────────────── */
    const VALORES_INICIAIS = {
        financeiro:    10,
        clima:         10,
        satisfacao:    10,
        qualidade:     10,
        produtividade: 10,
        reputacao:     10,
        inovacao:      10,
        seguranca:     10
    };

    /* ══════════════════════════════════════════════════
       LÓGICA DE INTERDEPENDÊNCIA (efeito em cadeia)
       Aplicado APÓS cada decisão do jogador.
       Cada regra roda UMA vez por rodada (não recursivo).
    ══════════════════════════════════════════════════ */
    function aplicarInterdependencias(ind) {
        const log = [];

        /* 1. Clima ruim → queda de produtividade
              Engenheiros desmotivados entregam menos */
        if (ind.clima <= 5 && ind.produtividade > 1) {
            ind.produtividade = Math.max(0, ind.produtividade - 2);
            log.push("🌡️ Clima crítico drena a produtividade do time.");
        }

        /* 2. Produtividade baixa → qualidade do produto cai
              Time sobrecarregado ou desmotivado escreve código pior */
        if (ind.produtividade <= 5 && ind.qualidade > 1) {
            ind.qualidade = Math.max(0, ind.qualidade - 2);
            log.push("⚡ Baixa produtividade compromete a qualidade das entregas.");
        }

        /* 3. Qualidade baixa → insatisfação dos clientes
              Bugs e instabilidade geram churn */
        if (ind.qualidade <= 5 && ind.satisfacao > 1) {
            ind.satisfacao = Math.max(0, ind.satisfacao - 2);
            log.push("🛠️ Produto instável deteriora a satisfação dos clientes.");
        }

        /* 4. Satisfação baixa → impacto financeiro
              Churn elevado reduz ARR */
        if (ind.satisfacao <= 5 && ind.financeiro > 1) {
            ind.financeiro = Math.max(0, ind.financeiro - 2);
            log.push("⭐ Churn alto corrói a saúde financeira.");
        }

        /* 5. Inovação alta → reputação melhora
              Empresa reconhecida como referência técnica */
        if (ind.inovacao >= 15 && ind.reputacao < 20) {
            ind.reputacao = Math.min(20, ind.reputacao + 1);
            log.push("🔬 Alta inovação eleva a reputação de mercado.");
        }

        /* 6. Segurança crítica → colapso de reputação e confiança
              Incidente de dados destrói credibilidade */
        if (ind.seguranca <= 4) {
            if (ind.reputacao > 1) {
                ind.reputacao = Math.max(0, ind.reputacao - 3);
                log.push("🔒 Falha crítica de segurança destrói a reputação.");
            }
            if (ind.satisfacao > 1) {
                ind.satisfacao = Math.max(0, ind.satisfacao - 2);
                log.push("🔒 Clientes perdem confiança após incidente de segurança.");
            }
        }

        /* 7. Sem recursos financeiros → inovação para
              R&D depende de caixa saudável */
        if (ind.financeiro <= 5 && ind.inovacao > 1) {
            ind.inovacao = Math.max(0, ind.inovacao - 2);
            log.push("💰 Caixa apertado congela investimentos em inovação.");
        }

        /* 8. Reputação excelente → atrai clientes
              Referência de mercado reduz churn */
        if (ind.reputacao >= 16 && ind.satisfacao < 20) {
            ind.satisfacao = Math.min(20, ind.satisfacao + 1);
            log.push("📣 Reputação forte aumenta confiança e retém clientes.");
        }

        return log; // retorna mensagens para debug/log
    }

    /* ── Score final ponderado (0–20 → 0–100) ────────── */
    function scoreTotal(indicators) {
        return Object.entries(PESOS).reduce((acc, [k, p]) => {
            return acc + (indicators[k] ?? 0) * p;
        }, 0);
    }

    /* ── Resumo narrativo do estado geral ─────────────── */
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

    /* ── Identifica o indicador mais crítico ─────────── */
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


/* --core/indicadores-varejo.js-- */
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


/* --core/indicadores-logistica.js-- */
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


/* --core/indicadores-industria