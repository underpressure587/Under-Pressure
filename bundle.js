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
/* --core/indicadores-industria.js-- */
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
/* --systems/impacto.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · IMPACTO · v5.0
   Calcula efeito real de uma decisão com modificadores
   de eventos ativos. Suporte a todos os 8 indicadores.
═══════════════════════════════════════════════════════ */

const BetaImpacto = (() => {

    function calcular(baseEffects, activeEvents) {
        const final = { ...baseEffects };
        activeEvents.forEach(ev => {
            if (!ev.modifier) return;
            Object.entries(ev.modifier).forEach(([k, mult]) => {
                if (final[k] !== undefined)
                    final[k] = Math.round(final[k] * mult);
            });
        });
        return final;
    }

    // Nomes legíveis de todos os indicadores possíveis
    const NOMES = {
        financeiro: "Financeiro", rh: "RH", clientes: "Clientes", processos: "Processos",
        margem: "Margem", estoque: "Estoque", marca: "Marca", digital: "Digital",
        sla: "SLA", frota: "Frota", seguranca: "Segurança", tecnologia: "Tecnologia",
        manutencao: "Manutenção", qualidade: "Qualidade", conformidade: "Conformidade",
        clima: "Clima", satisfacao: "Satisfação", produtividade: "Produtividade",
        reputacao: "Reputação", inovacao: "Inovação",
    };

    function descricao(effects) {
        return Object.entries(effects)
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => `${v > 0 ? "✅" : "❌"} ${NOMES[k] || k}: ${v > 0 ? "+" : ""}${v}`)
            .join(" · ") || "Sem impacto nos indicadores.";
    }

    return { calcular, descricao, NOMES };
})();
/* --systems/imprevisto.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · IMPREVISTO · v5.0
   Eventos com gestorEffects, pesos por gestor e flags.
═══════════════════════════════════════════════════════ */

const BetaImprevisto = (() => {

    const POOL = [
        {
            id: "greve",
            titulo: "⚠️ Risco de Greve",
            descricao: "A equipe está agitada. Decisões que prejudiquem RH têm impacto dobrado.",
            modifier: { rh: 2, clima: 2 },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "crise_cambial",
            titulo: "💱 Crise Cambial",
            descricao: "Oscilação do câmbio amplifica os efeitos financeiros.",
            modifier: { financeiro: 1.5 },
            gestorEffects: { esgotamento: +1 },
            duracao: 2
        },
        {
            id: "viral_positivo",
            titulo: "📣 Campanha Viral",
            descricao: "A empresa ganhou atenção positiva. Ganhos com clientes são maiores.",
            modifier: { clientes: 1.5, satisfacao: 1.5 },
            gestorEffects: { capitalPolitico: +1 },
            duracao: 1
        },
        {
            id: "auditoria",
            titulo: "🔍 Auditoria Surpresa",
            descricao: "Auditores na casa. Decisões que impactam processos têm efeito amplificado.",
            modifier: { processos: 2, qualidade: 2, conformidade: 2 },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "investidor",
            titulo: "💼 Visita de Investidor",
            descricao: "Investidor presente. Ganhos financeiros são maiores, perdas também.",
            modifier: { financeiro: 2 },
            gestorEffects: { capitalPolitico: +2 },
            duracao: 1
        },
        {
            id: "rotatividade",
            titulo: "🚪 Alta Rotatividade",
            descricao: "Muitas saídas simultâneas. O indicador de RH está hipersensível.",
            modifier: { rh: 2.5, clima: 2.5 },
            gestorEffects: { reputacaoInterna: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "acidente_operacional",
            titulo: "🚨 Incidente Operacional",
            descricao: "Ocorrência inesperada na operação. Decisões de segurança têm impacto dobrado.",
            modifier: { seguranca: 2, processos: 1.5 },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "reconhecimento_setor",
            titulo: "🏅 Reconhecimento do Setor",
            descricao: "A empresa foi citada positivamente pela mídia especializada.",
            modifier: { reputacao: 1.5, marca: 1.5, clientes: 1.2 },
            gestorEffects: { capitalPolitico: +1, reputacaoInterna: +1 },
            duracao: 1
        },
    ];

    let _usedIds = new Set();

    function sortear(currentRound, storyState = null, gestor = null) {
        const prob = Math.min(0.15 + currentRound * 0.01, 0.40);
        if (Math.random() > prob) return null;

        const disponiveis = POOL.filter(ev => !_usedIds.has(ev.id));
        if (!disponiveis.length) {
            _usedIds.clear();
            return sortear(currentRound, storyState, gestor);
        }

        if (!storyState) {
            const ev = disponiveis[Math.floor(Math.random() * disponiveis.length)];
            _usedIds.add(ev.id);
            return { ...ev, expiresAt: currentRound + ev.duracao };
        }

        const flags     = storyState.flags || [];
        const reputacao = storyState.reputacaoMercado || "boa";
        const esg       = gestor?.esgotamento ?? 5;
        const capPol    = gestor?.capitalPolitico ?? 5;

        const poolPonderado = disponiveis.map(ev => {
            let peso = 1;

            // Pesos por flags
            if (flags.includes("lideranca_toxica")      && ev.id === "rotatividade")         peso = 4;
            if (flags.includes("rh_negligenciado")      && ev.id === "greve")                peso = 3;
            if (flags.includes("ignorou_seguranca")     && ev.id === "auditoria")            peso = 4;
            if (flags.includes("ignorou_seguranca")     && ev.id === "acidente_operacional") peso = 3;
            if (flags.includes("crescimento_sem_caixa") && ev.id === "investidor")           peso = 0.2;
            if (flags.includes("crescimento_saudavel")  && ev.id === "investidor")           peso = 3;
            if (flags.includes("investiu_em_inovacao")  && ev.id === "viral_positivo")       peso = 3;

            // Pesos pelo estado do gestor
            if (esg >= 7 && ev.id === "greve")          peso *= 1.5;  // time sente o esgotamento
            if (capPol <= 3 && ev.id === "auditoria")   peso *= 2;    // conselho desconfiante provoca auditoria

            // Reputação modula eventos positivos/negativos
            if (reputacao === "toxica" && (ev.id === "investidor" || ev.id === "viral_positivo" || ev.id === "reconhecimento_setor")) {
                peso = 0;
            }
            if (reputacao === "boa" && (ev.id === "investidor" || ev.id === "viral_positivo" || ev.id === "reconhecimento_setor")) {
                peso *= 1.5;
            }

            return { ev, peso };
        }).filter(p => p.peso > 0);

        const totalPeso = poolPonderado.reduce((acc, p) => acc + p.peso, 0);
        let rand = Math.random() * totalPeso;
        let evEscolhido = poolPonderado[poolPonderado.length - 1].ev;

        for (const { ev, peso } of poolPonderado) {
            rand -= peso;
            if (rand <= 0) { evEscolhido = ev; break; }
        }

        _usedIds.add(evEscolhido.id);
        return { ...evEscolhido, expiresAt: currentRound + evEscolhido.duracao };
    }

    function resetar() { _usedIds.clear(); }

    return { sortear, resetar };
})();
/* --systems/feedback.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · FEEDBACK · v5.0
   Inclui melhor alternativa para aprendizagem comparativa.
═══════════════════════════════════════════════════════ */


const BetaFeedback = (() => {

    const COR    = { boa: "#22c55e", media: "#f59e0b", ruim: "#ef4444" };
    const ROTULO = { boa: "✅ BOA DECISÃO", media: "⚠️ DECISÃO MÉDIA", ruim: "❌ MÁ DECISÃO" };

    function calcular({ choice, choiceIndex, avaliacaoContextual, efeitosFinais,
                        eventoAtivo, history, storyState, storyStateAnterior,
                        efeitosGestor, stakeholderReacao, melhorAlternativa }) {
        return {
            avaliacao:    avaliacaoContextual,
            cor:          COR[avaliacaoContextual]    || "#94a3b8",
            rotulo:       ROTULO[avaliacaoContextual] || "—",
            escolhaTexto: choice.text,
            efeitos:      efeitosFinais,
            ensinamento:  choice.ensinamento || "Reflita sobre o impacto desta decisão nos indicadores da empresa.",
            eventoAtivo,
            historico:    history.slice(-3).reverse(),
            novasFlags:       _detectarNovasFlags(storyState, storyStateAnterior),
            novasConquistas:  _detectarNovasConquistas(storyState, storyStateAnterior),
            efeitosGestor,
            stakeholderReacao,
            melhorAlternativa,   // choice object ou null
        };
    }

    function _detectarNovasFlags(storyState, storyStateAnterior) {
        if (!storyState || !storyStateAnterior) return [];
        const antes = storyStateAnterior.flags || [];
        return (storyState.flags || []).filter(f => !antes.includes(f));
    }

    function _detectarNovasConquistas(storyState, storyStateAnterior) {
        if (!storyState || !storyStateAnterior) return [];
        const antes = storyStateAnterior.conquistas || [];
        return (storyState.conquistas || []).filter(c => !antes.includes(c));
    }

    return { calcular, COR, ROTULO };
})();
/* --systems/storyEngine.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · STORY ENGINE · Motor narrativo BitLife-style
   v5.0 — estilo mais preciso, gestor_de_crise calibrado,
           traumas no epílogo, flags com contexto.
═══════════════════════════════════════════════════════ */


const StoryEngine = (() => {

    /* ══════════════════════════════════════════════════
       1. AVALIAÇÃO DE FASE
    ══════════════════════════════════════════════════ */
    function avaliarFase(state) {
        const round   = state.currentRound;
        const vals    = Object.values(state.indicators);
        const media   = vals.reduce((a, b) => a + b, 0) / vals.length;
        const criticos = vals.filter(v => v <= 3).length;

        let fase;
        if (round <= 4) {
            fase = "fundacao";
        } else if (round <= 8) {
            fase = (criticos >= 2 || media <= 5) ? "crise" : "crescimento";
        } else if (round <= 11) {
            if (criticos >= 2 || media <= 5)    fase = "crise";
            else if (media >= 13)               fase = "consolidacao";
            else                                fase = "crescimento";
        } else {
            if (criticos >= 1 || media <= 5)    fase = "crise";
            else if (media >= 15)               fase = "expansao";
            else                                fase = "consolidacao";
        }

        if (state.storyState.faseEmpresa !== fase) BetaState.setFase(fase);
    }

    /* ══════════════════════════════════════════════════
       2. REGISTRO DE FLAGS (com motivo contextual)
    ══════════════════════════════════════════════════ */
    function registrarFlags(choice, state, avaliacao) {
        const { history, indicators, storyState } = state;

        // Liderança tóxica: 3 decisões RUINS com clima/rh negativo
        const ruinsClima = history.filter(h =>
            h.avaliacao === "ruim" &&
            (h.efeitos?.clima < 0 || h.efeitos?.rh < 0)
        );
        if (ruinsClima.length >= 3) {
            BetaState.addFlag("lideranca_toxica",
                `${ruinsClima.length} decisões ruins prejudicaram o time`);
            BetaState.addTrauma("Ambiente interno corroído por decisões que ignoraram as pessoas.");
        }

        // Ignorou segurança
        if (choice.effects?.seguranca < 0 || choice.effects?.seguranca_viaria < 0) {
            BetaState.addFlag("ignorou_seguranca", "Decisão que reduziu a segurança");
        }

        // Crescimento sem caixa: 3 decisões RUINS com financeiro negativo
        // (exclui investimentos estratégicos — só conta ruim com financeiro < 0)
        const ruinsFinanceiro = history.filter(h =>
            h.avaliacao === "ruim" && (h.efeitos?.financeiro ?? 0) < 0
        );
        if (ruinsFinanceiro.length >= 3) {
            BetaState.addFlag("crescimento_sem_caixa",
                `${ruinsFinanceiro.length} decisões ruins drenaram o caixa`);
        }

        // Demissão em massa: 2 decisões com impacto severo em RH
        const demissoes = history.filter(h =>
            (h.efeitos?.clima < -2 || h.efeitos?.rh < -2) &&
            (h.efeitos?.produtividade < 0 || h.efeitos?.processos < 0)
        );
        if (demissoes.length >= 2) {
            BetaState.addFlag("demissao_em_massa",
                "Ondas de corte comprometeram o capital humano");
            BetaState.addTrauma("Demissões em massa deixaram cicatrizes na cultura.");
        }

        // RH negligenciado: 5 rodadas sem nenhuma decisão boa com RH/clima
        const boasRH = history.filter(h =>
            h.avaliacao === "boa" && (h.efeitos?.clima > 0 || h.efeitos?.rh > 0)
        );
        if (history.length >= 5 && boasRH.length === 0) {
            BetaState.addFlag("rh_negligenciado",
                "Nenhuma decisão favoreceu o time nas últimas rodadas");
        }

        // Crescimento saudável: 5 consecutivas boas
        const ultimas5 = history.slice(-5);
        if (ultimas5.length === 5 && ultimas5.every(h => h.avaliacao === "boa")) {
            BetaState.addFlag("crescimento_saudavel");
            BetaState.addConquista("Sequência de 5 decisões excelentes.");
        }

        // Investiu em inovação: 3 efeitos positivos em inovação
        const inovacoes = history.filter(h => (h.efeitos?.inovacao ?? 0) > 0);
        if (inovacoes.length >= 3) {
            BetaState.addFlag("investiu_em_inovacao");
            BetaState.addConquista("Cultura de inovação estabelecida.");
        }

        // Gestor de crise: trauma anterior + maioria dos indicadores recuperados (>= n-2)
        const nInd = Object.keys(indicators).length;
        const recuperados = Object.values(indicators).filter(v => v >= 7).length;
        const traumasExistem = storyState.traumas.length > 0;
        if (traumasExistem && recuperados >= nInd - 2) {
            BetaState.addFlag("gestor_de_crise");
            BetaState.addConquista("Empresa recuperada de situação crítica.");
        }

        // Gestor esgotado (para narrativa)
        const { gestor } = state;
        if (gestor.esgotamento >= 7 && !storyState.flags.includes("gestor_esgotado")) {
            BetaState.addFlag("gestor_esgotado", "Esgotamento chegou a nível crítico");
            BetaState.addTrauma("O mandato começou a cobrar um preço pessoal alto.");
        }

        _atualizarReputacao(state);
        _registrarEstilo(choice, state);
    }

    /* ── Helper: reputação de mercado ─────────────────── */
    function _atualizarReputacao(state) {
        const { indicators, storyState } = state;
        const imgExterna   = indicators.reputacao ?? indicators.clientes ?? indicators.marca ?? 0;
        const saudeInterna = indicators.rh ?? indicators.clima ?? indicators.processos ?? 0;
        const financeiro   = indicators.financeiro ?? 0;

        const flagsNeg = ["lideranca_toxica", "demissao_em_massa", "ignorou_seguranca"];
        const temNeg   = flagsNeg.some(f => storyState.flags.includes(f));

        let novaRep;
        if (temNeg && (imgExterna <= 7 || financeiro <= 5))       novaRep = "toxica";
        else if (temNeg || imgExterna <= 8 || (financeiro <= 6 && saudeInterna <= 6)) novaRep = "instavel";
        else                                                        novaRep = "boa";

        if (storyState.reputacaoMercado !== novaRep) BetaState.setReputacao(novaRep);
    }

    /* ── Helper: estilo de gestão (mais preciso) ──────── */
    function _registrarEstilo(choice, state) {
        const efeitos = choice.effects || {};
        const vals    = Object.values(efeitos);
        const soma    = vals.reduce((a, b) => a + b, 0);
        const negCount = vals.filter(v => v < 0).length;
        const posCount = vals.filter(v => v > 0).length;

        let estilo;
        // Caótico: mais negativos que positivos e soma negativa
        if (negCount > posCount && soma < 0) {
            estilo = "caotico";
        }
        // Agressivo: soma alta (indica decisão de alto impacto nos dois sentidos
        // com saldo líquido positivo alto, ou decisões de grande risco/retorno)
        else if (soma >= 6 || (posCount >= 2 && soma >= 4)) {
            estilo = "agressivo";
        }
        else {
            estilo = "prudente";
        }

        BetaState.addEstiloGestao(estilo);
    }

    /* ══════════════════════════════════════════════════
       3. FILTRO DE CHOICES POR PRÉ-CONDIÇÕES
    ══════════════════════════════════════════════════ */
    function choicesDisponiveis(round, storyState, indicators) {
        return round.choices.filter(choice => {
            const req = choice.requisitos;
            if (!req) return true;

            if (req.faseEmpresa) {
                const fases = Array.isArray(req.faseEmpresa) ? req.faseEmpresa : [req.faseEmpresa];
                if (!fases.includes(storyState.faseEmpresa)) return false;
            }

            if (req.indicadorMinimo) {
                for (const [k, min] of Object.entries(req.indicadorMinimo)) {
                    if ((indicators[k] ?? 0) < min) return false;
                }
            }

            if (req.indicadorMaximo) {
                for (const [k, max] of Object.entries(req.indicadorMaximo)) {
                    if ((indicators[k] ?? 0) > max) return false;
                }
            }

            if (req.semFlags) {
                const bl = Array.isArray(req.semFlags) ? req.semFlags : [req.semFlags];
                if (bl.some(f => storyState.flags.includes(f))) return false;
            }

            if (req.comFlags) {
                const ob = Array.isArray(req.comFlags) ? req.comFlags : [req.comFlags];
                if (!ob.every(f => storyState.flags.includes(f))) return false;
            }

            return true;
        });
    }

    /* ══════════════════════════════════════════════════
       4. GERAÇÃO DE EPÍLOGO
    ══════════════════════════════════════════════════ */
    function gerarEpilogo(storyState, history, score, scoreGestor, gestor) {
        const { flags, estiloGestao, conquistas, traumas, faseEmpresa, reputacaoMercado } = storyState;

        const contagem = { agressivo: 0, prudente: 0, caotico: 0 };
        estiloGestao.forEach(e => contagem[e]++);
        const estiloDominante = Object.entries(contagem)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "prudente";

        const totalBoas  = history.filter(h => h.avaliacao === "boa").length;
        const totalRuins = history.filter(h => h.avaliacao === "ruim").length;

        const titulo    = _definirTitulo(flags, estiloDominante, score, faseEmpresa, reputacaoMercado, totalBoas, totalRuins, scoreGestor, gestor);
        const descricao = _construirDescricao(flags, conquistas, traumas, estiloDominante, score, faseEmpresa, reputacaoMercado, scoreGestor, gestor, totalBoas, totalRuins);

        return { titulo, descricao };
    }

    function _definirTitulo(flags, estilo, score, fase, reputacao, totalBoas, totalRuins, scoreGestor, gestor) {
        const sg     = scoreGestor ?? 50;
        const esg    = gestor?.esgotamento ?? 5;
        const capPol = gestor?.capitalPolitico ?? 5;

        // Mandato encerrado antecipadamente
        if (esg >= 9 && score >= 60)    return "😮‍💨 O Gestor que se Perdeu no Caminho";
        if (capPol <= 1 && score >= 55) return "🏛️ Bom para a Empresa, Fatal para o Mandato";

        // Negativos por flags
        if (flags.includes("lideranca_toxica") && flags.includes("demissao_em_massa"))
            return "😤 O Gestor do Caos";
        if (flags.includes("ignorou_seguranca") && reputacao === "toxica")
            return "⚠️ O Descuidado Operacional";
        if (flags.includes("crescimento_sem_caixa") && score < 45)
            return "📉 O Visionário Imprudente";
        if (totalRuins > totalBoas && score < 40)
            return "🌪️ O Capitão do Naufrágio";

        // Cruzamento empresa + gestor
        if (score >= 70 && sg >= 70)  return "🌟 O Gestor Completo";
        if (score >= 70 && sg < 45)   return "⚙️ Eficiente, mas a que Custo?";
        if (score < 45 && sg >= 70)   return "🧭 O Gestor que Sobreviveu ao Naufrágio";

        // Positivos por flags
        if (flags.includes("gestor_de_crise") && score >= 65)
            return "🔥 O Fênix da Gestão";
        if (flags.includes("crescimento_saudavel") && flags.includes("investiu_em_inovacao"))
            return "🚀 O Arquiteto do Futuro";
        if (score >= 80 && reputacao === "boa")
            return "🏆 O Arquiteto Sustentável";
        if (flags.includes("investiu_em_inovacao") && score >= 60)
            return "💡 O Inovador Consistente";

        // Por estilo
        if (estilo === "agressivo" && score >= 55) return "⚡ O Gestor de Alta Performance";
        if (estilo === "agressivo" && score < 55)  return "🎲 O Apostador Serial";
        if (estilo === "prudente"  && score >= 60) return "🧩 O Estrategista Cuidadoso";
        if (estilo === "prudente"  && score < 60)  return "🐢 O Gestor Conservador";
        if (estilo === "caotico")                  return "🌀 O Gestor Imprevisível";

        return "📋 O Gestor Pragmático";
    }

    function _construirDescricao(flags, conquistas, traumas, estilo, score, fase, reputacao, scoreGestor, gestor, totalBoas, totalRuins) {
        const partes = [];
        const sg  = scoreGestor ?? 50;
        const esg = gestor?.esgotamento ?? 5;
        const rep = gestor?.reputacaoInterna ?? 5;
        const cap = gestor?.capitalPolitico ?? 5;

        // Abertura
        if (score >= 75)      partes.push("A empresa atravessou o período com solidez e saiu fortalecida.");
        else if (score >= 50) partes.push("A empresa sobreviveu, mas carrega marcas das decisões ao longo do caminho.");
        else if (score >= 30) partes.push("A empresa chegou ao fim do período fragilizada, com muito a reconstruir.");
        else                  partes.push("A trajetória foi marcada por erros acumulados que comprometeram o futuro da empresa.");

        // Estilo de gestão
        const estiloTexto = {
            agressivo: "A liderança apostou alto e moveu rápido — às vezes rápido demais.",
            prudente:  "As decisões foram ponderadas, priorizando estabilidade sobre velocidade.",
            caotico:   "A gestão oscilou entre extremos, gerando incerteza em toda a organização.",
        };
        partes.push(estiloTexto[estilo] || "");

        // Traumas — agora aparecem no epílogo
        if (traumas.length > 0) {
            partes.push(`Momentos difíceis deixaram marca: ${traumas.join(" ")}`.trimEnd());
        }

        // Desfecho pessoal do gestor
        if (esg >= 8) {
            partes.push("O mandato cobrou um preço alto pessoalmente: o esgotamento acumulado deixou marcas que vão além do cargo.");
        } else if (esg <= 3) {
            partes.push("Notável: o gestor atravessou o período com energia preservada — sinal de gestão do próprio tempo tão importante quanto a da empresa.");
        }

        if (cap <= 2) {
            partes.push("A relação com o conselho e stakeholders se deteriorou ao longo do caminho — capital político que levou tempo para construir e foi rapidamente consumido.");
        } else if (cap >= 8) {
            partes.push("O capital político construído ao longo do mandato posiciona o gestor com credibilidade para os próximos capítulos.");
        }

        if (rep <= 3) {
            partes.push("Internamente, a equipe carrega cicatrizes da gestão — reputação que se reconstrói mais lentamente do que se destrói.");
        } else if (rep >= 8) {
            partes.push("A equipe interna reconhece a liderança com respeito genuíno — o ativo mais raro e mais valioso de qualquer gestor.");
        }

        // Cruzamento score empresa × gestor
        if (sg >= 75 && score >= 65) {
            partes.push("Resultado raro: empresa e gestor saíram fortalecidos. Esse alinhamento define uma liderança de referência.");
        } else if (sg < 40 && score >= 65) {
            partes.push("A empresa sobreviveu, mas o gestor pagou o preço — um desequilíbrio que as melhores lideranças aprendem a evitar.");
        } else if (sg >= 75 && score < 45) {
            partes.push("O gestor preservou sua posição, mas a empresa ficou para trás — vitória de mandato que poucos reconhecem como tal.");
        }

        // Placar decisório
        if (totalBoas > totalRuins * 2) {
            partes.push(`Decisório consistente: ${totalBoas} boas decisões contra apenas ${totalRuins} equivocadas.`);
        } else if (totalRuins > totalBoas) {
            partes.push(`O placar decisório foi desfavorável: ${totalRuins} decisões problemáticas superaram as ${totalBoas} acertadas.`);
        }

        // Flags negativas
        if (flags.includes("lideranca_toxica"))      partes.push("O ambiente interno foi corroído por decisões que priorizaram resultados acima das pessoas.");
        if (flags.includes("ignorou_seguranca"))     partes.push("Vulnerabilidades de segurança ignoradas criaram riscos que ainda assombram a empresa.");
        if (flags.includes("crescimento_sem_caixa")) partes.push("A ambição de crescer superou o controle financeiro — uma lição cara.");
        if (flags.includes("demissao_em_massa"))     partes.push("Ondas de demissão deixaram cicatrizes profundas na cultura organizacional.");

        // Flags positivas
        if (flags.includes("gestor_de_crise"))       partes.push("Em momentos críticos, a liderança mostrou capacidade de reversão.");
        if (flags.includes("investiu_em_inovacao"))  partes.push("O compromisso com inovação plantou sementes que beneficiarão a empresa nos próximos anos.");
        if (flags.includes("crescimento_saudavel"))  partes.push("Houve um período de excelência decisória que serve como referência para o futuro.");

        // Conquistas
        if (conquistas.length > 0) {
            partes.push(`Marcos conquistados: ${conquistas.join(" · ")}`);
        }

        // Fechamento reputação
        const repTexto = {
            boa:      "O mercado olha para a empresa com respeito.",
            instavel: "A reputação no mercado ainda é incerta — reconstruir confiança será o próximo desafio.",
            toxica:   "A imagem da empresa no mercado está comprometida. Recuperar credibilidade vai levar tempo.",
        };
        partes.push(repTexto[reputacao] || "");

        return partes.filter(Boolean).join(" ");
    }

    return { avaliarFase, registrarFlags, choicesDisponiveis, gerarEpilogo };

})();
/* --systems/protagonista.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · PROTAGONISTA · v5.0
   NPCs com memória acumulada e frases contextuais.
   Frases expandidas (8 pos / 8 neg) para reduzir repetição.
   Estado do gestor influencia as reações.
═══════════════════════════════════════════════════════ */

const Protagonista = (() => {

    const NPCS = {
        tecnologia: [
            { id: "cto",        nome: "Rafael (CTO)",          nivel: 6, sensivel: ["clima", "inovacao", "seguranca"] },
            { id: "investidor", nome: "Fundo Caravela",         nivel: 6, sensivel: ["financeiro", "reputacao"] },
            { id: "lider_eng",  nome: "Time de Engenharia",     nivel: 5, sensivel: ["clima", "produtividade"] },
        ],
        varejo: [
            { id: "gerente",    nome: "Cláudia (Ger. Geral)",   nivel: 6, sensivel: ["rh", "processos", "margem"] },
            { id: "franquia",   nome: "Rede de Parceiros",       nivel: 5, sensivel: ["clientes", "financeiro", "marca"] },
            { id: "digital_mgr",nome: "Bruno (E-commerce)",      nivel: 4, sensivel: ["digital", "clientes"] },
        ],
        logistica: [
            { id: "motoristas", nome: "Assoc. de Motoristas",   nivel: 6, sensivel: ["rh", "seguranca", "frota"] },
            { id: "clienteB2B", nome: "Magazine Atacado",        nivel: 7, sensivel: ["clientes", "sla", "processos"] },
            { id: "ti_ops",     nome: "Equipe de TI e Rotas",   nivel: 4, sensivel: ["tecnologia", "processos"] },
        ],
        industria: [
            { id: "engchefe",   nome: "Roberto (Eng. Chefe)",   nivel: 7, sensivel: ["processos", "manutencao", "qualidade"] },
            { id: "sindicato",  nome: "Sindicato Metalúrgico",  nivel: 5, sensivel: ["rh", "seguranca"] },
            { id: "qualidade",  nome: "Dra. Mara (Qualidade)",  nivel: 5, sensivel: ["qualidade", "conformidade"] },
        ],
    };

    // Frases expandidas — 8 variações por polaridade para reduzir repetição em 15 rodadas
    const FRASES_POS = [
        "Aprovou a decisão. Isso fortalece sua credibilidade com o time.",
        "Ficou satisfeito com a direção tomada. Seu mandato ganha respaldo.",
        "Reconheceu o movimento como positivo. A relação de confiança melhora.",
        "Demonstrou entusiasmo com o resultado. A equipe percebeu o impacto.",
        "Comentou positivamente em reunião. Sua liderança ganha mais defensores.",
        "Enviou mensagem de reconhecimento. Esses sinais importam na cultura.",
        "Expressou confiança na gestão. O time está observando e aprovando.",
        "Reforçou apoio publicamente. Capital político fortalecido nesta rodada.",
    ];
    const FRASES_NEG = [
        "Demonstrou insatisfação clara. A relação ficou tensa.",
        "Criticou a decisão em reunião fechada. O clima pesou.",
        "Questionou sua liderança internamente. O rumor se espalhou.",
        "Manifestou preocupação com os rumos. A pressão aumentou.",
        "Pediu reunião para discutir a decisão. Sinal de alerta.",
        "Expressou desconforto com a postura adotada. A confiança vacilou.",
        "Sinalizou insatisfação para outros stakeholders. A situação se complica.",
        "Registrou formalmente sua objeção. O capital político sofreu.",
    ];

    // Frases especiais quando gestor está esgotado ou com capital baixo
    const FRASES_PREOCUPACAO = [
        "Perguntou se você estava bem. O desgaste está visível para o time.",
        "Comentou nos bastidores que a gestão parece sobrecarregada.",
        "Sugeriu que você delegue mais. O esgotamento não passou despercebido.",
    ];

    function calcularReacao(efeitosEmpresa, sector, state) {
        const npcs = NPCS[sector] || [];
        if (!npcs.length) return null;

        // NPC mais impactado
        let maisAfetado  = null;
        let maiorImpacto = 0;

        npcs.forEach(npc => {
            const impacto = npc.sensivel.reduce(
                (a, k) => a + Math.abs(efeitosEmpresa[k] ?? 0), 0
            );
            if (impacto > maiorImpacto) { maiorImpacto = impacto; maisAfetado = npc; }
        });

        if (!maisAfetado || maiorImpacto === 0) return null;

        const saldo = maisAfetado.sensivel.reduce(
            (a, k) => a + (efeitosEmpresa[k] ?? 0), 0
        );

        // Verifica esgotamento visível
        const esgotamento = state?.gestor?.esgotamento ?? 0;
        if (esgotamento >= 7 && Math.random() < 0.35) {
            const frase = FRASES_PREOCUPACAO[Math.floor(Math.random() * FRASES_PREOCUPACAO.length)];
            return { nome: maisAfetado.nome, icone: "🟡", texto: frase };
        }

        const pool  = saldo >= 0 ? FRASES_POS : FRASES_NEG;
        const icone = saldo >= 0 ? "🟢" : "🔴";
        const texto = pool[Math.floor(Math.random() * pool.length)];

        return { nome: maisAfetado.nome, icone, texto };
    }

    function getNPCs(sector) { return NPCS[sector] || []; }

    return { calcularReacao, getNPCs };
})();
/* --empresas/tecnologia.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Tecnologia
   10 histórias de intro — 1 sorteada por jogo
═══════════════════════════════════════════════════════ */

const EmpresaTecnologia = {
    id:   "tecnologia",
    icon: "🚀",
    nome: "Startup de Tecnologia",
    desc: "SaaS · IA · Engenharia de Software",
    tag:  "tecnologia",
    dica: "Startups vivem de inovação e velocidade. Cuide do time — engenheiros insatisfeitos pedem demissão.",

    /* ── Array de intros (sorteado pelo engine) ─────── */
    intros: [

        /* ── 1 ─────────────────────────────────────── */
        {
            badge:     "Startup de Tecnologia · SaaS B2B",
            subtitulo: "Você acaba de assumir a gestão. O relógio já está correndo.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 4 anos num coworking em São Paulo, sua startup cresceu de 3 para 67 funcionários surfando a onda da transformação digital. Vocês desenvolvem uma plataforma SaaS de gestão para PMEs e já atingiram R$ 4,2 milhões em ARR. O NPS do produto é 71 — acima da média do mercado — e o pipeline comercial nunca esteve tão cheio."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O setor de SaaS B2B no Brasil cresceu 28% no último ano, mas a competição esquentou. Dois concorrentes bem financiados entraram no seu nicho com preços 20% abaixo dos seus. Os investidores da série A estão atentos: o próximo round depende dos resultados dos próximos dois trimestres."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A dívida técnica acumulada nos últimos 18 meses está travando a velocidade de entrega. A rotatividade no time de engenharia disparou: três sêniores pediram demissão no último mês, levando consigo conhecimento crítico do produto. O churn de clientes subiu de 2,1% para 3,8% mensais."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Equilibrar a pressão por crescimento rápido — que os investidores exigem — com a necessidade urgente de estabilizar o time e a plataforma. Cada decisão envolve um trade-off real: crescer rápido demais quebra o produto e o time; crescer devagar demais perde o mercado para os concorrentes."
                }
            ],
            alerta: { icone: "🚨", titulo: "Crise em Andamento" },
            rodape: "Você tem {totalRounds} rodadas para tomar decisões e conduzir a empresa ao resultado."
        }

    ] /* fim de intros[] — histórias 2-10 removidas para teste beta */
};
/* --empresas/varejo.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Varejo
═══════════════════════════════════════════════════════ */

const EmpresaVarejo = {
    id:   "varejo",
    icon: "🛒",
    nome: "Rede de Varejo",
    desc: "Lojas Físicas · E-commerce · Omnichannel",
    tag:  "varejo",
    dica: "Margens apertadas exigem giro rápido. Clientes satisfeitos garantem o retorno que sustenta a operação.",

    intros: [
        {
            badge:     "Rede de Varejo · Omnichannel",
            subtitulo: "Você assumiu a gestão. As lojas físicas sangram e o digital ainda não compensou.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 22 anos no interior de São Paulo, sua rede cresceu de 3 para 38 lojas físicas distribuídas em 12 cidades. Com R$ 180 milhões em receita anual e 820 funcionários, a empresa sempre foi referência regional em atendimento. O e-commerce foi lançado há 3 anos e hoje representa 14% das vendas — crescendo, mas insuficiente para compensar a deterioração das margens no físico."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O varejo regional enfrenta a maior pressão competitiva da história: marketplaces com entrega em 24h, discount stores e o crescimento acelerado do e-commerce dos grandes players. A margem bruta do setor caiu de 32% para 24% nos últimos 5 anos. Quem não se adaptar ao modelo omnichannel nos próximos 2 anos vai perder relevância permanentemente."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A margem operacional caiu de 8,3% para 5,1% em 18 meses. Seis lojas têm resultado negativo consistente. O estoque parado soma R$ 4,2 milhões. A rotatividade do time de vendas subiu para 47% ao ano — os melhores vendedores estão saindo para redes maiores ou para o setor de serviços."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Reestruturar a rede física sem destruir o que a torna especial — o atendimento personalizado — enquanto acelera a transformação digital e recupera as margens. Cada decisão envolve um trade-off real: fechar lojas deficitárias afeta comunidades e marca; manter custa caixa que poderia modernizar o restante."
                }
            ],
            alerta: { icone: "🚨", titulo: "Margem em Queda" },
            rodape: "Você tem {totalRounds} rodadas para tomar decisões e reconstruir a rentabilidade da rede."
        }
    ]
};
/* --empresas/logistica.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Logística
═══════════════════════════════════════════════════════ */

const EmpresaLogistica = {
    id:   "logistica",
    icon: "🚚",
    nome: "Operadora de Logística",
    desc: "Frota · TMS · Last-Mile Delivery",
    tag:  "logistica",
    dica: "Prazo é tudo. Atrasos destroem contratos. Processos operacionais eficientes são sua vantagem competitiva.",

    intros: [
        {
            badge:     "Operadora Logística · Last-Mile",
            subtitulo: "O SLA está quebrando. Seu maior cliente está de olho. O relógio corre.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 11 anos na Grande São Paulo, sua operadora de logística cresceu de uma frota de 12 veículos para 420 entregadores e 8 centros de distribuição. Com faturamento de R$ 52 milhões anuais, a empresa atende 38 clientes corporativos e processou 2,1 milhões de entregas no último ano. A reputação de confiabilidade foi construída ao longo de uma década de operação consistente."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O mercado de last-mile está sendo disputado por startups capitalizadas por VC com preços abaixo do custo para ganhar market share. Grandes e-commerces internacionalizaram suas operações e agora pressionam por SLA de 24h em centros urbanos. A tecnologia de roteirização por IA está redefinindo o custo por entrega — quem não investir vai perder competitividade rapidamente."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "31% das entregas estão fora do prazo de 48h — mais do que o dobro do benchmark setorial. O TMS está desatualizado, o estoque de manutenção da frota está em atraso e a rotatividade de entregadores atingiu 68% ao ano. Um cliente representa 38% da receita e tem cláusula de SLA no contrato."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Recuperar o nível de serviço sem aumentar o custo por entrega, diversificar a carteira de clientes para reduzir a dependência do cliente principal e modernizar a tecnologia de operação — tudo isso com uma equipe sob pressão e rotatividade crescente. Cada decisão precisa equilibrar o curto prazo operacional com a transformação estrutural necessária."
                }
            ],
            alerta: { icone: "🚨", titulo: "SLA em Descumprimento" },
            rodape: "Você tem {totalRounds} rodadas para recolocar a operação nos trilhos antes que os clientes percam a confiança."
        }
    ]
};
/* --empresas/industria.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · EMPRESA · Indústria
═══════════════════════════════════════════════════════ */

const EmpresaIndustria = {
    id:   "industria",
    icon: "🏭",
    nome: "Indústria Metalúrgica",
    desc: "Produção Pesada · ISO 9001 · Segurança",
    tag:  "industria",
    dica: "Segurança e conformidade não são custo — são pré-requisito. Uma parada de linha pode custar semanas.",

    intros: [
        {
            badge:     "Indústria Metalúrgica · Manufatura",
            subtitulo: "A fábrica tem 22 anos de história. E equipamentos quase tão velhos quanto ela.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada em 2003 no interior do estado, sua metalúrgica cresceu de uma pequena oficina de usinagem para uma planta de 8.400m² com 310 funcionários diretos. Com faturamento de R$ 68 milhões anuais, a empresa produz componentes estruturais e peças de precisão para o setor automotivo e de infraestrutura. A certificação ISO 9001 foi conquistada há 7 anos e é a âncora dos contratos mais importantes."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A indústria metalúrgica nacional enfrenta tripla pressão: custo de energia em alta histórica, matéria-prima importada sujeita à volatilidade cambial e concorrência crescente de fundições asiáticas com custo 30% menor. Ao mesmo tempo, clientes de grande porte estão exigindo certificações ESG e rastreabilidade total — requisitos que demandam investimento significativo em tecnologia e processos."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "O índice de frequência de acidentes está em 18,4 — o dobro do benchmark do setor. A certificação ISO 9001 está sob risco por não-conformidades identificadas em auditoria. A prensa hidráulica principal, responsável por 60% da produção, sofreu falha recente. E o engenheiro sênior que domina o conhecimento de manutenção quer se aposentar."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Modernizar a operação sem paralisar a produção que sustenta os contratos existentes. Cada real investido em segurança e automação é um real não investido em capacidade produtiva — e vice-versa. A empresa precisa decidir se vai competir por custo, por qualidade técnica ou por sustentabilidade. Os três ao mesmo tempo, sem capital suficiente, é caminho para a mediocridade em tudo."
                }
            ],
            alerta: { icone: "🚨", titulo: "Segurança e ISO em Risco" },
            rodape: "Você tem {totalRounds} rodadas para transformar a fábrica antes que os problemas acumulados se tornem irreversíveis."
        }
    ]
};
/* --rounds/tecnologia-rounds.js-- */
/* ═══════════════════════════════════════════════════════════════════
   BETA · TECNOLOGIA · ROUNDS EXCLUSIVOS — HISTÓRIA [0]
   Startup SaaS B2B · Dívida técnica, rotatividade e churn

   INDICADORES (8 — exclusivos do setor Tecnologia):
     financeiro    💰  Saúde do caixa / ARR / burn rate
     clima         🧑‍💻  Engajamento e moral do time
     satisfacao    ⭐  NPS / retenção / churn dos clientes
     qualidade     🛠️   Estabilidade / bugs / dívida técnica
     produtividade ⚡  Velocidade de entrega / output
     reputacao     📣  Imagem no mercado / percepção de marca
     inovacao      🔬  P&D / diferenciais / roadmap técnico
     seguranca     🔒  LGPD / vulnerabilidades / compliance

   FASES NARRATIVAS:
     R1–R5   → Diagnóstico: você descobre a extensão real da crise
     R6–R10  → Pressão: as consequências chegam de fora e de dentro
     R11–R15 → Decisão crítica: o futuro da empresa é definido
═══════════════════════════════════════════════════════════════════ */

const TecnologiaRounds = [

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [0] · SaaS B2B — Dívida técnica, rotatividade e churn
   Contexto: startup de 67 pessoas, ARR R$4,2M, NPS 71 em queda,
   3 sêniores saíram em 30 dias, churn subindo de 2,1% para 3,8%,
   concorrentes entraram com preço 20% menor.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Crash de Segunda-Feira
     Contexto: primeiro dia útil após assumir a gestão.
     A plataforma cai às 9h — o pior horário possível.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Crash de Segunda-Feira",
    description: "Seu primeiro dia como gestor responsável. Às 9h07, o sistema de monitoramento dispara: a plataforma está fora do ar. Duzentos e trinta clientes não conseguem acessar. O canal de suporte explode com mensagens. O CTO Pedro chega correndo: 'É o módulo de autenticação — o mesmo que está na nossa lista de dívida técnica há 14 meses. Estimamos 3 a 5 horas para restaurar.' Qual é a sua primeira decisão?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Comunicar proativamente todos os clientes afetados com previsão de retorno e atualizações a cada 30 minutos",
        risco: "baixo",
        effects: { satisfacao: +4, reputacao: +3, clima: +2, qualidade: -1 },
        avaliacao: "boa",
        ensinamento: "Comunicação transparente durante incidentes transforma uma crise técnica em prova de maturidade operacional. Clientes que recebem atualizações frequentes cancelam 60% menos do que os que ficam no silêncio. A percepção de cuidado vale mais que a perfeição técnica."
      },
      {
        text: "Focar 100% do time na resolução técnica sem comunicar clientes — só falar quando estiver resolvido",
        risco: "medio",
        effects: { qualidade: +3, satisfacao: -5, reputacao: -3, clima: +1 },
        avaliacao: "ruim",
        ensinamento: "Silêncio durante crises amplifica a percepção negativa. Clientes tentando acessar sem explicação imaginam o pior — e o próximo passo é cancelar. Resolver o técnico sem gerenciar a percepção é metade de uma resposta a um incidente."
      },
      {
        text: "Escalar o incidente para o conselho de investidores e pedir orientação antes de agir",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2, esgotamento: +1 },
        effects: { satisfacao: -3, reputacao: -2, clima: -3, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Escalada prematura ao conselho antes de ter dados e plano sinaliza despreparo ao time e desgasta credibilidade com os investidores. A decisão operacional de um incidente precisa acontecer em minutos, não em horas de governança."
      },
      {
        text: "Acionar simultaneamente o time técnico para resolução e o CS para comunicação segmentada, priorizando os maiores clientes",
        risco: "baixo",
        effects: { satisfacao: +5, reputacao: +4, clima: +3, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Paralelizar resolução técnica com comunicação comercial é a resposta de empresas maduras a incidentes. Priorizar os maiores clientes no atendimento reduz risco de churn imediato e demonstra que a empresa conhece o valor de cada relacionamento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Dev que Sabe Demais
     Contexto: 4 dias após o crash. O time ainda está abalado.
     O único engenheiro que domina o módulo crítico quer sair.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Dev que Sabe Demais",
    description: "André, o único engenheiro que conhece profundamente o módulo de pagamentos — responsável por 38% do ARR — bate à sua porta: 'Preciso de 3 semanas de férias. Estou esgotado desde o crash.' Você consulta o Pedro: 'Se André sair agora, qualquer problema nesse módulo vai nos parar por dias. Ele nunca documentou nada.' Você tem 24 horas para responder a André.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aprovar as férias integrais — negar seria injusto e pioraria o clima geral do time",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: 0 },
        effects: { clima: +3, produtividade: -4, qualidade: -3, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Aprovar férias sem transferência de conhecimento em módulo crítico é aceitar um risco operacional desnecessário. Cuidar do colaborador e proteger a operação não são excludentes — mas exigem negociação inteligente, não apenas aprovação ou negação."
      },
      {
        text: "Negar as férias até que o módulo esteja documentado — a empresa precisa estar segura primeiro",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2, esgotamento: +1 },
        effects: { clima: -5, produtividade: -2, qualidade: +2, satisfacao: +1 },
        avaliacao: "ruim",
        ensinamento: "Negar férias sem contrapartida gera ressentimento profundo e frequentemente acelera o pedido de demissão. Impor trabalho sem reconhecer o esgotamento cria o risco que você tentou evitar — agora com raiva adicionada à equação."
      },
      {
        text: "Negociar: André tira 1 semana agora e, ao retornar, vocês estruturam um plano de documentação de 2 semanas com dedicação exclusiva",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { clima: +5, qualidade: +3, produtividade: +2, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Negociação que respeita o colaborador e a operação é o caminho mais sustentável. Uma semana de descanso reduz o risco de demissão iminente. A documentação estruturada ao retorno transforma conhecimento tácito em ativo da empresa — não mais refém de uma pessoa."
      },
      {
        text: "Aprovar as férias e contratar imediatamente um dev sênior externo para cobrir o módulo durante a ausência",
        effects: { financeiro: -5, clima: +2, produtividade: -1, qualidade: -2 },
        avaliacao: "media",
        ensinamento: "Cobertura externa é válida como contingência, mas perigosa para módulos críticos não documentados. O custo é alto e o tempo de onboarding em código legado complexo pode superar as 3 semanas de ausência. A solução real é a documentação — não a substituição."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · Produto vs. Engenharia
     Contexto: 2ª semana. O conflito estrutural vem à tona.
     Roadmap travado entre novas features e dívida técnica.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reunião que Virou uma Briga",
    description: "Reunião de planejamento quinzenal. Juliana, head de Produto, apresenta um roadmap com 11 novas features para os próximos 60 dias. Pedro interrompe: 'Impossível. Com a dívida técnica atual, cada nova feature vai demorar 3× mais e vai criar 2× mais bugs. Precisamos de pelo menos 6 semanas só para estabilizar.' Juliana rebate: 'Enquanto isso, o concorrente vai lançar 4 features e a gente vai perder mais deals.' A reunião para. Todo mundo olha para você.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Dar razão ao Pedro: bloquear todas as features por 6 semanas e focar 100% na estabilização técnica",
        effects: { qualidade: +6, produtividade: +2, satisfacao: -4, reputacao: -2, clima: +1 },
        avaliacao: "media",
        ensinamento: "Priorizar a saúde técnica é estrategicamente correto, mas bloquear totalmente o roadmap por 6 semanas cria pressão comercial real e sinaliza ao mercado que a empresa parou. A decisão certa é calibrar o ritmo, não paralisar completamente."
      },
      {
        text: "Apoiar Juliana: lançar as features no prazo e endereçar a dívida técnica em paralelo como puder",
        effects: { satisfacao: +3, qualidade: -5, produtividade: -3, clima: -2, reputacao: +1 },
        avaliacao: "ruim",
        ensinamento: "Ignorar o alerta do CTO para agradar o roadmap comercial é a receita clássica para colapso técnico. Cada feature nova sobre código degradado multiplica a dívida. O time sabe que está construindo em areia e a motivação cai junto com a qualidade."
      },
      {
        text: "Propor um modelo 70/30: 70% da capacidade do time para estabilização técnica, 30% para as 3 features de maior impacto comercial identificadas pelo Produto",
        effects: { qualidade: +4, satisfacao: +2, produtividade: +3, clima: +4, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "O modelo 70/30 entre dívida técnica e features novas é uma das práticas mais eficazes em engenharia de produto. Ele honra os dois problemas sem paralisar nenhum. E mais importante: demonstra ao time que a liderança tomou uma decisão, não evitou o conflito."
      },
      {
        text: "Encerrar a reunião sem decisão e marcar sessões separadas com Pedro e Juliana para entender melhor os números antes de decidir",
        effects: { clima: -3, produtividade: -2, satisfacao: -1, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Adiar decisões estratégicas em reuniões onde o time espera liderança corroe a autoridade do gestor. O time interpreta a ausência de decisão como falta de preparo ou coragem. Dados podem ser levantados — mas a postura de quem decide também é um dado que o time avalia."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Dashboard de Churn
     Contexto: fim da 2ª semana. Dados de cancelamento chegam.
     O CS mapeia os motivos com precisão cirúrgica.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Dashboard de Churn",
    description: "Marina, head de Customer Success, apresenta o relatório da semana: 31 clientes cancelaram em 7 dias — o maior número em 18 meses. Ela traz os motivos mapeados: 68% citam lentidão e instabilidade da plataforma; 19% citam que o concorrente ofereceu preço menor; 13% citam atendimento demorado. 'Temos um problema técnico que está gerando um problema comercial,' ela conclui. 'E se não agirmos em 30 dias, vamos perder mais 80 clientes.' Como você responde?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Criar força-tarefa técnica dedicada exclusivamente aos gargalos que mais causam lentidão para os clientes em risco de churn",
        effects: { qualidade: +5, satisfacao: +4, produtividade: -2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Atacar a causa-raiz do churn — o problema técnico — com foco nos clientes mais vulneráveis é a decisão com maior retorno sobre investimento. Cada cliente retido custa 5-7× menos do que adquirir um novo. A força-tarefa cria urgência estruturada, não caos."
      },
      {
        text: "Lançar uma campanha agressiva de aquisição de novos clientes para compensar as perdas",
        effects: { financeiro: -4, satisfacao: -3, reputacao: -2, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Adquirir clientes para compensar churn é matematicamente insustentável: o CAC é 5-7× maior que o custo de retenção, e os novos clientes chegam para a mesma plataforma instável — acelerando o próximo ciclo de cancelamentos com mais pessoas no funil."
      },
      {
        text: "Contratar 3 gerentes de CS adicionais para atendimento personalizado e reduzir o tempo de resposta",
        effects: { financeiro: -4, satisfacao: +3, clima: +1, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "CS adicional resolve o sintoma de atendimento lento (13% dos motivos), mas não toca o problema principal (68% — instabilidade técnica). É um investimento de baixo retorno quando a causa-raiz domina o motivo do churn."
      },
      {
        text: "Ligar pessoalmente para os 10 clientes de maior receita em risco e entender o que os faria ficar",
        effects: { satisfacao: +5, reputacao: +3, clima: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Contato direto da liderança com clientes estratégicos em risco demonstra comprometimento difícil de ignorar. A maioria dos clientes não quer apenas resolver o problema técnico — quer saber que a empresa se importa com eles. Essa ligação frequentemente compra as semanas necessárias para a correção técnica."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · Os Quatro que Querem Sair
     Contexto: 3ª semana. O sinal mais grave chega do time.
     Um dev sênior traz um alerta que ninguém quer ouvir.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Os Quatro que Querem Sair",
    description: "Gabriel, um dos seus engenheiros mais antigos, pede uma conversa reservada. Ele é direto: 'Não vim pedir demissão — vim te avisar que quatro colegas estão olhando para fora. Dois já têm entrevistas marcadas. O problema não é salário. É que estamos mantendo um sistema que regride e não há sinal de que vai mudar.' Você tem a informação antes que se torne uma crise pública. O que você faz com ela?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Agradecer a Gabriel pela honestidade, convocá-lo como aliado e co-criar com ele um plano de melhoria técnica que você vai apresentar ao time esta semana",
        effects: { clima: +6, inovacao: +3, qualidade: +3, produtividade: +2, reputacao: +1 },
        avaliacao: "boa",
        ensinamento: "Transformar quem traz o problema em parte da solução é uma das estratégias mais poderosas de retenção técnica. Gabriel assumiu um risco pessoal ao te avisar — honrar esse risco com protagonismo real cria fidelidade genuína. E o plano co-criado tem mais chances de adesão do time."
      },
      {
        text: "Anunciar aumento salarial de 20% para todos os engenheiros sêniores ainda esta semana",
        effects: { financeiro: -6, clima: +3, produtividade: +1, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "Salário resolve o problema quando o motivo é salário. Aqui, Gabriel foi explícito: o problema é técnico. Aumento imediato pode reter temporariamente, mas as pessoas que pensam em sair por razões não financeiras vão continuar olhando para fora — agora com mais dinheiro no bolso enquanto procuram."
      },
      {
        text: "Conversar individualmente com cada um dos quatro devs antes que tomem uma decisão",
        effects: { clima: +4, produtividade: +1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Conversas individuais identificam motivações específicas e demonstram que a liderança se importa com cada pessoa. O risco é não resolver o problema sistêmico — mas o gesto de escuta individual frequentemente abre espaço para negociação que um anúncio coletivo não consegue."
      },
      {
        text: "Não revelar que sabe da situação e aguardar os pedidos de demissão formais antes de agir",
        effects: { clima: -5, produtividade: -3, qualidade: -2, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Ignorar um alerta antecipado é desperdiçar a única janela de intervenção antes da crise. Quando os pedidos chegarem formalmente, a narrativa já estará construída, outros colegas já terão ouvido os motivos, e a liderança terá perdido credibilidade por não ter agido quando podia."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Recrutador da Concorrência
     Contexto: 4ª semana. A pressão vem de fora.
     A startup concorrente recruta ativamente seu time.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Recrutador da Concorrência",
    description: "Um recrutador da startup concorrente entrou em contato com seis engenheiros do seu time pelo LinkedIn — incluindo Pedro, seu CTO. As mensagens foram encaminhadas para você por dois deles. A proposta tem salário 35% maior e bônus de assinatura. O timing é cirúrgico: acontece exatamente na semana em que seu time está mais fragilizado. Pedro menciona casualmente que 'a mensagem chegou para ele também.'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Criar imediatamente um programa de retenção com stock options escalonados para os 10 talentos mais críticos do time técnico",
        effects: { clima: +5, financeiro: -3, produtividade: +3, inovacao: +2, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Stock options criam alinhamento de longo prazo que salário não consegue replicar. Um programa estruturado — não reativo — demonstra que a empresa pensa no futuro dos seus talentos. Para engenheiros sêniores, a participação no crescimento da empresa frequentemente supera qualquer bônus de curto prazo."
      },
      {
        text: "Convocar reunião de time e ser transparente: 'Eu sei que o concorrente está recrutando. Vou falar sobre os nossos planos.'",
        effects: { clima: +6, reputacao: +2, produtividade: +2, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Transparência proativa sobre uma ameaça conhecida desmonta a narrativa do concorrente antes que ela se consolide. A reunião transforma um problema de bastidores em diálogo aberto — e o time avalia: líderes que falam a verdade antes de serem forçados a isso constroem confiança real."
      },
      {
        text: "Ignorar formalmente — interferir nas escolhas de carreira do time seria invasivo e vai piorar o clima",
        effects: { clima: -4, produtividade: -2, inovacao: -2, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "A omissão numa crise de retenção é lida pelo time como indiferença. Se a liderança não age quando o concorrente recruta ativamente, o time interpreta como permissão ou como sinal de que a empresa não luta pelos seus talentos. A inação aqui não é neutra — é uma mensagem."
      },
      {
        text: "Conversar privadamente apenas com Pedro para garantir que o CTO está retido antes de qualquer outra ação",
        effects: { clima: +2, produtividade: +1, qualidade: +2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "Reter o CTO é urgente e correto — mas fazer isso privadamente enquanto o restante do time percebe o problema gera ressentimento. Os outros cinco engenheiros sabem que foram contatados. A ausência de uma resposta visível da liderança para o grupo alimenta a sensação de que apenas os 'importantes' são valorizados."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · A Falha de Segurança
     Contexto: 5ª semana. Chega o alerta mais crítico até agora.
     Uma vulnerabilidade real, com janela de 24 horas para decidir.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Falha de Segurança",
    description: "Um pesquisador de segurança independente envia um e-mail direto para você — não para o suporte: 'Encontrei uma vulnerabilidade de injeção SQL no endpoint de relatórios da sua API. Dados de aproximadamente 4.200 clientes podem ter sido expostos nos últimos 21 dias. Tenho as evidências. Dou 24 horas para uma resposta antes de publicar no meu blog.' Pedro confirma: a falha é real. O time de segurança estima 6 a 8 horas para corrigir completamente.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Responder ao pesquisador imediatamente agradecendo, pedir 72 horas para correção completa e comunicar os clientes afetados em paralelo com transparência total",
        effects: { seguranca: +5, reputacao: +3, satisfacao: +4, financeiro: -2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "O programa de responsible disclosure existe exatamente para esse cenário. Agradecer pesquisadores de segurança que reportam vulnerabilidades — em vez de tratá-los como ameaças — cria uma relação que pode proteger a empresa no futuro. Clientes que recebem comunicação proativa sobre incidentes de segurança têm taxa de churn 40% menor do que os que descobrem pela imprensa."
      },
      {
        text: "Corrigir a vulnerabilidade nas próximas 6 horas sem comunicar clientes — só agir publicamente se o pesquisador publicar mesmo assim",
        effects: { seguranca: +3, satisfacao: -4, reputacao: -4, qualidade: +3 },
        avaliacao: "ruim",
        ensinamento: "Tratar a comunicação como condicional à publicação externa é uma aposta arriscada com probabilidade quase nula de sucesso. Quando a falha for publicada — e será — a omissão intencional será o maior dano. A LGPD exige notificação à ANPD em até 2 dias úteis após a ciência do incidente."
      },
      {
        text: "Consultar o jurídico antes de qualquer comunicação para entender as implicações legais da LGPD antes de agir",
        effects: { seguranca: +2, satisfacao: -3, reputacao: -2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "O jurídico precisa estar no loop, mas não pode ser a primeira etapa quando há 24 horas de prazo e dados expostos. Cada hora de atraso amplia a janela de exposição dos dados dos clientes. A sequência correta é: corrigir tecnicamente + comunicar clientes + notificar ANPD + alinhar com jurídico em paralelo."
      },
      {
        text: "Contratar imediatamente uma empresa especializada em resposta a incidentes de segurança para gerenciar o processo completo",
        effects: { seguranca: +4, reputacao: +4, satisfacao: +3, financeiro: -5, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Especialistas em resposta a incidentes (DFIR) têm playbooks testados para esse cenário exato. O custo financeiro é real, mas o protocolo correto — com linguagem técnica e jurídica precisa, comunicação adequada à ANPD e análise pós-incidente estruturada — reduz significativamente o risco de multa e de perda de clientes enterprise."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Contrato que Muda Tudo
     Contexto: 6ª semana. Uma oportunidade enorme aparece.
     Mas o timing é o pior possível.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Contrato que Muda Tudo",
    description: "Beatriz, sua head comercial, chega eufórica: 'A rede Mercato Varejo quer assinar um contrato de R$ 900 mil anuais — nosso maior deal em toda a história. Mas eles exigem 3 customizações profundas na plataforma entregues em 90 dias e um SLA de 99,9% de uptime garantido por contrato.' Pedro é categórico: 'Com a plataforma nesse estado, 99,9% de uptime é impossível. E as customizações levam no mínimo 120 dias com qualidade. Se prometemos e não entregamos, vira processo.' O prazo para responder ao Mercato é amanhã.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aceitar o contrato com as condições exatas — uma receita de R$ 900K justifica o risco e vai financiar a melhoria técnica",
        effects: { financeiro: +5, qualidade: -5, produtividade: -4, clima: -3, seguranca: -2 },
        avaliacao: "ruim",
        ensinamento: "Assinar um contrato com SLA que a tecnologia atual não suporta é vender algo que você não tem. Quando o uptime não for atingido — e não vai ser — as multas contratuais, o desgaste jurídico e o dano reputacional superam em muito a receita do deal. Comprometer o time com prazos impossíveis cria a próxima onda de burnout."
      },
      {
        text: "Negociar: aceitar o contrato com SLA de 99,5% e prazo de 120 dias para as customizações, sendo transparente sobre as limitações atuais",
        effects: { financeiro: +4, reputacao: +4, satisfacao: +3, clima: +2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar condições reais com transparência é o que separa empresas que crescem de empresas que implodem em clients enterprise. O Mercato está comprando uma solução, não um número de SLA — e clientes sofisticados reconhecem e respeitam vendedores que não prometem o impossível."
      },
      {
        text: "Recusar o negócio e comunicar ao Mercato que a empresa não está em condições técnicas de atender às exigências no momento",
        effects: { reputacao: +2, qualidade: +2, clima: +2, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Recusar um negócio honestamente é uma decisão corajosa e estrategicamente defensável. Preserva a integridade da empresa e evita um contrato destrutivo. O risco é perder uma janela de mercado que pode não voltar — mas a honestidade com o Mercato agora pode abrir a porta para uma relação futura mais sólida."
      },
      {
        text: "Aceitar o negócio e colocar toda a empresa em modo de guerra pelos próximos 90 dias para entregar o que foi prometido",
        requisitos: { semFlags: ["lideranca_toxica"] },
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +2 },
        effects: { financeiro: +3, clima: -6, produtividade: -3, qualidade: -2, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Modo de guerra com um time já fragilizado é a receita para o colapso humano que você estava tentando evitar. O resultado mais provável é: entregas parciais, SLA não cumprido, multa contratual, e perda dos melhores engenheiros no processo — que usarão o burnout do Mercato como gatilho definitivo para sair."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Ultimato dos Investidores
     Contexto: 7ª semana. A pressão financeira chega formalmente.
     Os investidores da Série A estabelecem condição para a Série B.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Ultimato dos Investidores",
    description: "Você recebe um memo formal dos investidores da Série A: 'Monitoramos os números de churn com preocupação crescente. Nossa condição para participar da Série B é clara: o churn mensal precisa cair para abaixo de 2,5% em 60 dias. Se não, não renovamos nossa posição e indicaremos ao conselho a contratação de um CEO profissional.' É a primeira vez que a palavra 'substituição' aparece num documento formal. Pedro e Beatriz estão com você. Como você responde?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Responder com um plano estruturado de 60 dias com metas específicas por semana, mostrando exatamente como o churn vai cair para 2,5%",
        effects: { reputacao: +4, satisfacao: +2, clima: +3, financeiro: +2, produtividade: +2 },
        avaliacao: "boa",
        ensinamento: "Investidores que estabelecem condições querem evidências de que o gestor entende o problema e tem um plano realista. Um plano estruturado com indicadores semanais transforma uma ameaça em contrato implícito de confiança. A especificidade do plano comunica competência; a honestidade sobre os riscos comunica maturidade."
      },
      {
        text: "Solicitar reunião urgente com os investidores para apresentar pessoalmente o estado atual e negociar os termos do ultimato",
        effects: { reputacao: +3, clima: +2, financeiro: +1, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Reuniões presenciais com investidores em crise criam contexto que e-mails e memos não conseguem. A linguagem corporal, a profundidade das respostas e a capacidade de responder em tempo real constroem ou destroem credibilidade. Negociar os termos em pessoa é mais eficaz do que aceitar ou rejeitar por escrito."
      },
      {
        text: "Aceitar integralmente o ultimato e comunicar ao time que todos os projetos não-churn são cancelados pelos próximos 60 dias",
        requisitos: { comFlags: ["crescimento_sem_caixa"] },
        effects: { satisfacao: +2, clima: -5, inovacao: -3, produtividade: -2, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Cancelar todos os projetos por pressão de investidores sinaliza ao time que as decisões da empresa são ditadas de fora — não pela liderança interna. O clima despenca, os melhores engenheiros (que têm opções) começam a sair, e o foco obcecado no churn sem endereçar a causa-raiz produz ações paliativas de baixo impacto."
      },
      {
        text: "Contratar uma consultoria de crescimento para montar um plano de retenção que impressione os investidores",
        effects: { financeiro: -4, reputacao: -1, satisfacao: +1, clima: -2 },
        avaliacao: "ruim",
        ensinamento: "Terceirizar a resposta a um ultimato estratégico passa aos investidores a mensagem de que o CEO não tem convicção própria sobre o caminho. Consultoria pode complementar, mas o plano precisa sair da liderança da empresa — ou a crise de confiança se aprofunda."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO · O Pivot para IA
     Contexto: 8ª semana. Uma proposta radical divide a liderança.
     Um dos sócios fundadores quer mudar tudo.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pivot para IA",
    description: "Rafael, cofundador e diretor técnico sênior, apresenta em reunião de diretoria: 'Vamos perder para os concorrentes se continuarmos nesse produto. Minha proposta é pivotarmos para IA generativa nos próximos 6 meses — abandonar a plataforma atual e desenvolver um produto completamente novo. Tenho 3 clientes enterprise que já disseram que pagariam por isso.' Pedro é contra: 'Nossa equipe não tem expertise em IA. Vai precisar de contratações massivas que não temos dinheiro para fazer.' Beatriz concorda com Rafael. Você precisa decidir.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Rejeitar o pivot completo, mas criar um laboratório de IA interno com 2 engenheiros dedicados para explorar aplicações incrementais no produto atual",
        effects: { inovacao: +4, clima: +3, financeiro: -2, qualidade: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "A versão inteligente de um pivot é a exploração estruturada: proteger o negócio atual enquanto investe em aprender o território novo. Um laboratório interno constrói expertise sem o risco de abandonar a receita existente. Os 3 clientes de Rafael podem financiar um piloto sem exigir abandono do core."
      },
      {
        text: "Apoiar o pivot completo — Rafael tem visão de produto e 3 clientes interessados é sinal de mercado suficiente",
        effects: { inovacao: +5, financeiro: -6, produtividade: -5, satisfacao: -4, clima: -3 },
        avaliacao: "ruim",
        ensinamento: "Pivots radicais com caixa pressionado, time fragilizado e produto principal gerando churn são apostas de sobrevivência — não de crescimento. Três clientes interessados é sinal de demanda, não de produto validado. O risco de ficar sem receita durante o pivot, com os custos de novo desenvolvimento, é existencial."
      },
      {
        text: "Propor um piloto de 90 dias: desenvolver um produto mínimo de IA para os 3 clientes de Rafael sem tocar no produto atual, e avaliar os resultados antes de decidir sobre o pivot",
        effects: { inovacao: +5, financeiro: -3, produtividade: -2, reputacao: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "O piloto estruturado é a abordagem de menor risco para testar uma hipótese de pivot. Noventa dias com 3 clientes pagantes (mesmo a preço reduzido) gera dados reais sobre viabilidade, esforço e product-market fit antes de qualquer comprometimento definitivo de recursos."
      },
      {
        text: "Solicitar análise financeira completa de quanto tempo de runway a empresa tem para executar um pivot antes de decidir qualquer coisa",
        effects: { financeiro: +2, clima: -2, inovacao: -1, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "Entender o runway é essencial, mas solicitá-lo como resposta à reunião — sem uma posição clara sobre a direção — atrasa uma decisão que o time espera. Dados financeiros devem ser levantados em paralelo, não como pré-requisito para ter uma posição estratégica."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · A Oferta de Aquisição
     Contexto: 9ª semana. Uma empresa americana entra em cena.
     Decisão com impacto permanente no futuro da empresa.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Oferta de Aquisição",
    description: "Um email chega diretamente para você — enviado pelo CEO da TechBridge, uma empresa americana de software com presença em 14 países: 'Temos acompanhado o crescimento de vocês no mercado brasileiro de SaaS B2B. Gostaríamos de propor uma conversa sobre aquisição. Nossa oferta indicativa é de R$ 28 milhões por 100% da empresa.' O múltiplo é de 6,7× o ARR atual — acima da média do mercado. Rafael quer aceitar imediatamente. Pedro quer rejeitar. Os investidores querem discutir.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Entrar nas conversas de due diligence com a TechBridge sem compromisso, para entender a oferta real antes de qualquer decisão",
        effects: { financeiro: +3, reputacao: +2, clima: -2, inovacao: -1 },
        avaliacao: "boa",
        ensinamento: "Due diligence sem compromisso é a postura correta para uma oferta indicativa — que quase nunca reflete o valor final. O processo revela o real interesse do comprador, a qualidade da proposta e eventuais cláusulas restritivas antes que você assuma qualquer posição pública. Não entrar nas conversas é deixar dinheiro e informação na mesa."
      },
      {
        text: "Rejeitar formalmente a oferta — vender agora, numa fase de crise, seria vender pelo preço errado e pelo motivo errado",
        effects: { clima: +3, inovacao: +2, produtividade: +2, financeiro: -1, reputacao: +1 },
        avaliacao: "media",
        ensinamento: "Rejeitar durante uma crise pode ser a decisão certa se o fundador tem convicção de que o valor futuro supera o múltiplo atual. Mas rejeitá-la sem due diligence priva a liderança de dados valiosos sobre como o mercado avalia a empresa — e pode fechar uma janela que não volta."
      },
      {
        text: "Aceitar a oferta imediatamente — R$ 28 milhões é um resultado excelente dado o estado atual da empresa",
        requisitos: { faseEmpresa: ["crise"], indicadorMaximo: { financeiro: 9 } },
        risco: "alto",
        gestorEffects: { capitalPolitico: +3, reputacaoInterna: -2 },
        effects: { financeiro: +8, clima: -5, inovacao: -4, produtividade: -4, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Aceitar uma oferta indicativa sem due diligence é vender antes de saber o que você tem. Indicativas raramente se transformam em contratos no mesmo valor — e a pressa em aceitar sinaliza desespero que o comprador vai usar para renegociar para baixo. O time que descobre a venda por e-mail entra em colapso de moral."
      },
      {
        text: "Contratar um banco de investimento especializado em M&A para gerenciar o processo e criar um leilão competitivo com outros interessados",
        requisitos: { indicadorMinimo: { financeiro: 8 }, semFlags: ["crescimento_sem_caixa"] },
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +5, reputacao: +4, clima: -1, inovacao: +1, satisfacao: +1 },
        avaliacao: "boa",
        ensinamento: "Um processo de M&A competitivo conduzido por especialistas aumenta o valor final da transação em média 20-35% em relação a negociações bilaterais diretas. O banco cria urgência competitiva, protege os fundadores das assimetrias jurídicas do processo e libera o CEO para continuar gerindo a empresa durante as negociações."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Investigação da ANPD
     Contexto: 10ª semana. A falha de segurança tem consequências.
     A regulação chega com peso institucional.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Investigação da ANPD",
    description: "A Autoridade Nacional de Proteção de Dados abre formalmente um processo administrativo referente ao incidente de segurança de três semanas atrás. O prazo para apresentar a defesa é de 15 dias úteis. Ao mesmo tempo, dois clientes enterprise recebem o aviso da ANPD diretamente e enviam notificações de rescisão contratual. O jurídico estima que a multa pode variar entre R$ 180 mil e R$ 1,2 milhão dependendo da qualidade da resposta apresentada. Pedro apresenta um plano técnico de adequação que custaria R$ 220 mil e levaria 8 semanas.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Investir imediatamente no plano técnico de Pedro e apresentar à ANPD um programa completo de adequação com cronograma detalhado e DPO nomeado",
        effects: { seguranca: +6, reputacao: +4, satisfacao: +3, financeiro: -4, qualidade: +3 },
        avaliacao: "boa",
        ensinamento: "A ANPD avalia a boa-fé e a qualidade do programa de adequação ao determinar o valor das multas. Empresas que apresentam planos estruturados com DPO nomeado, cronograma de implementação e evidências de comprometimento recebem penalidades significativamente menores do que as que respondem defensivamente. O investimento de R$ 220K pode economizar R$ 1M em multa."
      },
      {
        text: "Focar na defesa jurídica para minimizar a multa sem investir no plano técnico — o processo pode durar anos",
        requisitos: { comFlags: ["ignorou_seguranca"] },
        effects: { financeiro: -2, seguranca: -2, reputacao: -4, satisfacao: -3 },
        avaliacao: "ruim",
        ensinamento: "Uma estratégia puramente defensiva sem evidências de adequação técnica raramente reduz multas da ANPD — e constrói um histórico regulatório negativo que complica futuras captações, contratos enterprise e auditorias de due diligence. A defesa jurídica precisa ser acompanhada de adequação real."
      },
      {
        text: "Negociar acordo de conformidade voluntária com a ANPD, propondo metas de adequação em troca de redução de penalidades",
        effects: { seguranca: +4, reputacao: +3, financeiro: -3, satisfacao: +2, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Acordos de conformidade voluntária são reconhecidos pela ANPD como sinal de boa-fé e frequentemente resultam em penalidades menores e cronogramas mais flexíveis. A proatividade no acordo também cria precedente positivo no histórico regulatório da empresa — especialmente importante para contratos com órgãos públicos e clientes enterprise."
      },
      {
        text: "Comunicar publicamente nas redes sociais e no site que a empresa está colaborando totalmente com a ANPD para demonstrar transparência ao mercado",
        effects: { reputacao: -2, satisfacao: -1, seguranca: +1, clima: -1 },
        avaliacao: "ruim",
        ensinamento: "Comunicação pública sobre um processo administrativo em andamento — sem orientação jurídica — pode ser interpretada como reconhecimento de culpa e usado contra a empresa no processo. Transparência com clientes é essencial; publicidade em processo regulatório é perigosa sem protocolo legal cuidadoso."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O CTO Vai Embora
     Contexto: 11ª semana. A perda mais crítica possível.
     Pedro anuncia que vai criar a própria startup.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O CTO Vai Embora",
    description: "Pedro pede uma reunião reservada. Ele é direto: 'Tenho um cofounder, uma ideia que valida uma hipótese de mercado que eu acredito muito, e um angel que já confirmou R$ 500 mil de seed. Vou sair para criar essa startup. Meu prazo é 30 dias.' Pedro está há 3 anos na empresa. Ele é o principal arquiteto de tudo que vocês construíram. Sem ele, o conhecimento técnico da plataforma cai dramaticamente. Você tem 30 dias para reagir.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aceitar a decisão com elegância, negociar um período de transição de 60 dias com documentação estruturada e promover o dev sênior mais preparado a líder técnico interino",
        effects: { clima: +4, qualidade: +3, produtividade: +1, reputacao: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "A saída digna de um CTO cofundador define como o time inteiro processa a mudança. Negociar uma transição estruturada com documentação transforma a saída em fortalecimento institucional. Promover internamente sinaliza ao time que há trajetória real na empresa — o que é o oposto do que fez os outros deixarem."
      },
      {
        text: "Fazer uma proposta de cofundador retroativo para Pedro — participação de 8% e assento no conselho em troca de ficar",
        effects: { clima: +2, financeiro: -3, inovacao: +2, produtividade: +1, qualidade: +1 },
        avaliacao: "media",
        ensinamento: "Oferecer participação retroativa quando a pessoa já tomou a decisão de sair raramente funciona — e cria precedente questionável de que o reconhecimento só vem quando alguém ameaça sair. Se Pedro está comprometido com a própria startup, nenhum nível de equity vai genuinamente mudar sua decisão."
      },
      {
        text: "Contratar imediatamente um recrutador especializado em tecnologia para encontrar um novo CTO no mercado antes que Pedro saia",
        effects: { financeiro: -5, clima: -2, produtividade: -3, qualidade: -2 },
        avaliacao: "ruim",
        ensinamento: "Buscar um substituto externo como primeira reação comunica ao time que o conhecimento interno não é suficiente. Um novo CTO externo leva 3 a 6 meses para entender a arquitetura que Pedro conhece de cor — e esse vácuo, sem transição planejada, é o período de maior risco técnico da empresa."
      },
      {
        text: "Propor a Pedro um modelo de advisory: ele sai para a startup dele, mas dedica 8 horas mensais como advisor técnico durante 12 meses",
        effects: { qualidade: +3, inovacao: +2, clima: +3, produtividade: +2, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Um acordo de advisory mantém o canal de conhecimento técnico aberto durante o período crítico de transição. Para Pedro, é uma forma de honrar o relacionamento sem abrir mão da própria startup. Para a empresa, é acesso privilegiado ao arquiteto original durante o período em que o substituto ainda está subindo a curva de aprendizado."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · O Lançamento que Não Está Pronto
     Contexto: 13ª semana. A nova versão da plataforma quase pronta.
     A pressão por lançar conflita com a qualidade necessária.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Lançamento que Não Está Pronto",
    description: "A nova versão da plataforma — desenvolvida pelos últimos 10 semanas — está 85% concluída. O novo líder técnico Lucas apresenta o estado: 'Temos 43 bugs abertos, sendo 8 classificados como críticos. Com o time atual, precisamos de mais 5 semanas para fechar tudo com qualidade. Mas se lançarmos agora, os clientes vão sentir os problemas e vai parecer a versão anterior.' Os investidores já anunciaram o lançamento para os clientes enterprise como marco do plano. Beatriz diz que esperar mais 5 semanas vai custar 3 contratos que estão condicionados ao lançamento.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Adiar o lançamento geral por 5 semanas e corrigir todos os bugs críticos — comunicar honestamente aos investidores e clientes o motivo do atraso",
        effects: { qualidade: +6, reputacao: +3, satisfacao: +2, clima: +3, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Lançar com 8 bugs críticos é repetir o padrão que causou a crise atual — e desta vez com uma versão nova que os clientes têm expectativa elevada. O custo de 3 contratos adiados é real, mas mensurável. O custo de um lançamento malsucedido que reforça a reputação de instabilidade é muito mais alto e mais difícil de reverter."
      },
      {
        text: "Fazer um lançamento para primeiros adotantes — um grupo de 20 clientes selecionados — e usar o feedback deles para corrigir os últimos bugs antes do lançamento geral em 3 semanas",
        effects: { qualidade: +4, satisfacao: +3, reputacao: +4, produtividade: +2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "O lançamento gradual — beta fechado com clientes selecionados — é uma das práticas mais eficazes em software. Transforma o risco técnico em diferencial comercial (ser cliente acesso antecipado). Os bugs críticos são encontrados em ambiente controlado. E o lançamento geral acontece com mais confiança e menos risco reputacional."
      },
      {
        text: "Lançar conforme o prazo — a pressão dos investidores e os 3 contratos condicionados justificam aceitar os riscos dos bugs",
        effects: { financeiro: +3, qualidade: -5, satisfacao: -4, reputacao: -3, clima: -3, seguranca: -2 },
        avaliacao: "ruim",
        ensinamento: "Lançar com bugs críticos conhecidos para atender pressão externa é exatamente o que criou a dívida técnica original. O time que construiu a nova versão com cuidado vê a liderança repetir o mesmo erro — e a motivação para a próxima iteração de qualidade colapsa junto com o lançamento."
      },
      {
        text: "Terceirizar a correção dos 8 bugs críticos para uma empresa de QA especializada para entregar em 2 semanas",
        effects: { financeiro: -4, qualidade: +3, produtividade: +2, satisfacao: +1 },
        avaliacao: "media",
        ensinamento: "QA especializada pode acelerar a correção de bugs críticos com metodologia e ferramentas que o time interno pode não ter. O risco é o tempo de onboarding no código novo — bugs críticos frequentemente exigem compreensão profunda da arquitetura para serem corrigidos com segurança."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO CRÍTICA · O Board Meeting Final
     Contexto: 15ª semana. Tudo culmina aqui.
     A direção dos próximos 2 anos precisa ser definida hoje.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Board Meeting Final",
    description: "Reunião do conselho. Na sala: os dois investidores da Série A, Rafael (cofundador), Lucas (novo líder técnico), Beatriz (comercial) e você. Os investidores colocam a questão diretamente na mesa: 'A empresa sobreviveu à crise. Mas o mercado não vai esperar por uma empresa em modo de recuperação indefinidamente. Precisamos definir hoje: qual é a estratégia dos próximos 24 meses?' Quatro caminhos foram apresentados previamente em documento. Agora é a hora da decisão.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Crescimento sustentável: atingir break-even em 14 meses com expansão orgânica da base atual, e negociar Série B apenas quando a empresa estiver em posição de força técnica e operacional",
        effects: { financeiro: +5, qualidade: +5, clima: +5, satisfacao: +3, reputacao: +4, produtividade: +4 },
        avaliacao: "boa",
        ensinamento: "Crescimento sustentável — rentabilidade antes de nova captação — é o único caminho que preserva o controle estratégico do fundador e do time. Uma empresa no break-even negocia com investidores como parceiro, não como dependente. O aprendizado de 15 semanas de crise não pode ser desperdiçado na próxima pressão por crescimento acelerado."
      },
      {
        text: "Expansão acelerada: aceitar Série B com as condições mais favoráveis disponíveis agora e escalar o time de 67 para 130 pessoas nos próximos 12 meses",
        requisitos: { faseEmpresa: ["crescimento", "consolidacao", "expansao"], semFlags: ["crescimento_sem_caixa", "lideranca_toxica"] },
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +2 },
        effects: { financeiro: +5, clima: -5, qualidade: -4, produtividade: -4, seguranca: -2, reputacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Escalar um time em recuperação de crise antes de consolidar os processos é o padrão que destrói empresas que sobreviveram a crises. Dobrar o headcount sem cultura técnica sólida dilui a qualidade, reproduz os problemas de conhecimento tácito e cria a próxima geração de dívida técnica — desta vez com mais pessoas no caos."
      },
      {
        text: "Especialização: focar os próximos 24 meses exclusivamente no segmento de varejo — o setor onde o produto tem melhor fit e onde o Mercato Varejo pode ser referência",
        effects: { satisfacao: +4, reputacao: +5, qualidade: +3, financeiro: +3, inovacao: +2, clima: +3 },
        avaliacao: "boa",
        ensinamento: "Verticalização estratégica é uma das formas mais eficazes de criar diferencial defensável em SaaS B2B. Um produto 'feito para varejo' cria barreiras de entrada que um produto horizontal nunca consegue. O Mercato Varejo como caso de referência âncora credibilidade para toda a estratégia de go-to-market do setor."
      },
      {
        text: "Venda estratégica: reabrir as negociações com a TechBridge americana em condições mais favoráveis após a estabilização operacional",
        effects: { financeiro: +7, clima: -4, inovacao: -3, produtividade: -3, satisfacao: +2 },
        avaliacao: "media",
        ensinamento: "A venda estratégica é uma decisão legítima quando o contexto dos fundadores e do mercado se alinha. Negociar após a estabilização — não durante a crise — é o timing correto: o múltiplo melhora, a due diligence encontra menos problemas e os fundadores negociam de força, não de necessidade. O custo humano de uma aquisição mal conduzida, porém, é real e precisa ser endereçado no processo."
      }
    ]
  }

]
/* Histórias 1-9 removidas para teste beta — apenas história [0] ativa */

]; // fim TecnologiaRounds
/* --rounds/varejo-rounds.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · VAREJO · ROUNDS v5.0
   8 indicadores: financeiro, rh, clientes, processos,
                  margem, estoque, marca, digital
═══════════════════════════════════════════════════════ */

const VarejoRounds = [
[
  { title: "Os Números Não Fecham",
    description: "Ana, sua diretora financeira, apresenta os resultados do trimestre: margem operacional caiu de 8,3% para 5,1% em 18 meses. As lojas físicas respondem por 86% da receita mas concentram 94% dos custos. O e-commerce cresce 23% ao ano mas ainda não cobre a perda de margem do físico. Por onde começa o diagnóstico?",
    tags: ["varejo"],
    choices: [
      { risco:"baixo", text:"Mapear as 5 lojas com pior desempenho e calcular o custo real de cada uma", effects:{financeiro:+2,processos:+3,margem:+2}, avaliacao:"boa", ensinamento:"O diagnóstico granular por unidade é o primeiro passo de qualquer reestruturação de varejo. Sem saber quais lojas destroem margem, qualquer decisão é chute no escuro." },
      { risco:"medio", text:"Contratar consultoria especializada em varejo para avaliar toda a operação", effects:{financeiro:-4,processos:+2,margem:+1}, avaliacao:"media", ensinamento:"Consultoria traz benchmarks de mercado valiosos, mas o diagnóstico interno feito pelo próprio time costuma ser mais rápido e mais aderente à realidade operacional da empresa." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-2,capitalPolitico:+1}, text:"Anunciar corte de 10% em todos os custos de todas as lojas imediatamente", effects:{financeiro:+2,rh:-4,processos:-2,margem:+1}, avaliacao:"ruim", ensinamento:"Corte linear sem diagnóstico é o erro clássico de gestão de crise no varejo. Penaliza lojas saudáveis junto com as problemáticas e destrói a moral do time." },
      { text:"Acelerar as vendas do e-commerce para compensar a queda de margem do físico", effects:{clientes:+2,financeiro:-3,digital:+2,margem:-1}, avaliacao:"ruim", ensinamento:"Crescer o canal com menor margem para compensar o problema do canal principal adia o problema sem resolvê-lo. A causa-raiz da queda de margem precisa ser endereçada." }
    ]
  },
  { title: "O Ranking das Lojas",
    description: "O mapeamento revelou: das 38 lojas, 8 respondem por 71% do lucro. 6 lojas têm resultado negativo há mais de 12 meses. O gerente regional defende que as lojas deficitárias ainda têm 'valor estratégico de presença'. O contrato de aluguel de três delas vence em 60 dias.",
    tags: ["varejo"],
    choices: [
      { text:"Não renovar os contratos das 3 lojas deficitárias com aluguel vencendo", effects:{financeiro:+5,rh:-3,clientes:-2,margem:+3}, avaliacao:"boa", ensinamento:"Fechar lojas cronicamente deficitárias é decisão difícil mas necessária. O dinheiro economizado pode fortalecer as lojas rentáveis." },
      { text:"Negociar redução de 30% nos aluguéis das 6 lojas deficitárias antes de qualquer fechamento", effects:{financeiro:+3,processos:+2,margem:+2}, avaliacao:"boa", ensinamento:"Renegociação de aluguel é a primeira alavanca em varejo. Proprietários preferem 30% menos a ter o espaço vazio." },
      { text:"Converter as lojas deficitárias em pontos de experiência sem estoque físico", effects:{financeiro:-2,clientes:+3,processos:-3,marca:+2,estoque:+2}, avaliacao:"media", ensinamento:"Lojas conceito têm apelo no varejo moderno, mas a conversão tem custo e leva tempo." },
      { text:"Manter todas as lojas e dar 6 meses para os gerentes regionais reverterem os resultados", effects:{financeiro:-5,rh:-1,processos:-3,margem:-2}, avaliacao:"ruim", ensinamento:"Manter lojas cronicamente deficitárias sem plano estrutural consome caixa sem perspectiva de retorno." }
    ]
  },
  { title: "O Time de Vendas Está Desmotivado",
    description: "A pesquisa de clima aponta: 62% do time de vendas das lojas físicas se sente 'ameaçado' pelo crescimento do e-commerce. Os melhores vendedores estão saindo. O índice de rotatividade do time comercial subiu de 28% para 47% ao ano.",
    tags: ["varejo"],
    choices: [
      { text:"Criar comissão para vendedores físicos que direcionam clientes ao app — integração real de canais", effects:{rh:+6,clientes:+3,financeiro:-2,digital:+2,marca:+1}, avaliacao:"boa", ensinamento:"Remunerar o vendedor físico por vendas no digital elimina a percepção de competição interna. Omnichannel real começa quando os incentivos dos canais estão alinhados." },
      { text:"Comunicar que o e-commerce e o físico têm papéis complementares e que ninguém será demitido", effects:{rh:+4}, avaliacao:"media", ensinamento:"Comunicação sobre o futuro dos empregos é necessária, mas sem mudança real nos incentivos, o discurso perde credibilidade rapidamente." },
      { risco:"alto", gestorEffects:{reputacaoInterna:+2,capitalPolitico:-1}, text:"Aumentar o salário fixo dos vendedores físicos em 15% para reter o time", effects:{financeiro:-5,rh:+4,margem:-2}, avaliacao:"media", ensinamento:"Aumento de salário resolve o imediato mas não ataca a causa: o medo de irrelevância." },
      { risco:"medio", gestorEffects:{reputacaoInterna:-1}, text:"Focar na automação e aceitar a rotatividade como parte da transformação digital", effects:{financeiro:+2,rh:-6,clientes:-4,marca:-2}, avaliacao:"ruim", ensinamento:"Abrir mão do capital humano acumulado no atendimento físico para economizar em pessoas é uma aposta muito cara." }
    ]
  },
  { title: "O Problema do Estoque",
    description: "O relatório de inventário revela: R$ 4,2 milhões em produtos parados há mais de 90 dias. A previsão de demanda é feita manualmente por cada gerente de loja. Resultado: lojas com excesso em alguns SKUs e ruptura em outros. O índice de ruptura médio está em 18% — acima do benchmark de 8%.",
    tags: ["varejo"],
    choices: [
      { text:"Implementar sistema de gestão de estoque centralizado com reposição automática por loja", effects:{processos:+6,financeiro:-4,rh:-1,estoque:+5}, avaliacao:"boa", ensinamento:"Centralização do estoque com algoritmos de reposição é o padrão em redes de varejo eficientes. Elimina a ruptura, reduz o estoque parado e libera os gerentes para foco no cliente." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Fazer liquidação agressiva dos R$ 4,2M parados para liberar caixa imediatamente", effects:{financeiro:+4,clientes:+1,processos:+2,estoque:+4,margem:-1}, avaliacao:"boa", ensinamento:"Liquidar estoque parado com desconto é preferível a manter o capital imobilizado." },
      { risco:"medio", text:"Contratar gerente de supply chain para liderar a reorganização do estoque", effects:{financeiro:-3,processos:+4,rh:+1,estoque:+2}, avaliacao:"media", ensinamento:"Um gestor especializado em supply chain traz metodologia, mas leva de 3 a 6 meses para produzir resultado concreto." },
      { text:"Treinar os gerentes de loja para melhorar as previsões manuais", effects:{rh:+2,processos:-2,estoque:+1}, avaliacao:"ruim", ensinamento:"Treinamento em previsão manual não escala. Humanos não processam os dados de velocidade de giro que sistemas automatizados tratam em segundos." }
    ]
  },
  { title: "O E-commerce Não Converte",
    description: "O site tem 280.000 visitantes mensais mas converte apenas 1,4% — a média do varejo nacional é 2,8%. O time de TI aponta: tempo de carregamento médio de 6,2 segundos no mobile, frete caro e sem opção de retirada em loja.",
    tags: ["varejo"],
    choices: [
      { text:"Implementar click-and-collect: compra no app, retira na loja mais próxima sem frete", effects:{clientes:+6,processos:+3,financeiro:-3,digital:+4,marca:+2}, avaliacao:"boa", ensinamento:"Click-and-collect resolve o frete — principal barreira no e-commerce de varejo — e ainda traz tráfego para as lojas físicas." },
      { text:"Redesenhar o site focando em performance mobile e checkout simplificado", effects:{clientes:+5,processos:+3,financeiro:-4,digital:+5}, avaliacao:"boa", ensinamento:"Performance mobile é o maior driver de conversão no varejo digital brasileiro. Cada segundo a menos no tempo de carregamento aumenta a conversão em até 7%." },
      { text:"Contratar agência de marketing digital para aumentar o tráfego do site", effects:{financeiro:-5,clientes:+2,digital:+1}, avaliacao:"ruim", ensinamento:"Aumentar tráfego sem aumentar a conversão é amplificar o problema. Se o site converte 1,4%, trazer mais visitantes significa mais abandono, não mais vendas." },
      { text:"Lançar o aplicativo próprio com notificações de ofertas personalizadas", effects:{financeiro:-6,clientes:+3,processos:-2,digital:+3,marca:+1}, avaliacao:"media", ensinamento:"App próprio tem custo alto de desenvolvimento. Com taxa de conversão do site em 1,4%, otimizar o canal existente é mais urgente do que criar um novo canal com os mesmos problemas." }
    ]
  },
  { title: "Marketplace Gigante Invade o Seu Segmento",
    description: "O maior marketplace do país anunciou que vai vender os mesmos produtos do seu mix principal com entrega em 24 horas e preço em média 12% menor. Três dos seus 10 fornecedores principais já assinaram contrato para vender direto na plataforma deles.",
    tags: ["varejo"],
    choices: [
      { text:"Focar em marcas exclusivas e produtos que o marketplace não tem — criar diferenciação real", effects:{clientes:+5,financeiro:-3,processos:+2,marca:+4,margem:+2}, avaliacao:"boa", ensinamento:"Exclusividade de mix é a defesa mais eficaz contra marketplaces. Produtos que o marketplace não tem são itens que seus clientes precisam vir até você para comprar." },
      { text:"Negociar exclusividade de fornecimento com os 3 fornecedores que assinaram com o marketplace", effects:{financeiro:-4,clientes:+3,processos:+2,marca:+2}, avaliacao:"boa", ensinamento:"Recuperar a exclusividade de fornecedores estratégicos tem custo mas elimina a ameaça direta." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Reduzir preços para igualar o marketplace nos produtos mais concorridos", effects:{financeiro:-6,clientes:+2,margem:-4}, avaliacao:"ruim", ensinamento:"Guerra de preços com marketplace capitalizado é batalha perdida. Competir por preço destrói a margem sem garantir os clientes." },
      { text:"Criar programa de fidelidade com benefícios que o marketplace não consegue oferecer", effects:{clientes:+5,financeiro:-3,rh:-1,marca:+3}, avaliacao:"boa", ensinamento:"Fidelidade vai além do preço — ela é construída por conveniência, relacionamento e benefícios tangíveis." }
    ]
  },
  { title: "O Fornecedor Estratégico Aumenta o Preço em 22%",
    description: "Seu principal fornecedor — responsável por 31% do faturamento — comunicou reajuste de 22% em 60 dias, alegando aumento de custo de insumos importados.",
    tags: ["varejo"],
    choices: [
      { risco:"medio", text:"Negociar reajuste parcelado em 3 etapas de 7,3% ao longo de 9 meses", effects:{financeiro:+3,processos:+2,clientes:-1,margem:+1}, avaliacao:"boa", ensinamento:"Renegociação de prazo distribui o impacto e dá tempo para buscar alternativas ou repassar gradualmente ao cliente." },
      { text:"Absorver o reajuste e repassar integralmente ao cliente", effects:{clientes:-5,financeiro:-2,margem:-3}, avaliacao:"ruim", ensinamento:"Repasse integral de reajuste ao consumidor é o caminho que mais deteriora o relacionamento com o cliente." },
      { risco:"medio", text:"Buscar fornecedores alternativos para reduzir a dependência dos 31%", effects:{financeiro:-3,processos:+5,clientes:-2,estoque:-1}, avaliacao:"boa", ensinamento:"Diversificação de fornecedores é a única estratégia estrutural contra concentração de dependência." },
      { text:"Aceitar o reajuste integral e renegociar benefícios como prazo de pagamento e exclusividade", effects:{financeiro:-2,processos:+3,clientes:-1,marca:+1}, avaliacao:"media", ensinamento:"Aceitar o preço em troca de benefícios operacionais pode ser válido se o prazo de pagamento melhorar o fluxo de caixa." }
    ]
  },
  { title: "Crise de Imagem: Reclamação Viral nas Redes",
    description: "Um cliente filmou a devolução de um produto sendo recusada indevidamente por uma gerente de loja e postou no Instagram. Em 48 horas, o vídeo atingiu 1,2 milhão de visualizações. O Procon notificou a empresa.",
    tags: ["varejo"],
    choices: [
      { text:"Publicar nota de desculpas, resolver o caso da cliente e anunciar treinamento de toda a rede", effects:{clientes:+6,rh:-2,processos:+3,marca:+4}, avaliacao:"boa", ensinamento:"Resposta pública rápida com ação concreta é o padrão ouro de gestão de crise em varejo. Clientes que veem a empresa resolver com transparência frequentemente se tornam defensores." },
      { text:"Contatar o cliente para resolver privadamente antes de qualquer comunicação pública", effects:{clientes:+3,processos:+1,marca:+1}, avaliacao:"media", ensinamento:"Resolver privadamente protege o relacionamento com o cliente específico, mas não controla a narrativa pública que já viralizou." },
      { text:"Verificar internamente se a gerente agiu conforme a política vigente antes de se posicionar", effects:{clientes:-5,financeiro:-3,marca:-4}, avaliacao:"ruim", ensinamento:"Em crises digitais, o silêncio público é lido como omissão. A investigação interna pode correr em paralelo com uma resposta imediata." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-1,capitalPolitico:+2}, text:"Desligar a gerente e comunicar isso publicamente como demonstração de valores", effects:{rh:-6,clientes:+2,processos:-2,marca:-1}, avaliacao:"ruim", ensinamento:"Demitir publicamente como resposta a pressão de redes sociais cria precedente de gestão por humilhação." }
    ]
  },
  { title: "Black Friday: O Maior Risco do Ano",
    description: "Faltam 45 dias para a Black Friday. No ano passado, o site ficou fora do ar por 3 horas no pico das 23h. O time de TI quer R$ 280k para infraestrutura cloud escalável. O time de operações quer R$ 180k para reforçar o time de separação de pedidos. O orçamento disponível é de R$ 300k.",
    tags: ["varejo"],
    choices: [
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Investir R$ 220k em infraestrutura cloud e R$ 80k em operações temporárias", effects:{processos:+5,clientes:+4,financeiro:-4,digital:+4}, avaliacao:"boa", ensinamento:"Site fora do ar na Black Friday é perda direta de receita e dano de imagem irreparável. Priorizar infraestrutura garante que o crescimento de demanda não seja desperdício." },
      { risco:"medio", text:"Investir o orçamento todo em operações — equipe presencial garante a separação e expedição de pedidos", effects:{rh:+3,clientes:-3,processos:-2,digital:-2}, avaliacao:"ruim", ensinamento:"Equipe sem infraestrutura digital não resolve o ponto de falha. O gargalo do ano anterior foi o site — não a separação e expedição de pedidos." },
      { text:"Limitar as promoções digitais para não superar a capacidade atual da infraestrutura", effects:{financeiro:+2,clientes:-4,processos:+1,digital:-2,marca:-2}, avaliacao:"ruim", ensinamento:"Limitar vendas para não estourar a infraestrutura é admitir incapacidade operacional. Na Black Friday, o espaço que você não ocupa é imediatamente preenchido pelo concorrente." },
      { text:"Negociar com o provedor cloud contrato de uso variável — paga só pelo pico", effects:{financeiro:+2,processos:+5,clientes:+4,digital:+3}, avaliacao:"boa", ensinamento:"Cloud com modelo de uso variável elimina o investimento fixo e garante escala sob demanda. É a solução mais inteligente para demanda de pico previsível como Black Friday." }
    ]
  },
  { title: "Resultado da Black Friday",
    description: "A Black Friday foi o melhor dia da história da empresa em receita — R$ 3,1M em 24 horas. Mas o prazo de entrega médio foi 6,8 dias contra os 3 dias prometidos. 23% dos pedidos atrasaram mais de 5 dias. O Reclame Aqui explodiu com 1.847 reclamações. O NPS despencou 22 pontos.",
    tags: ["varejo"],
    choices: [
      { text:"Contatar proativamente todos os clientes com pedido atrasado com cupom de compensação", effects:{clientes:+5,financeiro:-3,rh:-2,marca:+2}, avaliacao:"boa", ensinamento:"Contato proativo antes da reclamação do cliente reduz o volume de Reclame Aqui e transforma a frustração em percepção de cuidado." },
      { text:"Publicar nota pública pedindo desculpas e explicando o volume excepcional como causa", effects:{clientes:+3,processos:+2,marca:+1}, avaliacao:"media", ensinamento:"Nota pública cria contexto, mas 'volume excepcional' é um argumento que todos os varejistas usam toda Black Friday. Clientes esperam que você planeje para o volume." },
      { text:"Rever o contrato com a transportadora que mais atrasou para a próxima operação", effects:{processos:+5,clientes:-1,estoque:+1}, avaliacao:"media", ensinamento:"Renegociar logística para o próximo ano é essencial, mas não resolve as 1.847 reclamações abertas agora." },
      { text:"Absorver as reclamações e focar nos próximos eventos — os clientes esquecem rápido", effects:{clientes:-6,financeiro:-2,marca:-4}, avaliacao:"ruim", ensinamento:"Clientes de varejo têm muitas opções e baixa fidelidade de preço. Uma experiência ruim seguida de silêncio da marca resulta em migração definitiva." }
    ]
  },
  { title: "Fechar ou Transformar: As 6 Lojas Deficitárias",
    description: "Após 6 meses de tentativas de melhoria, as 6 lojas deficitárias mantêm resultado negativo. O custo fixo combinado é de R$ 890k/mês. Um fundo de private equity propôs adquirir 4 dos pontos para convertê-los em dark stores para delivery.",
    tags: ["varejo"],
    choices: [
      { text:"Vender 4 lojas ao PE para dark stores e fechar 2 — R$ 2,1M de caixa e R$ 890k/mês de custo eliminado", effects:{financeiro:+8,clientes:-3,rh:-4,margem:+4,estoque:+2}, avaliacao:"boa", ensinamento:"Transformar ativos que destroem valor em caixa e eliminar custo fixo é a decisão estruturalmente correta." },
      { risco:"medio", gestorEffects:{reputacaoInterna:+1,esgotamento:+1}, text:"Converter as 6 lojas em espaços menores de experiência com estoque reduzido", effects:{financeiro:-4,clientes:+3,processos:-3,marca:+3,estoque:+2}, avaliacao:"media", ensinamento:"Lojas experienciais têm mérito estratégico, mas a conversão tem custo e tempo. Sem garantia de reversão do déficit, a empresa assume mais custo." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-3,capitalPolitico:+2}, text:"Fechar as 6 lojas de uma vez e realocar o time para as lojas rentáveis", effects:{financeiro:+6,rh:-6,clientes:-4,margem:+3}, avaliacao:"media", ensinamento:"Fechamento total é a solução mais limpa financeiramente, mas o impacto humano e de marca é maior." },
      { text:"Dar mais 6 meses com metas rígidas e fechar apenas as que não atingirem o breakeven", effects:{financeiro:-5,processos:-2,margem:-2}, avaliacao:"ruim", ensinamento:"Seis meses a mais de custo fixo de R$ 890k/mês sem mudança estrutural são R$ 5,3M queimados." }
    ]
  },
  { title: "Proposta de Fusão com Rede Concorrente Regional",
    description: "Uma rede concorrente com 22 lojas em cidades onde você não atua propôs fusão. O acordo consolidaria 60 lojas e criaria a maior rede regional do estado. O preço é atrativo, mas as culturas operacionais são opostas.",
    tags: ["varejo"],
    choices: [
      { text:"Propor joint venture comercial sem fusão societária — compartilhar fornecedores e negociar escala conjunta", effects:{financeiro:+4,processos:+3,clientes:+1,margem:+3}, avaliacao:"boa", ensinamento:"Joint venture preserva a independência enquanto captura o benefício de escala. Poder de compra conjunto pode reduzir custo de mercadoria em 8-15%." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+2}, text:"Aceitar a fusão — 60 lojas criam poder de barganha que nenhum dos dois tem sozinho", effects:{financeiro:+5,clientes:+2,rh:-4,processos:-5,margem:+1}, avaliacao:"media", ensinamento:"Fusões de redes de varejo com culturas opostas raramente entregam a sincronia prometida." },
      { risco:"medio", gestorEffects:{reputacaoInterna:+1,capitalPolitico:-1}, text:"Recusar e acelerar a expansão orgânica para as cidades onde o concorrente atua", effects:{financeiro:-6,clientes:+3,rh:-2,marca:+1}, avaliacao:"ruim", ensinamento:"Expansão orgânica para mercados onde o concorrente já está estabelecido é custosa e lenta." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+2}, text:"Adquirir apenas as 8 lojas do concorrente em mercados estratégicos para você", effects:{financeiro:-3,clientes:+4,processos:+2,marca:+2}, avaliacao:"boa", ensinamento:"Aquisição seletiva de ativos estratégicos captura o que você precisa sem o custo de integrar uma rede inteira com cultura divergente." }
    ]
  },
  { title: "Decisão de Marca Própria",
    description: "O diretor de compras identificou oportunidade: 6 categorias respondem por 44% das vendas mas têm margem bruta de apenas 22%. Os mesmos produtos com marca própria teriam margem estimada de 38%.",
    tags: ["varejo"],
    choices: [
      { text:"Lançar marca própria nas 2 categorias com maior volume e menor risco técnico primeiro", effects:{financeiro:+5,clientes:+2,processos:+3,margem:+4,marca:+3}, avaliacao:"boa", ensinamento:"Começar por onde o risco é menor e o impacto é maior é a estratégia certa em marca própria. Validar com 2 categorias antes de expandir evita over-commit." },
      { text:"Lançar marca própria nas 6 categorias simultaneamente para maximizar o impacto de margem", effects:{financeiro:-4,processos:-4,clientes:-2,margem:-1,estoque:-2}, avaliacao:"ruim", ensinamento:"Lançar 6 categorias ao mesmo tempo fragmenta o foco, o orçamento e a capacidade de resposta a problemas." },
      { text:"Terceirizar o desenvolvimento das marcas próprias para um fabricante com linha exclusiva", effects:{financeiro:-2,processos:+4,clientes:+2,margem:+3,marca:+2}, avaliacao:"boa", ensinamento:"Parceria com fabricante estabelecido reduz o risco técnico e acelera o time-to-market." },
      { text:"Adiar — marca própria exige atenção de gestão que a empresa não tem neste momento", effects:{processos:+2,financeiro:-1,margem:+0}, avaliacao:"media", ensinamento:"Disciplina para não abraçar todas as oportunidades ao mesmo tempo é habilidade valiosa. Mas o custo da inação em margem é real." }
    ]
  },
  { title: "O Investidor Quer Abrir o Capital",
    description: "O fundo que detém 23% da empresa quer abrir o capital em 18 meses. O IPO resolveria o problema de caixa e financiaria a transformação digital completa. Mas exige dois anos de resultados crescentes, auditoria externa e governança formalizada.",
    tags: ["varejo"],
    choices: [
      { text:"Aceitar o objetivo do IPO e iniciar o processo de governança e auditoria imediatamente", effects:{financeiro:+4,processos:+5,rh:-2,margem:+2}, avaliacao:"boa", ensinamento:"IPO como objetivo estratégico orienta todas as decisões de governança e resultado. O processo de se preparar para abrir o capital frequentemente melhora a empresa." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Negociar um prazo de 36 meses — 18 meses é inviável com a situação atual", effects:{financeiro:+2,processos:+3,rh:+1,margem:+1}, avaliacao:"boa", ensinamento:"Prazo realista de preparação protege o valuation. Abrir o capital mal preparado destrói valor para todos os acionistas." },
      { text:"Recusar o IPO e propor recompra da participação do fundo com caixa do próximo ano", effects:{financeiro:-5,rh:+3,processos:-2}, avaliacao:"media", ensinamento:"Recomprar o fundo antes do IPO pode ser correto se o empreendedor quer manter o controle total. O risco é perder a governança e rede de contatos." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+3}, text:"Aceitar e contratar bancos de investimento imediatamente para iniciar o coleta de intenções de compra de ações", requisitos:{indicadorMinimo:{financeiro:10,processos:9}}, effects:{financeiro:-4,processos:-3,rh:-3,margem:-2}, avaliacao:"ruim", ensinamento:"Contratar bancos antes de ter governança, auditoria e resultados consistentes queima capital em assessoria sem estar pronto para o mercado." }
    ]
  },
  { title: "O Futuro da Rede: Qual Varejo Você Quer Ser?",
    description: "Após um ciclo intenso de transformação, você precisa definir o posicionamento definitivo para os próximos 3 anos. Os dados mostram que o consumidor evoluiu e o mercado não perdoa ambiguidade.",
    tags: ["varejo"],
    choices: [
      { text:"Varejo omnichannel premium: lojas experienciais + e-commerce com entrega rápida e serviço diferenciado", effects:{financeiro:+5,clientes:+6,processos:+4,rh:+2,marca:+5,digital:+3,margem:+3}, avaliacao:"boa", ensinamento:"Omnichannel premium é o posicionamento mais defensável contra marketplaces. Clientes que pagam mais por experiência têm menor elasticidade de preço e maior fidelidade." },
      { text:"Digital-first: reduzir a rede física para 15 lojas estratégicas e escalar o e-commerce como canal principal", effects:{financeiro:+4,clientes:+3,processos:+5,rh:-3,digital:+6,margem:+2}, avaliacao:"boa", ensinamento:"Varejo digital-first com ancoragem física seletiva é a estratégia de maior eficiência operacional." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-2,capitalPolitico:+1}, text:"Atacadista regional: vender para pequenos varejistas e abandonar o B2C direto", requisitos:{faseEmpresa:["crise"]}, effects:{clientes:-5,financeiro:+3,rh:-4,processos:-3,marca:-4}, avaliacao:"ruim", ensinamento:"Pivô para atacado abandona anos de construção de marca e relacionamento com o consumidor final. Mudança de modelo radical raramente resolve problema de execução." },
      { text:"Varejo de proximidade: micro-lojas de até 200m² em bairros residenciais com sortimento local", effects:{financeiro:+3,clientes:+4,processos:+3,rh:+1,marca:+2,estoque:+2}, avaliacao:"boa", ensinamento:"Varejo de proximidade compete no convênio de localização que o e-commerce não resolve: a compra imediata, sem espera, a 5 minutos de casa." }
    ]
  }
]
]; // fim VarejoRounds
/* --rounds/logistica-rounds.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · LOGÍSTICA · ROUNDS v5.0
   8 indicadores: financeiro, rh, clientes, processos,
                  sla, frota, seguranca, tecnologia
═══════════════════════════════════════════════════════ */

const LogisticaRounds = [
[
  { title: "O SLA Está Quebrando",
    description: "Rafael, seu diretor de operações, apresenta os dados do último trimestre: 31% das entregas estão fora do prazo de 48h. O benchmark do setor é 12%. Os dois principais clientes têm cláusula de multa por SLA — e nenhum dos dois foi acionado ainda, mas estão monitorando.",
    tags: ["logistica"],
    choices: [
      { risco:"baixo", text:"Mapear os gargalos por etapa do processo: coleta, rota, CD e última milha", effects:{processos:+4,rh:+1,sla:+2}, avaliacao:"boa", ensinamento:"Diagnóstico por etapa identifica onde a ruptura real acontece. Em logística, o problema raramente está onde parece." },
      { risco:"medio", text:"Contratar consultoria especializada em supply chain para o diagnóstico", effects:{financeiro:-4,processos:+2,sla:+1}, avaliacao:"media", ensinamento:"Consultoria traz metodologia e benchmarks, mas o diagnóstico mais preciso vem de quem conhece as peculiaridades da operação local." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Aumentar o quadro de entregadores em 20% imediatamente para cobrir o volume", effects:{financeiro:-5,rh:-2,processos:-1,sla:-1}, avaliacao:"ruim", ensinamento:"Contratar sem diagnóstico pode ampliar o problema. Se o gargalo está no CD ou na triagem, mais entregadores não resolvem." },
      { text:"Renegociar o SLA com os clientes para 72h enquanto resolve o problema operacional", effects:{clientes:-4,processos:+1,sla:-2}, avaliacao:"ruim", ensinamento:"Renegociar o SLA para baixo em vez de corrigir a operação é admitir incapacidade e cria precedente ruim." }
    ]
  },
  { title: "O Entregador Mais Produtivo Pediu Demissão",
    description: "Seu entregador de maior volume — 340 entregas por mês, zero acidentes, NPS do cliente 4,8/5 — pediu demissão citando 'falta de reconhecimento e plano de carreira'. É o quinto entregador acima da média a sair em 3 meses. A rotatividade da operação está em 68% ao ano.",
    tags: ["logistica"],
    choices: [
      { text:"Criar plano de carreira para entregadores: supervisor de rota, coordenador de CD, analista de operações", effects:{rh:+6,processos:+2,financeiro:-2,sla:+1}, avaliacao:"boa", ensinamento:"Entregadores de alta performance saem por falta de futuro, não de salário. Um plano de carreira claro retém os melhores e cria pipeline interno de liderança." },
      { text:"Oferecer bônus de R$ 500/mês para entregadores com performance acima de 300 entregas e NPS>4.5", effects:{rh:+5,financeiro:-3,sla:+2}, avaliacao:"boa", ensinamento:"Bônus por performance reconhece concretamente quem mais contribui. Vinculado ao NPS do cliente, alinha o incentivo individual ao resultado que o negócio precisa." },
      { text:"Fazer pesquisa de clima com todos os entregadores antes de tomar qualquer decisão", effects:{rh:+3,processos:+1}, avaliacao:"media", ensinamento:"Pesquisa antes de agir é prudente, mas com 5 saídas consecutivas de alta performance o padrão já está claro." },
      { text:"Contratar novos entregadores para compensar as saídas e manter o volume de operação", effects:{financeiro:-4,rh:-3,processos:-2,frota:-1}, avaliacao:"ruim", ensinamento:"Contratar para compensar a rotatividade sem atacar a causa é remar contra a maré. O custo de treinar um entregador novo para atingir 340 entregas/mês é significativo." }
    ]
  },
  { title: "O Centro de Distribuição Está no Limite",
    description: "O CD principal — responsável por 54% do volume — opera a 97% da capacidade. Em dias de pico, ocorrem gargalos de triagem que atrasam toda a operação em 4 a 6 horas. A ampliação do CD custaria R$ 2,8M. O aluguel de um galpão adicional custaria R$ 85k/mês.",
    tags: ["logistica"],
    choices: [
      { risco:"medio", text:"Alugar o galpão adicional como CD de overflow para os dias de pico imediatamente", effects:{financeiro:-3,processos:+4,clientes:+2,sla:+3}, avaliacao:"boa", ensinamento:"Galpão adicional resolve o pico com custo previsível sem comprometer capital em imobilizado." },
      { risco:"medio", text:"Implementar turnos noturnos no CD para desafogar o volume em 24h ao invés de 12h", effects:{rh:-3,processos:+5,financeiro:-2,sla:+2}, avaliacao:"media", ensinamento:"Turnos noturnos aumentam a capacidade sem capex adicional, mas têm custo de adicional noturno e impacto na saúde do time." },
      { text:"Investir R$ 2,8M na ampliação do CD — resolver definitivamente o problema de capacidade", effects:{financeiro:-7,processos:+7,clientes:+3,sla:+4}, avaliacao:"media", ensinamento:"Investimento em capacidade permanente é correto se o volume justifica. Mas R$ 2,8M de capex em operação com SLA quebrado exige projeção de crescimento sólida." },
      { text:"Redistribuir volume entre os 8 CDs para equilibrar a carga sem investimento adicional", effects:{processos:+3,clientes:-2,rh:-1,sla:+1}, avaliacao:"media", ensinamento:"Rebalancear entre CDs existentes é custo zero imediato, mas aumenta o custo de frete entre CDs. Redistribuição geográfica raramente é neutra em custo total." }
    ]
  },
  { title: "O TMS Está Desatualizado",
    description: "O sistema de gerenciamento de transporte (TMS) foi implementado em 2017 e não integra com o sistema dos clientes novos. Resultado: 40% dos pedidos ainda são inseridos manualmente, causando erros e atrasos de até 2 horas. O mercado tem soluções SaaS que integram em 2 semanas por R$ 18k/mês.",
    tags: ["logistica"],
    choices: [
      { text:"Contratar o TMS SaaS de mercado — integrar em 2 semanas e eliminar os erros manuais", effects:{processos:+6,financeiro:-3,rh:-1,tecnologia:+6,sla:+3}, avaliacao:"boa", ensinamento:"Modernizar o TMS com solução de mercado é quase sempre melhor do que manter sistema legado. O custo mensal de R$ 18k se paga com a eliminação dos erros e atrasos." },
      { text:"Desenvolver integração customizada no TMS atual para preservar o investimento histórico", effects:{financeiro:-5,processos:-2,rh:-2,tecnologia:-1}, avaliacao:"ruim", ensinamento:"Customizar sistema legado para integrar tecnologia moderna é caminho de alto custo e baixa velocidade. O investimento histórico no TMS de 2017 já foi." },
      { text:"Contratar desenvolvedores para construir API de integração entre os sistemas existentes e os dos clientes", effects:{financeiro:-4,processos:+2,rh:-1,tecnologia:+3}, avaliacao:"media", ensinamento:"API customizada é mais flexível mas mais lenta e cara. Para um problema operacional que está impactando SLA hoje, 2 semanas de implementação do SaaS supera meses de desenvolvimento." },
      { risco:"baixo", text:"Manter o processo manual com checklist reforçado para reduzir os erros humanos", effects:{processos:-3,rh:-2,sla:-2}, avaliacao:"ruim", ensinamento:"Checklist não resolve erro sistêmico de processo manual em escala. Adicionar controle manual sobre processo manual apenas aumenta a burocracia." }
    ]
  },
  { title: "O Cliente Principal Representa 38% da Receita",
    description: "A auditoria de carteira revela concentração preocupante: um único cliente representa 38% da receita. O contrato vence em 14 meses. O diretor de vendas alerta: eles estão em negociação com dois concorrentes.",
    tags: ["logistica"],
    choices: [
      { text:"Iniciar campanha ativa de vendas para reduzir a dependência antes da renovação do contrato", effects:{clientes:+4,financeiro:-2,rh:-1,sla:+1}, avaliacao:"boa", ensinamento:"Diversificação de carteira é o único antídoto estrutural para a concentração de receita. Começar 14 meses antes ainda dá tempo de construir alternativas." },
      { text:"Investir no cliente principal para garantir a renovação — propor expansão de escopo do serviço", effects:{clientes:+3,financeiro:-3,sla:+2}, avaliacao:"boa", ensinamento:"Expandir o escopo com o cliente principal aumenta o switching cost e a dependência mútua. Um cliente que usa 5 serviços seus é muito mais difícil de perder." },
      { text:"Renegociar o contrato com desconto para garantir renovação de 3 anos antes da concorrência agir", effects:{financeiro:-4,clientes:+3,sla:+1}, avaliacao:"media", ensinamento:"Desconto para renovação antecipada sacrifica margem mas garante previsibilidade. Se o operacional melhorar até lá, você pode renegociar de posição de força no próximo ciclo." },
      { text:"Aguardar — o cliente provavelmente está usando a negociação com concorrentes como pressão de preço", effects:{clientes:-5,financeiro:-3,sla:-1}, avaliacao:"ruim", ensinamento:"Assumir que a ameaça é só blefe é o risco mais caro em gestão de carteira de clientes. Com 38% da receita em jogo, qualquer estratégia é melhor que a inação." }
    ]
  },
  { title: "Acidente com Entregador em Moto",
    description: "Um entregador sofreu acidente grave com fratura de clavícula. O seguro cobre as despesas médicas, mas a investigação interna revelou que 23% da frota de motos tem manutenção atrasada há mais de 60 dias. O acidente viralizou nas redes com crítica à 'uberização' sem condições seguras de trabalho.",
    tags: ["logistica"],
    choices: [
      { text:"Suspender a frota com manutenção atrasada, regularizar tudo e implementar checklist semanal obrigatório", effects:{processos:+5,rh:+4,clientes:-2,financeiro:-3,frota:+4,seguranca:+5}, avaliacao:"boa", ensinamento:"Segurança da frota não é custo — é pré-requisito operacional. Suspender motos irregulares antes de um segundo acidente é a decisão certa mesmo com impacto no curto prazo." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+2}, text:"Comunicar publicamente o suporte ao entregador e o plano de manutenção da frota", effects:{rh:+3,clientes:+1,processos:+2,seguranca:+2}, avaliacao:"boa", ensinamento:"Transparência sobre ação corretiva em acidente de trabalho constrói reputação. O mercado de talento logístico é pequeno — como você trata um acidente é observado por todos." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Investigar internamente por uma semana antes de tomar qualquer decisão pública", effects:{rh:-4,clientes:-3,processos:-2,seguranca:-2}, avaliacao:"ruim", ensinamento:"Em acidente de trabalho com repercussão pública, uma semana de silêncio é lida como omissão." },
      { text:"Migrar toda a frota para motoristas PJ para reduzir a responsabilidade trabalhista da empresa", effects:{rh:-6,financeiro:+2,clientes:-3,frota:-2,seguranca:-3}, avaliacao:"ruim", ensinamento:"Migrar para PJ como resposta a acidente de trabalho é percebido como precarização, não como solução. Aumenta o risco jurídico de vínculo empregatício disfarçado." }
    ]
  },
  { title: "Startup de Drone Delivery Propõe Parceria",
    description: "Uma startup de drone delivery com tecnologia homologada pela ANAC propõe parceria: você opera o hub de distribuição, eles operam os drones para última milha em dois bairros nobres de São Paulo. O custo por entrega cai 40% nessas zonas, mas a parceria exige exclusividade por 18 meses.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar a parceria como piloto em escala limitada — 2 bairros, sem exclusividade total", effects:{processos:+4,clientes:+3,financeiro:-2,tecnologia:+3}, avaliacao:"boa", ensinamento:"Pilotos com tecnologia emergente permitem aprender sem comprometer toda a operação. Negociar para reduzir a exclusividade mantém a flexibilidade de expandir para outros players." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Aceitar com exclusividade total — ser pioneiro em drone delivery cria vantagem competitiva real", requisitos:{indicadorMinimo:{financeiro:9},semFlags:["crescimento_sem_caixa"]}, effects:{processos:+3,clientes:+4,financeiro:-4,rh:-2,tecnologia:+4}, avaliacao:"media", ensinamento:"Exclusividade com startup não consolidada trava a estratégia por 18 meses. Se o piloto falhar, você carrega o ônus sem alternativa." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Adquirir participação na startup em vez de parceria operacional", effects:{financeiro:-6,processos:+3,clientes:+2,tecnologia:+5}, avaliacao:"media", ensinamento:"Investir na startup alinha os incentivos e dá acesso à tecnologia a longo prazo. O risco é a distração de gestão e o capital imobilizado numa empresa ainda em validação." },
      { text:"Recusar — drone delivery ainda não está regulamentado para escala e o risco operacional é alto", effects:{processos:+1,clientes:-2,tecnologia:-1}, avaliacao:"media", ensinamento:"Prudência com tecnologia não validada em escala é razoável. Mas recusar por completo perde a janela de aprendizado com custo baixo." }
    ]
  },
  { title: "Greve dos Entregadores por 48 Horas",
    description: "Entregadores de 3 CDs paralisaram por 48 horas reivindicando reajuste de 15% e seguro de acidentes melhorado. O cliente principal tem pedidos urgentes represados. O advogado diz que a paralisação é ilegal por falta de aviso prévio.",
    tags: ["logistica"],
    choices: [
      { text:"Entrar na negociação reconhecendo as demandas legítimas e propondo um acordo em 24 horas", effects:{rh:+5,clientes:-2,financeiro:-3,sla:-1,seguranca:+2}, avaliacao:"boa", ensinamento:"Negociar de boa fé com trabalhadores em greve é mais eficiente do que confrontação jurídica." },
      { text:"Acionar o advogado para impetrar interdito proibitório e retomar a operação por via judicial", effects:{rh:-6,clientes:-1,processos:+2,seguranca:-2}, avaliacao:"ruim", ensinamento:"Resolução judicial de greve gera ressentimento que dura anos. O custo do litígio e do clima organizacional deteriorado supera o ganho operacional de curto prazo." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+1}, text:"Atender o reajuste de 15% e o seguro — custará R$ 280k/ano mas encerra a crise", effects:{rh:+6,financeiro:-4,processos:+2,seguranca:+3,sla:+1}, avaliacao:"boa", ensinamento:"Custo de greve continuada supera o custo do acordo em operações de escala. R$ 280k/ano em reajuste e seguro é contabilmente justificável." },
      { text:"Propor reajuste de 8% e criar comitê de melhoria de condições para discutir o restante", effects:{rh:+3,financeiro:-2,processos:+1}, avaliacao:"media", ensinamento:"Proposta intermediária pode ser percebida como boa fé ou como procrastinação. Em greves, a percepção coletiva define se a paralisação continua." }
    ]
  },
  { title: "Concorrente Faz Dumping de Preço",
    description: "Um concorrente financiado por venture capital lançou operação na mesma praça com preço 35% abaixo do seu. O mercado sabe que o preço é insustentável — mas dois clientes médios já migraram. Seu time de vendas está pedindo autorização para reduzir o preço nos contratos em renovação.",
    tags: ["logistica"],
    choices: [
      { text:"Não reduzir o preço — mostrar aos clientes o custo total de mudança de operador e os riscos de SLA", effects:{clientes:+3,financeiro:+3,rh:+2,sla:+1}, avaliacao:"boa", ensinamento:"Competir em valor, não em preço, é a postura correta frente a dumping. O custo de migração de um operador logístico frequentemente supera o desconto oferecido." },
      { text:"Criar pacote premium com SLA garantido e rastreamento em tempo real para clientes que não querem risco", effects:{clientes:+4,processos:+3,financeiro:-2,sla:+3,tecnologia:+2}, avaliacao:"boa", ensinamento:"Diferenciação por nível de serviço é a resposta estratégica ao dumping de preço. Clientes que valorizam confiabilidade pagam prêmio por garantia." },
      { text:"Reduzir o preço para 15% abaixo do concorrente para recuperar os clientes perdidos", effects:{financeiro:-7,clientes:+2,sla:-1}, avaliacao:"ruim", ensinamento:"Entrar na guerra de preços com player capitalizado por VC é batalha que operadores tradicionais raramente vencem. Margem destruída hoje não volta quando o concorrente ajustar o modelo." },
      { text:"Propor contratos de longo prazo (3 anos) com cláusula de reajuste garantida para os clientes atuais", effects:{financeiro:+3,clientes:+4,processos:+2,sla:+2}, avaliacao:"boa", ensinamento:"Contratos longos criam estabilidade de receita e elevam o custo de saída para o cliente. Quem assina um contrato de 3 anos não migra para o concorrente mais barato no mês seguinte." }
    ]
  },
  { title: "O Contrato do Cliente Principal Entra em Renegociação",
    description: "O cliente que representa 38% da receita entrou oficialmente em processo de renegociação. Eles querem redução de 18% no preço e melhoria de SLA de 48h para 36h. Apresentaram proposta concorrente como argumento. Você tem 15 dias para responder.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar 10% de redução e comprometer-se com SLA de 40h — ponto de equilíbrio viável", effects:{financeiro:-3,clientes:+5,processos:+2,sla:+3}, avaliacao:"boa", ensinamento:"Negociação que encontra ponto de equilíbrio preserva o relacionamento sem destruir a margem. Aceitar 10% de redução é custo real, mas perder 38% da receita seria um choque impossível de absorver." },
      { text:"Recusar qualquer redução de preço mas oferecer melhorias operacionais como serviços adicionais", effects:{clientes:+2,processos:+3,financeiro:+2,sla:+1}, avaliacao:"media", ensinamento:"Defender o preço com valor adicionado é válido se os serviços propostos têm valor real para o cliente. Se o concorrente tem proposta concreta e você não move, o risco de perda é alto." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-1,capitalPolitico:+2}, text:"Aceitar as condições integralmente — perder esse cliente não é opção", effects:{financeiro:-5,clientes:+3,sla:+1}, avaliacao:"ruim", ensinamento:"Aceitar 18% de redução em 38% da receita é impacto de 6,8% no faturamento total. Além disso, cria precedente: o cliente sabe que pode extrair mais na próxima renovação." },
      { text:"Usar os 15 dias para fechar 3 novos contratos médios e renegociar do zero com mais alternativas", effects:{financeiro:-2,clientes:+4,processos:-2,sla:-1}, avaliacao:"media", ensinamento:"Diversificar antes de negociar melhora o poder de barganha estruturalmente. O risco é que 15 dias podem não ser suficientes para fechar novos contratos que compensem a perda potencial." }
    ]
  },
  { title: "Proposta de Expansão para Mais 3 Estados",
    description: "Um fundo de infraestrutura quer financiar a expansão para 3 novos estados com R$ 12M, em troca de 22% da empresa. A operação atual ainda está sob pressão de SLA. Expandir significa abrir 5 novos CDs, contratar 200 entregadores e replicar uma operação que ainda não está funcionando perfeitamente.",
    tags: ["logistica"],
    choices: [
      { text:"Recusar e resolver os problemas operacionais da operação atual antes de qualquer expansão", effects:{processos:+5,rh:+3,financeiro:-1,sla:+4,frota:+2}, avaliacao:"boa", ensinamento:"Expandir operação com SLA quebrado é exportar o problema para novos mercados. Crescer com disfunção operacional multiplica os custos de retrabalho." },
      { text:"Aceitar com condição de expansão apenas após 6 meses de SLA acima de 95% na operação atual", effects:{financeiro:+4,processos:+3,clientes:+2,sla:+2}, avaliacao:"boa", ensinamento:"Condicionar expansão a meta operacional protege a empresa e o investidor. Fundos sérios respeitam gestores que sabem dizer não ao capital prematuro." },
      { risco:"alto", gestorEffects:{capitalPolitico:+3,esgotamento:+3}, text:"Aceitar e expandir imediatamente — o capital resolve o problema de capacidade", requisitos:{faseEmpresa:["crescimento","consolidacao","expansao"],indicadorMinimo:{processos:9}}, effects:{financeiro:+6,processos:-6,rh:-4,clientes:-3,sla:-4}, avaliacao:"ruim", ensinamento:"Capital não resolve problema operacional — só o amplifica. Abrir 5 CDs e contratar 200 pessoas com SLA a 31% de descumprimento cria o caos em escala." },
      { risco:"medio", gestorEffects:{capitalPolitico:+1}, text:"Propor expansão para apenas 1 estado como piloto com R$ 4M e 12% da empresa", effects:{financeiro:+3,processos:-2,clientes:+2,sla:-1}, avaliacao:"media", ensinamento:"Piloto em um estado equilibra a oportunidade de crescimento com o risco operacional. O acordo menor testa a capacidade de replicação antes de comprometer o capital e a participação total." }
    ]
  },
  { title: "Automação dos CDs: Robôs ou Humanos?",
    description: "Uma empresa de automação industrial propõe instalar esteiras automatizadas e robôs de triagem nos 3 maiores CDs. Redução de 35% no custo por pacote triado. Investimento de R$ 4,2M. O projeto torna 47 postos de trabalho de triagem desnecessários.",
    tags: ["logistica"],
    choices: [
      { text:"Implementar automação com plano de requalificação: os 47 operadores migram para controle e manutenção", effects:{processos:+6,financeiro:-3,rh:-2,tecnologia:+4,sla:+3}, avaliacao:"boa", ensinamento:"Automação com requalificação ativa é a transição mais sustentável. Reduz o custo operacional e preserva o conhecimento institucional." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-3,capitalPolitico:+2}, text:"Implementar automação e desligar os 47 funcionários com indenização justa", effects:{processos:+7,financeiro:-5,rh:-6,tecnologia:+5,sla:+3}, avaliacao:"media", ensinamento:"Desligamento com indenização é juridicamente correto mas tem custo de reputação como empregador em mercado onde você precisa contratar constantemente." },
      { text:"Implementar automação apenas nos 2 CDs com maior custo operacional e avaliar antes de expandir", effects:{processos:+4,financeiro:-2,rh:-1,tecnologia:+3,sla:+2}, avaliacao:"boa", ensinamento:"Implementação faseada reduz o risco técnico e social da automação. Dois CDs como piloto provam o ROI antes de comprometer capital nos outros 6." },
      { text:"Recusar — automação cria dependência tecnológica e vulnerabilidade operacional em caso de falha", effects:{rh:+3,processos:-3,financeiro:-2,tecnologia:-1}, avaliacao:"ruim", ensinamento:"Recusar automação por medo de dependência tecnológica mantém estrutura de custo não competitiva. A vulnerabilidade existe no sistema humano também." }
    ]
  },
  { title: "Proposta de White Label para E-commerce",
    description: "Um e-commerce regional quer que você opere toda a logística deles com marca branca. O contrato vale R$ 3,8M por 2 anos e exige exclusividade de atendimento em 3 cidades. Pode parecer bom, mas significa desviar capacidade dos seus próprios clientes.",
    tags: ["logistica"],
    choices: [
      { text:"Aceitar apenas se tiver capacidade ociosa real e sem impactar o SLA dos clientes atuais", effects:{financeiro:+4,clientes:+2,processos:+2,sla:+1}, avaliacao:"boa", ensinamento:"White label é margem adicional quando há capacidade disponível. Aceitá-lo às custas do SLA dos clientes atuais é trocar um relacionamento consolidado por um novo contrato que pode não renovar." },
      { text:"Aceitar e contratar os recursos adicionais necessários para atender sem impacto na operação atual", effects:{financeiro:+3,rh:-3,processos:-2,frota:-1}, avaliacao:"media", ensinamento:"Contratar para atender white label funciona se o prazo de contratação e treinamento for menor que o prazo de início do contrato." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+1}, text:"Recusar — white label dilui a marca e desvia foco da operação principal", effects:{processos:+2,clientes:-1}, avaliacao:"media", ensinamento:"Recusar white label por princípio ignora R$ 3,8M de receita em contrato de 2 anos. O dilema da marca é real, mas o impacto financeiro justifica análise séria." },
      { risco:"alto", gestorEffects:{capitalPolitico:+1,esgotamento:+2}, text:"Criar subsidiária operacional dedicada ao white label para separar as marcas e os times", requisitos:{indicadorMinimo:{financeiro:10},semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:-2,processos:+3,rh:-2,tecnologia:+1}, avaliacao:"media", ensinamento:"Subsidiária separada preserva a marca e isola o risco operacional. O custo de criar e operar uma entidade jurídica separada precisa ser comparado com a margem do contrato." }
    ]
  },
  { title: "Oportunidade de Contrato com o Governo",
    description: "Uma secretaria estadual de saúde precisa de operador logístico para distribuir insumos médicos em 127 municípios. Contrato de R$ 8,4M por 3 anos. As exigências são complexas: rastreabilidade em tempo real, temperatura controlada e SLA de 24h mesmo em municípios remotos.",
    tags: ["logistica"],
    choices: [
      { risco:"medio", text:"Propor piloto em 30 municípios para validar a operação antes de assumir os 127", effects:{financeiro:+3,processos:+3,clientes:+2,tecnologia:+3,sla:+1}, avaliacao:"boa", ensinamento:"Piloto com governo é a forma mais segura de entrar em setor com exigências técnicas que você ainda não validou operacionalmente." },
      { text:"Aceitar o contrato completo e adquirir os equipamentos de temperatura controlada necessários", effects:{financeiro:+5,processos:-3,rh:-2,clientes:-2,frota:-1}, avaliacao:"media", ensinamento:"Insumos médicos com rastreabilidade e temperatura controlada exigem competência técnica específica. Entrar nos 127 municípios sem pilotar é exposição a multas contratuais." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Recusar — logística de saúde é segmento especializado fora do core da empresa", effects:{processos:+2,financeiro:-2}, avaliacao:"media", ensinamento:"Disciplina estratégica em não entrar em segmentos que exigem competência não desenvolvida é válida. Contratos governamentais de saúde têm penalidades severas por descumprimento de SLA." },
      { text:"Aceitar em parceria com empresa especializada em logística de saúde — dividir receita e risco", effects:{financeiro:+3,processos:+4,clientes:+2,tecnologia:+2,sla:+2}, avaliacao:"boa", ensinamento:"Parceria para entrar em mercado com competência complementar é a forma mais inteligente de capturar a oportunidade sem assumir risco técnico solo." }
    ]
  },
  { title: "O Futuro da Operação: Qual Logística Você Quer Ser?",
    description: "Após um ciclo de transformação intensa, o mercado de logística continua mudando rápido. Você precisa definir o posicionamento estratégico para os próximos 3 anos.",
    tags: ["logistica"],
    choices: [
      { text:"Tech-first: investir em TMS próprio, roteirização por IA e dashboard em tempo real para os clientes", effects:{financeiro:-3,processos:+7,clientes:+5,rh:+2,tecnologia:+7,sla:+4}, avaliacao:"boa", ensinamento:"Logística orientada a tecnologia cria diferenciação difícil de replicar para operadores tradicionais. Visibilidade em tempo real e roteirização inteligente são diferenciais que clientes enterprise pagam prêmio para ter." },
      { text:"Especialista em nicho: focar em cold chain (temperatura controlada) para farmácias e alimentos", effects:{financeiro:+4,clientes:+4,processos:+5,rh:+2,frota:+3,sla:+3}, avaliacao:"boa", ensinamento:"Especialização em nicho com barreiras técnicas cria pricing power e relacionamentos mais longos. Cold chain exige certificação, equipamento e know-how." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+3}, text:"Expansão geográfica agressiva: cobrir todos os estados antes de otimizar a operação existente", requisitos:{faseEmpresa:["crescimento","consolidacao","expansao"],semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:+3,processos:-6,rh:-4,clientes:-3,sla:-4}, avaliacao:"ruim", ensinamento:"Expansão geográfica com operação não otimizada exporta os problemas em escala. O resultado é SLA ruim em mais mercados." },
      { text:"Plataforma de logística: criar marketplace que conecta CDs, frota e entregadores independentes", effects:{financeiro:-2,clientes:+4,processos:+4,rh:-1,tecnologia:+5,sla:+2}, avaliacao:"boa", ensinamento:"Marketplace logístico cria escalabilidade sem o custo de ativo fixo. O risco é o problema do ovo e da galinha — precisa de oferta e demanda simultâneas para funcionar." }
    ]
  }
]
]; // fim LogisticaRounds
/* --rounds/industria-rounds.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · INDÚSTRIA · ROUNDS v5.0
   8 indicadores: financeiro, rh, clientes, processos,
                  seguranca, manutencao, qualidade, conformidade
═══════════════════════════════════════════════════════ */

const IndustriaRounds = [
[
  { title: "O Relatório de Segurança",
    description: "Márcio, seu gerente de segurança do trabalho, apresenta dados alarmantes: 14 acidentes com afastamento no último ano — o dobro da média do setor. O IFA está em 18,4 quando o benchmark nacional é 8,2. O Ministério do Trabalho pode iniciar fiscalização a qualquer momento.",
    tags: ["industria"],
    choices: [
      { text:"Mapear as causas-raiz de cada acidente com análise de árvore de falhas antes de qualquer ação", effects:{processos:+4,rh:+2,seguranca:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Análise de causa-raiz é o único caminho para eliminar acidentes estruturalmente. Sem entender por que os acidentes acontecem, qualquer investimento em segurança é paliativo." },
      { text:"Contratar empresa de consultoria em segurança do trabalho para auditoria completa", effects:{financeiro:-3,processos:+3,seguranca:+2,conformidade:+2}, avaliacao:"media", ensinamento:"Auditoria externa traz imparcialidade e benchmark de melhores práticas. O risco é o tempo de contratação e diagnóstico — durante o qual o IFA continua elevado." },
      { text:"Investir R$ 800k em EPIs novos e sinalização de segurança imediatamente", effects:{financeiro:-4,processos:+2,rh:-1,seguranca:+2}, avaliacao:"media", gestorEffects:{esgotamento:+1}, ensinamento:"EPIs e sinalização são necessários, mas atacam os sintomas. Se o problema é comportamental, de processo ou de equipamento, o investimento em EPI não muda o IFA estruturalmente." },
      { text:"Aumentar os treinamentos de segurança para toda a força de trabalho", effects:{rh:+3,processos:+2,financeiro:-2,seguranca:+2,conformidade:+1}, avaliacao:"media", ensinamento:"Treinamento é necessário mas não suficiente quando o IFA é o dobro do mercado. Acidentes frequentemente acontecem por falha de processo ou equipamento inadequado." }
    ]
  },
  { title: "A Máquina Mais Crítica Parou",
    description: "A prensa hidráulica principal — responsável por 60% da produção — parou por falha no sistema hidráulico. A peça para reparo tem 45 dias de prazo de importação. A alternativa é um reparo provisório que dura estimados 30 dias, custando R$ 95k, com risco de parada total novamente.",
    tags: ["industria"],
    choices: [
      { text:"Pedir o reparo provisório e pedir a peça original simultaneamente para garantir continuidade", effects:{financeiro:-4,processos:+5,clientes:+2,manutencao:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Solução em paralelo garante produção enquanto a peça correta chega. Em indústria, parar a linha é a decisão mais cara — mesmo um reparo provisório com custo extra vale para manter os contratos." },
      { text:"Aguardar os 45 dias pela peça original sem fazer o reparo provisório", effects:{clientes:-5,financeiro:-3,rh:-2,manutencao:-2}, avaliacao:"ruim", gestorEffects:{capitalPolitico:-1,esgotamento:+1}, ensinamento:"Parar 60% da produção por 45 dias para esperar a peça certa destrói contratos e moral do time. O custo de manter a linha rodando com reparo provisório é sempre menor que o custo de parar." },
      { text:"Subcontratar a produção das peças para um concorrente durante os 45 dias de espera", effects:{financeiro:-5,clientes:+4,processos:-1,qualidade:-1}, avaliacao:"boa", ensinamento:"Subcontratação emergencial mantém os clientes abastecidos mesmo sem capacidade própria. O custo é maior, mas preserva o relacionamento e a receita dos contratos críticos." },
      { text:"Comunicar os clientes sobre a parada e negociar atraso no prazo de entrega", effects:{clientes:-3,financeiro:-2,conformidade:-1}, avaliacao:"media", ensinamento:"Transparência com clientes industriais é positiva, mas entrega atrasada em indústria frequentemente gera penalidade contratual e abre a porta para o cliente buscar fornecedores alternativos." }
    ]
  },
  { title: "A ISO 9001 Está em Risco",
    description: "A auditoria de manutenção da ISO 9001 identificou 4 não-conformidades críticas: rastreabilidade de matéria-prima incompleta, registros de calibração em atraso em 3 equipamentos, e procedimentos de inspeção desatualizados. A certificadora deu 90 dias para correção ou a certificação será suspensa. Dois clientes exigem ISO como condição de contrato.",
    tags: ["industria"],
    choices: [
      { risco:"baixo", text:"Montar força-tarefa interna com os responsáveis de cada área para corrigir em 60 dias", effects:{processos:+6,rh:+2,financeiro:-1,qualidade:+4,conformidade:+5}, avaliacao:"boa", ensinamento:"Força-tarefa com prazo claro e responsáveis definidos é a forma mais eficiente de corrigir não-conformidades de ISO. O engajamento interno cria conhecimento que consultoria externa não deixa." },
      { risco:"medio", text:"Contratar consultoria de qualidade para corrigir as não-conformidades e preparar a reauditoria", effects:{financeiro:-4,processos:+5,qualidade:+3,conformidade:+4}, avaliacao:"media", ensinamento:"Consultoria de qualidade é mais rápida na correção mas cria dependência. Se as pessoas internas não aprendem os requisitos, a próxima auditoria vai encontrar os mesmos problemas." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-1,capitalPolitico:-2}, text:"Comunicar os dois clientes sobre o risco e propor contrato de qualidade alternativo temporário", effects:{clientes:-4,processos:+1,conformidade:-3}, avaliacao:"ruim", ensinamento:"Informar clientes que exigem ISO de que a certificação está em risco antes de resolver o problema é antecipar a crise sem solução. Corrija primeiro, comunique depois." },
      { text:"Terceirizar o processo de documentação de qualidade para resolver as não-conformidades burocráticas", effects:{processos:+3,financeiro:-3,rh:-2,qualidade:+1,conformidade:+2}, avaliacao:"media", ensinamento:"Terceirizar documentação de qualidade resolve o papel, mas não o processo. A certificadora vai auditar a operação real, não os documentos." }
    ]
  },
  { title: "Custo de Energia em Alta Histórica",
    description: "A conta de energia elétrica subiu 68% nos últimos 18 meses, representando agora 23% do custo de produção. O time de engenharia identificou que os equipamentos mais antigos consomem 40% mais energia que os equivalentes modernos.",
    tags: ["industria"],
    choices: [
      { text:"Investir em energia solar — 1.200 painéis cobrem 55% do consumo atual com payback de 4,5 anos", effects:{financeiro:-6,processos:+5,clientes:+2,conformidade:+2}, avaliacao:"boa", ensinamento:"Energia solar em indústria tem payback comprovado e cria previsibilidade de custo. A volatilidade tarifária desaparece para a parcela coberta pelos painéis." },
      { text:"Migrar para o mercado livre de energia elétrica e negociar contrato de 5 anos com gerador próprio", effects:{financeiro:+3,processos:+3,clientes:+1,manutencao:+1}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Mercado livre de energia é a alavanca mais rápida para redução de custo de eletricidade em grandes consumidores industriais. A redução média é de 15 a 25% em relação à tarifa cativa." },
      { text:"Substituir os 5 equipamentos mais antigos por versões modernas 40% mais eficientes", effects:{financeiro:-5,processos:+4,rh:-1,manutencao:+4}, avaliacao:"boa", ensinamento:"Equipamentos modernos pagam a diferença de energia em 3 a 5 anos na maioria dos casos industriais. A substituição ataca a causa-raiz do consumo excessivo." },
      { text:"Reduzir o turno de produção para horários de tarifa reduzida e aumentar estoque", effects:{financeiro:+2,processos:-3,rh:-3,qualidade:-1}, avaliacao:"ruim", gestorEffects:{reputacaoInterna:-1,esgotamento:+1}, ensinamento:"Adaptar o horário de produção à tarifa cria rigidez operacional e deteriora o time. O custo de estoque adicional e horas extras frequentemente supera a economia de energia." }
    ]
  },
  { title: "O Maior Cliente Exige Certificação de Sustentabilidade",
    description: "Seu maior cliente industrial comunicou que, a partir de 2026, exige de todos os fornecedores certificação de sustentabilidade ESG. O prazo é 14 meses. Sem a certificação, o contrato de R$ 4,2M/ano não será renovado.",
    tags: ["industria"],
    choices: [
      { risco:"medio", text:"Iniciar o processo de certificação ESG imediatamente com consultoria especializada", effects:{processos:+5,financeiro:-4,clientes:+3,conformidade:+4}, avaliacao:"boa", ensinamento:"14 meses é prazo apertado para certificação ESG em indústria. Iniciar agora com consultoria especializada é a decisão correta — cada mês de atraso comprime o prazo de um processo que não perdoa atalhos." },
      { risco:"baixo", gestorEffects:{reputacaoInterna:+1}, text:"Mapear internamente os requisitos e construir o sistema de gestão com a equipe própria", effects:{processos:+3,financeiro:-2,rh:+2,conformidade:+3}, avaliacao:"boa", ensinamento:"Construção interna cria conhecimento duradouro e engajamento do time. O risco é a inexperiência em certificação ESG gerar retrabalho e perder o prazo do contrato." },
      { risco:"medio", gestorEffects:{capitalPolitico:-1}, text:"Negociar com o cliente uma extensão de 6 meses do prazo para adequação", effects:{clientes:-2,processos:+2,conformidade:+1}, avaliacao:"media", ensinamento:"Pedir prazo adicional demonstra boa fé, mas em ESG, o cliente está atendendo pressão dos próprios investidores. Clientes frequentemente não têm flexibilidade para conceder extensões nessas condições." },
      { text:"Avaliar se o custo de certificação justifica o contrato ou se é melhor buscar novos clientes sem exigência ESG", effects:{clientes:-4,financeiro:-2,conformidade:-2}, avaliacao:"ruim", ensinamento:"ESG está se tornando requisito universal no mercado industrial, não diferencial de clientes específicos. Fugir da certificação hoje é perder mais contratos amanhã." }
    ]
  },
  { title: "Acidente Grave com Afastamento de 60 Dias",
    description: "Um funcionário do setor de prensagem sofreu acidente grave com amputação parcial de dois dedos. O CIPA foi acionado, a CAT foi emitida e o processo de investigação está em curso. A operação da prensa foi suspensa preventivamente. O Ministério do Trabalho comunicou inspeção em 72 horas.",
    tags: ["industria"],
    choices: [
      { text:"Suspender toda a linha de prensagem, acionar a investigação interna e preparar a documentação para o MTE", effects:{processos:+5,rh:+3,financeiro:-3,clientes:-2,seguranca:+4,conformidade:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Cooperação total com o Ministério do Trabalho é a postura que reduz o risco de autuação severa. Suspender a linha proativamente demonstra compromisso com segurança além do mínimo legal." },
      { text:"Retomar a operação com reforço de supervisão enquanto a investigação corre", effects:{clientes:+1,processos:-5,rh:-5,seguranca:-4,conformidade:-3}, avaliacao:"ruim", gestorEffects:{reputacaoInterna:-2,capitalPolitico:-1}, ensinamento:"Retomar operação no equipamento envolvido no acidente antes da investigação é imprudente juridicamente e moralmente. O MTE pode multar e interditar a planta inteira se perceber negligência pós-acidente." },
      { text:"Contratar advogado trabalhista e preparar defesa antes da inspeção do MTE", effects:{financeiro:-3,processos:+2,rh:-2,conformidade:+1}, avaliacao:"media", ensinamento:"Suporte jurídico é necessário, mas a postura não pode ser apenas defensiva. O MTE avalia o comportamento pós-acidente — empresa que se prepara para se defender antes de investigar a causa envia o sinal errado." },
      { text:"Comunicar ao funcionário e à família o suporte integral da empresa e anunciar revisão de todo o processo produtivo", effects:{rh:+6,processos:+3,clientes:+1,financeiro:-2,seguranca:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+2}, ensinamento:"Suporte genuíno ao trabalhador acidentado e comprometimento público com mudança são as atitudes que constroem cultura de segurança real. Empresas que tratam acidentes com burocracia têm o próximo acidente mais cedo." }
    ]
  },
  { title: "O Principal Engenheiro Quer Aposentar em 6 Meses",
    description: "Roberto, engenheiro sênior com 26 anos de empresa, é o único que domina completamente a manutenção dos equipamentos mais antigos. Ele quer se aposentar em 6 meses. O conhecimento que ele carrega não está documentado em nenhum lugar.",
    tags: ["industria"],
    choices: [
      { text:"Criar programa de mentoria intensiva: Roberto treina 2 engenheiros júnior nos próximos 6 meses", effects:{rh:+5,processos:+5,financeiro:-2,manutencao:+3}, avaliacao:"boa", ensinamento:"Mentoria intensiva é a forma mais eficiente de transferir conhecimento tácito. Conhecimento de manutenção industrial não se documenta — se demonstra e pratica." },
      { text:"Contratar engenheiro sênior externo para absorver o conhecimento de Roberto nos 6 meses", effects:{financeiro:-4,processos:+3,rh:+1,manutencao:+2}, avaliacao:"media", ensinamento:"Contratar experiência externa é mais rápido que treinar do zero, mas absorver 26 anos de conhecimento específico daquela planta em 6 meses é ambicioso." },
      { text:"Propor à Roberto estender por mais 2 anos com aumento de 30% e redução para 20h semanais", effects:{financeiro:-3,rh:+3,processos:+4,manutencao:+4}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Regime de meio período como consultor-sênior é solução elegante para especialistas próximos da aposentadoria. Preserva o acesso ao conhecimento enquanto a transferência acontece com menos urgência." },
      { text:"Mapear e documentar os procedimentos de manutenção em vídeo e manual antes que ele saia", effects:{processos:+3,rh:-1,manutencao:+1}, avaliacao:"media", ensinamento:"Documentação é necessária mas não suficiente para conhecimento técnico profundo. Manutenção industrial tem dimensão tácita que vídeo não captura — a decisão em campo vem da experiência acumulada." }
    ]
  },
  { title: "Cliente Exige Redução de Prazo de Entrega de 30 para 15 Dias",
    description: "O cliente que representa 28% da receita exige redução do prazo de entrega de 30 para 15 dias a partir do próximo contrato. A produção atual não suporta esse ritmo sem investimento em capacidade ou redesenho do processo produtivo.",
    tags: ["industria"],
    choices: [
      { text:"Investir em sistema de produção puxada (kanban) para reduzir o lead time de 30 para 18 dias", effects:{processos:+6,financeiro:-3,clientes:+3,qualidade:+2}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Lean manufacturing e kanban são o padrão para redução de lead time em indústria. A produção puxada elimina o estoque intermediário e reduz o tempo de ciclo sem necessariamente aumentar a capacidade total." },
      { text:"Manter estoque avançado dos produtos mais pedidos pelo cliente para entrega em 5 dias", effects:{financeiro:-4,clientes:+5,processos:+2,qualidade:+1}, avaliacao:"boa", ensinamento:"Estoque avançado dedicado é solução rápida para redução de prazo percebido pelo cliente. O custo de capital imobilizado em estoque precisa ser comparado ao valor do contrato que será mantido ou perdido." },
      { text:"Recusar a redução de prazo e apresentar benchmark do mercado para demonstrar que 30 dias é competitivo", effects:{clientes:-5,financeiro:-3,conformidade:-1}, avaliacao:"ruim", gestorEffects:{capitalPolitico:-1,esgotamento:+1}, ensinamento:"Argumentar com benchmark em vez de buscar a solução é postura que deteriora o relacionamento. O cliente sabe o que o mercado dele exige melhor do que qualquer benchmark setorial." },
      { text:"Aceitar os 15 dias para o próximo contrato e iniciar urgentemente o redesenho do processo produtivo", effects:{processos:-3,clientes:+3,rh:-3,financeiro:-2,qualidade:-2}, avaliacao:"media", ensinamento:"Aceitar sem estar pronto cria risco de descumprimento. Se o redesenho do processo levar mais tempo do que o prazo do contrato, você entrega atrasado e ainda perde a confiança do cliente." }
    ]
  },
  { title: "Greve Geral na Categoria",
    description: "O sindicato dos metalúrgicos decretou greve geral na categoria por 5 dias, exigindo reajuste de 12% acima da inflação. A câmara de arbitragem mediará em 72 horas. Sua empresa tem 310 funcionários — se eles aderirem, 40% da produção do mês estará comprometida.",
    tags: ["industria"],
    choices: [
      { text:"Participar ativamente da negociação patronal coletiva pela câmara de arbitragem", effects:{rh:+4,processos:+3,financeiro:-2,conformidade:+1}, avaliacao:"boa", ensinamento:"Negociação coletiva com mediação é mais eficiente que gestão individual de greve. Acordos coletivos têm mais legitimidade junto ao sindicato e ao time." },
      { text:"Antecipar acordo interno com os funcionários antes que a greve chegue à sua planta", effects:{rh:+6,financeiro:-4,processos:+2,seguranca:+1}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+2}, ensinamento:"Antecipar o acordo individualmente cria um sinal de valorização do time que vai além do salário. Funcionários que percebem que a empresa foi ao seu encontro antes da pressão têm nível de lealdade muito maior." },
      { text:"Aguardar o resultado da câmara sem ação prévia — mover antes é pagar mais desnecessariamente", effects:{rh:-3,clientes:-2,financeiro:+1}, avaliacao:"media", ensinamento:"Aguardar o resultado coletivo é financeiramente racional, mas o time percebe que a empresa só cedeu por pressão — não por reconhecimento. O custo de engajamento da passividade é real." },
      { text:"Declarar serviços essenciais e exigir manutenção de 60% da operação com base jurídica", effects:{rh:-6,processos:-3,financeiro:-2,conformidade:-2}, avaliacao:"ruim", gestorEffects:{reputacaoInterna:-2,esgotamento:+1}, ensinamento:"Em indústria metalúrgica, caracterizar serviços essenciais é juridicamente controverso e cria confronto que dura além da greve. Times que se sentem tratados como adversários entregam menos depois do conflito." }
    ]
  },
  { title: "Matéria-Prima Importada com Dólar em Alta",
    description: "O dólar subiu 34% em 8 meses. O aço importado que você usa em 40% dos produtos subiu junto. Seu custo de matéria-prima aumentou R$ 1,1M/mês. Os contratos com clientes têm preço fixo pelos próximos 6 meses.",
    tags: ["industria"],
    choices: [
      { text:"Negociar com os clientes uma cláusula de reajuste por variação cambial nos próximos 30 dias", effects:{clientes:-2,financeiro:+4,processos:+3,conformidade:+1}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Cláusula de variação cambial é prática de mercado em contratos industriais de longo prazo. Clientes industriais entendem a dinâmica — a negociação é mais viável do que parece quando o argumento é transparente." },
      { text:"Buscar substitutos nacionais de aço para reduzir a exposição cambial", effects:{financeiro:+3,processos:-2,clientes:-1,qualidade:-1}, avaliacao:"boa", ensinamento:"Diversificação de matéria-prima reduz exposição cambial estruturalmente. O custo de desenvolvimento do fornecedor nacional é real, mas a independência do câmbio vale o investimento." },
      { text:"Contratar hedge cambial para travar o custo do dólar pelos próximos 12 meses", effects:{financeiro:+2,processos:+3,conformidade:+1}, avaliacao:"boa", ensinamento:"Hedge cambial é ferramenta padrão para empresas com custos em dólar e receita em real. O custo do hedge é previsível — muito melhor do que absorver a volatilidade cambial na margem operacional." },
      { text:"Absorver o custo por 6 meses e recuperar a margem na renovação dos contratos", effects:{financeiro:-6,processos:-1,manutencao:-1}, avaliacao:"ruim", gestorEffects:{esgotamento:+1}, ensinamento:"Absorver R$ 1,1M/mês por 6 meses são R$ 6,6M de caixa queimado. Em indústria, margem operacional negativa por um trimestre pode comprometer investimentos em segurança, manutenção e pessoal." }
    ]
  },
  { title: "Proposta de Automação Total da Linha de Prensagem",
    description: "Uma integradora industrial apresentou proposta de automação completa da linha de prensagem com braços robóticos: elimina 45 postos de operação, reduz o custo por peça em 38%, aumenta a precisão em 62% e elimina o risco de acidente nessa linha. Investimento de R$ 6,8M com payback projetado de 5 anos.",
    tags: ["industria"],
    choices: [
      { text:"Aceitar com plano de requalificação: os 45 operadores migram para manutenção, qualidade e programação", effects:{processos:+7,financeiro:-4,rh:-2,clientes:+3,seguranca:+5,qualidade:+4}, avaliacao:"boa", ensinamento:"Automação com requalificação é o caminho mais sustentável. Operadores que conhecem a linha são os mais rápidos de treinar para manutenção dos robôs." },
      { text:"Implementar automação apenas nas 3 operações com maior índice de acidente, não a linha completa", effects:{processos:+4,financeiro:-3,rh:-1,clientes:+1,seguranca:+4}, avaliacao:"boa", ensinamento:"Automação seletiva dos pontos críticos de segurança equilibra investimento e resultado. Reduz o risco de acidente onde ele é mais frequente sem comprometer o modelo de emprego atual integralmente." },
      { text:"Recusar — R$ 6,8M é capital que pode ser usado para ampliação de capacidade e novos contratos", effects:{financeiro:+2,processos:-3,rh:+3,seguranca:-1}, avaliacao:"media", ensinamento:"Recusar automação industrial em linha crítica por alocação de capital é decisão que precisa de análise rigorosa. 5 anos de payback com 38% de redução de custo e zero acidente é difícil de superar." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-3,capitalPolitico:+2}, text:"Implementar a automação e desligar os 45 operadores com pacote de indenização", requisitos:{semFlags:["lideranca_toxica","demissao_em_massa"]}, effects:{processos:+7,rh:-7,financeiro:-6,clientes:+2,seguranca:+4}, avaliacao:"ruim", ensinamento:"Desligamento em massa sem requalificação tem custo jurídico, de reputação e operacional. Indenizações de 45 trabalhadores com tempo de casa elevado podem consumir parte significativa da economia projetada." }
    ]
  },
  { title: "Oportunidade de Exportar para a América Latina",
    description: "Um distribuidor argentino quer importar seus produtos para Argentina, Chile e Paraguai. Potencial de R$ 2,8M adicionais por ano. A operação exige adaptação de embalagem, certificações de conformidade em cada país e capacidade produtiva adicional de 18%.",
    tags: ["industria"],
    choices: [
      { text:"Aceitar com piloto de 12 meses só para Argentina — o menor dos três mercados com menor complexidade", effects:{financeiro:+3,clientes:+3,processos:+2,conformidade:+2}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Piloto em um mercado antes de comprometer toda a operação de exportação é a forma mais inteligente de aprender. Argentina tem complexidade regulatória menor que os outros dois para metalúrgica." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+2}, text:"Aceitar os três mercados e contratar a integradora para ampliar a capacidade em 18%", requisitos:{indicadorMinimo:{financeiro:9},semFlags:["crescimento_sem_caixa"]}, effects:{financeiro:-4,clientes:+5,processos:-3,rh:-2,qualidade:-1}, avaliacao:"media", ensinamento:"Ampliar capacidade para exportar sem ter validado o canal de distribuição é risco real. Contratos de exportação frequentemente enfrentam barreiras regulatórias e logísticas que projeções não capturam." },
      { text:"Recusar — a operação atual tem problemas suficientes para focar antes de exportar", effects:{processos:+3,clientes:-2,manutencao:+1}, avaliacao:"media", ensinamento:"Disciplina de não expandir antes de resolver operação existente é válida. Mas exportação pode trazer receita em dólar que contrabalance os custos de importação de matéria-prima." },
      { text:"Aceitar e usar parte da receita de exportação para financiar a modernização dos equipamentos", effects:{financeiro:+4,processos:+3,clientes:+3,rh:-1,manutencao:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Usar receita incremental de exportação para financiar modernização cria ciclo virtuoso sem comprometer o caixa operacional. A disciplina de alocar a receita nova para investimento evita que ela se dissolva no custo corrente." }
    ]
  },
  { title: "Fusão com Metalúrgica Complementar",
    description: "Uma metalúrgica da região produz os componentes que você hoje compra de terceiros a preço de mercado. O dono quer se aposentar e vender por R$ 4,5M. A integração vertical elimina R$ 780k/ano de custo de aquisição. Mas a empresa tem 85 funcionários, equipamentos de qualidade mista e cultura muito diferente da sua.",
    tags: ["industria"],
    choices: [
      { text:"Adquirir apenas os ativos produtivos (equipamentos e patentes) sem incorporar toda a empresa", effects:{financeiro:-3,processos:+4,rh:-1,manutencao:+2}, avaliacao:"boa", ensinamento:"Aquisição de ativos sem a empresa elimina o custo de integração cultural e trabalhista. O risco é perder os operadores que conhecem como operar esses ativos de forma eficiente." },
      { text:"Fazer due diligence rigorosa por 60 dias antes de qualquer decisão", effects:{processos:+3,financeiro:-1,conformidade:+2}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1}, ensinamento:"Due diligence em metalúrgica precisa avaliar passivo trabalhista, ambiental e de segurança — não apenas os ativos. Empresas do setor frequentemente têm contingências que não aparecem no balanço." },
      { text:"Aceitar a fusão completa e integrar as culturas ao longo de 12 meses", effects:{financeiro:-5,processos:-3,rh:-4,qualidade:-1,seguranca:-1}, avaliacao:"media", gestorEffects:{esgotamento:+2}, ensinamento:"Fusão completa é a solução mais rápida para a integração vertical, mas integrar 85 funcionários com cultura diferente enquanto a sua operação está em transformação é risco alto de disfunção nos dois lados." },
      { text:"Propor parceria de fornecimento preferencial sem aquisição — exclusividade por 5 anos", effects:{financeiro:+2,processos:+3,clientes:+1,qualidade:+1}, avaliacao:"boa", ensinamento:"Parceria de fornecimento exclusivo captura parte do benefício de integração vertical sem o custo e o risco da aquisição. O risco é o fornecedor ser vendido para terceiro que desfaz a exclusividade." }
    ]
  },
  { title: "Investidor Propõe Transformação em Indústria 4.0",
    description: "Um fundo de infraestrutura quer investir R$ 9M em troca de 30% da empresa para transformar a planta em referência de Indústria 4.0: sensores IoT em todos os equipamentos, manutenção preditiva, ERP integrado e dashboard em tempo real. O projeto levaria 18 meses para estar operacional.",
    tags: ["industria"],
    choices: [
      { text:"Aceitar com condição de 18% da empresa e plano de governança que preserve a autonomia operacional", effects:{financeiro:+6,processos:+6,rh:+2,clientes:+3,manutencao:+4,conformidade:+3}, avaliacao:"boa", gestorEffects:{capitalPolitico:+1}, ensinamento:"Negociar a participação e a governança antes de aceitar capital é a postura correta. Indústria 4.0 com capital externo pode transformar completamente a competitividade — se os termos protegerem a operação." },
      { text:"Aceitar as condições integralmente — R$ 9M resolve todos os problemas de uma vez", effects:{financeiro:+7,processos:+4,rh:-3,clientes:+2,manutencao:+3}, avaliacao:"media", ensinamento:"Capital resolve investimento mas não resolve cultura e execução. 30% de participação com fundo de infraestrutura geralmente vem com exigências de resultado que podem conflitar com a realidade operacional de 18 meses." },
      { text:"Recusar e implementar IoT em etapas com recursos próprios nos próximos 3 anos", effects:{financeiro:-3,processos:+3,rh:+1,manutencao:+2}, avaliacao:"media", ensinamento:"Implementação própria preserva o controle mas é mais lenta e fragmentada. Em mercados industriais competitivos, 3 anos sem transformação digital é tempo suficiente para perder clientes que exigem rastreabilidade." },
      { risco:"alto", gestorEffects:{reputacaoInterna:-4,capitalPolitico:+2}, text:"Aceitar e demitir 40% do time para pagar o retorno esperado pelo fundo em 5 anos", requisitos:{semFlags:["gestor_de_crise"]}, effects:{financeiro:+3,rh:-8,processos:-3,clientes:-2,seguranca:-3}, avaliacao:"ruim", ensinamento:"Corte de pessoal para pagar retorno de fundo é a sequência mais destrutiva em transformação industrial. A Indústria 4.0 precisa de pessoas que entendem os equipamentos para operar e manter os sistemas inteligentes." }
    ]
  },
  { title: "O Legado Industrial: Que Empresa Você Quer Deixar?",
    description: "Após um ciclo de transformações intensas, você precisa definir a estratégia para os próximos 5 anos. O mercado industrial está em ponto de inflexão: automação, ESG e digitalização estão redefinindo quem sobrevive.",
    tags: ["industria"],
    choices: [
      { text:"Indústria de precisão: especializando em componentes de alta complexidade com margem premium", effects:{financeiro:+5,clientes:+5,processos:+6,rh:+3,qualidade:+5,conformidade:+3}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+1,capitalPolitico:+1}, ensinamento:"Especialização em componentes de alta precisão cria barreiras técnicas que commodities não têm. Clientes que precisam de peças críticas de qualidade certificada têm baixa elasticidade de preço e alta fidelidade." },
      { text:"Fornecedora sustentável: certificação ESG completa como diferencial competitivo em contratos públicos e multinacionais", effects:{financeiro:+3,clientes:+4,processos:+5,rh:+4,seguranca:+3,conformidade:+5}, avaliacao:"boa", ensinamento:"ESG como estratégia central de posicionamento abre portas para clientes multinacionais e licitações públicas. A certificação antecipada vira vantagem enquanto os concorrentes correm para se adequar." },
      { risco:"alto", gestorEffects:{capitalPolitico:+2,esgotamento:+3}, text:"Crescimento por aquisição: comprar metalúrgicas menores para criar escala regional", requisitos:{faseEmpresa:["consolidacao","expansao"],indicadorMinimo:{financeiro:11}}, effects:{financeiro:-2,clientes:+2,processos:-4,rh:-3,manutencao:-2}, avaliacao:"ruim", ensinamento:"Estratégia de crescimento por aquisição exige time de M&A, integração cultural e caixa que metalúrgicas em transformação raramente têm simultaneamente." },
      { text:"Excelência em gestão de pessoas: se tornar a referência regional em segurança, treinamento e desenvolvimento humano", effects:{financeiro:+2,rh:+7,processos:+4,clientes:+3,seguranca:+4}, avaliacao:"boa", gestorEffects:{reputacaoInterna:+2}, ensinamento:"Excelência em gestão de pessoas em indústria pesada é diferencial escasso. Empresas com reputação de segurança e desenvolvimento atraem os melhores técnicos, reduzem a rotatividade e entregam qualidade consistentemente superior." }
    ]
  }
]
]; // fim IndustriaRounds
/* --core/engine.js-- */
/* ═══════════════════════════════════════════════════════
   BETA · ENGINE · Orquestra o fluxo completo do jogo
   v5.0 — situações por setor, gestor+imprevisto integrados,
          interdependências para todos os setores,
          melhor alternativa no feedback.
═══════════════════════════════════════════════════════ */




/* ── Situações iniciais com filtro de setor ─────────── */
const SITUACOES_INICIAIS = [
    {
        titulo:  "Batalha Judicial Trabalhista",
        resumo:  "Processo trabalhista + caixa apertado",
        setores: ["varejo", "logistica", "industria", "tecnologia"],
        historia: "Três ex-funcionários abriram um processo coletivo por horas extras não pagas dos últimos 2 anos. O valor estimado da causa é R$420 mil. Ao mesmo tempo, o caixa da empresa mal cobre os próximos 45 dias de operação. O advogado diz que as chances de perder são de 60%. Você precisa tomar decisões estratégicas com uma faca no pescoço — cada real gasto precisa ser justificado, e o time já está sentindo o clima pesado."
    },
    {
        titulo:  "Invasão do Mercado Internacional",
        resumo:  "Concorrente internacional com preços 35% menores",
        setores: ["varejo", "tecnologia", "logistica"],
        historia: "Uma multinacional europeia desembarcou no Brasil com uma campanha massiva de marketing e preços 35% abaixo dos seus. Nos últimos 30 dias, você perdeu 3 dos seus 10 maiores clientes para eles. Sua equipe comercial está em pânico, e alguns vendedores já receberam propostas do concorrente para trocar de lado. O mercado está olhando para você esperando a sua reação — ou a sua capitulação."
    },
    {
        titulo:  "Colapso da Liderança",
        resumo:  "Diretoria inteira pediu demissão",
        setores: ["tecnologia", "varejo", "industria", "logistica"],
        historia: "Em uma semana chocante, o CEO, o CFO e o COO entregaram as cartas de demissão em conjunto, alegando divergências estratégicas com os sócios. Eles levaram consigo anos de conhecimento operacional e, pior, parece que estão fundando uma empresa concorrente. A equipe está desorientada, os processos estão sem dono, e os principais clientes já ligaram perguntando o que está acontecendo. Você assume um navio sem capitão em plena tempestade."
    },
    {
        titulo:  "Vazamento Massivo de Dados",
        resumo:  "120 mil registros de clientes expostos na dark web",
        setores: ["tecnologia", "varejo"],
        historia: "Uma vulnerabilidade no sistema de autenticação expôs nome, CPF, endereço e dados de cartão de 120 mil clientes. Os dados já aparecem em fóruns da dark web. Dois clientes corporativos enviaram notificações de rescisão contratual, a imprensa está ligando, e a ANPD abriu um processo administrativo. Você tem 72 horas para comunicar o incidente oficialmente ou a multa dobra."
    },
    {
        titulo:  "Explosão de Demanda",
        resumo:  "Demanda triplicou em 30 dias — estrutura não aguenta",
        setores: ["varejo", "logistica", "industria", "tecnologia"],
        historia: "Uma menção espontânea de um influenciador com 8 milhões de seguidores fez a demanda explodir 200% em menos de um mês. O prazo de entrega que era de 5 dias agora está em 22 dias, o SAC está soterrado de reclamações, três funcionários-chave pediram demissão por excesso de trabalho, e o estoque de matéria-prima acaba em 8 dias. A janela de oportunidade está aberta — mas pode fechar com um estrondo."
    },
    {
        titulo:  "Fornecedor Principal Faliu",
        resumo:  "Fornecedor exclusivo decretou falência — 12 dias de estoque",
        setores: ["varejo", "industria", "logistica"],
        historia: "Seu único fornecedor de componentes críticos decretou falência repentinamente após um escândalo de fraude contábil. Você tem exatamente 12 dias de estoque. Já tentou contato com outros 4 fornecedores: dois não têm capacidade, um tem prazo de 45 dias para primeira entrega, e um oferece qualidade duvidosa. Três contratos grandes vencem no mês que vem com cláusula de multa por atraso. O relógio está contando."
    },
    {
        titulo:  "Recessão e Juros nas Alturas",
        resumo:  "PIB caiu 3,2% e taxa básica de juros chegou a 22%",
        setores: ["varejo", "industria", "logistica", "tecnologia"],
        historia: "O país entrou em recessão técnica e o Banco Central elevou a taxa básica de juros para 22% ao ano. Seu empréstimo de capital de giro, que custava R$18 mil/mês, agora custa R$34 mil. As vendas caíram 28% nos últimos 60 dias. Dois dos seus maiores clientes B2B pediram renegociação de prazo de pagamento para 120 dias. Sobreviver a esse ciclo vai exigir decisões difíceis."
    },
    {
        titulo:  "Crise nas Redes Sociais",
        resumo:  "Post viral com 4,2 mi de visualizações destruindo a marca",
        setores: ["varejo", "tecnologia"],
        historia: "Um influenciador com 6 milhões de seguidores postou um vídeo de 8 minutos relatando uma péssima experiência com seu produto e atendimento, com provas em tela. Em 24 horas: 4,2 milhões de visualizações, trending nos topics, 340 avaliações 1-estrela no Google e cancelamento de 87 pedidos. Concorrentes já estão fazendo posts irônicos. Sua equipe de marketing está em reunião de crise desde ontem à noite."
    },
    {
        titulo:  "Nova Regulamentação Imposta",
        resumo:  "Lei publicada: 90 dias para adequação total ou multa de R$2M",
        setores: ["industria", "logistica", "tecnologia"],
        historia: "Uma nova lei federal publicada na semana passada exige que todas as empresas do setor implementem controles específicos de rastreabilidade, proteção de dados e relatórios ESG obrigatórios. O prazo é de 90 dias. O custo estimado de adequação é entre R$280 mil e R$600 mil. Empresas que descumprirem serão multadas em até R$2 milhões e podem ter as operações suspensas. Seu concorrente principal já anunciou que vai começar a adequação imediatamente."
    },
    {
        titulo:  "Colapso na Cadeia de Entregas",
        resumo:  "Frota bloqueada + 800 entregas atrasadas",
        setores: ["logistica"],
        historia: "Uma operação policial bloqueou a principal rodovia de escoamento por 72 horas, e a sua frota ficou presa. Com isso, 800 entregas estão atrasadas, sendo 120 delas com prazo contratual já vencido e cláusula de multa de 0,5% ao dia. O sistema de rastreamento parou de atualizar por causa de uma falha de integração. Três grandes embarcadores ameaçam rescindir contrato."
    },
    {
        titulo:  "Apagão de Dados Críticos",
        resumo:  "Servidor principal corrompido — 3 anos de dados perdidos",
        setores: ["tecnologia", "logistica"],
        historia: "Uma falha em cascata no sistema de armazenamento corrompeu o banco de dados principal. Três anos de histórico de clientes, contratos, registros financeiros e propriedade intelectual estão inacessíveis. O último backup completo é de 8 meses atrás. A TI estima que a recuperação parcial levará entre 15 e 40 dias. Enquanto isso, a operação está funcionando no modo manual. Dois contratos precisam ser renovados essa semana e você não tem os dados para emitir as propostas."
    },
    {
        titulo:  "Paralisação por Acidente Grave",
        resumo:  "Fiscalização do MTE interdita linha de produção",
        setores: ["industria"],
        historia: "Após dois acidentes com afastamento em 30 dias, o Ministério do Trabalho interditou preventivamente a linha principal de produção. O auto de infração cita ausência de NR-12 em 4 equipamentos e treinamento desatualizado. O prazo para regularização é de 20 dias úteis. Com a linha parada, três clientes que dependem da entrega estão ameaçando acionar as cláusulas de penalidade contratual. O custo por dia de paralisação é de R$180 mil."
    },
];

/* ── Informações de empresa por setor ────────────────── */
const COMPANY_INFO = {
    tecnologia: {
        nome: "Startup de Tecnologia",
        historia: "Inovação constante, escalabilidade digital e guerra por talentos de TI.",
        historiaDet: "Fundada há 4 anos em um coworking de São Paulo, sua startup cresceu de 3 para 67 funcionários surfando a onda da transformação digital. Vocês desenvolvem uma plataforma SaaS de gestão para PMEs e já atingiram R$4,2 milhões em ARR. O produto tem NPS de 71, mas a dívida técnica acumulada e a rotatividade alta no time de engenharia estão ameaçando a velocidade de entrega."
    },
    varejo: {
        nome: "Rede de Varejo Omnichannel",
        historia: "Giro de estoque rápido, margens apertadas e foco total na experiência do cliente.",
        historiaDet: "Sua rede possui 38 lojas físicas no interior de São Paulo e um e-commerce que representa 14% do faturamento. Com 18 anos de história, a empresa é reconhecida pela qualidade no atendimento. O faturamento anual é de R$42 milhões, mas a margem operacional encolheu de 8,3% para 5,1% nos últimos 18 meses por causa da concorrência online e do custo fixo das lojas deficitárias."
    },
    industria: {
        nome: "Indústria Metalúrgica",
        historia: "Produção pesada, manutenção de ativos e rigorosa segurança operacional.",
        historiaDet: "Fundada em 1987, a metalúrgica emprega 310 funcionários e produz peças de precisão para os setores automotivo e de construção civil. O faturamento anual gira em torno de R$72 milhões. O parque fabril envelheceu: 60% das máquinas têm mais de 15 anos. A certificação ISO 9001 vence em 6 meses e o IFA (Índice de Frequência de Acidentes) está 2× acima do benchmark nacional."
    },
    logistica: {
        nome: "Operadora de Logística Last-Mile",
        historia: "Gestão de frota, rotas inteligentes, SLAs de entrega e controle rigoroso de custos operacionais.",
        historiaDet: "Fundada há 11 anos, sua operadora conta com 420 entregadores e 8 centros de distribuição. Hoje movimenta mais de 380 mil pacotes por mês. O faturamento anual é de R$46 milhões, mas o SLA de 48h está sendo cumprido em apenas 69% das entregas — o benchmark do setor é 88%. Um cliente representa 38% da receita e o contrato vence em 14 meses."
    }
};

const EMPRESAS = {
    tecnologia: { ...EmpresaTecnologia, rounds: TecnologiaRounds },
    varejo:     { ...EmpresaVarejo,     rounds: VarejoRounds     },
    logistica:  { ...EmpresaLogistica,  rounds: LogisticaRounds  },
    industria:  { ...EmpresaIndustria,  rounds: IndustriaRounds  },
};

let _ui = {};

function registrarUI(callbacks) { _ui = callbacks; }

/* ═══════════════════════════════════════════════════════
   INICIAR JOGO
═══════════════════════════════════════════════════════ */
function iniciar(sectorId, groupName, companyName) {
    const setorFinal = sectorId === "aleatorio"
        ? Object.keys(EMPRESAS)[Math.floor(Math.random() * 4)]
        : sectorId;

    BetaImprevisto.resetar();

    const state = BetaState.init(setorFinal, groupName, companyName);
    state.companyInfo   = COMPANY_INFO[setorFinal];

    // Filtra situações pelo setor
    const situacoesFiltradas = SITUACOES_INICIAIS.filter(s =>
        !s.setores || s.setores.includes(setorFinal)
    );
    state.situacaoAtual = situacoesFiltradas[
        Math.floor(Math.random() * situacoesFiltradas.length)
    ];

    const empresa   = EMPRESAS[setorFinal];
    const introList = empresa.intros || (empresa.intro ? [empresa.intro] : []);
    const introIndex    = Math.floor(Math.random() * introList.length);
    const introSorteada = introList[introIndex] || null;

    state.introIndex = introIndex;

    if (empresa.rounds && empresa.rounds[introIndex]?.length > 0) {
        state.gameRounds  = empresa.rounds[introIndex];
        state.totalRounds = state.gameRounds.length;
    } else {
        state.gameRounds  = [];
        state.totalRounds = 0;
    }

    if (introSorteada) {
        state.introAtual = introSorteada;
        state.phase = "intro";
        _ui.mostrarIntro?.(state, empresa);
    } else {
        state.phase = "playing";
        _preparaRodada(state);
        _ui.mostrarTela?.("screen-game");
        _ui.renderSidebar?.(state, empresa);
        _ui.renderRodada?.(state);
    }
}

function iniciarRodadas() {
    const state  = BetaState.get();
    const empresa = EMPRESAS[state.sector];
    BetaState.setPhase("playing");
    _preparaRodada(state);
    _ui.mostrarTela?.("screen-game");
    _ui.renderSidebar?.(state, empresa);
    _ui.renderRodada?.(state);
}

/* ═══════════════════════════════════════════════════════
   PROCESSAR ESCOLHA
═══════════════════════════════════════════════════════ */
function processarEscolha(choiceIndex) {
    const state        = BetaState.get();
    const round        = state.gameRounds[state.currentRound];
    const choicesAtivas = state.choicesAtivas || round.choices;
    const choice        = choicesAtivas[choiceIndex];
    if (!choice) return;

    const eventoAtivo   = _eventoAtivo(state);
    const efeitosFinais = BetaImpacto.calcular(
        { ...(choice.effects || {}) },
        eventoAtivo ? [eventoAtivo] : []
    );

    const avaliacao = BetaIndicadores.avaliarDecisaoContextual(
        efeitosFinais, state.indicators, state.situacaoAtual
    );

    BetaState.applyEffects(efeitosFinais);
    _aplicarInterdependencias(state.sector, state.indicators);

    const storyStateAntes = {
        flags:      [...state.storyState.flags],
        conquistas: [...state.storyState.conquistas]
    };

    // Protege chamadas que podem lançar erros sem derrubar o fluxo
    try { StoryEngine.avaliarFase(state); } catch(e) { console.warn("avaliarFase:", e); }
    try { StoryEngine.registrarFlags(choice, state, avaliacao); } catch(e) { console.warn("registrarFlags:", e); }
    try { _atualizarSituacaoStatus(state); } catch(e) { console.warn("situacaoStatus:", e); }

    BetaState.addHistory({
        rodada:   state.currentRound + 1,
        titulo:   round.title,
        escolha:  choice.text,
        avaliacao,
        efeitos:  efeitosFinais,
        ensinamento: choice.ensinamento || ""
    });

    const _temEfeitoReal = obj => obj && Object.values(obj).some(v => v !== 0);
    const efeitosGestor = _temEfeitoReal(choice.gestorEffects)
        ? choice.gestorEffects
        : _calcularEfeitosGestorAutomatico(efeitosFinais, avaliacao, state);
    BetaState.applyGestorEffects(efeitosGestor);

    if (eventoAtivo?.gestorEffects) {
        BetaState.applyGestorEffects(eventoAtivo.gestorEffects);
    }

    _ui.renderSidebar?.(state, EMPRESAS[state.sector]);

    let stakeholderReacao = null;
    try { stakeholderReacao = Protagonista.calcularReacao(efeitosFinais, state.sector, state); } catch(e) {}
    if (stakeholderReacao) BetaState.addStakeholderLog(stakeholderReacao);

    let melhorAlternativa = null;
    try { melhorAlternativa = _calcularMelhorAlternativa(choicesAtivas, choiceIndex, state.indicators, state.situacaoAtual); } catch(e) {}

    const feedbackData = BetaFeedback.calcular({
        choice,
        choiceIndex,
        avaliacaoContextual: avaliacao,
        efeitosFinais,
        eventoAtivo,
        history: state.history,
        storyState:         state.storyState,
        storyStateAnterior: storyStateAntes,
        efeitosGestor,
        stakeholderReacao,
        melhorAlternativa,
    });

    const isGameOver    = BetaIndicadores.isGameOver(state.indicators);
    const motivoMandato = _verificarMandatoEncerrado(state.gestor);

    // Feedback é SEMPRE exibido
    _ui.mostrarFeedback?.(feedbackData, () => {
        if (isGameOver) {
            _encerrar("gameover");
        } else if (motivoMandato) {
            _encerrar(motivoMandato === "conselho" ? "mandato_conselho" : "mandato_burnout");
        } else {
            _avancarRodada();
        }
    });
}

/* ═══════════════════════════════════════════════════════
   PREPARAR RODADA
═══════════════════════════════════════════════════════ */
function _preparaRodada(state) {
    const round = state.gameRounds[state.currentRound];
    if (!round) return;
    const filtradas = StoryEngine.choicesDisponiveis(round, state.storyState, state.indicators);
    state.choicesAtivas = filtradas.length >= 2 ? filtradas : round.choices;
}

/* ═══════════════════════════════════════════════════════
   AVANÇAR RODADA
═══════════════════════════════════════════════════════ */
function _avancarRodada() {
    BetaState.nextRound();
    const state = BetaState.get();

    const novoEv = BetaImprevisto.sortear(state.currentRound, state.storyState, state.gestor);
    if (novoEv) BetaState.addEvent(novoEv);

    if (state.currentRound >= state.totalRounds) {
        _encerrar("fim");
    } else {
        _preparaRodada(state);
        _ui.renderSidebar?.(state, EMPRESAS[state.sector]);
        _ui.renderRodada?.(state);
    }
}

/* ═══════════════════════════════════════════════════════
   ENCERRAR / RESULTADO
═══════════════════════════════════════════════════════ */
function _encerrar(motivo) {
    const state = BetaState.get();
    BetaState.setPhase("result");

    const score = state.sector === "tecnologia"
        ? IndicadoresTecnologia.scoreTotal(state.indicators)
        : BetaIndicadores.scoreTotal(state.indicators, state.sector);

    const scoreFinal = Math.round(score * 5); // 0–100

    const g = state.gestor;
    const scoreGestor = Math.round(
        (g.reputacaoInterna * 5 + g.capitalPolitico * 5 + (10 - g.esgotamento) * 3) / 1.3
    );

    // Decisões cruciais: as 3 mais impactantes (maior soma absoluta de efeitos)
    const decisoesCruciais = [...state.history]
        .map(h => ({
            ...h,
            impacto: Object.values(h.efeitos || {}).reduce((a, v) => a + Math.abs(v), 0)
        }))
        .sort((a, b) => b.impacto - a.impacto)
        .slice(0, 3);

    _ui.renderResultado?.({
        motivo,
        score:       scoreFinal,
        scoreGestor,
        gestor:      state.gestor,
        indicators:  state.indicators,
        history:     state.history,
        companyName: state.companyName,
        empresa:     EMPRESAS[state.sector],
        sector:      state.sector,
        epilogo:     StoryEngine.gerarEpilogo(
            state.storyState, state.history, scoreFinal, scoreGestor, state.gestor
        ),
        decisoesCruciais,
    });
}

/* ═══════════════════════════════════════════════════════
   HELPERS INTERNOS
═══════════════════════════════════════════════════════ */

function _aplicarInterdependencias(sector, indicators) {
    switch (sector) {
        case "tecnologia": IndicadoresTecnologia.aplicarInterdependencias(indicators); break;
        case "varejo":     IndicadoresVarejo.aplicarInterdependencias(indicators);     break;
        case "logistica":  IndicadoresLogistica.aplicarInterdependencias(indicators);  break;
        case "industria":  IndicadoresIndustria.aplicarInterdependencias(indicators);  break;
    }
}

/* Efeitos automáticos no gestor com thresholds calibrados */
function _calcularEfeitosGestorAutomatico(efeitosEmpresa, avaliacao, state) {
    const efeitos = { reputacaoInterna: 0, capitalPolitico: 0, esgotamento: 0 };

    const impactoRH = (efeitosEmpresa.rh ?? 0) + (efeitosEmpresa.clima ?? 0);
    if (impactoRH <= -3) efeitos.reputacaoInterna -= 1;
    else if (impactoRH <= -5) efeitos.reputacaoInterna -= 2;
    else if (impactoRH >= 3) efeitos.reputacaoInterna += 1;

    const impactoFin = efeitosEmpresa.financeiro ?? 0;
    if (impactoFin >= 3)  efeitos.capitalPolitico += 1;
    else if (impactoFin <= -3) efeitos.capitalPolitico -= 1;

    // Esgotamento aumenta em rodadas de crise, ainda mais em decisões ruins
    if (state.storyState.faseEmpresa === "crise") efeitos.esgotamento += 1;
    if (avaliacao === "ruim" && state.storyState.faseEmpresa === "crise") efeitos.esgotamento += 1;

    return efeitos;
}

/* Calcula a melhor alternativa não escolhida */
function _calcularMelhorAlternativa(choices, choiceIndex, indicators, situacao) {
    let melhor = null;
    let melhorScore = -Infinity;
    choices.forEach((c, i) => {
        if (i === choiceIndex) return;
        const score = _scoreSimples(c.effects || {}, indicators);
        if (score > melhorScore) { melhorScore = score; melhor = c; }
    });
    return melhor;
}

function _scoreSimples(effects, indicators) {
    const pos = Object.values(effects).filter(v => v > 0).reduce((a, b) => a + b, 0);
    const neg = Math.abs(Object.values(effects).filter(v => v < 0).reduce((a, b) => a + b, 0));
    return pos - neg;
}

function _atualizarSituacaoStatus(state) {
    const round = state.currentRound;
    if (round !== 7 && round !== 12) return;

    const vals  = Object.values(state.indicators);
    const media = vals.reduce((a, b) => a + b, 0) / vals.length;
    const criticos = vals.filter(v => v <= 4).length;

    if (criticos === 0 && media >= 11) {
        BetaState.setSituacaoStatus("resolvida");
    } else if (criticos <= 1 && media >= 9) {
        BetaState.setSituacaoStatus("melhorando");
    } else if (criticos >= 2 || media <= 6) {
        BetaState.setSituacaoStatus("piorando");
    }
}

function _verificarMandatoEncerrado(gestor) {
    if (gestor.capitalPolitico <= 0)  return "conselho";
    if (gestor.esgotamento >= 10)     return "burnout";
    return null;
}

function _eventoAtivo(state) {
    return state.activeEvents.find(e => e.expiresAt >= state.currentRound) || null;
}
/* --mainBeta.js-- */
/* ═══════════════════════════════════════════════════════
   GESTÃO SOB PRESSÃO · MAIN v5.1
   ─────────────────────────────────────────────────────
   · Sistema de jogador com persistência (localStorage)
   · Pódio global e histórico de jogos
   · Restauração de sessão interrompida
   · Timer opcional por rodada (90s)
   · Glossário com 20 termos de gestão
   · Benchmarks de mercado nos indicadores
   · Memória narrativa (referências a decisões passadas)
   · Painel de recomendações dinâmicas
   · Modo revisão pós-jogo com decisões cruciais
   · Tela de jogo em 3 abas: HISTÓRIA · DESAFIOS · HISTÓRICO
═══════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   PERSISTÊNCIA
════════════════════════════════════════════════════ */
const LS = {
  get:    k      => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  remove: k      => { try { localStorage.removeItem(k); } catch {} },
};
const SK = {
  PLAYER:"gsp_player", PODIO:"gsp_podio",
  HISTORICO:"gsp_historico", HIST_GUEST:"gsp_historico_guest",
  SESSION:"gsp_session", SETTINGS:"gsp_settings",
};

/* ════════════════════════════════════════════════════
   ESTADO LOCAL
════════════════════════════════════════════════════ */
let _player   = null;
let _settings = { timer: false, cloudStatus: false };
let _setorSelecionado = null;
let _escolhaFeita     = false;
let _feedbackCallback = null;
let _timerInterval    = null;
let _timerSegs        = 0;
let _bloqueioAte      = 0; // timestamp — bloqueia escolher() durante transições
let _prevIndicators   = {}; // track trends

/* ════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════ */
function _setFirebaseStatus(estado) {
  // estados: 'connecting' | 'online' | 'offline'
  const dot   = document.getElementById('firebase-status-dot');
  const label = document.getElementById('firebase-status-label');
  if (!dot || !label) return;
  dot.className = 'firebase-dot firebase-dot--' + estado;
  const textos = { connecting: 'Conectando', online: 'Online', offline: 'Offline' };
  label.textContent = textos[estado] || estado;
  label.style.color = estado === 'online' ? '#2ecc71' : estado === 'offline' ? '#e74c3c' : 'var(--t3)';
}

// Inicia polling do Firebase só após DOM pronto
window.addEventListener('DOMContentLoaded', function _pollFirebase() {
  let tentativas = 0;
  const intervalo = setInterval(() => {
    tentativas++;
    if (window.GSPSync && window.GSPAuth?.isReady()) {
      clearInterval(intervalo);
      _setFirebaseStatus('online');
    } else if (tentativas >= 80) {
      // Timeout de 6s sem resposta
      clearInterval(intervalo);
      _setFirebaseStatus('offline');
    }
  }, 100);
});

// Listener global — captura login do Google mesmo após redirect
function _iniciarListenerAuth() {
  if (!window.GSPAuth?.isReady()) return;
  window.GSPAuth.onAuthChange((user) => {
    if (user && !_player) {
      // Mostra loading breve antes de entrar
      const telaAtual = document.querySelector('.screen.active')?.id;
      if (telaAtual === 'screen-login' || telaAtual === 'screen-auth') {
        mostrarTela('screen-loading');
        _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
      }
      _loginOk(user);
    }
  });
}


/* ── HELPER: força overlay a cobrir a viewport real ── */
function _abrirOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  ['overlay-pause','overlay-tooltip','overlay-glossary','overlay-settings'].forEach(function(oid) {
    if (oid !== id) { var o = document.getElementById(oid); if (o) o.style.display = 'none'; }
  });
  if (el.parentNode !== document.body) document.body.appendChild(el);
  // Alinha com o #app para centralizar corretamente
  const app = document.getElementById('app');
  const rect = app ? app.getBoundingClientRect() : {left:0, top:0, width:window.innerWidth, height:window.innerHeight};
  el.style.position        = 'fixed';
  el.style.left            = rect.left + 'px';
  el.style.top             = rect.top  + 'px';
  el.style.width           = rect.width  + 'px';
  el.style.height          = rect.height + 'px';
  el.style.display         = 'flex';
  el.style.alignItems      = 'center';
  el.style.justifyContent  = 'center';
  el.style.padding         = '20px';
  el.style.boxSizing       = 'border-box';
  el.style.zIndex          = '99999';
}
function _fecharOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

async function _boot() {
  _settings = LS.get(SK.SETTINGS) || { timer: false, cloudStatus: false };
  document.querySelectorAll('.overlay').forEach(o => { _fecharOverlay(o.id); });

  // Verifica mensagem global / manutenção
  if (window.ADMIN) {
    const cfg = await window.ADMIN.verificarMensagemGlobal().catch(()=>null);
    if (cfg?.manutencao) {
      document.getElementById('loading-msg').textContent = '🔧 Jogo em manutenção. Volte em breve!';
      return;
    }
    if (cfg?.mensagem) {
      setTimeout(() => mostrarSucesso(cfg.mensagem), 1500);
    }
  }

  // Sempre sai da screen-loading imediatamente
  const saved = LS.get(SK.PLAYER);
  if (saved) {
    _player = saved;
    _verificarSessaoSalva();
    _atualizarHome();
    if (!localStorage.getItem('gsp_tutorial_done')) {
      mostrarTela('screen-tutorial');
    } else {
      mostrarTela('screen-home');
    }
    _sincronizarFirebaseBackground(saved);
    return;
  }

  // Sem sessão salva — mostra loading enquanto verifica redirect do Google
  const _googlePending = localStorage.getItem('gsp_google_pending') === '1';
  localStorage.removeItem('gsp_google_pending');

  mostrarTela('screen-loading');
  if (_googlePending) {
    _setLoadingMsg('Conectando com Google...', 'Finalizando seu login', 30);
  } else {
    _setLoadingMsg('Iniciando...', 'Preparando o jogo', 10);
  }

  // Escuta o evento de redirect do Google (disparado pelo firebase-config quando getRedirectResult resolve)
  let _redirectPlayer = null;
  const _redirectHandler = (e) => { _redirectPlayer = e.detail; };
  window.addEventListener('gsp-redirect-login', _redirectHandler, { once: true });

  if (window.GSPAuth) {
    if (!_googlePending) _setLoadingMsg('Conectando ao servidor...', 'Aguardando Firebase', 30);
    let t = 0;
    while (!window.GSPAuth.isReady() && t < 30) {
      await new Promise(r => setTimeout(r, 100));
      t++;
    }
    if (window.GSPAuth.isReady()) {
      if (_googlePending) {
        _setLoadingMsg('Verificando conta Google...', 'Quase lá!', 60);
      } else {
        _setLoadingMsg('Verificando sua sessão...', 'Checando login do Google', 60);
      }
      try {
        // Aguarda até 15s pelo resultado (waitForAuthReady OU evento de redirect)
        let fbUser = null;
        const maxTentativas = _googlePending ? 150 : 80;
        for (let i = 0; i < maxTentativas; i++) {
          if (_redirectPlayer) {
            // Evento de redirect chegou — entra direto
            window.removeEventListener('gsp-redirect-login', _redirectHandler);
            _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
            await _loginOk(_redirectPlayer);
            return;
          }
          fbUser = await window.GSPAuth.waitForAuthReady().catch(() => null);
          if (fbUser) break;
          if (_googlePending && i % 30 === 0 && i > 0) {
            _setLoadingMsg('Conectando com Google...', 'Aguardando resposta...', 60 + i/3);
          }
          await new Promise(r => setTimeout(r, 100));
        }
        if (fbUser) {
          window.removeEventListener('gsp-redirect-login', _redirectHandler);
          const user = {
            uid: fbUser.uid,
            nome: fbUser.displayName || fbUser.email?.split('@')[0] || 'Jogador',
            email: fbUser.email,
            tipo: 'user'
          };
          _setLoadingMsg('Entrando no painel...', 'Bem-vindo de volta!', 90);
          await _loginOk(user);
          return;
        }
      } catch(e) {}
    }
  }

  window.removeEventListener('gsp-redirect-login', _redirectHandler);
  if (_googlePending) {
    _setLoadingMsg('Não foi possível conectar', 'Tente novamente', 100);
    await new Promise(r => setTimeout(r, 1000));
  } else {
    _setLoadingMsg('Pronto!', 'Faça seu login para continuar', 100);
    await new Promise(r => setTimeout(r, 400));
  }
  _iniciarListenerAuth();
  mostrarTela('screen-login');
}

// Sincroniza sessão Firebase em background sem bloquear a UI
function _sincronizarFirebaseBackground(player) {
  if (!player?.uid || !window.GSPAuth?.isReady() || !window.GSPSync) return;
  Promise.all([
    window.GSPSync.carregarHistorico(player.uid),
    window.GSPSync.carregarPodio(),
    window.GSPSync.carregarSessao(player.uid)
  ]).then(([histFS, podioFS, sessFS]) => {
    if (histFS?.length > 0) LS.set(SK.HISTORICO, histFS.map(h => ({ ...h, ts: h.ts?.toMillis ? h.ts.toMillis() : (h.ts || Date.now()) })));
    // Sempre sincroniza o localStorage com o Firestore — mesmo se vier vazio
    LS.set(SK.PODIO, (podioFS || []).map(p => ({ ...p, ts: p.ts?.toMillis ? p.ts.toMillis() : (p.ts || Date.now()) })));
    if (sessFS) LS.set(SK.SESSION, { ...sessFS, ts: sessFS.ts?.toMillis ? sessFS.ts.toMillis() : Date.now() });
  }).catch(() => {});
}

function _setLoadingMsg(msg, sub, progress) {
  const el = document.getElementById('loading-msg');
  if (el) el.textContent = msg;
  const sub_el = document.getElementById('loading-submsg');
  if (sub_el) sub_el.textContent = sub || '';
  const bar = document.getElementById('loading-bar-fill');
  if (bar && progress !== undefined) bar.style.width = progress + '%';
}

/* ════════════════════════════════════════════════════
   NAVEGAÇÃO
════════════════════════════════════════════════════ */
function mostrarTela(id, goBack) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active", "go-back");
    s.style.display = '';
    s.style.opacity = '';
    s.style.transition = '';
    s.style.animation = '';
  });
  // Fecha todos os overlays ao navegar
  document.querySelectorAll(".overlay").forEach(o => { _fecharOverlay(o.id); });
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active");
    el.style.animation = goBack
      ? 'screenBack .3s cubic-bezier(.22,.68,0,1.2)'
      : 'screenIn .3s cubic-bezier(.22,.68,0,1.2)';
    setTimeout(() => { el.style.animation = ''; }, 350);
  }
  // Remove tema de setor em todas as telas fora do jogo
  const TELAS_JOGO = ["screen-intro","screen-game","screen-feedback","screen-result"];
  if (!TELAS_JOGO.includes(id)) _aplicarTemaSetor(null);
  window.scrollTo(0, 0);
  // Atualiza botão admin ao entrar na home
  if (id === 'screen-home' && _player?.uid) {
    const btn = document.getElementById('btn-admin-home');
    if (btn) btn.style.display = _ADMIN_UIDS?.includes(_player.uid) ? 'inline-flex' : 'none';
  }
}
function voltar(tela) {
  ['.login-logo-img', '.login-footer', '.login-main', '.login-eyebrow', '.login-rule', '.login-desc'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.style.opacity = ''; el.style.transition = ''; el.style.transform = ''; }
  });
  const authLogoEl = document.querySelector('.auth-logo-img');
  if (authLogoEl) authLogoEl.style.opacity = '';
  mostrarTela(tela, true);
}

/* ════════════════════════════════════════════════════
   LOGIN / IDENTIDADE
════════════════════════════════════════════════════ */

function irComoConvidado() {
  _player = { nome: "Convidado", tipo: "guest" };
  _atualizarHome();
  mostrarTela("screen-home");
}

function confirmarNome() {
  const input = document.getElementById("player-name-input");
  const nome  = input?.value.trim();
  if (!nome) { mostrarErroCritico("Digite seu nome para continuar."); return; }
  _player = { nome, tipo: "user" };
  LS.set(SK.PLAYER, _player);
  if (input) input.value = "";
  _verificarSessaoSalva();
  _atualizarHome();
  mostrarTela("screen-home");
}

function sair() {
  LS.remove(SK.PLAYER);
  LS.remove(SK.SESSION);
  _player = null;
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela("screen-login");
}

function _atualizarHome() {
  const el = document.getElementById("home-player-name");
  if (el) el.textContent = `OLÁ, ${(_player?.nome || "JOGADOR").toUpperCase()}`;
  const av = document.getElementById("home-avatar-icon");
  if (av && _player?.nome) av.textContent = _player.nome.charAt(0).toUpperCase();
}

/* ════════════════════════════════════════════════════
   SESSÃO PERSISTENTE
════════════════════════════════════════════════════ */
function _salvarSessao() {
  const state = BetaState.get();
  if (!state || state.phase === "result") { LS.remove(SK.SESSION); return; }
  LS.set(SK.SESSION, {
    sector: state.sector, companyName: state.companyName,
    currentRound: state.currentRound, totalRounds: state.totalRounds,
    ts: Date.now(),
  });
}

function _verificarSessaoSalva() {
  const sess   = LS.get(SK.SESSION);
  const banner = document.getElementById("session-restore-banner");
  const texto  = document.getElementById("session-restore-text");
  if (sess && banner && texto) {
    const mins  = Math.round((Date.now() - sess.ts) / 60000);
    const tempo = mins < 60 ? `${mins} min atrás` : `${Math.round(mins/60)}h atrás`;
    texto.textContent = `Jogo em andamento: ${sess.companyName} (${sess.sector}) — Rodada ${sess.currentRound + 1}/${sess.totalRounds} · salvo ${tempo}`;
    banner.style.display = "";
  } else if (banner) {
    banner.style.display = "none";
  }
}

function restaurarSessao() {
  const sess = LS.get(SK.SESSION);
  if (!sess) return;
  // BUG #12 FIX: verificar se há estado completo salvo
  const estadoCompleto = LS.get('gsp_session_state');
  if (estadoCompleto && estadoCompleto.sector === sess.sector) {
    // Restaurar estado real: setor, rodada e companyName corretos
    iniciar(sess.sector, _player?.nome || "Jogador", sess.companyName);
    // Notificar jogador que começa da rodada onde parou (próxima melhoria: restaurar state completo)
    setTimeout(() => mostrarSucesso(`Sessão restaurada: ${sess.companyName} · Rodada ${sess.currentRound + 1}`), 500);
  } else {
    // Fallback: iniciar do começo, mas avisar jogador
    iniciar(sess.sector, _player?.nome || "Jogador", sess.companyName);
    setTimeout(() => mostrarAviso('Sessão reiniciada do início. Progresso anterior não recuperável.'), 500);
  }
}

function descartarSessao() {
  LS.remove(SK.SESSION);
  const banner = document.getElementById("session-restore-banner");
  if (banner) banner.style.display = "none";
}

/* ════════════════════════════════════════════════════
   PÓDIO / HISTÓRICO DE JOGOS
════════════════════════════════════════════════════ */
function _registrarResultado(score, scoreGestor, sector, companyName) {
  const isGuest  = _player?.tipo === 'guest' || !_player?.uid;
  const histKey  = isGuest ? SK.HIST_GUEST : SK.HISTORICO;
  const entrada  = {
    player: _player?.nome || 'Convidado',
    score, scoreGestor, sector, companyName, ts: Date.now(),
    uid: _player?.uid || null,
  };

  // Salva no histórico local
  const hist = LS.get(histKey) || [];
  hist.unshift(entrada);
  LS.set(histKey, hist.slice(0, 30));

  // Atualiza pódio local — usuários logados deduplicam por uid, convidados sempre adicionam nova entrada
  const podio = LS.get(SK.PODIO) || [];
  if (entrada.uid) {
    const existIdx = podio.findIndex(p => p.uid && p.uid === entrada.uid);
    if (existIdx >= 0) {
      if (entrada.score > podio[existIdx].score) podio[existIdx] = entrada;
    } else {
      podio.push(entrada);
    }
  } else {
    podio.push(entrada);
  }
  podio.sort((a, b) => b.score - a.score);
  LS.set(SK.PODIO, podio.slice(0, 20));

  LS.remove(SK.SESSION);

  // Salva no Firestore com feedback visível
  if (!isGuest && _player?.uid) {
    const _salvarNoFirestore = () => {
      if (!window.GSPSync) { mostrarAviso('⚠️ Firebase indisponível'); return; }
      const _statusEl = () => document.getElementById('result-cloud-status');
      if (_settings.cloudStatus !== false) {
        if (_statusEl()) { _statusEl().style.display = 'block'; _statusEl().textContent = '☁️ Salvando na nuvem...'; }
      }
      Promise.all([
        window.GSPSync.salvarPartida(_player.uid, entrada),
        window.GSPSync.salvarNoPodio(_player.uid, entrada)
      ])
        .then(() => {
          if (_settings.cloudStatus !== false && _statusEl()) _statusEl().textContent = '✅ Salvo na nuvem!';
        })
        .catch(e => {
          console.error('[GSP] Erro ao salvar resultado:', e);
          if (_settings.cloudStatus !== false && _statusEl()) _statusEl().textContent = '❌ Erro: ' + (e?.code || e?.message || 'desconhecido');
        });
    };
    if (window.GSPSync) {
      _salvarNoFirestore();
    } else {
      let t = 0;
      const poll = setInterval(() => {
        t++;
        if (window.GSPSync) { clearInterval(poll); _salvarNoFirestore(); }
        else if (t >= 50) { clearInterval(poll); mostrarAviso('⚠️ Firebase não conectado'); }
      }, 100);
    }
  }
}

/* irParaPodio: definição única e correta abaixo (com data-sector) */

function irParaHistoricoJogos() {
  mostrarTela("screen-historico-jogos");
  const isGuest = _player?.tipo === "guest" || !_player?.uid;
  const histKey = isGuest ? SK.HIST_GUEST : SK.HISTORICO;
  const lista   = document.getElementById("historico-jogos-lista");
  if (!lista) return;

  // Renderiza imediatamente com dados locais
  _renderHistorico(lista, LS.get(histKey) || [], isGuest);

  // Se logado, sincroniza Firestore em background e re-renderiza se tiver novo
  if (!isGuest && _player?.uid && window.GSPSync) {
    window.GSPSync.carregarHistorico(_player.uid).then(histFS => {
      if (!histFS?.length) return;
      const c = histFS.map(h => ({ ...h, ts: h.ts?.toMillis ? h.ts.toMillis() : (h.ts || Date.now()) }));
      LS.set(SK.HISTORICO, c);
      _renderHistorico(lista, c, false);
    }).catch(() => {});
  }
}

function _renderHistorico(lista, hist, isGuest) {
  const icones = { tecnologia:"🚀", varejo:"🛒", logistica:"🚚", industria:"🏭" };
  const labels = { tecnologia:"Tecnologia", varejo:"Varejo", logistica:"Logística", industria:"Indústria" };

  if (isGuest) {
    lista.innerHTML = `
      <div class="hist-guest-banner">
        <div class="hist-guest-icon">☁️</div>
        <div class="hist-guest-title">Histórico na nuvem</div>
        <div class="hist-guest-desc">Crie uma conta para salvar seu histórico online e acessar em qualquer dispositivo.</div>
        <button class="btn btn-primary hist-guest-btn" onclick="BetaUI.irParaAuth()">Criar conta grátis</button>
      </div>
      ${hist.length ? '<div class="hist-section-label">Sessão atual (local)</div>' + hist.map(p => _histCard(p, icones, labels)).join('') : ''}`;
    return;
  }

  if (!hist.length) {
    lista.innerHTML = `<div class="podio-empty">Nenhuma partida registrada ainda.<br>Complete um mandato para ver seu histórico aqui.</div>`;
    return;
  }

  // Agrupa por setor para estatísticas rápidas
  const totalJogos = hist.length;
  const melhor     = Math.max(...hist.map(h => h.score));
  const media      = Math.round(hist.reduce((a, h) => a + h.score, 0) / totalJogos);

  lista.innerHTML = `
    <div class="hist-stats-row">
      <div class="hist-stat"><span class="hist-stat-val">${totalJogos}</span><span class="hist-stat-label">Partidas</span></div>
      <div class="hist-stat"><span class="hist-stat-val" style="color:var(--s-text)">${melhor}</span><span class="hist-stat-label">Melhor</span></div>
      <div class="hist-stat"><span class="hist-stat-val">${media}</span><span class="hist-stat-label">Média</span></div>
    </div>
    <div class="hist-section-label">Últimas partidas</div>
    ${hist.map(p => _histCard(p, icones, labels)).join('')}`;
}

function _histCard(p, icones, labels) {
  const data    = new Date(p.ts).toLocaleDateString("pt-BR");
  const hora    = new Date(p.ts).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
  const cor     = p.score >= 70 ? "var(--good)" : p.score >= 45 ? "var(--warn)" : "var(--danger)";
  const badge   = p.score >= 70 ? "hist-badge-great" : p.score >= 45 ? "hist-badge-ok" : "hist-badge-bad";
  const label   = p.score >= 70 ? "Excelente" : p.score >= 45 ? "Regular" : "Crítico";
  return `<div class="hist-card">
    <div class="hist-card-left">
      <div class="hist-card-sector">${icones[p.sector]||"🏢"}</div>
      <div class="hist-card-info">
        <div class="hist-card-company">${p.companyName}</div>
        <div class="hist-card-meta">${labels[p.sector]||p.sector} · ${data} às ${hora}</div>
      </div>
    </div>
    <div class="hist-card-right">
      <div class="hist-card-score" style="color:${cor}">${p.score}</div>
      <div class="hist-badge ${badge}">${label}</div>
      <div class="hist-card-gestor">Gestor: ${p.scoreGestor}</div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════
   SETOR / INÍCIO
════════════════════════════════════════════════════ */
function irParaSetores() {
  // Limpar estado anterior de seleção
  document.querySelectorAll(".sector-card").forEach(b => b.classList.remove("selected"));
  const sh = document.getElementById("sector-hidden");
  const cn = document.getElementById("companyName");
  if (sh) sh.value = "";
  if (cn) cn.value = "";
  mostrarTela("screen-sector");
}

function _aplicarTemaSetor(sector) {
  const app = document.getElementById('app');
  if (app) {
    if (sector) app.setAttribute('data-sector', sector);
    else app.removeAttribute('data-sector');
  }
}

function selecionarSetor(sector) {
  _setorSelecionado = sector;
  document.querySelectorAll(".sector-card").forEach(b => b.classList.remove("selected"));
  document.querySelector(`[data-sector="${sector}"]`)?.classList.add("selected");
  document.getElementById("sector-hidden").value = sector;
  // Tema só é aplicado quando o jogo começa
}

function lancarJogo() {
  const sector        = document.getElementById("sector-hidden").value;
  const companyNameEl = document.getElementById("companyName");
  const companyName   = companyNameEl.value.trim();
  if (!sector) { mostrarErroCritico("Selecione o tipo de empresa antes de continuar."); return; }
  if (!companyName) {
    companyNameEl.focus();
    companyNameEl.classList.add("input-error-shake");
    setTimeout(() => companyNameEl.classList.remove("input-error-shake"), 600);
    mostrarErroCritico("Digite o nome da empresa antes de continuar.");
    return;
  }
  iniciar(sector, _player?.nome || "Jogador", companyName);
}

/* ════════════════════════════════════════════════════
   INTRO
════════════════════════════════════════════════════ */
let _introCache = null;

function mostrarIntro(state, empresa) {
  _aplicarTemaSetor(state.sector);
  mostrarTela("screen-intro");
  const intro = state.introAtual;
  if (!intro) { comecaJogo(); return; }
  _introCache = { intro, empresa, sector: state.sector, situacao: state.situacaoAtual };
  document.getElementById("intro-badge").textContent     = intro.badge || empresa.nome || state.sector;
  document.getElementById("intro-titulo").textContent    = intro.badge || intro.titulo || "Bem-vindo";
  document.getElementById("intro-subtitulo").textContent = intro.subtitulo || "";
  const secoes = document.getElementById("intro-secoes");
  if (secoes) secoes.innerHTML = (intro.secoes || []).map(s => `
    <div class="intro-secao">
      <div class="intro-secao-header">
        <span class="intro-secao-icone">${s.icone||"📌"}</span>
        <span class="intro-secao-titulo">${s.titulo}</span>
      </div>
      <div class="intro-secao-corpo">${s.corpo}</div>
    </div>`).join("");
  const criseEl = document.getElementById("intro-crise");
  const crise   = state.situacaoAtual;
  if (crise && criseEl) {
    criseEl.style.display = "";
    criseEl.innerHTML = `
      <div class="intro-crise-header">
        <span class="intro-crise-badge">⚠ CRISE ATIVA</span>
        <span class="intro-crise-titulo">${crise.titulo}</span>
      </div>
      <div class="intro-crise-texto">${crise.historia}</div>`;
  } else if (criseEl) { criseEl.style.display = "none"; }
  const preview = document.getElementById("intro-indicators-preview");
  if (preview) {
    preview.innerHTML = Object.entries(state.indicators).map(([k, v]) => {
      const cor = BetaIndicadores.corNivel(v);
      return `<div class="intro-ind-item">
        <span>${BetaIndicadores.LABELS[k]||k}</span>
        <span style="color:${cor};font-weight:700">${v}/20</span>
      </div>`;
    }).join("");
  }
}

function comecaJogo() {
  iniciarRodadas();
  _renderEmpresaTab();
}

function _renderEmpresaTab() {
  const el = document.getElementById("empresa-tab-content");
  if (!el || !_introCache) return;
  const { intro, empresa, sector, situacao } = _introCache;
  const icones = { tecnologia:"🚀", industria:"🏭", logistica:"🚚", varejo:"🛒" };
  let html = `
    <div class="empresa-tab-header">
      <span class="empresa-tab-badge">${icones[sector]||"🏢"} ${empresa.nome || sector}</span>
      <h2 class="empresa-tab-titulo">${intro.titulo || intro.badge || ""}</h2>
      ${intro.subtitulo ? `<p class="empresa-tab-sub">${intro.subtitulo}</p>` : ""}
    </div>`;
  if (intro.secoes?.length) {
    html += intro.secoes.map(s => `
      <div class="empresa-tab-secao">
        <div class="empresa-tab-secao-header">
          <span class="empresa-tab-secao-icone">${s.icone||"📌"}</span>
          <span class="empresa-tab-secao-titulo">${s.titulo}</span>
        </div>
        <div class="empresa-tab-secao-corpo">${s.corpo}</div>
      </div>`).join("");
  }
  if (situacao) {
    html += `
      <div class="empresa-tab-crise">
        <div class="empresa-tab-crise-header">
          <span class="empresa-tab-crise-badge">⚠ CRISE ATIVA</span>
          <span class="empresa-tab-crise-titulo">${situacao.titulo}</span>
        </div>
        <div class="empresa-tab-crise-corpo">${situacao.historia}</div>
      </div>`;
  }
  el.innerHTML = html;
}

/* ════════════════════════════════════════════════════
   BENCHMARKS DE MERCADO
════════════════════════════════════════════════════ */
const BENCHMARKS = {
  varejo:    { financeiro:11,rh:10,clientes:12,processos:10,margem:9,estoque:11,marca:10,digital:9 },
  logistica: { financeiro:11,rh:10,clientes:12,processos:11,sla:12,frota:10,seguranca:11,tecnologia:9 },
  industria: { financeiro:11,rh:10,clientes:11,processos:11,seguranca:10,manutencao:10,qualidade:12,conformidade:11 },
  tecnologia:{ financeiro:11,clima:11,satisfacao:12,qualidade:11,produtividade:10,reputacao:10,inovacao:9,seguranca:10 },
};

function _bench(sector, key) { return BENCHMARKS[sector]?.[key] ?? null; }

/* ════════════════════════════════════════════════════
   SIDEBAR — INDICADORES + GESTOR
════════════════════════════════════════════════════ */
function renderSidebar(state, empresa) {
  try {
  const nameEl = document.getElementById("game-company-name");
  if (nameEl) nameEl.textContent = `${state.companyName} · ${empresa?.nome||""}`;

  // Barra de progresso das rodadas
  const progBar = document.getElementById("game-progress-bar");
  if (progBar) {
    const pct = Math.round(((state.currentRound + 1) / state.totalRounds) * 100);
    progBar.style.width = `${pct}%`;
  }

  const roundBadge = document.getElementById("game-round-badge");
  if (roundBadge) {
    const faseLabel = { fundacao:"Diagnóstico",crescimento:"Crescimento",
                        crise:"⚠ Crise",consolidacao:"Consolidação",expansao:"Expansão" };
    const fase = state.storyState?.faseEmpresa;
    roundBadge.textContent = `Rod. ${state.currentRound+1}/${state.totalRounds} · ${faseLabel[fase]||""}`;
  }
  const grid = document.getElementById("game-indicators-grid");
  if (grid) {
    // Detectar indicadores críticos para toast
    const newlyCritical = [];
    grid.innerHTML = Object.entries(state.indicators).map(([k, v]) => {
      const pct      = (v / 20) * 100;
      const cor      = BetaIndicadores.corNivel(v);
      const label    = BetaIndicadores.LABELS[k] || k;
      const b        = _bench(state.sector, k);
      const benchHtml = b ? `<span class="game-ind-bench">Méd: ${b}</span>` : "";

      // Seta de tendência vs rodada anterior
      const prev = _prevIndicators[k];
      let trendHtml = "";
      if (prev !== undefined) {
        const diff = v - prev;
        if      (diff >  0) trendHtml = `<span class="game-ind-trend up">▲${diff}</span>`;
        else if (diff <  0) trendHtml = `<span class="game-ind-trend down">▼${Math.abs(diff)}</span>`;
        else                trendHtml = `<span class="game-ind-trend flat">—</span>`;
      }

      // Classe crítico se valor <= 3
      const isCritical = v <= 3;
      if (isCritical && (prev === undefined || prev > 3)) newlyCritical.push(label);
      const rowClass = isCritical ? ' critical' : '';
      const nameClass = isCritical ? ' critical-label' : '';

      // Label already contains emoji prefix (e.g. "💰 Financeiro")
      // Split into icon + name for better layout
      const labelParts = label.split(" ");
      const indIcon = labelParts[0];
      const indName = labelParts.slice(1).join(" ");
      const benchVal = b ? `<span>Méd: ${b}</span><span style="color:${cor};font-weight:700">${v}/20</span>` : `<span style="color:${cor};font-weight:600">${v}/20</span>`;
      return `<div class="game-ind-row${rowClass}" style="--ind-cor:${cor}" onclick="BetaUI.abrirTooltipIndicador('${k}')">
        <div class="game-ind-top">
          <span class="game-ind-name${nameClass}"><span style="margin-right:4px;font-size:.8rem">${indIcon}</span>${indName}</span>
          <div style="display:flex;align-items:center;gap:3px">${trendHtml}<span class="game-ind-val" style="color:${cor}">${v}</span></div>
        </div>
        <div class="game-ind-track"><div class="game-ind-bar" style="width:${pct}%;background:${cor}"></div></div>
        <div class="game-ind-bench">${benchVal}</div>
      </div>`;
    }).join("");

    // Salvar indicadores atuais para próxima comparação
    _prevIndicators = { ...state.indicators };

    // Toast para indicadores recém-críticos
    if (newlyCritical.length && state.currentRound > 0) {
      newlyCritical.forEach(label => _mostrarCriticalToast(`⚠ ${label} em nível crítico! Ação urgente necessária.`));
    }
  }
  const strip = document.getElementById("game-gestor-strip");
  if (strip) {
    const g = state.gestor;
    const esgCor = g.esgotamento>=7?"var(--danger)":g.esgotamento>=5?"var(--warn)":"var(--good)";
    const capCor = g.capitalPolitico<=2?"var(--danger)":"var(--purple)";
    const repCor = g.reputacaoInterna<=2?"var(--danger)":"var(--purple)";
    strip.innerHTML = `
      <div class="gestor-pill" onclick="BetaUI.abrirTooltipIndicador('reputacaoInterna')">
        <span class="gestor-pill-label">Reputação ⓘ</span>
        <span class="gestor-pill-val" style="color:${repCor}">${g.reputacaoInterna}/10</span>
      </div>
      <div class="gestor-pill" onclick="BetaUI.abrirTooltipIndicador('capitalPolitico')">
        <span class="gestor-pill-label">Cap. Político ⓘ</span>
        <span class="gestor-pill-val" style="color:${capCor}">${g.capitalPolitico}/10</span>
      </div>
      <div class="gestor-pill" onclick="BetaUI.abrirTooltipIndicador('esgotamento')">
        <span class="gestor-pill-label">Esgotamento ⓘ</span>
        <span class="gestor-pill-val" style="color:${esgCor}">${g.esgotamento}/10</span>
      </div>`;
  }
  _salvarSessao();
  } catch(err) {
    console.error("renderSidebar crash — jogo continua:", err);
    mostrarAviso("Erro ao atualizar a tela. O jogo continua.");
    try { _salvarSessao(); } catch(e) {}
  }
}

/* ════════════════════════════════════════════════════
   RODADA
════════════════════════════════════════════════════ */
function renderRodada(state) {
  _escolhaFeita = false;
  _bloqueioAte  = Date.now() + 350; // bloqueia toques fantasma pós-transição
  const round = state.gameRounds[state.currentRound];
  if (!round) return;

  const faseLabel = { fundacao:"Diagnóstico",crescimento:"Crescimento",
                      crise:"⚠ Crise",consolidacao:"Consolidação",expansao:"Expansão" };
  const fase = state.storyState?.faseEmpresa;
  document.getElementById("hist-round-badge").textContent =
    `Rodada ${state.currentRound+1} · ${faseLabel[fase]||""}`;
  document.getElementById("hist-round-title").textContent = round.title || "";
  document.getElementById("hist-round-desc").textContent  = _enriquecerDescricao(round.description||"", state);

  // Evento ativo
  const ev     = state.activeEvents?.find(e => e.expiresAt >= state.currentRound);
  const banner = document.getElementById("hist-event-banner");
  const evTxt  = document.getElementById("hist-event-text");
  if (ev && banner && evTxt) { banner.classList.add("visible"); evTxt.textContent = `${ev.titulo} — ${ev.descricao}`; }
  else if (banner) banner.classList.remove("visible");

  // Choices
  const choices = state.choicesAtivas || round.choices;
  const lista   = document.getElementById("choices-list");
  lista.innerHTML = choices.map((c, i) => {
    const letra = String.fromCharCode(65+i);
    const risco = c.risco ? `<span class="choice-risk risk-${c.risco}">${c.risco.toUpperCase()}</span>` : "";
    return `<button class="choice-card" onclick="BetaUI.escolher(${i})" id="choice-btn-${i}">
      <span class="choice-letter">${letra}</span>
      <span class="choice-text">${c.text}</span>
      ${risco}
    </button>`;
  }).join("");

  // Histórico + recomendações
  _renderHistoricoTab(state);

  // Timer
  _iniciarTimer();

  // Sempre começa na aba HISTÓRIA
  mudarTab("historia");
  mostrarTela("screen-game");
}

/* ── Abas ──────────────────────────────────────────── */
function mudarTab(aba) {
  ["historia","desafios","historico","empresa"].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.remove("active");
    document.getElementById(`gtab-${t}`)?.classList.remove("active");
  });
  document.getElementById(`tab-${aba}`)?.classList.add("active");
  document.getElementById(`gtab-${aba}`)?.classList.add("active");
}

/* ── Histórico + Recomendações ─────────────────────── */
function _renderHistoricoTab(state) {
  const histEl = document.getElementById("historico-indicadores");
  const recEl  = document.getElementById("recomendacoes-panel");
  if (histEl) {
    const ultimas = state.history?.slice(-6).reverse() || [];
    if (!ultimas.length) {
      histEl.innerHTML = `<span style="color:var(--text-muted);font-size:.78rem;">Tome decisões para ver as mudanças aqui.</span>`;
    } else {
      histEl.innerHTML = ultimas.map(h => {
        const efeitos = Object.entries(h.efeitos||{}).filter(([,v])=>v!==0).slice(0,3)
          .map(([k,v])=>`<span class="efeito-tag ${v>0?'efeito-pos':'efeito-neg'}">${v>0?"+":""}${v} ${BetaIndicadores.LABELS[k]||k}</span>`)
          .join(" ");
        const emo = h.avaliacao==="boa"?"✅":h.avaliacao==="ruim"?"❌":"⚠️";
        return `<div class="historico-item">
          <div class="historico-item-round">${emo} Rod.${h.rodada} — ${h.titulo}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">${efeitos}</div>
        </div>`;
      }).join("");
    }
  }
  if (recEl) {
    const recs = _gerarRecomendacoes(state);
    recEl.innerHTML = recs.length
      ? recs.map(r=>`<div class="rec-item"><div class="rec-item-title">${r.titulo}</div><div class="rec-item-desc">${r.desc}</div></div>`).join("")
      : `<span style="color:var(--text-muted);font-size:.78rem;">Recomendações aparecem conforme o jogo avança.</span>`;
  }
}

/* ════════════════════════════════════════════════════
   MEMÓRIA NARRATIVA
════════════════════════════════════════════════════ */
function _enriquecerDescricao(desc, state) {
  const hist  = state.history || [];
  const flags = state.storyState?.flags || [];
  const g     = state.gestor;
  const refs  = [];
  if (hist.length && state.currentRound > 2) {
    const ultimaRuim = hist.filter(h=>h.avaliacao==="ruim").slice(-1)[0];
    if (ultimaRuim) refs.push(`O impacto de "${ultimaRuim.escolha.slice(0,48)}..." ainda repercute na organização.`);
  }
  if (g.esgotamento >= 7) refs.push("Você sente o peso acumulado das rodadas anteriores.");
  if (flags.includes("lideranca_toxica")) refs.push("A tensão interna criada pelas últimas decisões é perceptível.");
  if (!refs.length) return desc;
  return `[${refs[0]}]\n\n${desc}`;
}

/* ════════════════════════════════════════════════════
   RECOMENDAÇÕES
════════════════════════════════════════════════════ */
function _gerarRecomendacoes(state) {
  const ind  = state.indicators;
  const bench= BENCHMARKS[state.sector] || {};
  const recs = [];
  Object.entries(ind).forEach(([k, v]) => {
    const b = bench[k]; if (!b) return;
    const label = BetaIndicadores.LABELS[k] || k;
    if (v < b-3) recs.push({ titulo:`⚠ ${label} abaixo do mercado`, desc:`${label} (${v}) está ${b-v} pts abaixo da média do setor (${b}).` });
    else if (v > b+3) recs.push({ titulo:`✅ ${label} acima da média`, desc:`${label} (${v}) está ${v-b} pts acima da média do setor (${b}). Mantenha.` });
  });
  const g = state.gestor;
  if (g.esgotamento >= 7) recs.push({ titulo:"🔋 Esgotamento crítico", desc:"Priorize decisões que reduzam pressão e resgatem capital político." });
  if (g.capitalPolitico <= 3) recs.push({ titulo:"🏛 Capital político baixo", desc:"O conselho está desconfiante. Decisões com retorno financeiro ou de clientes recuperam credibilidade." });
  return recs.slice(0, 4);
}

/* ════════════════════════════════════════════════════
   ESCOLHA / TIMER
════════════════════════════════════════════════════ */
function escolher(idx) {
  if (_escolhaFeita) return;
  if (Date.now() < _bloqueioAte) return; // bloqueia toque fantasma pós-transição
  _escolhaFeita = true;
  _pararTimer();

  // Animação: destaca escolha, desabilita opções
  document.querySelectorAll(".choice-card").forEach((b, i) => {
    b.disabled = true;
    if (i === idx) b.classList.add("chosen");
  });

  // Animar barras dos indicadores (feedback visual imediato)
  document.querySelectorAll(".game-ind-bar").forEach(bar => {
    bar.classList.add("deciding");
    setTimeout(() => bar.classList.remove("deciding"), 600);
  });

  // Pequena pausa para a animação ser vista antes de processar
  setTimeout(() => processarEscolha(idx), 180);
}

function _iniciarTimer() {
  _pararTimer();
  if (!_settings.timer) return;
  _timerSegs = 90;
  const el = document.getElementById("timer-display");
  if (!el) return;
  el.classList.add("active"); el.classList.remove("danger");
  el.textContent = `⏱ ${_timerSegs}s`;
  _timerInterval = setInterval(() => {
    _timerSegs--;
    el.textContent = `⏱ ${_timerSegs}s`;
    if (_timerSegs <= 10) el.classList.add("danger");
    if (_timerSegs <= 0) { _pararTimer(); if (!_escolhaFeita) escolher(0); }
  }, 1000);
}

function _pararTimer() {
  clearInterval(_timerInterval); _timerInterval = null;
  const el = document.getElementById("timer-display");
  if (el) { el.classList.remove("active","danger"); el.textContent = ""; }
}

/* ════════════════════════════════════════════════════
   FEEDBACK
════════════════════════════════════════════════════ */
function mostrarFeedback(data, callback) {
  _feedbackCallback = callback;
  mostrarTela("screen-feedback");
  const corMap   = { boa:"var(--good)", media:"var(--warn)", ruim:"var(--danger)" };
  const iconMap  = { boa:"✅", media:"⚠️", ruim:"❌" };
  const labelMap = { boa:"BOA DECISÃO", media:"DECISÃO COM TRADE-OFFS", ruim:"MÁ DECISÃO" };
  const badgeClass = { boa:"verdict-boa", media:"verdict-media", ruim:"verdict-ruim" };
  const badge = document.getElementById("fb-veredito-badge");
  if (badge) { badge.className=`verdict-badge ${badgeClass[data.avaliacao]||"verdict-media"}`; badge.textContent=iconMap[data.avaliacao]||"⚠️"; }
  const lbl = document.getElementById("fb-veredito-label");
  if (lbl) { lbl.textContent=labelMap[data.avaliacao]||"DECISÃO"; lbl.style.color=corMap[data.avaliacao]; }
  document.getElementById("fb-veredito-sub").textContent   = data.avaliacao==="boa"?"Decisão acertada":data.avaliacao==="ruim"?"Decisão equivocada":"Decisão com trade-offs";
  document.getElementById("fb-escolha-texto").textContent  = data.escolhaTexto||"";
  document.getElementById("fb-explicacao-texto").textContent = data.ensinamento||"";
  // Impactos
  const grid = document.getElementById("fb-impactos-grid");
  if (grid) grid.innerHTML = Object.entries(data.efeitos||{}).filter(([,v])=>v!==0).map(([k,v])=>{
    const cor=v>0?"var(--good)":"var(--danger)"; const nome=BetaIndicadores.LABELS[k]||k;
    return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor}">${v>0?"+":""}${v}</span><span class="fb-chip-nome">${nome}</span></div>`;
  }).join("")||`<span style="font-size:.8rem;color:var(--text-muted)">Sem impacto direto.</span>`;
  // Melhor alternativa
  const altEl = document.getElementById("fb-melhor-alt");
  if (altEl) {
    const melhor = data.melhorAlternativa;
    const _scoreFB = efs => Object.values(efs || {}).reduce((s,v) => s+v, 0);
    const melhorEhMelhor = melhor && melhor.text !== data.escolhaTexto
      && _scoreFB(melhor.effects) > _scoreFB(data.efeitos);
    if (melhorEhMelhor) {
      altEl.style.display = "";
      document.getElementById("fb-alt-texto").textContent = melhor.text;
      document.getElementById("fb-alt-ensinamento").textContent = melhor.ensinamento||"";
      const efEl = document.getElementById("fb-alt-efeitos");
      if (efEl) efEl.innerHTML = Object.entries(melhor.effects||{}).filter(([,v])=>v!==0).map(([k,v])=>{
        const cor=v>0?"var(--good)":"var(--danger)"; const nome=BetaIndicadores.LABELS[k]||k;
        return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor};font-size:.8rem">${v>0?"+":""}${v}</span><span class="fb-chip-nome">${nome}</span></div>`;
      }).join("");
    } else { altEl.style.display="none"; }
  }
  // Gestor
  const gestorEl=document.getElementById("fb-gestor"), gestorGrid=document.getElementById("fb-gestor-grid");
  if (gestorEl && gestorGrid) {
    const eg=data.efeitosGestor||{}, temEfeito=Object.values(eg).some(v=>v!==0);
    if (temEfeito) {
      gestorEl.style.display="";
      const labels={reputacaoInterna:"🧑 Reputação",capitalPolitico:"🏛 Cap. Político",esgotamento:"🔋 Esgotamento"};
      gestorGrid.innerHTML=Object.entries(eg).filter(([,v])=>v!==0).map(([k,v])=>{
        const ruim=k==="esgotamento"?v>0:v<0; const cor=ruim?"var(--danger)":"var(--purple)";
        return `<div class="fb-chip"><span class="fb-chip-val" style="color:${cor}">${v>0?"+":""}${v}</span><span class="fb-chip-nome">${labels[k]||k}</span></div>`;
      }).join("");
    } else { gestorEl.style.display="none"; }
  }
  // Stakeholder
  const stEl=document.getElementById("fb-stakeholder");
  if (data.stakeholderReacao && stEl) {
    stEl.style.display="";
    document.getElementById("fb-st-icon").textContent=data.stakeholderReacao.icone||"👤";
    document.getElementById("fb-st-nome").textContent=data.stakeholderReacao.nome||"";
    document.getElementById("fb-st-txt").textContent=data.stakeholderReacao.texto||"";
  } else if (stEl) { stEl.style.display="none"; }
  // Evento
  const evEl=document.getElementById("fb-evento"), evTxt=document.getElementById("fb-evento-texto");
  if (data.eventoAtivo && evEl) { evEl.style.display=""; evTxt.textContent=`${data.eventoAtivo.titulo} amplificou os efeitos desta rodada.`; }
  else if (evEl) { evEl.style.display="none"; }
  // Notificações
  const notifEl=document.getElementById("fb-notif"), notifLst=document.getElementById("fb-notif-lista");
  if (notifEl && notifLst) {
    const notifs=[...(data.novasFlags||[]).map(f=>_textoFlag(f)),...(data.novasConquistas||[]).map(c=>`🏆 ${c}`)];
    if (notifs.length) { notifEl.style.display=""; notifLst.innerHTML=notifs.map(n=>`<div class="fb-notif-row">${n}</div>`).join(""); }
    else { notifEl.style.display="none"; }
  }
  // Histórico rápido
  const histEl=document.getElementById("fb-historico"), histLst=document.getElementById("fb-historico-lista");
  if (histEl && histLst && data.historico?.length) {
    histEl.style.display="";
    histLst.innerHTML=data.historico.slice(0,3).map(h=>{
      const emo=h.avaliacao==="boa"?"✅":h.avaliacao==="ruim"?"❌":"⚠️";
      return `<div class="historico-item"><div class="historico-item-round">${emo} Rod.${h.rodada} — ${h.titulo}</div></div>`;
    }).join("");
  } else if (histEl) { histEl.style.display="none"; }
}

function avancar() {
  if (!_feedbackCallback) return;
  const cb = _feedbackCallback;
  _feedbackCallback = null;
  _bloqueioAte = Date.now() + 400; // bloqueia escolher() durante transição
  cb();
}

/* ════════════════════════════════════════════════════
   RESULTADO FINAL
════════════════════════════════════════════════════ */
function renderResultado({ motivo, score, scoreGestor, gestor, indicators,
                           history, companyName, empresa, sector, epilogo, decisoesCruciais }) {
  mostrarTela("screen-result");
  _registrarResultado(score, scoreGestor, sector, companyName);
  const titulos={fim:score>=70?"Mandato Concluído com Êxito":score>=45?"Mandato Concluído":"Mandato com Dificuldades",gameover:"Colapso Operacional",mandato_conselho:"Encerrado pelo Conselho",mandato_burnout:"Afastamento por Burnout"};
  const subs={fim:"Você completou as 15 rodadas. Veja o balanço do seu mandato.",gameover:"Um indicador zerou. A empresa entrou em colapso.",mandato_conselho:"Seu capital político se esgotou e o conselho encerrou seu mandato.",mandato_burnout:"O esgotamento chegou ao limite e você precisou se afastar."};
  const motivoLabels = {fim:"Relatório Final",gameover:"Colapso Operacional",
    mandato_conselho:"Mandato Encerrado pelo Conselho",mandato_burnout:"Afastamento por Burnout"};
  document.getElementById("result-motivo-label").textContent = motivoLabels[motivo] || motivo.replace(/_/g," ").toUpperCase();
  document.getElementById("result-title").textContent    = titulos[motivo]||"Mandato Encerrado";
  document.getElementById("result-subtitle").textContent = subs[motivo]||"";
  const corEmp=score>=70?"var(--good)":score>=45?"var(--warn)":"var(--danger)";
  const corGes=scoreGestor>=70?"var(--purple)":scoreGestor>=45?"var(--warn)":"var(--danger)";
  const numEl=document.getElementById("result-score-num"), mgEl=document.getElementById("result-manager-num");
  if (numEl){numEl.textContent=score; numEl.style.color=corEmp;}
  if (mgEl) {mgEl.textContent=scoreGestor; mgEl.style.color=corGes;}
  // Epílogo
  const epilogoSec=document.getElementById("result-epilogo-section"), epilogoEl=document.getElementById("result-epilogo");
  if (epilogo && epilogoEl && epilogoSec) {
    epilogoSec.style.display="";
    epilogoEl.innerHTML=`<div class="result-epilogo-titulo">${epilogo.titulo}</div><div class="result-epilogo-desc">${epilogo.descricao}</div>`;
  } else if (epilogoSec) { epilogoSec.style.display="none"; }
  // Indicadores com benchmark
  const indEl=document.getElementById("result-indicators");
  if (indEl) {
    const bench=BENCHMARKS[sector]||{};
    indEl.innerHTML=Object.entries(indicators).map(([k,v])=>{
      const cor=BetaIndicadores.corNivel(v), label=BetaIndicadores.LABELS[k]||k, b=bench[k];
      const diff=b?(v>b?`+${v-b} acima`:v<b?`${v-b} abaixo`:"na média"):"";
      return `<div class="result-ind-card">
        <div class="result-ind-label">${label}</div>
        <div class="result-ind-val" style="color:${cor}">${v}<span style="font-size:.7rem;color:var(--text-muted)">/20</span></div>
        ${diff?`<div class="result-ind-level" style="color:${cor}">${diff}</div>`:""}
      </div>`;
    }).join("");
  }
  // Gestor final
  const gestorGrid=document.getElementById("result-gestor-grid");
  if (gestorGrid) {
    const g=gestor, esgCor=g.esgotamento>=7?"var(--danger)":g.esgotamento>=5?"var(--warn)":"var(--good)";
    gestorGrid.innerHTML=`
      <div class="gestor-item"><div class="gestor-item-val" style="color:var(--purple)">${g.reputacaoInterna}</div><div class="gestor-item-label">Reputação Interna</div></div>
      <div class="gestor-item"><div class="gestor-item-val" style="color:var(--purple)">${g.capitalPolitico}</div><div class="gestor-item-label">Capital Político</div></div>
      <div class="gestor-item"><div class="gestor-item-val" style="color:${esgCor}">${g.esgotamento}</div><div class="gestor-item-label">Esgotamento</div></div>`;
  }
  // Decisões cruciais — modo revisão
  const cruciaisSec=document.getElementById("result-cruciais-section"), cruciaisLst=document.getElementById("result-cruciais-lista");
  if (cruciaisSec && cruciaisLst && decisoesCruciais?.length) {
    cruciaisSec.style.display="";
    cruciaisLst.innerHTML=decisoesCruciais.map(d=>{
      const emo=d.avaliacao==="boa"?"✅":d.avaliacao==="ruim"?"❌":"⚠️";
      const efeitos=Object.entries(d.efeitos||{}).filter(([,v])=>v!==0).map(([k,v])=>{
        const cor=v>0?"var(--good)":"var(--danger)"; const nome=BetaIndicadores.LABELS[k]||k;
        return `<span style="color:${cor};font-size:.65rem;margin-right:8px">${v>0?"+":""}${v} ${nome}</span>`;
      }).join("");
      return `<div class="crucial-item">
        <div class="crucial-round">${emo} Rodada ${d.rodada} — ${d.titulo}</div>
        <div class="crucial-escolha">"${d.escolha}"</div>
        <div style="margin:6px 0">${efeitos}</div>
        ${d.ensinamento?`<div style="font-size:.75rem;color:var(--text-muted);line-height:1.4;font-style:italic">${d.ensinamento}</div>`:""}
      </div>`;
    }).join("");
  } else if (cruciaisSec) { cruciaisSec.style.display="none"; }
}

/* ════════════════════════════════════════════════════
   GLOSSÁRIO
════════════════════════════════════════════════════ */
const GLOSSARIO_TERMOS = [
  /* ── Indicadores e Mecânicas do Jogo ── */
  { termo:"SLA", def:"Acordo de Nível de Serviço (Service Level Agreement). Define metas de prazo e qualidade entre fornecedor e cliente. Ex: entregar 95% dos pedidos em até 48h." },
  { termo:"NPS", def:"Nota de lealdade dos clientes (Net Promoter Score). Calculado pela pergunta: 'De 0 a 10, quanto você recomendaria esta empresa?' Acima de 70 é excelente." },
  { termo:"Benchmark", def:"Referência média do mercado para um indicador. Exibido abaixo das barras durante o jogo — serve para comparar seu desempenho com o do setor." },
  { termo:"Capital Político", def:"Credibilidade do gestor junto ao conselho e parceiros estratégicos. Cai com decisões precipitadas ou resultados ruins. Sobe com alinhamento e entregas consistentes." },
  { termo:"Esgotamento", def:"Nível de desgaste pessoal do gestor. Ao atingir 10, é necessário se afastar por colapso e o mandato é encerrado antecipadamente." },
  { termo:"Flag", def:"Padrão de comportamento registrado ao longo do mandato. Influencia quais eventos aparecem e o desfecho final. Ex: Liderança Tóxica, Crescimento sem Caixa." },
  { termo:"Imprevisto", def:"Evento inesperado que altera os efeitos das decisões durante aquela rodada. Pode ser positivo ou negativo, e é influenciado pelo estado atual dos indicadores." },
  { termo:"Margem Operacional", def:"Quanto de cada real de receita sobra como lucro operacional. Ex: margem de 8% significa que a empresa lucra R$8 para cada R$100 vendidos." },
  { termo:"Mandato", def:"Uma partida completa do jogo, com 15 rodadas de decisões. O gestor conduz a empresa do início ao fim e recebe uma pontuação pelo resultado." },

  /* ── Finanças e Investimento ── */
  { termo:"ARR", def:"Receita Recorrente Anual (Annual Recurring Revenue). Total de contratos ativos que a empresa recebe por ano. Principal métrica de saúde de empresas SaaS." },
  { termo:"Churn", def:"Taxa de cancelamento de clientes. Churn de 3,8% ao mês significa que 3,8% da base cancela todo mês — o que elimina metade da base em menos de 2 anos." },
  { termo:"CAC", def:"Custo de Aquisição de Cliente. Quanto a empresa gasta em marketing e vendas para conquistar um novo cliente. Quanto menor, melhor." },
  { termo:"Runway", def:"Tempo que a empresa sobrevive com o caixa atual, sem nova receita. Ex: 'temos 8 meses de runway' significa que o dinheiro acaba em 8 meses." },
  { termo:"Break-even", def:"Ponto de equilíbrio: quando receitas e custos se igualam. A empresa deixa de ter prejuízo e começa a lucrar a partir desse ponto." },
  { termo:"Capex", def:"Investimento em bens de capital fixo (Capital Expenditure). Ex: comprar máquinas, construir um galpão, instalar painéis solares. Diferente de custo operacional." },
  { termo:"Hedge Cambial", def:"Instrumento financeiro que trava o custo do dólar, protegendo empresas que têm custos em moeda estrangeira mas receita em reais." },
  { termo:"Payback", def:"Prazo em que um investimento se paga com a economia ou receita gerada. Ex: painéis solares com payback de 4,5 anos se pagam em 4 anos e 6 meses." },
  { termo:"IPO", def:"Abertura de capital na bolsa de valores (Initial Public Offering). A empresa vende ações ao público para captar dinheiro e cresce com capital dos investidores." },
  { termo:"M&A", def:"Fusões e Aquisições (Mergers & Acquisitions). Processo de compra, fusão ou incorporação de uma empresa por outra." },
  { termo:"Due Diligence", def:"Análise detalhada feita antes de uma aquisição ou investimento. Verifica riscos financeiros, jurídicos, trabalhistas e operacionais da empresa-alvo." },
  { termo:"Série A / Série B", def:"Rodadas de investimento numeradas. Série A é a primeira rodada significativa (geralmente R$5M a R$30M). Série B é a seguinte, para escalar o que foi validado." },
  { termo:"Angel (Investidor-Anjo)", def:"Pessoa física que investe capital próprio em startups em estágio inicial, geralmente em troca de uma participação pequena na empresa." },
  { termo:"Venture Capital", def:"Fundo de capital de risco que investe em startups com alto potencial de crescimento. Em troca, recebe participação societária." },
  { termo:"Private Equity", def:"Fundo que investe em empresas maiores e mais maduras (não startups), buscando eficiência operacional e retorno na venda futura." },
  { termo:"Stock Options", def:"Opção de compra de ações da empresa por um preço fixo. Benefício que alinha o interesse do colaborador com o crescimento da empresa a longo prazo." },
  { termo:"Switching Cost", def:"Custo que o cliente teria ao trocar de fornecedor — tempo de integração, retreinamento, risco de falha. Quanto maior, mais difícil é perder o cliente." },

  /* ── Tecnologia e Produto ── */
  { termo:"SaaS", def:"Software como Serviço (Software as a Service). Modelo em que o software é cobrado mensalmente por assinatura, sem instalação local. Ex: Google Drive, Salesforce." },
  { termo:"Dívida Técnica", def:"Atalhos no código que aceleram a entrega hoje, mas criam problemas no futuro. Quanto maior a dívida, mais lento e instável o sistema fica com o tempo." },
  { termo:"Pivot", def:"Mudança radical de direção estratégica ou de modelo de negócio. Ex: uma startup de SaaS que decide virar plataforma de IA generativa." },
  { termo:"Product-Market Fit", def:"Encaixe produto-mercado. O momento em que o produto resolve tão bem um problema real que os clientes o recomendam naturalmente e o churn cai." },
  { termo:"Roadmap", def:"Plano de funcionalidades e melhorias do produto ordenado no tempo. Define o que será desenvolvido e em que sequência." },
  { termo:"ERP", def:"Sistema integrado de gestão empresarial (Enterprise Resource Planning). Centraliza finanças, estoque, RH e produção em um único sistema." },
  { termo:"IoT", def:"Internet das Coisas (Internet of Things). Sensores e equipamentos conectados à internet que enviam dados em tempo real. Ex: sensor de temperatura em câmara fria." },
  { termo:"DPO", def:"Encarregado de Proteção de Dados (Data Protection Officer). Profissional responsável pela conformidade com a LGPD. Nomeação obrigatória para empresas que tratam dados pessoais em escala." },
  { termo:"TMS", def:"Sistema de Gerenciamento de Transporte (Transportation Management System). Controla rotas, rastreamento e custos de frota em operações logísticas." },
  { termo:"Injeção SQL", def:"Tipo de ataque hacker que insere comandos maliciosos em campos de texto para acessar o banco de dados e roubar informações." },

  /* ── Operações e Logística ── */
  { termo:"Lead Time", def:"Tempo total desde o pedido até a entrega ao cliente. Reduzir o lead time é um dos principais objetivos da gestão de operações." },
  { termo:"Kanban", def:"Sistema de produção puxada. Produz apenas o que foi vendido ou consumido, reduzindo estoque intermediário e tempo de entrega." },
  { termo:"Lean Manufacturing", def:"Manufatura enxuta. Filosofia que elimina desperdícios no processo produtivo — tempo ocioso, estoque excessivo, defeitos, movimentação desnecessária." },
  { termo:"Cold Chain", def:"Cadeia do frio. Transporte e armazenagem de produtos que precisam de temperatura controlada, como alimentos perecíveis e medicamentos." },
  { termo:"White Label", def:"Produto fabricado por uma empresa e vendido por outra com a sua própria marca. Ex: supermercado que vende arroz com a marca própria fabricado por terceiro." },
  { termo:"Dark Store", def:"Loja física convertida em mini-centro de distribuição para e-commerce, sem atendimento presencial. Foco em separação e envio rápido de pedidos." },
  { termo:"Click-and-Collect", def:"Modelo onde o cliente compra online e retira na loja física. Elimina o custo de frete e gera tráfego para o ponto físico." },
  { termo:"SKU", def:"Código único de produto (Stock Keeping Unit). Cada variação de produto (tamanho, cor, sabor) tem um SKU diferente para controle de estoque." },
  { termo:"Omnichannel", def:"Estratégia que integra todos os canais de venda e atendimento (loja física, site, app, telefone) em uma experiência única para o cliente." },

  /* ── RH e Gestão de Pessoas ── */
  { termo:"Burnout", def:"Síndrome de esgotamento profissional causada por estresse crônico no trabalho. Pode levar ao afastamento. No jogo, representa colapso do gestor." },
  { termo:"Onboarding", def:"Processo de integração de um novo colaborador ou cliente. Inclui treinamentos, apresentações e adaptação à cultura e ferramentas da empresa." },
  { termo:"Rotatividade (Turnover)", def:"Percentual de funcionários que saem e precisam ser substituídos no ano. Alta rotatividade sinaliza problemas de gestão, cultura ou remuneração." },

  /* ── Regulatório e Jurídico ── */
  { termo:"LGPD", def:"Lei Geral de Proteção de Dados. Regula o uso de dados pessoais no Brasil. Multas podem chegar a 2% do faturamento ou R$50 milhões por infração." },
  { termo:"ANPD", def:"Autoridade Nacional de Proteção de Dados. Órgão do governo que fiscaliza o cumprimento da LGPD e aplica penalidades em caso de violação." },
  { termo:"ISO 9001", def:"Norma internacional de gestão da qualidade. Certifica que a empresa tem processos controlados e rastreáveis. Exigida por grandes clientes industriais." },
  { termo:"ESG", def:"Critérios ambientais, sociais e de governança (Environmental, Social, Governance). Avaliados por investidores e clientes para decidir com quem fazer negócio." },
  { termo:"IFA", def:"Índice de Frequência de Acidentes. Mede o número de acidentes com afastamento por milhão de horas trabalhadas. Benchmark nacional: 8,2." },
  { termo:"EPI", def:"Equipamento de Proteção Individual. Capacete, luva, óculos, bota e outros itens obrigatórios por lei para proteção do trabalhador." },
  { termo:"CIPA", def:"Comissão Interna de Prevenção de Acidentes. Grupo de funcionários e gestores que acompanha as condições de segurança. Obrigatória em empresas com 20+ funcionários." },
  { termo:"CAT", def:"Comunicação de Acidente de Trabalho. Documento obrigatório emitido pelo empregador quando um funcionário sofre acidente ou doença ocupacional." },
  { termo:"MTE", def:"Ministério do Trabalho e Emprego. Órgão federal que fiscaliza as condições de trabalho, pode autuar empresas e interditar operações inseguras." },

  /* ── Mercado e Estratégia ── */
  { termo:"B2B", def:"Business to Business. Empresa que vende para outras empresas (não para o consumidor final). Ex: software de gestão vendido para PMEs." },
  { termo:"B2C", def:"Business to Consumer. Empresa que vende diretamente ao consumidor final. Ex: loja de varejo, aplicativo de delivery." },
  { termo:"PME", def:"Pequena e Média Empresa. No Brasil, classificadas por faturamento anual: pequena até R$4,8M, média até R$300M." },
  { termo:"Pipeline Comercial", def:"Conjunto de oportunidades de venda em andamento. 'Pipeline cheio' significa muitos negócios potenciais sendo negociados." },
  { termo:"Indústria 4.0", def:"Quarta revolução industrial. Integração de automação, robótica, IoT e inteligência artificial nos processos industriais para maior eficiência e rastreabilidade." },
  { termo:"Verticalização", def:"Estratégia de especializar a empresa em um setor ou nicho específico, ao invés de atender mercados variados. Cria diferencial técnico e relacionamentos mais profundos." },
  { termo:"Interdependência", def:"Relação causal entre indicadores. Ex: na logística, frota deteriorada → segurança cai → RH cai → resultado financeiro cai." },
];


function openGlossary() {
  const el=document.getElementById("overlay-glossary"), content=document.getElementById("glossary-content");
  _abrirOverlay('overlay-glossary');
  if (content) content.innerHTML=GLOSSARIO_TERMOS.map(g=>
    `<div class="glossary-term"><div class="glossary-term-word">${g.termo}</div><div class="glossary-term-def">${g.def}</div></div>`
  ).join("");
}
function closeGlossary() { const el=document.getElementById("overlay-glossary"); _fecharOverlay('overlay-glossary'); }

/* ════════════════════════════════════════════════════
   CONFIGURAÇÕES
════════════════════════════════════════════════════ */
function openSettings() {
  _abrirOverlay('overlay-settings');
  _atualizarToggleTimer();
  const cloudBtn = document.getElementById('toggle-cloud-btn');
  if (cloudBtn) {
    const on = _settings.cloudStatus !== false;
    cloudBtn.textContent = on ? 'ON' : 'OFF';
    cloudBtn.className = `toggle-btn ${on ? 'on' : 'off'}`;
  }
}
function closeSettings() { _fecharOverlay('overlay-settings'); }
function toggleTimerSetting() { _settings.timer=!_settings.timer; LS.set(SK.SETTINGS,_settings); _atualizarToggleTimer(); }
function toggleCloudStatus() {
  _settings.cloudStatus = !_settings.cloudStatus;
  LS.set(SK.SETTINGS, _settings);
  const btn = document.getElementById('toggle-cloud-btn');
  if (btn) { btn.textContent = _settings.cloudStatus ? 'ON' : 'OFF'; btn.className = `toggle-btn ${_settings.cloudStatus ? 'on' : 'off'}`; }
}
function _atualizarToggleTimer() {
  const btn=document.getElementById("toggle-timer-btn"); if(!btn) return;
  btn.textContent=_settings.timer?"ON":"OFF"; btn.className=`toggle-btn ${_settings.timer?"on":"off"}`;
}

/* ════════════════════════════════════════════════════
   UTILIDADES
════════════════════════════════════════════════════ */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
      .then(() => { _atualizarBotaoFullscreen(); })
      .catch(() => mostrarAviso("Tela cheia não disponível neste dispositivo."));
  } else {
    document.exitFullscreen?.();
    _atualizarBotaoFullscreen();
  }
}
function _atualizarBotaoFullscreen() {
  const btn = document.getElementById("settings-fs-btn");
  if (!btn) return;
  const isFs = !!document.fullscreenElement;
  btn.textContent = isFs ? "✕ Sair" : "⛶ Ativar";
}
document.addEventListener("fullscreenchange", _atualizarBotaoFullscreen);

function reiniciar() { LS.remove(SK.SESSION); _aplicarTemaSetor(null); mostrarTela("screen-home"); }

function _showToast(msg, tipo = "info", duracao = 3200) {
  const container = document.getElementById("toast");
  if (!container) return;
  const div = document.createElement("div");
  div.className = "toast-msg";
  const cores = {
    erro:    { bg:"rgba(231,76,60,.92)",  borda:"rgba(231,76,60,.5)",  icone:"❌" },
    aviso:   { bg:"rgba(243,156,18,.92)", borda:"rgba(243,156,18,.5)", icone:"⚠️" },
    ok:      { bg:"rgba(46,204,113,.92)", borda:"rgba(46,204,113,.5)", icone:"✅" },
    info:    { bg:"var(--bg4)",           borda:"var(--line2)",        icone:"ℹ️" },
    critico: { bg:"rgba(192,57,43,.95)",  borda:"rgba(192,57,43,.6)",  icone:"🚨" },
  };
  const c = cores[tipo] || cores.info;
  div.style.cssText = `background:${c.bg};border-color:${c.borda};`;
  div.textContent = `${c.icone} ${msg}`;
  container.appendChild(div);
  setTimeout(() => {
    div.classList.add("removing");
    setTimeout(() => div.remove(), 220);
  }, duracao);
}

function mostrarErro(msg)           { _showToast(msg, "info",    3200); }
function mostrarSucesso(msg)        { _showToast(msg, "ok",      2800); }
function mostrarAviso(msg)          { _showToast(msg, "aviso",   3200); }
function mostrarErroCritico(msg)    { _showToast(msg, "erro",    3500); }

function _mostrarCriticalToast(msg) { _showToast(msg, "critico", 3500); }

function _textoFlag(flag) {
  const MAPA={
    lideranca_toxica:"⚠️ Liderança Tóxica — padrão de decisões prejudicou o time",
    crescimento_sem_caixa:"⚠️ Decisões ruins drenaram o caixa",
    demissao_em_massa:"⚠️ Ondas de corte afetaram a cultura organizacional",
    rh_negligenciado:"⚠️ RH negligenciado — nenhuma decisão favoreceu o time",
    ignorou_seguranca:"⚠️ Vulnerabilidades de segurança foram ignoradas",
    crescimento_saudavel:"🟢 Sequência de 5 decisões corretas",
    investiu_em_inovacao:"🟢 Cultura de inovação estabelecida",
    gestor_de_crise:"🔥 Empresa recuperada de situação crítica",
    gestor_esgotado:"🔋 Esgotamento em nível crítico",
  };
  return MAPA[flag] || `🔔 ${flag}`;
}

/* ════════════════════════════════════════════════════
   REGISTRO NO ENGINE + BOOT
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   TUTORIAL
════════════════════════════════════════════════════ */
let _tutorialStep = 0;
const _TUTORIAL_TOTAL = 4;

function pularTutorial() {
  localStorage.setItem('gsp_tutorial_done', '1');
  _verificarSessaoSalva();
  _atualizarHome();
  mostrarTela('screen-home');
}

function tutorialStep(dir) {
  const slides = document.querySelectorAll('.tutorial-slide');
  const dots   = document.querySelectorAll('.tut-dot');
  slides[_tutorialStep]?.classList.remove('active');
  dots[_tutorialStep]?.classList.remove('active');
  _tutorialStep = Math.max(0, _tutorialStep + dir);
  if (_tutorialStep >= _TUTORIAL_TOTAL) { pularTutorial(); return; }
  slides[_tutorialStep]?.classList.add('active');
  dots[_tutorialStep]?.classList.add('active');
  const prevBtn = document.getElementById('tut-prev');
  const nextBtn = document.getElementById('tut-next');
  if (prevBtn) prevBtn.style.display = _tutorialStep > 0 ? '' : 'none';
  if (nextBtn) nextBtn.textContent = _tutorialStep === _TUTORIAL_TOTAL - 1 ? 'Começar →' : 'Próximo →';
}

// BUG #7 FIX: dots do tutorial agora são clicáveis
function irParaSlide(step) {
  const slides = document.querySelectorAll('.tutorial-slide');
  const dots   = document.querySelectorAll('.tut-dot');
  slides[_tutorialStep]?.classList.remove('active');
  dots[_tutorialStep]?.classList.remove('active');
  _tutorialStep = Math.max(0, Math.min(step, _TUTORIAL_TOTAL - 1));
  slides[_tutorialStep]?.classList.add('active');
  dots[_tutorialStep]?.classList.add('active');
  const prevBtn = document.getElementById('tut-prev');
  const nextBtn = document.getElementById('tut-next');
  if (prevBtn) prevBtn.style.display = _tutorialStep > 0 ? '' : 'none';
  if (nextBtn) nextBtn.textContent = _tutorialStep === _TUTORIAL_TOTAL - 1 ? 'Começar →' : 'Próximo →';
}

/* ════════════════════════════════════════════════════
   PERFIL DO JOGADOR
════════════════════════════════════════════════════ */
async function irParaPerfil() {
  // Configura hold 3s no avatar para admin
  setTimeout(() => {
    const av = document.getElementById('perfil-avatar');
    if (av && !av._adminListened) {
      av._adminListened = true;
      av.addEventListener('click',     _contarCliqueAdmin);
      av.addEventListener('touchend',  _contarCliqueAdmin, { passive: true });
    }
  }, 500);
  mostrarTela('screen-perfil');
  const playerSalvo = LS.get(SK.PLAYER);
  if (playerSalvo) _player = playerSalvo;
  const isGuest = _player?.tipo === "guest" || !_player?.uid;

  // Renderiza IMEDIATAMENTE com dados locais
  const hist = LS.get(isGuest ? SK.HIST_GUEST : SK.HISTORICO) || [];
  const nome = _player?.nome || 'Jogador';

  // Avatar
  const av = document.getElementById('perfil-avatar');
  if (av) av.textContent = nome.charAt(0).toUpperCase();
  const pn = document.getElementById('perfil-nome');
  if (pn) pn.textContent = nome;

  // ID curto + email (só para logados)
  const metaRow = document.getElementById('perfil-meta-row');
  if (metaRow) {
    if (!isGuest && _player?.uid) {
      const idCurto = '#' + _player.uid.substring(0, 8).toUpperCase();
      const email   = _player.email || '';
      metaRow.innerHTML = `
        <div class="perfil-id-badge" onclick="BetaUI._copiarId('${idCurto}')" title="Clique para copiar">${idCurto} <span style="font-size:.65rem;opacity:.6">⎘</span></div>
        ${email ? `<div class="perfil-email">${email}</div>` : ''}`;
    } else {
      metaRow.innerHTML = `<div class="perfil-id-badge" style="opacity:.5">Convidado</div>`;
    }
  }

  // Botão logout visível só para logados
  const logoutBtn = document.getElementById('perfil-logout-btn');
  if (logoutBtn) logoutBtn.style.display = (!isGuest && _player?.uid) ? '' : 'none';

  const total  = hist.length;
  const melhor = total ? Math.max(...hist.map(h => h.score)) : 0;
  const media  = total ? Math.round(hist.reduce((a,h) => a + h.score, 0) / total) : 0;
  const boas   = hist.filter(h => h.score >= 70).length;
  const setorCount = {};
  hist.forEach(h => { setorCount[h.sector] = (setorCount[h.sector] || 0) + 1; });
  const favEntry = Object.entries(setorCount).sort((a,b) => b[1]-a[1])[0];
  const icones = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };
  const favLabel = favEntry ? `${icones[favEntry[0]]||''} ${favEntry[0]}` : '—';

  const sub = document.getElementById('perfil-subtitulo');
  if (sub) sub.textContent = `${total} mandato${total !== 1 ? 's' : ''} concluído${total !== 1 ? 's' : ''}`;

  const statsEl = document.getElementById('perfil-stats');
  if (statsEl) statsEl.innerHTML = [
    { val: total ? melhor : '—', label: 'Melhor Score' },
    { val: total ? media  : '—', label: 'Score Médio'  },
    { val: boas,                 label: 'Excelentes (70+)' },
    { val: favLabel,             label: 'Setor Favorito' },
  ].map(s => `<div class="perfil-stat">
    <div class="perfil-stat-val">${s.val}</div>
    <div class="perfil-stat-label">${s.label}</div>
  </div>`).join('');

  // Gráfico de evolução (últimas 10 partidas, do mais antigo ao mais recente)
  const grafEl = document.getElementById('perfil-grafico');
  if (grafEl) {
    const ultimas = hist.slice(0, 10).reverse();
    if (ultimas.length < 2) {
      grafEl.innerHTML = `<span style="color:var(--t3);font-size:.78rem">Jogue ao menos 2 partidas para ver a evolução.</span>`;
    } else {
      const max = 100, min = 0;
      const W = 280, H = 80, PAD = 10;
      const pts = ultimas.map((h, i) => {
        const x = PAD + (i / (ultimas.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((h.score - min) / (max - min)) * (H - PAD * 2);
        return { x, y, score: h.score, sector: h.sector };
      });
      const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
      // Area fill path
      const areaPath = `M${pts[0].x},${H - PAD} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${H-PAD} Z`;
      const dots = pts.map((p, i) => {
        const cor = p.score >= 70 ? '#2ecc71' : p.score >= 45 ? '#f39c12' : '#e74c3c';
        return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${cor}" stroke="var(--bg2)" stroke-width="1.5">
          <title>${icones[p.sector]||''} ${p.score} pts</title>
        </circle>`;
      }).join('');
      // Y axis labels
      const yLabels = [0,50,100].map(v => {
        const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
        return `<text x="1" y="${y+3}" font-size="7" fill="var(--t3)" font-family="monospace">${v}</text>`;
      }).join('');
      grafEl.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="overflow:visible">
          <defs>
            <linearGradient id="gfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--s-primary)" stop-opacity=".35"/>
              <stop offset="100%" stop-color="var(--s-primary)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          ${[0,50,100].map(v => {
            const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
            return `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="3,3"/>`;
          }).join('')}
          ${yLabels}
          <!-- Area -->
          <path d="${areaPath}" fill="url(#gfGrad)"/>
          <!-- Line -->
          <polyline points="${polyline}" fill="none" stroke="var(--s-primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <!-- Dots -->
          ${dots}
        </svg>
        <div class="perfil-grafico-leg">
          <span style="color:#2ecc71">● Excelente</span>
          <span style="color:#f39c12">● Regular</span>
          <span style="color:#e74c3c">● Crítico</span>
        </div>`;
    }
  }

  const conquistas = _calcularConquistas(hist);
  const cqEl = document.getElementById('perfil-conquistas');
  const _prevUnlocked = JSON.parse(sessionStorage.getItem('gsp_prev_unlocked') || '[]');
  if (cqEl) {
    cqEl.innerHTML = conquistas.map(c => `
      <div class="perfil-conquista ${c.unlocked ? 'unlocked' : ''}">
        <div class="perfil-conquista-icon">${c.unlocked ? c.icon : '🔒'}</div>
        <div>
          <div class="perfil-conquista-nome">${c.nome}</div>
          <div class="perfil-conquista-desc">${c.desc}</div>
        </div>
      </div>`).join('');
    const cards = cqEl.querySelectorAll('.perfil-conquista.unlocked');
    conquistas.filter(c => c.unlocked).forEach((c, i) => {
      if (!_prevUnlocked.includes(c.nome)) {
        setTimeout(() => cards[i]?.classList.add('new-unlock'), 200 + i * 120);
        setTimeout(() => cards[i]?.classList.remove('new-unlock'), 1200 + i * 120);
      }
    });
  }
  sessionStorage.setItem('gsp_prev_unlocked', JSON.stringify(conquistas.filter(c => c.unlocked).map(c => c.nome)));

  // Sincroniza Firestore em background — não bloqueia a UI
  if (!isGuest && _player?.uid && window.GSPSync) {
    window.GSPSync.carregarHistorico(_player.uid).then(histFS => {
      if (histFS.length > 0) {
        const c = histFS.map(h => ({ ...h, ts: h.ts?.toMillis ? h.ts.toMillis() : (h.ts || Date.now()) }));
        const localHist = LS.get(SK.HISTORICO) || [];
        // Só re-renderiza se vier dado novo do servidor
        if (c.length !== localHist.length) {
          LS.set(SK.HISTORICO, c);
          // Re-renderiza apenas os stats silenciosamente
          const total2  = c.length;
          const melhor2 = total2 ? Math.max(...c.map(h => h.score)) : 0;
          const media2  = total2 ? Math.round(c.reduce((a,h) => a + h.score, 0) / total2) : 0;
          const boas2   = c.filter(h => h.score >= 70).length;
          const setorCount2 = {};
          c.forEach(h => { setorCount2[h.sector] = (setorCount2[h.sector] || 0) + 1; });
          const favEntry2 = Object.entries(setorCount2).sort((a,b) => b[1]-a[1])[0];
          const icones2 = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };
          const favLabel2 = favEntry2 ? `${icones2[favEntry2[0]]||''} ${favEntry2[0]}` : '—';
          const subEl = document.getElementById('perfil-subtitulo');
          if (subEl) subEl.textContent = `${total2} mandato${total2 !== 1 ? 's' : ''} concluído${total2 !== 1 ? 's' : ''}`;
          const statsEl2 = document.getElementById('perfil-stats');
          if (statsEl2) statsEl2.innerHTML = [
            { val: total2 ? melhor2 : '—', label: 'Melhor Score' },
            { val: total2 ? media2  : '—', label: 'Score Médio'  },
            { val: boas2,                  label: 'Excelentes (70+)' },
            { val: favLabel2,              label: 'Setor Favorito' },
          ].map(s => `<div class="perfil-stat"><div class="perfil-stat-val">${s.val}</div><div class="perfil-stat-label">${s.label}</div></div>`).join('');
        }
      }
    }).catch(() => {});
  }
}

function _copiarId(id) {
  navigator.clipboard?.writeText(id).then(() => mostrarSucesso(`ID ${id} copiado!`)).catch(() => mostrarAviso('Não foi possível copiar.'));
}

function _calcularConquistas(hist) {
  const total  = hist.length;
  const melhor = total ? Math.max(...hist.map(h => h.score)) : 0;
  return [
    { icon:'🏆', nome:'Primeiro Mandato',    desc:'Complete 1 jogo',              unlocked: total >= 1  },
    { icon:'⭐', nome:'Gestão Excelente',    desc:'Score acima de 70',             unlocked: melhor >= 70 },
    { icon:'🔥', nome:'Veterano',            desc:'5 mandatos concluídos',         unlocked: total >= 5  },
    { icon:'💼', nome:'Executivo Sênior',    desc:'10 mandatos concluídos',        unlocked: total >= 10 },
    { icon:'🚀', nome:'Especialista Tech',   desc:'Vença com Tecnologia (70+)',    unlocked: hist.some(h => h.sector === 'tecnologia' && h.score >= 70) },
    { icon:'🏭', nome:'Rei da Indústria',    desc:'Vença com Indústria (70+)',     unlocked: hist.some(h => h.sector === 'industria'  && h.score >= 70) },
    { icon:'🚚', nome:'Mestre da Logística', desc:'Vença com Logística (70+)',     unlocked: hist.some(h => h.sector === 'logistica'  && h.score >= 70) },
    { icon:'🛒', nome:'Czar do Varejo',      desc:'Vença com Varejo (70+)',        unlocked: hist.some(h => h.sector === 'varejo'     && h.score >= 70) },
    { icon:'🌐', nome:'Gestor Completo',     desc:'Vença nos 4 setores',           unlocked: ['tecnologia','industria','logistica','varejo'].every(s => hist.some(h => h.sector === s && h.score >= 70)) },
    { icon:'💯', nome:'Mandato Perfeito',    desc:'Score 90 ou mais',              unlocked: melhor >= 90 },
  ];
}

/* ════════════════════════════════════════════════════
   PÓDIO — com filtro por setor
════════════════════════════════════════════════════ */
let _podioFiltro = 'all';

function filtrarPodio(setor) {
  _podioFiltro = setor;
  document.querySelectorAll('.podio-filter').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === setor)
  );
  const lista = document.getElementById('podio-lista');
  if (!lista) return;

  const isAll = !setor || setor === 'all';

  if (isAll) {
    // "Todos" — usa cache 'all' ou localStorage
    const dados = _podioCache['all'] || LS.get(SK.PODIO) || [];
    _renderPodio(lista, dados, 'all');
    return;
  }

  // Filtro por setor — filtra os dados 'all' já carregados localmente
  const dadosAll = _podioCache['all'] || LS.get(SK.PODIO) || [];
  if (dadosAll.length) {
    // Filtra por setor e reordena pelo melhor score naquele setor
    const filtrados = dadosAll
      .filter(p => p.sector === setor || (p.melhorPorSetor && p.melhorPorSetor[setor]))
      .map(p => {
        const entradaSetor = p.melhorPorSetor?.[setor];
        return {
          ...p,
          score:       entradaSetor?.score       ?? p.score,
          companyName: entradaSetor?.companyName ?? p.companyName,
          sector:      setor,
        };
      })
      .sort((a, b) => b.score - a.score);
    _renderPodio(lista, filtrados, setor);
  }

  // Busca Firestore em background para dados mais precisos do setor
  if (_podioCache[setor]) {
    _renderPodio(lista, _podioCache[setor], setor);
  } else {
    _buscarEAtualizarPodio(lista, setor);
  }
}

// Cache por setor para não rebuscar dados já carregados
let _podioCache = {};

function irParaPodio() {
  mostrarTela('screen-podio');
  _podioFiltro = 'all';
  _podioCache  = {};
  document.querySelectorAll('.podio-filter').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === 'all')
  );
  const lista = document.getElementById('podio-lista');
  if (!lista) return;

  // Convidados não têm acesso ao pódio
  if (!_player?.uid || _player?.tipo === 'guest') {
    lista.innerHTML = `<div class="podio-empty">🔒 Faça login para ver o ranking global.<br><br><button class="btn btn-primary" style="margin:0 auto" onclick="BetaUI.irParaAuth()">Criar conta / Entrar</button></div>`;
    return;
  }

  const local = LS.get(SK.PODIO) || [];
  if (local.length) _renderPodio(lista, local, 'all');

  _buscarEAtualizarPodio(lista, 'all');
}

function _buscarEAtualizarPodio(lista, setor) {
  if (!window.GSPSync) {
    lista.innerHTML = `<div class="podio-empty">⚠️ Firebase não disponível. Verifique sua conexão.</div>`;
    return;
  }

  const msgId = 'podio-sync-msg';
  let syncEl = document.getElementById(msgId);
  if (!syncEl) {
    syncEl = document.createElement('div');
    syncEl.id = msgId; syncEl.className = 'podio-sync';
    syncEl.textContent = '🔄 Atualizando ranking...';
    lista.prepend(syncEl);
  }

  window.GSPSync.carregarPodio(setor).then(podioFS => {
    const syncMsg = document.getElementById(msgId);
    if (syncMsg) syncMsg.remove();
    const c = (podioFS || []).map(p => ({
      ...p, ts: p.ts?.toMillis ? p.ts.toMillis() : (p.ts || Date.now())
    }));
    _podioCache[setor] = c;
    // Sempre atualiza localStorage para espelhar o banco (inclusive quando vazio)
    if (setor === 'all' || !setor) LS.set(SK.PODIO, c);
    if (_podioFiltro === (setor || 'all')) _renderPodio(lista, c, setor);
  }).catch(e => {
    const syncMsg = document.getElementById(msgId);
    if (syncMsg) syncMsg.textContent = '⚠️ Erro ao carregar ranking. Tente novamente.';
    setTimeout(() => document.getElementById(msgId)?.remove(), 3000);
    console.warn('[GSP] _buscarEAtualizarPodio:', e);
  });
}

function _renderPodio(lista, podio, setor) {
  const isAll  = !setor || setor === 'all';
  const icones = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };

  if (!podio.length) {
    lista.innerHTML = `<div class="podio-empty">Nenhuma partida no ranking ainda.<br>Complete um mandato para aparecer aqui.</div>`;
    return;
  }

  // Score único: melhorScore no modo Todos, score do setor no modo filtrado
  const scoreLabel = isAll ? 'Melhor' : 'Score';
  const getScore   = p => isAll ? (p.melhorScore ?? p.score ?? 0) : (p.score ?? 0);

  const sorted = [...podio].sort((a, b) => getScore(b) - getScore(a));
  const top3   = sorted.slice(0, 3);
  const resto  = sorted.slice(3);

  // Escada: ordem visual = 2º (esquerda) · 1º (centro) · 3º (direita)
  const visualOrder = [
    top3[1] ? { p: top3[1], pos: 2, cls: 'podio-top3-2', rk: 'silver' } : null,
    top3[0] ? { p: top3[0], pos: 1, cls: 'podio-top3-1', rk: 'gold'   } : null,
    top3[2] ? { p: top3[2], pos: 3, cls: 'podio-top3-3', rk: 'bronze' } : null,
  ].filter(Boolean);

  const _card = ({ p, pos, cls, rk }) => {
    const val  = getScore(p);
    const isMe = _player?.uid && p.uid === _player.uid;
    const sub  = isAll
      ? `${p.totalJogos ?? 1} jogo${(p.totalJogos ?? 1) !== 1 ? 's' : ''}`
      : `${icones[p.sector]||'🏢'} ${p.companyName}`;
    return `<div class="podio-top3-card ${cls} ${isMe ? 'podio-top3-me' : ''}" data-sector="${p.sector||''}">
      <div class="podio-top3-player">
        ${isMe ? '<div class="podio-top3-you">Você</div>' : ''}
        <div class="podio-top3-avatar">${(p.player||'?').charAt(0).toUpperCase()}</div>
        <div class="podio-top3-name">${p.player}</div>
        <div class="podio-top3-company">${sub}</div>
        <div class="podio-top3-score">${val}</div>
        <div class="podio-top3-score-label">${scoreLabel}</div>
      </div>
      <div class="podio-top3-step">
        <span class="podio-top3-pos ${rk}">${pos}º</span>
      </div>
    </div>`;
  };

  const top3Html = `
    <div class="podio-top3">${visualOrder.map(_card).join('')}</div>
    <div class="podio-base"></div>`;

  const restoHtml = resto.length ? `
    <div class="hist-section-label">A partir do 4º lugar</div>
    ${resto.map((p, i) => {
      const val  = getScore(p);
      const cor  = val >= 70 ? 'var(--good)' : val >= 45 ? 'var(--warn)' : 'var(--danger)';
      const isMe = _player?.uid && p.uid === _player.uid;
      const sub  = isAll
        ? `${p.totalJogos ?? 1} jogo${(p.totalJogos ?? 1) !== 1 ? 's' : ''}`
        : `${icones[p.sector]||'🏢'} ${p.companyName}`;
      return `<div class="podio-item ${isMe ? 'podio-item-me' : ''}" data-sector="${p.sector||''}">
        <div class="podio-rank">${i + 4}</div>
        <div class="podio-player">
          <div class="podio-player-name">${p.player}${isMe ? ' <span class="podio-you-tag">Você</span>' : ''}</div>
          <div class="podio-player-meta">${sub}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">
          <div class="podio-score" style="color:${cor}">${val}</div>
          <div class="podio-score-sublabel">${scoreLabel}</div>
        </div>
      </div>`;
    }).join('')}` : '';

  lista.innerHTML = top3Html + restoHtml;
}

/* ════════════════════════════════════════════════════
   PAUSA
════════════════════════════════════════════════════ */
let _jogoPausado = false;

function pausarJogo() {
  _jogoPausado = true;
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  const state = BetaState.get();
  const info  = document.getElementById('pause-info');
  if (info && state) {
    const fases = { fundacao:'Diagnóstico', crescimento:'Crescimento', crise:'⚠ Crise', consolidacao:'Consolidação', expansao:'Expansão' };
    const fase  = state.storyState?.faseEmpresa || '';
    info.textContent = `${state.companyName} · ${fases[fase]||fase} · Rodada ${state.currentRound+1}/${state.totalRounds}`;
  }
  const overlay = document.getElementById('overlay-pause');
  _abrirOverlay('overlay-pause');
}

function continuarJogo() {
  _jogoPausado = false;
  const overlay = document.getElementById('overlay-pause');
  _fecharOverlay('overlay-pause');
  // BUG #11 FIX: se timer chegou a 0 durante pausa, forçar escolha imediata
  if (_settings.timer && !_escolhaFeita && _timerSegs <= 0) { escolher(0); return; }
  if (_settings.timer && !_escolhaFeita && _timerSegs > 0) {
    const el = document.getElementById('timer-display');
    if (el) { el.classList.add('active'); if (_timerSegs <= 10) el.classList.add('danger'); }
    _timerInterval = setInterval(() => {
      _timerSegs--;
      if (el) el.textContent = `⏱ ${_timerSegs}s`;
      if (_timerSegs <= 10 && el) el.classList.add('danger');
      if (_timerSegs <= 0) { _pararTimer(); if (!_escolhaFeita) escolher(0); }
    }, 1000);
  }
}

function abandonarJogo() {
  _jogoPausado = false;
  const overlay = document.getElementById('overlay-pause');
  _fecharOverlay('overlay-pause');
  _pararTimer();
  LS.remove(SK.SESSION);
  _aplicarTemaSetor(null);
  mostrarTela('screen-home');
}

/* ════════════════════════════════════════════════════
   TOOLTIP DE INDICADORES DO GESTOR
════════════════════════════════════════════════════ */
const INDICADOR_INFO = {
  reputacaoInterna: {
    titulo: '🧑 Reputação Interna',
    desc: 'Reflete como o time percebe sua liderança. Decisões que prejudicam as pessoas reduzem a reputação; decisões inclusivas e transparentes aumentam.',
    consequence: '⚠ Se chegar a 0, sua autoridade é questionada pelo conselho.',
  },
  capitalPolitico: {
    titulo: '🏛 Capital Político',
    desc: 'Sua credibilidade junto ao conselho e stakeholders externos. É consumido por decisões impopulares e reposicionamentos bruscos.',
    consequence: '⚠ Se chegar a 0, o conselho encerra seu mandato antecipadamente.',
  },
  esgotamento: {
    titulo: '🔋 Esgotamento',
    desc: 'Mede o desgaste acumulado do gestor. Aumenta com crises mal resolvidas e alta pressão de trabalho.',
    consequence: '🔴 Se chegar a 10, você é afastado por burnout e o mandato é encerrado imediatamente.',
  },
};

function abrirTooltipIndicador(key) {
  const info = INDICADOR_INFO[key];
  if (!info) return;
  const state = BetaState.get();
  const val   = state?.gestor?.[key] ?? '—';
  const overlay = document.getElementById('overlay-tooltip');
  const title   = document.getElementById('tooltip-title');
  const body    = document.getElementById('tooltip-body');
  if (!overlay) return;
  if (title) title.textContent = info.titulo;
  if (body) body.innerHTML = `
    <div class="tooltip-val-block">
      <div class="tooltip-val-num" style="color:var(--s-text)">${val}<span style="font-size:.9rem;color:var(--t3)">/10</span></div>
      <div class="tooltip-val-label">Valor atual</div>
    </div>
    <p class="tooltip-body-text">${info.desc}</p>
    <div class="tooltip-consequence">${info.consequence}</div>`;
  _abrirOverlay('overlay-tooltip');
}

function closeTooltip() {
  const el = document.getElementById('overlay-tooltip');
  _fecharOverlay('overlay-tooltip');
}

/* ════════════════════════════════════════════════════
   MODO TREINO
════════════════════════════════════════════════════ */
let _modoTreino = false;

function toggleModoTreino() {
  _modoTreino = !_modoTreino;
  const btn = document.getElementById('toggle-treino-btn');
  if (btn) { btn.textContent = _modoTreino ? 'ON' : 'OFF'; btn.className = `toggle-btn ${_modoTreino ? 'on' : 'off'}`; }
}

/* ════════════════════════════════════════════════════
   COMPARTILHAR RESULTADO
════════════════════════════════════════════════════ */
function compartilharResultado() {
  const score  = document.getElementById('result-score-num')?.textContent || '—';
  const titulo = document.getElementById('result-title')?.textContent || 'Mandato';
  const state  = BetaState.get();
  const icones = { tecnologia:'🚀', varejo:'🛒', logistica:'🚚', industria:'🏭' };
  const icon   = icones[state?.sector] || '🏢';
  const empresa = state?.companyName || 'Empresa';
  const texto  = `${icon} ${titulo}
📊 Score: ${score}/100
🏢 ${empresa}

Joguei Under Pressure — o simulador de decisões executivas!`;
  if (navigator.share) {
    navigator.share({ title: 'Under Pressure', text: texto }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(texto)
      .then(() => mostrarErro('Resultado copiado para a área de transferência!'))
      .catch(() => mostrarErro('Copie o resultado manualmente.'));
  }
}

/* ════════════════════════════════════════════════════
   ANIMAÇÃO DE SCORE + CONFETTI
════════════════════════════════════════════════════ */
function _animarScore(elId, valorFinal, cor, duracao = 1200) {
  const el = document.getElementById(elId);
  if (!el || isNaN(valorFinal)) return;
  const start = Date.now();
  const tick  = () => {
    const elapsed  = Date.now() - start;
    const progress = Math.min(elapsed / duracao, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(ease * valorFinal);
    el.style.color = cor;
    if (progress < 1) { requestAnimationFrame(tick); }
    else { el.textContent = valorFinal; el.classList.add('animating'); setTimeout(() => el.classList.remove('animating'), 200); }
  };
  requestAnimationFrame(tick);
}

function _lancarConfetti() {
  const screen = document.getElementById('screen-result');
  if (!screen) return;
  const cores = ['#D4A853','#5B8DEF','#1FB885','#E8711A','#E8467A','#ffffff'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}%;top:0;position:absolute;background:${cores[Math.floor(Math.random()*cores.length)]};animation-delay:${Math.random()*1.5}s;animation-duration:${1.5+Math.random()}s`;
    screen.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

/* Wrapper animado para renderResultado */
function renderResultadoAnimado({ motivo, score, scoreGestor, gestor, indicators,
                                   history, companyName, empresa, sector, epilogo, decisoesCruciais }) {
  renderResultado({ motivo, score, scoreGestor, gestor, indicators, history, companyName, empresa, sector, epilogo, decisoesCruciais });
  // Estado visual
  const screen = document.getElementById('screen-result');
  if (screen) {
    screen.classList.remove('state-excelente','state-regular','state-dificil');
    screen.classList.add(score >= 70 ? 'state-excelente' : score >= 45 ? 'state-regular' : 'state-dificil');
  }
  // Animar scores (começa em 0)
  const corEmp = score >= 70 ? 'var(--good)' : score >= 45 ? 'var(--warn)' : 'var(--danger)';
  const corGes = scoreGestor >= 70 ? 'var(--purple)' : scoreGestor >= 45 ? 'var(--warn)' : 'var(--danger)';
  const ne = document.getElementById('result-score-num');
  const mg = document.getElementById('result-manager-num');
  if (ne) { ne.textContent = '0'; ne.style.color = corEmp; }
  if (mg) { mg.textContent = '0'; mg.style.color = corGes; }
  setTimeout(() => {
    _animarScore('result-score-num',   score,       corEmp);
    _animarScore('result-manager-num', scoreGestor, corGes);
  }, 400);
  if (score >= 70) setTimeout(_lancarConfetti, 800);
  // Modo Treino: não salvar
  if (_modoTreino) {
    const ml = document.getElementById('result-motivo-label');
    if (ml) ml.textContent = 'MODO TREINO · Resultado não salvo';
    const podio = LS.get(SK.PODIO) || [];
    if (podio.length) { podio.shift(); LS.set(SK.PODIO, podio); }
    const hh = LS.get(SK.HISTORICO) || [];
    if (hh.length) { hh.shift(); LS.set(SK.HISTORICO, hh); }
  }
}

/* ════════════════════════════════════════════════════
   REGISTRO NO ENGINE + BOOT
════════════════════════════════════════════════════ */
registrarUI({ mostrarTela, mostrarIntro, renderSidebar, renderRodada, mostrarFeedback, renderResultado: renderResultadoAnimado });


/* ════════════════════════════════════════════════════
   AUTH FUNCTIONS
════════════════════════════════════════════════════ */
function irParaAuth() {
  mostrarTela('screen-auth');
  authMudarAba('login');
}
function irParaLogin()  { mostrarTela("screen-auth"); authMudarAba("login"); }

function authMudarAba(aba) {
  ["login","cadastro","recuperar"].forEach(a => {
    const f = document.getElementById(`auth-form-${a}`);
    const b = document.getElementById(`tab-${a === "login" ? "login" : "register"}-btn`);
    if (f) f.style.display = "none";
    if (b) b.classList.remove("active");
  });
  const form = document.getElementById(`auth-form-${aba}`);
  if (form) form.style.display = "flex";
  if (aba === "login") document.getElementById("tab-login-btn")?.classList.add("active");
  if (aba === "cadastro") document.getElementById("tab-register-btn")?.classList.add("active");
  ["auth-login-err","auth-reg-err","auth-rec-err","auth-rec-ok"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ""; el.style.display = ""; }
  });
}

function authTogglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === "password") { inp.type = "text"; btn.textContent = "🙈"; }
  else { inp.type = "password"; btn.textContent = "👁"; }
}

function _authSetLoading(prefix, on) {
  const btn = document.getElementById(`auth-${prefix}-btn`);
  const lbl = document.getElementById(`auth-${prefix}-label`);
  const spn = document.getElementById(`auth-${prefix}-spinner`);
  if (btn) btn.disabled = on;
  if (lbl) lbl.style.opacity = on ? "0.4" : "1";
  if (spn) spn.style.display = on ? "inline" : "none";
}

function _authShowErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

function _traduzirErroFirebase(code) {
  const map = {
    "auth/email-already-in-use":    "Este e-mail já está em uso.",
    "auth/invalid-email":           "E-mail inválido.",
    "auth/weak-password":           "A senha deve ter pelo menos 6 caracteres.",
    "auth/user-not-found":          "Usuário não encontrado.",
    "auth/wrong-password":          "Senha incorreta.",
    "auth/invalid-credential":      "E-mail ou senha incorretos.",
    "auth/too-many-requests":       "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed":  "Falha de rede. Verifique sua conexão.",
    "auth/popup-closed-by-user":    "Login cancelado.",
    "auth/user-disabled":           "Esta conta foi desativada.",
  };
  return map[code] || "Ocorreu um erro. Tente novamente.";
}

async function authLogin() {
  const email = document.getElementById("auth-login-email")?.value.trim();
  const senha = document.getElementById("auth-login-pass")?.value;
  if (!email) { _authShowErr("auth-login-err", "Digite seu e-mail."); return; }
  if (!senha)  { _authShowErr("auth-login-err", "Digite sua senha."); return; }
  if (!window.GSPAuth?.isReady()) {
    const nome = email.split("@")[0];
    _loginOk({ nome, email, tipo: "user" });
    return;
  }
  _authSetLoading("login", true);
  try {
    const player = await window.GSPAuth.login({ email, senha });
    _loginOk(player);
  } catch(e) {
    const msg = _traduzirErroFirebase(e.code);
    _authShowErr("auth-login-err", msg);
    mostrarErroCritico(msg);
  } finally {
    _authSetLoading("login", false);
  }
}

async function authCadastrar() {
  const nome  = document.getElementById("auth-reg-nome")?.value.trim();
  const email = document.getElementById("auth-reg-email")?.value.trim();
  const senha = document.getElementById("auth-reg-pass")?.value;
  if (!nome)  { _authShowErr("auth-reg-err", "Digite seu nome."); return; }
  if (!email) { _authShowErr("auth-reg-err", "Digite seu e-mail."); return; }
  if (!senha || senha.length < 6) { _authShowErr("auth-reg-err", "A senha deve ter ao menos 6 caracteres."); return; }
  if (!window.GSPAuth?.isReady()) {
    _loginOk({ nome, email, tipo: "user" });
    return;
  }
  _authSetLoading("reg", true);
  try {
    const player = await window.GSPAuth.cadastrar({ nome, email, senha });
    mostrarSucesso("Conta criada com sucesso!");
    await _loginOk(player);
  } catch(e) {
    const msg = _traduzirErroFirebase(e.code);
    _authShowErr("auth-reg-err", msg);
    mostrarErroCritico(msg);
  } finally {
    _authSetLoading("reg", false);
  }
}

async function authGoogle() {
  // Aguarda Firebase ficar pronto (até 3s)
  if (!window.GSPAuth?.isReady()) {
    let t = 0;
    while (!window.GSPAuth?.isReady() && t < 30) {
      await new Promise(r => setTimeout(r, 100));
      t++;
    }
  }
  if (!window.GSPAuth?.isReady()) {
    mostrarErro("Configure o Firebase para usar o login com Google.");
    return;
  }
  try {
    const player = await window.GSPAuth.loginGoogle();

    if (!player) {
      // Popup bloqueado — redirect em andamento, página vai recarregar
      // Mostra login com mensagem para o usuário não ficar perdido
      mostrarTela('screen-auth');
      authMudarAba('login');
      mostrarAviso('Redirecionando para o Google...');
      return;
    }

    mostrarSucesso("Login com Google realizado!");
    await _loginOk(player);
  } catch(e) {
    mostrarTela('screen-auth');
    authMudarAba('login');
    mostrarErroCritico(_traduzirErroFirebase(e.code));
  }
}

async function authRecuperar() {
  const email = document.getElementById("auth-rec-email")?.value.trim();
  if (!email) { _authShowErr("auth-rec-err", "Digite seu e-mail."); return; }
  if (!window.GSPAuth?.isReady()) {
    _authShowErr("auth-rec-err", "Firebase não configurado.");
    return;
  }
  _authSetLoading("rec", true);
  try {
    await window.GSPAuth.recuperarSenha(email);
    const ok = document.getElementById("auth-rec-ok");
    if (ok) { ok.style.display = "block"; ok.textContent = "✅ E-mail enviado! Verifique sua caixa de entrada."; }
    mostrarSucesso("E-mail de recuperação enviado!");
  } catch(e) {
    const msg = _traduzirErroFirebase(e.code);
    _authShowErr("auth-rec-err", msg);
    mostrarErroCritico(msg);
  } finally {
    _authSetLoading("rec", false);
  }
}

async function _loginOk(player) {
  _player = player;
  LS.set(SK.PLAYER, _player);

  // Mostra botão admin
  _atualizarBotaoAdmin(player.uid);

  // Entra no painel imediatamente — sem esperar Firestore
  _verificarSessaoSalva();
  _atualizarHome();
  mostrarTela("screen-home");

  // Sincroniza dados em background (não bloqueia a UI)
  _sincronizarFirebaseBackground(player);
}


/* ════════════════════════════════════════════════════
   PAINEL ADMIN
════════════════════════════════════════════════════ */
const _ADMIN_UIDS = ['vL1h5semMvdO6NuWs6lKntJll1s2'];

async function _atualizarBotaoAdmin(uid) {
  if (!uid) return;
  const btn = document.getElementById('btn-admin-home');
  if (!btn) return;
  // Verifica localmente primeiro (instantâneo)
  if (_ADMIN_UIDS.includes(uid)) {
    btn.style.display = 'inline-flex';
    return;
  }
  // Fallback: tenta via Firestore
  try {
    const isAdmin = await window.ADMIN?.verificarAdmin(uid);
    btn.style.display = isAdmin ? 'inline-flex' : 'none';
  } catch(e) {
    btn.style.display = 'none';
  }
}

let _adminClicks = 0;
let _adminClickTimer = null;

function _contarCliqueAdmin() {
  _adminClicks++;
  if (_adminClickTimer) clearTimeout(_adminClickTimer);
  if (_adminClicks >= 3) {
    _adminClicks = 0;
    irParaAdmin();
  } else {
    _adminClickTimer = setTimeout(() => { _adminClicks = 0; }, 1000);
  }
}

async function irParaAdmin() {
  if (!_player?.uid) return;
  const isAdmin = await window.ADMIN?.verificarAdmin(_player.uid);
  if (isAdmin) {
    mostrarTela('screen-admin');
    window.ADMIN.irParaSecao('visao-geral');
  }
}

window.BetaUI = {
  irParaLogin, irParaAuth, irComoConvidado, confirmarNome, sair,
  authMudarAba, authTogglePass, authLogin, authCadastrar, authGoogle, authRecuperar,
  irParaSetores, irParaPodio, irParaHistoricoJogos,
  irParaPerfil, filtrarPodio, _copiarId,
  restaurarSessao, descartarSessao,
  selecionarSetor, lancarJogo, comecaJogo,
  mudarTab, escolher, avancar, reiniciar,
  openGlossary, closeGlossary, openSettings, closeSettings, toggleTimerSetting, toggleCloudStatus,
  toggleFullscreen, voltar,
  // Novos
  pularTutorial, tutorialStep, irParaSlide,
  pausarJogo, continuarJogo, abandonarJogo,
  abrirTooltipIndicador, closeTooltip,
  toggleModoTreino,
  compartilharResultado,
  irParaAdmin,
};

// Inicializa o jogo — funciona tanto se DOM já carregou quanto se ainda está carregando
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }
})();
