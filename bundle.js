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
   3 histórias de intro — 1 sorteada por jogo
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
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "EdTech · Ensino Digital B2C",
            subtitulo: "O boom acabou. Agora é hora de construir um negócio de verdade.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua plataforma de educação online nasceu no auge da pandemia e chegou a 180 mil alunos ativos em 2021. Com R$ 22 milhões em receita anual e 95 colaboradores, a empresa se tornou referência em cursos de tecnologia e negócios para jovens profissionais. O modelo de assinatura mensal respondia por 70% da receita recorrente."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A volta ao presencial reduziu a demanda por cursos online em 34% no setor. Plataformas internacionais como Coursera e Udemy ampliaram sua presença no Brasil com preços agressivos. O mercado de EdTech enfrenta uma onda de consolidação: quatro startups do setor faliram nos últimos seis meses, abrindo espaço — mas também gerando desconfiança nos investidores."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A base de assinantes caiu de 180 mil para 94 mil em 18 meses. O CAC triplicou enquanto o LTV encolheu. O runway atual é de 8 meses — insuficiente para chegar ao break-even sem um corte cirúrgico de custos ou uma entrada de capital. O time de conteúdo, responsável pela qualidade que diferencia o produto, está sobrecarregado e desmotivado."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Decidir entre dois caminhos: pivotar para o modelo B2B (vender licenças corporativas para treinamento de equipes, onde as margens são maiores) ou focar no B2C e recuperar a base com um produto mais enxuto e preço competitivo. Cada caminho exige um perfil de time diferente — e você não tem capital para tentar os dois ao mesmo tempo."
                }
            ],
            alerta: { icone: "🚨", titulo: "Runway Crítico" },
            rodape: "Você tem {totalRounds} rodadas para tomar decisões e definir o futuro da empresa."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Scale-up de IA · Automação Corporativa",
            subtitulo: "O produto funciona. O problema é que o mercado ainda não sabe disso.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua empresa desenvolve uma plataforma de automação inteligente para processos de RH e compliance. Fundada há 3 anos por ex-pesquisadores de IA da USP, o produto ganhou dois prêmios de inovação e tem NPS de 83 entre os 40 clientes atuais. O faturamento é de R$ 6,8 milhões em ARR, com 58 funcionários — a maioria formada por cientistas de dados e engenheiros sênior."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "O hype de IA generativa fez grandes players — SAP, Oracle e startups bem capitalizadas — anunciarem soluções similares para os próximos 12 meses. Clientes enterprise que demonstravam interesse passaram a 'aguardar o mercado amadurecer'. Ao mesmo tempo, o segmento de PMEs que a empresa atende hoje tem tíquete médio baixo e ciclo de vendas longo, comprimindo a eficiência comercial."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "O pipeline comercial está travado: 60% das oportunidades estão em 'avaliação técnica' há mais de 90 dias. A equipe de vendas, de apenas 4 pessoas, não tem experiência em vendas enterprise. O time técnico, excelente, não se comunica bem com compradores não-técnicos — e as demos frequentemente afastam em vez de convencer os decisores de negócio."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Transformar um produto tecnicamente superior em um negócio comercialmente viável antes que os grandes players lancem suas soluções. Isso exige construir capacidade de vendas enterprise, simplificar a proposta de valor e, possivelmente, escolher um vertical específico onde a empresa possa dominar antes de expandir. O tempo é o recurso mais escasso."
                }
            ],
            alerta: { icone: "🚨", titulo: "Pipeline Travado" },
            rodape: "Você tem {totalRounds} rodadas para transformar o potencial em resultado real."
        }

    ] /* fim de intros[] */
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
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "Rede de Farmácias · Varejo de Saúde",
            subtitulo: "As redes nacionais chegaram na sua cidade. E trouxeram preços que você não consegue bater.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua rede regional de farmácias foi fundada há 27 anos na região metropolitana de Fortaleza. Com 24 lojas, 360 funcionários e R$ 110 milhões em receita anual, a empresa construiu uma base fiel de clientes graças ao atendimento humanizado e ao relacionamento de longo prazo com médicos locais. O programa de fidelidade tem 94 mil clientes ativos e a participação de mercado regional sempre foi estável, em torno de 18%."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "Duas grandes redes nacionais abriram 31 lojas na região nos últimos 18 meses, com preços até 15% abaixo dos praticados localmente graças ao poder de compra centralizado. A digitalização do setor farmacêutico acelerou: aplicativos de comparação de preço e delivery de medicamentos em até 1 hora passaram a ser o padrão de exigência dos consumidores mais jovens. Margens de medicamentos de referência foram comprimidas pela pressão dos genéricos."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A receita caiu 11% no último semestre e quatro lojas em áreas onde os concorrentes nacionais abriram pontos registram resultado negativo. O ticket médio por cliente recuou de R$ 98 para R$ 81. O sistema de gestão de estoque está desatualizado, gerando rupturas frequentes nos produtos de maior giro. A equipe de farmacêuticos — o principal diferencial de atendimento — está com salários defasados em relação às ofertas dos concorrentes."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Reposicionar a rede para competir no que as grandes redes não conseguem replicar — proximidade, confiança e serviço personalizado — enquanto moderniza a operação e decide quais lojas defender, quais transformar e quais fechar. Tentar competir em preço é um caminho direto para a destruição de margem. O verdadeiro diferencial está em saber qual batalha é possível vencer."
                }
            ],
            alerta: { icone: "🚨", titulo: "Concorrência Nacional Chegou" },
            rodape: "Você tem {totalRounds} rodadas para reposicionar a rede antes que a erosão de clientes se torne irreversível."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Atacarejo Regional · Autosserviço",
            subtitulo: "Você dobrou o tamanho em 3 anos. Agora o crescimento rápido está cobrando a conta.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Seu atacarejo cresceu de 2 para 7 lojas nos últimos 3 anos, aproveitando o movimento de migração de consumidores para o formato cash-and-carry durante o período de alta inflação. Com 980 funcionários e R$ 420 milhões em receita anual, a rede se tornou referência no interior de Minas Gerais. O modelo atende tanto o consumidor final quanto pequenos comerciantes e restaurantes, com tíquete médio de R$ 310."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A normalização da inflação reduziu o ímpeto do consumidor para o formato atacarejo. Grandes redes do segmento — Atacadão e Assaí — estão em franca expansão para o interior do estado, com lojas maiores e preços beneficiados por escala nacional. O custo de ocupação das novas lojas abertas nos últimos 2 anos pesa cada vez mais no resultado, especialmente nas unidades que ainda não atingiram maturidade de volume."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "Três das sete lojas abertas recentemente ainda operam abaixo do ponto de equilíbrio. A dívida contraída para financiar a expansão representa 2,8x o EBITDA — acima do limite confortável para o setor. O time de gestão, que funcionava bem com 2 lojas, está sobrecarregado e sem processos estruturados para operar 7 unidades. A taxa de perdas (quebra e furto) subiu de 1,4% para 2,9% da receita."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Desacelerar o crescimento e colocar as lojas existentes no azul antes que a chegada dos grandes concorrentes reduza ainda mais as margens. Isso exige profissionalizar a gestão, controlar perdas, reduzir o endividamento e possivelmente rever o mix de produtos para focar nos segmentos onde a rede tem vantagem real frente às grandes redes nacionais."
                }
            ],
            alerta: { icone: "🚨", titulo: "Expansão Desequilibrada" },
            rodape: "Você tem {totalRounds} rodadas para consolidar a operação e recuperar a rentabilidade da rede."
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
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "Logística Refrigerada · Cadeia do Frio",
            subtitulo: "Uma falha na cadeia do frio não é apenas prejuízo — é risco sanitário.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Sua operadora de logística refrigerada atua há 14 anos no transporte e armazenagem de alimentos perecíveis, medicamentos e insumos hospitalares. Com 190 colaboradores, 87 veículos refrigerados e 3 armazéns frigorificados no eixo SP-RJ-BH, a empresa fatura R$ 38 milhões anuais. Os contratos com redes de supermercados e distribuidoras farmacêuticas exigem rastreabilidade contínua e temperatura garantida."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A ANVISA intensificou auditorias na cadeia do frio após episódios de contaminação em outros operadores do setor. Seguradoras elevaram os prêmios de cobertura de carga perecível em 40%. Ao mesmo tempo, grandes redes varejistas estão verticalizando parte da operação logística, reduzindo o volume disponível para terceiros. O custo de energia para refrigeração subiu 22% no último ano."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "Um sensor de temperatura falhou em um veículo durante uma entrega para rede farmacêutica, resultando na devolução de R$ 620 mil em medicamentos. O cliente acionou a cláusula de auditoria do contrato. Internamente, o diagnóstico revelou que 18% da frota refrigerada está com sistemas de monitoramento desatualizados. O responsável de qualidade identificou o problema há 4 meses, mas o investimento foi adiado por restrições orçamentárias."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Modernizar o sistema de monitoramento de temperatura de toda a frota sem paralisar a operação, reconstituir a confiança do cliente farmacêutico e estabelecer um protocolo de qualidade que passe na auditoria iminente — tudo isso gerenciando um caixa apertado e uma equipe operacional sob pressão máxima. Uma segunda falha neste momento pode custar o contrato mais importante da empresa."
                }
            ],
            alerta: { icone: "🚨", titulo: "Falha na Cadeia do Frio" },
            rodape: "Você tem {totalRounds} rodadas para reconquistar a confiança e modernizar a operação."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Fulfillment de E-commerce · Operação Omnichannel",
            subtitulo: "O contrato com o marketplace maior do Brasil começou. A operação não estava pronta.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Especializada em fulfillment para e-commerce, sua empresa opera 2 centros de distribuição na região de Campinas e processa 18 mil pedidos por dia. Com 310 funcionários e faturamento de R$ 45 milhões, a empresa cresceu 3x nos últimos 2 anos acompanhando o boom do comércio eletrônico. O diferencial é a integração com os principais marketplaces nacionais e o SLA de despacho em até 4 horas do recebimento do pedido."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A guerra de entrega entre marketplaces empurrou o SLA padrão de same-day para next-day nas regiões metropolitanas. Gigantes do e-commerce estão construindo seus próprios CDs, ameaçando contratos de operadores independentes. A escassez de mão de obra especializada em operações de CD elevou o custo de contratação em 35%, enquanto a automação ainda está fora do alcance financeiro da maioria dos operadores de médio porte."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A entrada de um contrato com um marketplace de grande porte elevou o volume de pedidos em 62% de um mês para o outro. O CD principal está operando acima de 110% da capacidade, gerando filas internas, erros de separação e atrasos. O índice de pedidos com problema saltou de 1,2% para 4,7% — acima do limite contratual de 2%. O marketplace já emitiu alerta formal e tem cláusula de rescisão por performance."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Absorver o volume adicional rapidamente sem comprometer a qualidade das entregas dos clientes já existentes, antes que o marketplace acione a cláusula de rescisão. Isso exige decisões simultâneas de infraestrutura, pessoas e processo — em um ambiente onde cada erro é visível em tempo real no painel do contratante e pode virar notícia nas redes sociais dos consumidores finais."
                }
            ],
            alerta: { icone: "🚨", titulo: "Capacidade no Limite" },
            rodape: "Você tem {totalRounds} rodadas para estabilizar a operação e honrar os contratos."
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
        },

        /* ── 2 ─────────────────────────────────────── */
        {
            badge:     "Indústria de Embalagens · Bens de Consumo",
            subtitulo: "Seus maiores clientes querem embalagens sustentáveis. Sua linha de produção não está pronta.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Com 18 anos de operação no interior do Paraná, sua indústria de embalagens plásticas atende 62 clientes no setor alimentício e de higiene pessoal. São 430 funcionários, duas plantas industriais e faturamento de R$ 94 milhões anuais. A empresa é fornecedora homologada de três grandes redes varejistas e de dois dos maiores fabricantes de alimentos do país — contratos que representam 58% da receita."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A pressão ESG chegou à cadeia de fornecedores: os grandes clientes passaram a exigir que ao menos 30% dos insumos usados nas embalagens sejam de origem reciclada ou renovável até o próximo ano. A regulamentação federal de responsabilidade pós-consumo também avança, com multas previstas para produtores que não comprovarem destinação adequada de resíduos. Concorrentes já iniciaram conversões de linha."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "A conversão de uma linha de produção para insumos reciclados custa entre R$ 8 e R$ 12 milhões e leva de 6 a 10 meses. A empresa não tem caixa suficiente para converter as duas plantas simultaneamente. Um dos clientes-âncora enviou carta formal solicitando cronograma de adequação — e deixou claro que avaliará outros fornecedores caso o prazo não seja cumprido."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Priorizar qual linha converter primeiro sem perder os clientes que exigem o prazo mais curto, ao mesmo tempo em que negocia financiamento para a conversão e mantém a produção corrente funcionando. Cada mês de atraso aumenta o risco de perder contratos; cada decisão precipitada pode comprometer a qualidade do produto e gerar devoluções que destroem a margem."
                }
            ],
            alerta: { icone: "🚨", titulo: "Adequação ESG Urgente" },
            rodape: "Você tem {totalRounds} rodadas para modernizar a operação sem perder os contratos que sustentam a empresa."
        },

        /* ── 3 ─────────────────────────────────────── */
        {
            badge:     "Indústria Química · Especialidades",
            subtitulo: "Uma autuação ambiental parou a planta. A retomada depende de você.",
            secoes: [
                {
                    icone: "🏢",
                    titulo: "A Empresa",
                    corpo: "Fundada há 30 anos no ABC paulista, sua indústria química produz aditivos e solventes para o segmento de tintas, vernizes e adesivos industriais. Com 280 funcionários e R$ 71 milhões em receita anual, a empresa é fornecedora de referência para construtoras e fabricantes de móveis. A reputação técnica construída ao longo de três décadas é o principal ativo da marca."
                },
                {
                    icone: "📉",
                    titulo: "Contexto de Mercado",
                    corpo: "A fiscalização ambiental no setor químico intensificou-se após acidentes em concorrentes regionais. Licenças de operação estão sendo revisadas em todo o setor. Ao mesmo tempo, a alta do dólar encareceu os insumos importados em 27% nos últimos 12 meses, comprimindo margens. Clientes construtoras, por sua vez, atravessam um ciclo de baixa e têm reduzido pedidos."
                },
                {
                    icone: "⚠️",
                    titulo: "Situação Atual",
                    corpo: "O IBAMA autuou a empresa por descarte irregular de resíduo em área de proteção ambiental. A multa inicial é de R$ 4,1 milhões, e a planta está operando em regime parcial sob monitoramento do órgão. O responsável técnico ambiental pediu demissão no dia seguinte à autuação. A imprensa regional noticiou o caso, e dois clientes sinalizaram revisão de contrato."
                },
                {
                    icone: "🎯",
                    titulo: "Principal Desafio Estratégico",
                    corpo: "Regularizar a situação ambiental com agilidade para retomar a operação plena, reconstruir a credibilidade com clientes e órgãos reguladores, e simultaneamente reorganizar o processo de gestão de resíduos para evitar recorrência. A crise expõe a fragilidade da governança interna — e a janela para agir antes de perder contratos críticos é estreita."
                }
            ],
            alerta: { icone: "🚨", titulo: "Autuação Ambiental Ativa" },
            rodape: "Você tem {totalRounds} rodadas para regularizar a operação e reconstruir a confiança do mercado."
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
/* Histórias [1] e [2] adicionadas abaixo */


/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · EdTech · Ensino Digital B2C
   Contexto: plataforma de 94k assinantes (era 180k), R$22M ARR,
   95 colaboradores, 8 meses de runway, CAC triplicou, LTV encolheu.
   Pivô B2C→B2B em análise. Time de conteúdo sobrecarregado.

   INDICADORES: financeiro:9, clima:4, satisfacao:7, qualidade:6,
                produtividade:5, reputacao:8, inovacao:7, seguranca:6

   ATENÇÃO: clima já começa em 4 (baixo). Qualquer decisão que ignore
   o time de conteúdo pode desencadear a interdependência:
   clima≤5 → produtividade-2 → qualidade-2 → satisfacao-2 → financeiro-2
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Relatório dos 8 Meses
     Contexto: primeiro dia focado nos números reais.
     O CFO apresenta o runway e o cenário.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Relatório dos 8 Meses",
    description: "Carla, sua CFO, coloca os números na mesa: runway de 8 meses, CAC de R$187 por assinante (era R$62 há 18 meses), LTV médio caído de R$940 para R$410. A base saiu de 180k para 94k assinantes. 'Temos duas opções estruturais', ela diz. 'Cortar custos para chegar ao break-even no B2C — ou pivotar para B2B corporativo, onde o ticket é 12x maior mas o ciclo de venda é de 90 dias.' Por onde você começa?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Fazer um diagnóstico cirúrgico: entrevistar os 20 maiores clientes que cancelaram e os 20 mais fiéis antes de qualquer decisão",
        risco: "baixo",
        effects: { satisfacao: +2, qualidade: +2, financeiro: -1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Decisões estratégicas baseadas em dados de clientes reais são infinitamente mais seguras do que projeções internas. Os cancelamentos e as permanências carregam a resposta sobre o que o produto precisa ser."
      },
      {
        text: "Anunciar imediatamente o pivô para B2B e iniciar prospecção de empresas ainda este mês",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
        effects: { financeiro: -2, clima: -2, satisfacao: -2, inovacao: +2 },
        avaliacao: "ruim",
        ensinamento: "Pivôs anunciados antes de serem validados criam expectativa sem entrega. O mercado B2B exige produto, processo de vendas e cases — nenhum deles existe ainda. Pivotar sem preparação acelera a queima de caixa."
      },
      {
        text: "Reduzir a equipe de conteúdo de 22 para 12 pessoas agora para estender o runway imediatamente",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2, capitalPolitico: +1 },
        effects: { financeiro: +3, clima: -4, qualidade: -3, produtividade: -3, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Cortar o time de conteúdo destrói o ativo central de uma EdTech. Conteúdo é o produto — demitir quem o produz é equivalente a uma fábrica desligar a linha de produção para economizar energia."
      },
      {
        text: "Montar um grupo de trabalho com CFO, head de produto e head de conteúdo para apresentar um plano em 2 semanas",
        risco: "baixo",
        effects: { financeiro: -1, clima: +2, produtividade: +2, qualidade: +1 },
        avaliacao: "boa",
        ensinamento: "Incluir as lideranças-chave na análise estratégica aumenta a qualidade da decisão e o comprometimento de execução. Duas semanas para planejar é um custo mínimo diante de uma decisão que define o futuro da empresa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · O Time de Conteúdo no Limite
     Contexto: clima em 4. O head de conteúdo pede reunião urgente.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Time de Conteúdo no Limite",
    description: "Rafael, head de conteúdo e um dos fundadores originais, pede reunião. 'O time está produzindo 4 cursos por mês com a estrutura de 1 curso por mês. Três pessoas estão de atestado por ansiedade. Se não contratar ou redistribuir, vou perder mais dois sêniors até o final do mês.' O clima já está em nível crítico. Qualquer nova queda vai arrastar produtividade e qualidade junto.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Contratar 4 produtores de conteúdo freelancers para aliviar a sobrecarga imediatamente",
        risco: "medio",
        effects: { clima: +3, produtividade: +3, qualidade: +2, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Freelancers são a válvula de alívio mais rápida para um time sobrecarregado. O custo é real, mas perder dois sêniors custa muito mais — em tempo de reposição, curva de aprendizado e moral do restante da equipe."
      },
      {
        text: "Reduzir o ritmo de produção de 4 para 2 cursos por mês para aliviar o time sem contratar",
        risco: "baixo",
        effects: { clima: +2, produtividade: +2, satisfacao: -2, inovacao: -2, financeiro: -1 },
        avaliacao: "media",
        ensinamento: "Reduzir o ritmo protege o time mas encolhe o portfólio — que é o principal argumento de renovação de assinatura. O trade-off precisa ser consciente e comunicado para o time."
      },
      {
        text: "Implementar método de produção em blocos — gravar em lote para otimizar o tempo de cada especialista",
        risco: "baixo",
        effects: { clima: +1, produtividade: +4, qualidade: +1, financeiro: 0 },
        avaliacao: "boa",
        ensinamento: "Reorganização do fluxo de produção é a solução mais eficiente: não custa dinheiro e aumenta a capacidade. Produção em blocos é padrão em Netflix, Masterclass e os maiores players de conteúdo do mundo."
      },
      {
        text: "Dizer ao Rafael que a empresa está em momento crítico e que todos precisam aguentar mais 3 meses",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -2 },
        effects: { clima: -3, produtividade: -2, qualidade: -2, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Pedir aguardo a um time já no limite sem nenhuma ação concreta é a receita para perder exatamente as pessoas que você mais precisa. Líderes em crise não pedem paciência — oferecem soluções."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Cliente que Cancela e Explica
     Contexto: entrevistas de cancelamento revelam padrão claro.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente que Cancela e Explica",
    description: "As entrevistas de cancelamento revelaram três padrões dominantes: 60% cancela por 'falta de tempo para estudar' (conteúdo muito longo), 25% por 'não consigo aplicar no trabalho' (teoria sem prática), 15% por preço frente a alternativas gratuitas. O head de produto propõe reformular os cursos em módulos de 8 minutos com projetos práticos. O time de conteúdo estima 4 meses de trabalho para reformular o catálogo atual.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Reformular os 20 cursos mais populares em módulos curtos com projetos práticos — priorizar impacto máximo",
        risco: "medio",
        effects: { qualidade: +4, satisfacao: +3, produtividade: -2, financeiro: -2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Reformular o produto com base em feedback real de cancelamento é a alocação mais eficiente de esforço de produto. Focar nos 20 cursos mais populares entrega 80% do impacto com 30% do trabalho."
      },
      {
        text: "Criar uma nova trilha de microlearning sem mexer no catálogo existente — adicionar sem reformar",
        risco: "medio",
        effects: { inovacao: +3, satisfacao: +2, financeiro: -3, produtividade: -3, qualidade: 0 },
        avaliacao: "media",
        ensinamento: "Adicionar sem reformar fragmenta o portfólio e o foco do time. Os novos microconteúdos precisam competir por atenção com o catálogo antigo que tem os mesmos problemas apontados nos cancelamentos."
      },
      {
        text: "Reformular o catálogo inteiro nos próximos 4 meses — fazer certo de uma vez",
        risco: "alto",
        gestorEffects: { esgotamento: +1 },
        effects: { qualidade: -2, produtividade: -4, clima: -2, financeiro: -3, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Reformular 100% do catálogo em paralelo com a operação normal sobrecarrega o time além do limite. Com o clima já crítico, essa decisão pode quebrar o time que está segurando a empresa."
      },
      {
        text: "Criar uma feature de 'modo rápido' que corta os cursos existentes automaticamente em clips de 10 minutos",
        risco: "baixo",
        effects: { satisfacao: +2, inovacao: +2, qualidade: -1, financeiro: -1, produtividade: +1 },
        avaliacao: "media",
        ensinamento: "A solução tecnológica compensa o curto prazo, mas a edição automática não substitui a reformulação pedagógica. Clips gerados por IA de conteúdo longo raramente capturam os momentos mais relevantes."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · A Plataforma Que Ficou Para Trás
     Contexto: a tecnologia da plataforma tem 3 anos sem refactor.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Plataforma Que Ficou Para Trás",
    description: "O relatório técnico chega: a plataforma tem performance média de 4,8 segundos para carregar no mobile — o benchmark do setor é 1,8s. O app iOS tem nota 3,2 na App Store. O CTO Eduardo estima 3 meses de refatoração para atingir o padrão atual do mercado. 'É dívida técnica que acumulamos quando crescemos rápido durante a pandemia', ele explica. 'Cada semana que postergamos custa mais para resolver depois.'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Alocar 40% da equipe de engenharia para refatoração e manter 60% em novas features — equilibrar débito e produto",
        risco: "medio",
        effects: { qualidade: +3, seguranca: +2, produtividade: -2, satisfacao: +2, inovacao: -1 },
        avaliacao: "boa",
        ensinamento: "Alocar parcialmente para tech debt enquanto mantém entregas de produto é a prática recomendada. Pagar 100% da dívida técnica de uma vez paralisa o produto; ignorar 100% cria um produto que o time não consegue mais evoluir."
      },
      {
        text: "Pausar todas as novas features pelos 3 meses de refatoração total",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { qualidade: +5, seguranca: +3, produtividade: -4, satisfacao: -3, inovacao: -3, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "Refatoração total entrega a maior melhoria técnica, mas 3 meses sem novas features em uma empresa com 8 meses de runway e assinantes cancelando é um risco real de mercado."
      },
      {
        text: "Focar apenas nas melhorias de performance do mobile — o problema mais visível para o assinante",
        risco: "baixo",
        effects: { satisfacao: +3, qualidade: +2, financeiro: -1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Priorizar pelo impacto no cliente é a escolha certa quando os recursos são escassos. Performance mobile afeta diretamente a experiência de 68% dos usuários que acessam pelo celular."
      },
      {
        text: "Adiar a refatoração — com o runway de 8 meses, sobrevivência financeira precede qualidade técnica",
        risco: "medio",
        effects: { financeiro: +1, qualidade: -2, seguranca: -2, satisfacao: -2, produtividade: -1 },
        avaliacao: "ruim",
        ensinamento: "Ignorar débito técnico é emprestar dinheiro com juros compostos. Cada mês sem refatoração aumenta o custo de correção futura e deteriora a experiência do usuário — acelerando exatamente o churn que drena o caixa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Fundo de Corporate Venture
     Contexto: oportunidade de capital surge com exigências.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Fundo de Corporate Venture",
    description: "O fundo de corporate venture de um grande grupo educacional quer investir R$8M por 25% da empresa. A condição: a empresa precisa pivotar para B2B e atender prioritariamente o grupo controlador por 3 anos. O cheque resolve o runway, mas o pivô forçado pode desalinhar o time e limitar o mercado endereçável no futuro. Seu investidor-anjo atual aconselha cautela.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Negociar as condições: aceitar os R$8M mas reduzir a exclusividade para 18 meses e o stake para 18%",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +6, inovacao: -1, satisfacao: -1, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar os termos de um cheque grande é a responsabilidade do CEO. Reduzir a exclusividade e a diluição preserva a flexibilidade estratégica sem recusar capital que resolve o problema de sobrevivência."
      },
      {
        text: "Aceitar as condições integralmente — R$8M agora vale mais do que qualquer flexibilidade futura",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +8, inovacao: -3, satisfacao: -2, clima: -2, reputacao: -1 },
        avaliacao: "media",
        ensinamento: "Capital resolve o runway, mas 3 anos de exclusividade com um único cliente pode engessar completamente a estratégia. Fundos corporate geralmente querem muito mais do que o dinheiro inicial sugere."
      },
      {
        text: "Recusar e buscar investidores sem condicionantes de pivô nos próximos 60 dias",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: -3, inovacao: +2, clima: -1, reputacao: +1 },
        avaliacao: "media",
        ensinamento: "Recusar capital ruim pode ser a decisão certa — mas exige que a alternativa exista. Com 8 meses de runway, 60 dias buscando investidor sem garantia de cheque é um risco calculado que precisa de plano B."
      },
      {
        text: "Aceitar metade do valor (R$4M) em troca de condições mais brandas — meio a meio",
        risco: "baixo",
        effects: { financeiro: +4, inovacao: 0, satisfacao: 0, clima: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Cheque menor com menos restrições muitas vezes é melhor negócio do que cheque maior com cláusulas que limitam o futuro. R$4M estende o runway em 4 meses — tempo suficiente para validar o B2B sem se prender a ele."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · O Head de Produto Quer Sair
     Contexto: pressão externa começa. Liderança ameaçada.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Head de Produto Quer Sair",
    description: "Tatiana, sua head de produto, pede uma conversa difícil: 'Recebi uma oferta de uma startup financiada para ser CPO. Salário 40% acima. Posso ficar se houver um caminho claro para o produto daqui — mas não consigo trabalhar com a incerteza atual.' Tatiana tem 4 anos de empresa e domina toda a visão de produto. Reposicioná-la levaria meses.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Apresentar o roadmap estratégico dos próximos 12 meses e oferecer participação societária como retenção",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { financeiro: -2, clima: +3, produtividade: +2, inovacao: +2, qualidade: +1 },
        avaliacao: "boa",
        ensinamento: "Equity como instrumento de retenção alinha o interesse da liderança ao futuro da empresa. Além do dinheiro, a Tatiana quer pertencer ao projeto — e um roadmap claro é o que ela está pedindo."
      },
      {
        text: "Aumentar o salário em 25% e criar o cargo de CPO formalmente",
        risco: "medio",
        effects: { financeiro: -3, clima: +2, produtividade: +2, qualidade: +1, inovacao: +1 },
        avaliacao: "media",
        ensinamento: "Contraproposta salarial resolve o imediato mas não o problema real: a incerteza estratégica. Se o caminho do produto continuar nebuloso, a retenção financeira é temporária."
      },
      {
        text: "Desejar boa sorte e iniciar a busca imediata por um novo head de produto no mercado",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -1 },
        effects: { clima: -3, produtividade: -4, qualidade: -3, inovacao: -2, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Perder o head de produto com 4 anos de empresa em um momento de incerteza estratégica é um dos eventos mais custosos para uma startup. O custo de reposição é alto — mas o custo de conhecimento perdido é incalculável."
      },
      {
        text: "Propor que ela lidere a decisão de pivô como projeto estratégico principal — dar protagonismo à incerteza",
        risco: "baixo",
        effects: { clima: +4, produtividade: +3, inovacao: +3, financeiro: -1, qualidade: +2 },
        avaliacao: "boa",
        ensinamento: "Transformar o problema em missão é uma das ferramentas mais poderosas de retenção de talento. Líderes de produto engajam quando sentem que têm impacto real na direção da empresa."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · Coursera Anuncia Expansão no Brasil
     Contexto: competidor internacional entra com força.
  ═══════════════════════════════════════════════════════ */
  {
    title: "Coursera Anuncia Expansão no Brasil",
    description: "O Coursera anunciou parceria com 8 universidades brasileiras e planos de localizar todo o catálogo em português até o próximo semestre. A precificação será de R$59/mês — R$40 abaixo da sua assinatura atual. A imprensa especializada já faz comparações diretas. Três investidores-anjos que você está prospectando enviaram o artigo com a pergunta: 'Como vocês respondem a isso?'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Posicionar publicamente o diferencial: instrutores brasileiros, contexto local e projetos aplicados ao mercado nacional",
        risco: "baixo",
        effects: { reputacao: +4, satisfacao: +2, inovacao: +1, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Diferenciação clara é a única resposta sustentável à entrada de um player global capitalizado. Instrutores e casos locais são um moat que plataformas internacionais demoram anos para construir."
      },
      {
        text: "Reduzir o preço para R$69/mês para competir mais diretamente com o Coursera",
        risco: "alto",
        effects: { satisfacao: +2, clientes: +1, financeiro: -5, margem: -3 },
        avaliacao: "ruim",
        ensinamento: "Guerra de preços com empresa capitalizada é batalha perdida antes de começar. Reduzir preço comprime margem sem garantir diferencial — e abre um precedente que é difícil de reverter."
      },
      {
        text: "Acelerar o desenvolvimento de features que o Coursera não tem: certificações reconhecidas por empresas brasileiras",
        risco: "medio",
        effects: { inovacao: +4, reputacao: +3, financeiro: -3, produtividade: -2 },
        avaliacao: "boa",
        ensinamento: "Criar features que um global não consegue replicar rapidamente é a estratégia correta para startups locais contra gigantes. Certificações reconhecidas por RHs brasileiros exigem anos de parcerias locais."
      },
      {
        text: "Ignorar o anúncio — o Coursera ainda não está operando e o mercado reage a fatos, não a anúncios",
        risco: "medio",
        effects: { reputacao: -3, satisfacao: -1, financeiro: 0 },
        avaliacao: "ruim",
        ensinamento: "Silêncio frente a um anúncio competitivo é lido pelo mercado como ausência de estratégia. Investidores, talentos e clientes observam como a empresa reage à pressão — e o silêncio é uma resposta."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Resultado do Piloto B2B
     Contexto: 3 empresas testaram a plataforma para treinamento.
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Resultado do Piloto B2B",
    description: "O piloto B2B com 3 empresas terminou. Os resultados são mistos: a empresa A vai contratar (R$180k/ano, 200 licenças), a empresa B quer mais customização antes de decidir, a empresa C achou 'caro para o que entrega'. O ticket médio do B2B seria 11x o do B2C, mas o ciclo de venda foi de 4 meses. Com o runway atual, quantos ciclos de 4 meses você consegue financiar?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Assinar o contrato com a empresa A, usar como caso de referência e montar equipe de 2 vendedores B2B especializados",
        risco: "medio",
        effects: { financeiro: +4, reputacao: +3, satisfacao: +2, inovacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Primeiro cliente B2B convertido é o ativo mais valioso da transição de modelo. Um case real com resultado mensurável é a ferramenta de vendas mais eficiente para os próximos contratos."
      },
      {
        text: "Investir na customização exigida pela empresa B — um contrato maior vale o investimento",
        risco: "medio",
        effects: { financeiro: -4, qualidade: +2, inovacao: +2, produtividade: -2, satisfacao: +1 },
        avaliacao: "media",
        ensinamento: "Customização para fechar um contrato B2B pode criar um produto melhor — ou um produto engessado em torno de uma necessidade específica que não escala. A decisão precisa avaliar se a customização tem valor para outros clientes."
      },
      {
        text: "Desistir do B2B — o ciclo de 4 meses é incompatível com o runway e os resultados foram decepcionantes",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { financeiro: -1, inovacao: -3, reputacao: -2, satisfacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Abandonar o B2B depois de 1 ciclo com 33% de conversão (empresa A) é prematura. Vendas B2B têm curva de aprendizado e os primeiros ciclos raramente são representativos da maturidade do canal."
      },
      {
        text: "Pivotar completamente para B2B: desligar o plano B2C e migrar o time inteiro para atendimento corporativo",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: +2, satisfacao: -4, clima: -3, reputacao: -2, inovacao: +2 },
        avaliacao: "ruim",
        ensinamento: "Pivô completo sem validação suficiente é o erro clássico de startups em crise. Desligar 94k assinantes B2C antes de garantir receita B2B suficiente pode zerar o caixa mais rápido do que a queima atual."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · A Crise de Retenção Chega ao Pico
     Contexto: churn mensal subindo. Dados de coorte preocupam.
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Crise de Retenção Chega ao Pico",
    description: "Os dados de coorte mostram que o churn no 3º mês de assinatura está em 41% — era 18% há dois anos. O head de CS Marcos propõe uma iniciativa de 'sucesso do aluno': check-ins semanais automatizados, trilhas personalizadas e gamificação de progresso. Custo de implementação: R$340k em tecnologia e 3 meses de trabalho. Impacto estimado: redução de 12% no churn mensal.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aprovar o projeto de sucesso do aluno — reduzir o churn é a prioridade mais urgente",
        risco: "medio",
        effects: { satisfacao: +4, inovacao: +3, financeiro: -4, produtividade: -2, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Em modelo de assinatura, reduzir churn tem ROI garantido — cada ponto percentual de retenção a mais vale meses de crescimento de CAC. Investir em sucesso do cliente é investir no LTV."
      },
      {
        text: "Implementar apenas a gamificação — a parte mais barata e com impacto mais visível para o assinante",
        risco: "baixo",
        effects: { satisfacao: +2, inovacao: +2, financeiro: -1, produtividade: 0 },
        avaliacao: "media",
        ensinamento: "Gamificação cria engajamento de curto prazo, mas não resolve as causas estruturais do churn identificadas nas entrevistas: falta de tempo e conteúdo pouco aplicável. É um analgésico, não um tratamento."
      },
      {
        text: "Criar uma equipe de CS humano — 4 pessoas que entram em contato com assinantes no 2º mês",
        risco: "medio",
        effects: { satisfacao: +3, qualidade: +1, financeiro: -3, clima: +1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "CS humano em modelo de assinatura cria uma camada de relacionamento que a tecnologia não replica. Contato no 2º mês — antes do pico de churn no 3º — intercepta o abandono no momento certo."
      },
      {
        text: "Aguardar os resultados das reformulações de conteúdo antes de investir em CS — resolver a causa antes do sintoma",
        risco: "baixo",
        effects: { satisfacao: -2, financeiro: +1, produtividade: +1, inovacao: 0 },
        avaliacao: "media",
        ensinamento: "Sequenciar as iniciativas pode fazer sentido — mas cada mês de churn alto queima assinantes que não voltam. O ideal é endereçar causa e sintoma em paralelo, mesmo que com recursos menores para cada frente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO · O Investidor Anjo Cobra Uma Posição
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Investidor Anjo Cobra Uma Posição",
    description: "Seu principal investidor-anjo, Henrique, que aportou R$1,2M na fundação, pede uma reunião. Ele é direto: 'Você tem 5 meses de runway. Eu posso participar de um bridge de R$3M se você me apresentar uma estratégia clara — B2C reformulado com métricas de retenção, ou B2B com pipeline documentado. Não posso apostar em 'ainda estamos descobrindo'.' Você tem 7 dias para responder.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Apresentar uma estratégia dual clara: B2C enxuto com foco em retenção + B2B como canal secundário crescente",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +4, satisfacao: +1, reputacao: +2, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "Estratégia dual bem documentada com métricas claras é o que investidores experientes querem ver. A honestidade sobre ter dois caminhos em exploração — com dados — é mais confiante do que um pivô forçado."
      },
      {
        text: "Apresentar o B2B como estratégia única — é o que ele quer ouvir e tem o maior potencial de ticket",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { financeiro: +3, satisfacao: -2, reputacao: -1, inovacao: +1 },
        avaliacao: "ruim",
        ensinamento: "Apresentar uma estratégia que você não está 100% comprometido para agradar o investidor é uma armadilha. O desalinhamento aparece em 60 dias — e a confiança que se perde é muito mais cara do que o cheque."
      },
      {
        text: "Recusar o bridge e focar nos próximos 5 meses em chegar ao break-even no B2C com cortes cirúrgicos",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: +2, satisfacao: -2, clima: -2, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "Break-even sem capital externo exige cortes que podem matar o produto que você está tentando salvar. É viável — mas precisa de um plano de corte muito preciso para não destruir as métricas de retenção que o B2B vai exigir."
      },
      {
        text: "Aceitar o bridge imediatamente e apresentar a estratégia depois — o dinheiro é mais urgente do que o plano",
        risco: "alto",
        gestorEffects: { capitalPolitico: -2 },
        effects: { financeiro: +5, reputacao: -3, satisfacao: 0, inovacao: -1 },
        avaliacao: "ruim",
        ensinamento: "Receber investimento sem apresentar a estratégia é trair a confiança do investidor antes mesmo de começar. Investidores experientes reconhecem quando estão sendo usados como fonte de caixa, não como parceiros."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Momento do Pivô
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Momento do Pivô",
    description: "Com o bridge aprovado e 9 meses de runway restantes, você precisa definir a alocação dos recursos. O board tem duas posições: metade quer 80% do time focado no B2B para chegar a R$500k MRR em 8 meses. A outra metade quer reformar o produto B2C e recuperar a base. O head de produto alerta: 'Não temos gente para os dois com excelência. Qualquer que seja a escolha, precisamos de 100% de comprometimento.'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "B2B como prioridade: realocar 70% do time para construir o canal corporativo com o pipeline atual",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { financeiro: +3, inovacao: +3, satisfacao: -3, clima: -1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Quando os recursos são escassos, clareza de prioridade é mais valiosa do que equilíbrio. B2B com ticket 11x maior e receita previsível é a transformação que cria uma empresa sustentável — desde que executado com foco."
      },
      {
        text: "B2C reformulado: investir os recursos na correção de churn e reativação de ex-assinantes",
        risco: "medio",
        effects: { satisfacao: +4, reputacao: +2, inovacao: +2, financeiro: -2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Recuperar uma base existente custa menos do que construir um novo canal do zero. Se o churn foi por problemas de produto — e não por falta de interesse — a reformulação pode reativar uma base que já confiou na empresa."
      },
      {
        text: "Modelo híbrido: 50% B2B, 50% B2C — não descartar nenhuma aposta enquanto os dados não são conclusivos",
        risco: "medio",
        effects: { financeiro: -1, inovacao: +1, produtividade: -2, qualidade: -2, satisfacao: 0 },
        avaliacao: "ruim",
        ensinamento: "Dividir o time ao meio entre dois modelos opostos garante que nenhum dos dois seja executado com a excelência necessária. Em um momento de decisão estratégica, 'metade de tudo' é o caminho mais seguro para o fracasso em ambas as frentes."
      },
      {
        text: "Vender a base de 94k assinantes para um player maior e usar o caixa para construir o B2B sem pressão de runway",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +2 },
        requisitos: { indicadorMinimo: { financeiro: 7 } },
        effects: { financeiro: +6, satisfacao: -5, reputacao: -3, clima: -2, inovacao: +2 },
        avaliacao: "media",
        ensinamento: "Vender um ativo para financiar uma transição é uma opção legítima — mas sinaliza ao mercado que a empresa desistiu do B2C. O impacto na marca e no time é real e precisa ser gerenciado ativamente."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Plataforma ou o Conteúdo?
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Plataforma ou o Conteúdo?",
    description: "O orçamento de produto para o próximo semestre precisa ser alocado. O CTO quer R$1,2M para refatorar a plataforma e lançar um app nativo. O head de conteúdo quer R$1M para produzir 40 novos cursos com instrutores de referência. O CFO diz que há R$1,5M disponível para produto no total — não para os dois. Cada área garante que o sucesso da empresa depende da sua prioridade.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Investir R$1M na plataforma — sem produto técnico confiável, o conteúdo não chega ao usuário",
        risco: "medio",
        effects: { qualidade: +5, seguranca: +3, produtividade: +2, satisfacao: +2, inovacao: -1, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Em uma plataforma digital, a experiência técnica é o produto. Conteúdo excelente em uma plataforma com 4,8s de carregamento perde para conteúdo mediano em uma plataforma rápida e confiável."
      },
      {
        text: "Investir R$900k no conteúdo — os 40 novos cursos ampliam o catálogo e reduzem churn por obsolescência",
        risco: "medio",
        effects: { qualidade: +2, inovacao: +4, satisfacao: +3, reputacao: +2, produtividade: -1, financeiro: -3 },
        avaliacao: "boa",
        ensinamento: "Catálogo relevante e atualizado é o principal driver de retenção em EdTech. Um usuário que encontra cursos novos toda vez que acessa tem razão para continuar pagando."
      },
      {
        text: "Dividir: R$750k para plataforma e R$750k para conteúdo — cobrir os dois com menos",
        risco: "medio",
        effects: { qualidade: +2, inovacao: +2, satisfacao: +1, produtividade: -1, financeiro: -3 },
        avaliacao: "media",
        ensinamento: "Divisão pode ser o caminho quando os dois investimentos são estratégicos e nenhum precisa de resultado imediato. O risco é que R$750k para plataforma e R$750k para conteúdo podem ser insuficientes para gerar o impacto que o negócio precisa."
      },
      {
        text: "Terceirizar o desenvolvimento de plataforma para uma agência e usar o time interno 100% em conteúdo",
        risco: "alto",
        gestorEffects: { esgotamento: +1 },
        effects: { qualidade: -2, inovacao: +3, satisfacao: +2, financeiro: -2, produtividade: -3 },
        avaliacao: "ruim",
        ensinamento: "Terceirizar a plataforma core de uma empresa de tecnologia é ceder o controle do principal ativo técnico. Agências entregam o que você especifica — e especificar bem exige o time técnico que você desviou para conteúdo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · O Acordo com Empresa de RH
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Acordo com Empresa de RH",
    description: "A maior empresa de consultoria de RH do Brasil quer fazer uma parceria de distribuição: eles incluem sua plataforma nos pacotes de benefícios de 80 clientes corporativos. Em troca, desconto de 40% no valor da licença e split de receita de 30% para eles. O volume potencial é de 12.000 usuários novos — mas a margem por usuário cai para 42% do atual.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aceitar a parceria com limite de volume: máximo de 4.000 usuários para testar o canal antes de escalar",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +3, satisfacao: +3, reputacao: +2, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "Pilotar uma parceria de distribuição com volume limitado é a abordagem correta. Validar o canal antes de se comprometer com 12.000 usuários protege contra surpresas de comportamento de uso e de custo de suporte."
      },
      {
        text: "Aceitar a parceria integralmente — 12.000 usuários novos resolve o problema de base de uma vez",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +5, satisfacao: +4, reputacao: +3, qualidade: -3, produtividade: -3, clima: -2 },
        avaliacao: "media",
        ensinamento: "12.000 usuários novos em um produto ainda com problemas de plataforma e churn alto é um risco operacional real. Suporte para essa base pode colapsar um time já sobrecarregado."
      },
      {
        text: "Recusar — 40% de desconto e 30% de split destroem a margem por usuário",
        risco: "medio",
        effects: { financeiro: 0, reputacao: -1, satisfacao: -1, inovacao: +1 },
        avaliacao: "media",
        ensinamento: "Recusar uma parceria de distribuição por margem pode ser correto se a empresa tiver canais alternativos com custo de aquisição menor. Com CAC triplicado no B2C, a parceria pode ser mais eficiente mesmo com a margem reduzida."
      },
      {
        text: "Negociar: aceitar com split de 20% (não 30%) e desconto de 30% (não 40%)",
        risco: "baixo",
        effects: { financeiro: +4, satisfacao: +3, reputacao: +2, inovacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Toda proposta inicial de parceria tem gordura para negociar. 10 pontos percentuais de split e 10 de desconto a menos podem representar R$200k adicionais de receita por ano — vale a negociação."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · A Reestruturação do Time
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Reestruturação do Time",
    description: "Com a direção estratégica definida, é hora de alinhar o time ao novo modelo. O CEO de RH sugere reestruturação: desligar 18 pessoas que não fazem parte do caminho escolhido e contratar 12 perfis específicos para B2B. O CFO aponta que o custo da reestruturação (indenizações + seleção) é de R$820k — mas a economia anual é de R$600k.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Fazer a reestruturação com cuidado: comunicação clara, indenizações generosas e suporte de recolocação",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +1, esgotamento: +2 },
        effects: { financeiro: -2, clima: -2, produtividade: +3, qualidade: +2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Reestruturação bem conduzida — com humanidade e transparência — é percebida pelo time que fica como sinal de liderança responsável. O contrário cria trauma cultural que persiste por anos."
      },
      {
        text: "Adiar a reestruturação e realocar internamente as pessoas que não têm perfil B2B",
        risco: "medio",
        effects: { financeiro: -1, clima: +2, produtividade: -2, qualidade: -1, inovacao: -1 },
        avaliacao: "media",
        ensinamento: "Realocação interna preserva as pessoas mas pode colocar profissionais em funções que não são seu ponto forte. O custo humano é menor, mas o custo de performance pode ser maior no longo prazo."
      },
      {
        text: "Fazer a reestruturação rapidamente para minimizar a incerteza — comunicar e executar em 48 horas",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -3, capitalPolitico: -1 },
        effects: { financeiro: +1, clima: -5, produtividade: -3, qualidade: -2, satisfacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Reestruturação executada em 48 horas é percebida como frieza e descaso. O time que fica processa a saída dos colegas — e a forma como foi feita — como sinal de como eles mesmos serão tratados no futuro."
      },
      {
        text: "Contratar os 12 novos perfis antes de desligar os 18 — garantir continuidade antes da transição",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: -4, clima: -1, produtividade: +2, inovacao: +3, qualidade: +2 },
        avaliacao: "media",
        ensinamento: "Contratar antes de desligar garante continuidade mas aumenta temporariamente o custo de folha. Com runway apertado, 3 meses de time duplo pode comprometer o plano financeiro."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da EdTech
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da EdTech",
    description: "Você chegou ao final do ciclo estratégico. A empresa sobreviveu à crise de runway, tomou decisões difíceis e precisa agora definir como crescer de forma sustentável. Os dados do último trimestre mostram sinais de estabilização. O board pede uma visão para os próximos 3 anos.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Empresa de aprendizagem corporativa: B2B como motor principal, B2C como funil de entrada para empresas",
        effects: { financeiro: +5, reputacao: +4, inovacao: +3, satisfacao: +3, qualidade: +2, clima: +2 },
        avaliacao: "boa",
        ensinamento: "B2B com B2C como funil é o modelo mais eficiente em EdTech: a marca de consumo alimenta a credibilidade corporativa, e o ticket B2B financia a qualidade que retém o B2C. É assim que Coursera e LinkedIn Learning cresceram."
      },
      {
        text: "Plataforma de conteúdo premium: aumentar o preço para R$149/mês e focar em uma base menor e mais engajada",
        effects: { reputacao: +3, satisfacao: +2, inovacao: +4, financeiro: +3, qualidade: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Modelos premium com base menor funcionam quando o produto justifica o preço. Assinantes que pagam mais cancelam menos — a seleção por preço garante uma base com comprometimento real com o aprendizado."
      },
      {
        text: "Marketplace de instrutores: abrir a plataforma para qualquer instrutor brasileiro, focando no volume e na comissão",
        effects: { financeiro: +2, inovacao: +5, satisfacao: -2, qualidade: -4, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Marketplace aberto sem curadoria destrói a consistência de qualidade que é o principal diferencial frente ao Coursera. O modelo Udemy — com mais de 200k cursos de qualidade variável — é difícil de competir no Brasil sem escala massiva."
      },
      {
        text: "Venda estratégica: buscar um acquirer que valorize a base, a tecnologia e o time",
        requisitos: { indicadorMinimo: { reputacao: 10, financeiro: 9 } },
        effects: { financeiro: +7, inovacao: +2, reputacao: +3, satisfacao: +2, clima: +1 },
        avaliacao: "boa",
        ensinamento: "A venda estratégica é uma decisão legítima quando a empresa construiu ativos reais — base de usuários, tecnologia e marca — que têm valor para um acquirer com mais escala. Não é fracasso; é realização de valor construído."
      }
    ]
  }

],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Scale-up de IA · Automação Corporativa
   Contexto: 40 clientes, R$6,8M ARR, 58 funcionários (maioria
   cientistas de dados), pipeline travado — 60% em "avaliação técnica"
   há mais de 90 dias, 4 vendedores sem experiência enterprise.

   INDICADORES: financeiro:9, clima:4, satisfacao:7, qualidade:6,
                produtividade:5, reputacao:8, inovacao:7, seguranca:6

   ATENÇÃO: inovacao alta (7) é o principal ativo.
   Clima baixo (4) é o principal risco.
   O maior perigo é deixar o produto técnico sobrecarregar as vendas.
══════════════════════════════════════════════════════════════════ */
[

  /* ═══════════════════════════════════════════════════════
     R1 · DIAGNÓSTICO · O Pipeline Travado
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Pipeline Travado",
    description: "Marcos, seu head de vendas, apresenta o mapa do pipeline: 24 oportunidades em negociação, R$4,2M em valor potencial. Mas 60% está em 'avaliação técnica' há mais de 90 dias sem avançar. Ele explica: 'As demos são boas tecnicamente, mas os decisores de negócio — CFOs e CHROs — saem sem entender o ROI concreto. Eles precisam de números, não de arquitetura de IA.' Qual é o diagnóstico e o plano?",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Criar um framework de ROI personalizado para cada oportunidade — calcular o retorno específico para cada cliente antes da próxima reunião",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +3, produtividade: -2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Em vendas B2B enterprise, o comprador precisa justificar internamente a decisão. ROI documentado com os números do próprio cliente é o argumento mais poderoso — e diferencia empresas que vendem tecnologia de empresas que vendem resultado."
      },
      {
        text: "Contratar um diretor de vendas enterprise com experiência em SAP ou Oracle para liderar o pipeline",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: -3, satisfacao: +2, reputacao: +2, produtividade: +2 },
        avaliacao: "boa",
        ensinamento: "Vendas enterprise exige um perfil específico que raramente é desenvolvido internamente em startups de produto técnico. Um diretor com rolodex enterprise pode desbloquear o pipeline em semanas."
      },
      {
        text: "Colocar os cientistas de dados nas reuniões de vendas para explicar melhor a tecnologia",
        risco: "medio",
        effects: { qualidade: +2, satisfacao: -2, produtividade: -3, inovacao: -1 },
        avaliacao: "ruim",
        ensinamento: "CFOs e CHROs não tomam decisões baseadas em explicações técnicas mais detalhadas — eles precisam de ROI e cases de sucesso similares. Cientistas de dados em reuniões de negócio geralmente aprofundam o problema que você está tentando resolver."
      },
      {
        text: "Desqualificar as 14 oportunidades mais antigas e focar os recursos nas 10 mais aquecidas",
        risco: "baixo",
        effects: { financeiro: +1, produtividade: +2, satisfacao: 0, reputacao: -1 },
        avaliacao: "media",
        ensinamento: "Foco no pipeline quente é uma tática válida, mas desqualificar sem tentar desbloquear descarta R$2,4M em potencial. O problema não é o prospect — é a abordagem de vendas."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R2 · DIAGNÓSTICO · A Demo que Afasta
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Demo que Afasta",
    description: "Você assiste a uma gravação de demo. O que vê: 45 minutos de arquitetura de IA, gráficos de acurácia de modelos e terminologia técnica que o CHRO da empresa claramente não acompanhou. No final, ele pergunta: 'Isso funciona com o nosso sistema de RH?' A resposta do cientista de dados foi uma explicação de 10 minutos sobre APIs de integração. O CHRO agradeceu e nunca mais respondeu.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Reformular a demo completamente: começar pelo problema do cliente, mostrar o antes e o depois em 15 minutos",
        risco: "baixo",
        effects: { satisfacao: +4, reputacao: +3, produtividade: -1, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "A melhor demo começa pelo dor do cliente, não pelo produto. Em 15 minutos mostrando o problema que o cliente reconhece e a solução que ele pode explicar para o board, você fecha mais do que em 45 minutos de arquitetura técnica."
      },
      {
        text: "Criar um deck de casos de uso com ROI por indústria — entregar antes da demo para preparar o decisor",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +2, inovacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Material de preparação posiciona a conversa antes de acontecer. Um CFO que chega à demo sabendo que empresas similares reduziram custo de processo em 32% já está em modo de avaliação — não de ceticismo."
      },
      {
        text: "Treinar os cientistas de dados em técnicas de storytelling de vendas",
        risco: "medio",
        effects: { produtividade: -2, satisfacao: +1, inovacao: -1, qualidade: -1 },
        avaliacao: "ruim",
        ensinamento: "Treinar técnicos para vender é possível, mas leva meses e raramente atinge a naturalidade de um vendedor experiente. O tempo de treinamento é tempo que o pipeline fica parado."
      },
      {
        text: "Contratar um SE (Sales Engineer) que faz a ponte entre a tecnologia e o negócio nas demos",
        risco: "medio",
        effects: { satisfacao: +3, financeiro: -3, reputacao: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "O Sales Engineer é o papel mais subestimado em startups de IA. Ele traduz a complexidade técnica em valor de negócio — e é o que estava faltando no seu processo."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R3 · DIAGNÓSTICO · O Concorrente Enterprise Chega
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Concorrente Enterprise Chega",
    description: "Um prospect que estava em negociação avançada informa que vai assinar com a Workday, que acaba de lançar um módulo de automação de RH com IA generativa integrado ao ERP deles. 'É mais caro, mas elimina o risco de integração,' explica o CPO da empresa prospect. Dois outros prospects enviaram mensagens similares na semana. O mercado está observando como você posiciona a empresa diante dos grandes players.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Posicionar a empresa como especialista vertical — o produto mais profundo para automação de RH do que qualquer ERP generalista",
        risco: "baixo",
        effects: { reputacao: +4, inovacao: +3, satisfacao: +2, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "ERPs generalistas com IA adicionada são profundos no ERP e rasos na IA. Um especialista vertical tem 10x mais profundidade no problema específico — e essa diferença é defensável e mensurável."
      },
      {
        text: "Oferecer integração nativa com Workday e SAP como feature de diferenciação — 'trabalha com o que você já tem'",
        risco: "medio",
        effects: { satisfacao: +4, inovacao: +2, qualidade: +2, financeiro: -3, produtividade: -3 },
        avaliacao: "boa",
        ensinamento: "Integração com os ERPs do mercado elimina o principal objeção de risco técnico. Empresas que conseguem dizer 'funciona com o seu SAP atual' removem o argumento mais frequente de não-decisão."
      },
      {
        text: "Reduzir o preço para competir com os módulos dos ERPs — ser mais barato é o único diferencial restante",
        risco: "alto",
        effects: { financeiro: -4, reputacao: -3, satisfacao: -1, inovacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Competir com ERP por preço é uma batalha impossível. A Workday tem margem para precificar abaixo do custo por anos para ganhar participação de mercado. Startups que entram em guerra de preço com enterprise geralmente saem de caixa, não de market share."
      },
      {
        text: "Focar em empresas que não usam os ERPs grandes — mid-market sem SAP ou Workday é o segmento mais defensável",
        risco: "medio",
        effects: { satisfacao: +3, reputacao: +2, inovacao: +2, financeiro: +1, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Segmentação defensável é o maior ativo de uma startup em mercado dominado por grandes players. Mid-market sem ERP é um mercado enorme, menos competitivo e com ciclo de venda mais curto."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R4 · DIAGNÓSTICO · O Cientista de Dados que Quer Mudar
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cientista de Dados que Quer Mudar",
    description: "Felipe, seu melhor cientista de dados, pede uma conversa: 'Passamos 3 anos construindo modelos que funcionam — e a empresa não consegue vender. Estou recebendo proposta do Mercado Livre para trabalhar em escala real. Aqui sinto que o meu trabalho não chega ao cliente.' Dois outros cientistas demonstram frustração similar em reuniões. O clima está em nível crítico e a produtividade do time técnico ameaça cair.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Criar um programa interno de 'cientista de dados no cliente' — visitas mensais aos clientes para ver o produto em uso",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +2 },
        effects: { clima: +4, produtividade: +3, qualidade: +2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Conectar o time técnico com o impacto real do trabalho deles é a forma mais eficaz de retenção para cientistas de dados. Ver o modelo rodando no cliente e conversando com o usuário final transforma abstração em propósito."
      },
      {
        text: "Criar trilha de carreira técnica com títulos e salários progressivos independentes de gestão de pessoas",
        risco: "medio",
        effects: { clima: +3, financeiro: -2, produtividade: +2, qualidade: +1 },
        avaliacao: "boa",
        ensinamento: "Cientistas de dados não querem ser gerentes — querem reconhecimento técnico. Trilha dual de carreira (técnica e de gestão) resolve o teto de crescimento sem forçar a migração para funções que não são sua vocação."
      },
      {
        text: "Oferecer equity para os 5 técnicos mais sêniors como retenção de curto prazo",
        risco: "medio",
        effects: { clima: +2, financeiro: -1, produtividade: +1, inovacao: +1 },
        avaliacao: "media",
        ensinamento: "Equity retém no curto prazo mas não resolve a causa: falta de impacto percebido. Se o trabalho continuar parecendo sem resultado, o vesting vira apenas um motivo para adiar a saída — não para ficar."
      },
      {
        text: "Criar um time de skunkworks: Felipe lidera um projeto de IA generativa como lado B — mais liberdade técnica",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1 },
        effects: { clima: +3, inovacao: +5, produtividade: -3, financeiro: -2, qualidade: -1 },
        avaliacao: "media",
        ensinamento: "Skunkworks pode ser a válvula que mantém o talento — mas tira capacidade do produto principal no pior momento. A inovação dentro de uma empresa em crise precisa de governança para não se tornar distração."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R5 · DIAGNÓSTICO · O Cliente que Cancelou com Dados
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente que Cancelou com Dados",
    description: "A empresa Lógica RH, uma das primeiras clientes, notificou cancelamento após 18 meses. O motivo surpreende: 'A acurácia dos modelos é ótima. O problema é que não conseguimos usar o produto no dia a dia — a interface é complexa demais para os nossos analistas de RH.' O relatório interno revela que 60% das features do produto nunca foram usadas pelos clientes existentes.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Reformular a interface priorizando os 40% de features mais usadas — produto mais simples, adoção maior",
        risco: "medio",
        effects: { satisfacao: +4, qualidade: +3, inovacao: -1, produtividade: -2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Produto complexo que ninguém usa é tecnologia sem valor entregue. Simplificar a interface — com base em dados de uso real — aumenta a adoção que é o único indicador de sucesso do cliente que importa."
      },
      {
        text: "Criar um programa de onboarding estruturado: 4 semanas de treinamento presencial para cada novo cliente",
        risco: "medio",
        effects: { satisfacao: +3, qualidade: +2, financeiro: -3, reputacao: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Onboarding estruturado compensa a complexidade no curto prazo — mas não a elimina. A melhor solução é um produto que não precise de 4 semanas de treinamento para ser usado."
      },
      {
        text: "Manter o produto como está e focar em clientes com time técnico de RH mais avançado",
        risco: "medio",
        effects: { satisfacao: -2, reputacao: -1, inovacao: +2, financeiro: 0 },
        avaliacao: "ruim",
        ensinamento: "Segmentar para clientes que toleram complexidade é uma estratégia — mas limita severamente o mercado endereçável. RH é uma função que na maioria das empresas não tem time técnico dedicado."
      },
      {
        text: "Contratar um time de UX especializado em produto enterprise para liderar a reformulação de interface",
        risco: "medio",
        effects: { satisfacao: +3, qualidade: +3, financeiro: -4, produtividade: -1, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "UX enterprise é uma disciplina específica — projetar para analistas de RH que usam o produto por obrigação é completamente diferente de projetar para early adopters entusiastas. A contratação especializada paga dividendos."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R6 · PRESSÃO · A Vertical Certa
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Vertical Certa",
    description: "O board pede uma decisão sobre verticalização. O produto atual atende RH e compliance em qualquer setor — mas sem profundidade em nenhum. Três verticais emergem como candidatas: varejo (maior volume de clientes, ticket menor), financeiro (ticket maior, ciclo de venda mais longo, regulação complexa) e manufatura (cadeia de conformidade trabalhista intensa, menor concorrência de IA).",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Manufatura: menor concorrência, conformidade trabalhista é problema crítico e recorrente, menos sujeito ao hype de IA generativa",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +3, inovacao: +2, financeiro: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Verticalizar em segmento com menos IA concorrente e problema estrutural crítico é construir um moat defensável. Conformidade trabalhista em manufatura tem consequências regulatórias que forçam a adoção — diferente de 'nice-to-have'."
      },
      {
        text: "Financeiro: ticket maior e as empresas desse setor pagam mais por conformidade e automação",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: +3, reputacao: +2, inovacao: +3, satisfacao: -2, produtividade: -3 },
        avaliacao: "media",
        ensinamento: "Financeiro tem o maior ticket — mas também o ciclo de venda mais longo, os processos de compliance mais exigentes e o maior grau de ceticismo com startups de IA. O risco de burn sem converter é real."
      },
      {
        text: "Varejo: volume maior compensa o ticket menor e o ciclo de vendas é mais curto",
        risco: "medio",
        effects: { satisfacao: +2, financeiro: +2, produtividade: +2, reputacao: +1, inovacao: -1 },
        avaliacao: "media",
        ensinamento: "Volume de contratos menores tem valor — mas exige estrutura de CS e suporte que não existe ainda. Varejo tem alta rotatividade de pessoal que cria demanda real, mas o ticket pequeno pode não cobrir o custo de atendimento."
      },
      {
        text: "Não verticalizar — manter o produto horizontal e competir por breadth, não por depth",
        risco: "medio",
        effects: { inovacao: +2, satisfacao: -2, reputacao: -2, produtividade: +1, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Produto horizontal em IA é o espaço que os ERPs gigantes vão ocupar primeiro. Startups de IA que ganham são aquelas que fazem uma coisa melhor do que qualquer empresa grande consegue — e isso requer foco vertical."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R7 · PRESSÃO · SAP Anuncia Módulo Concorrente
  ═══════════════════════════════════════════════════════ */
  {
    title: "SAP Anuncia Módulo Concorrente",
    description: "A SAP anunciou o SAP SuccessFactors AI Automation — módulo que automatiza compliance trabalhista e processos de RH, integrado nativamente ao ERP. Preço: incluído nos contratos enterprise existentes. Seis dos seus 40 clientes usam SAP. Três já enviaram e-mail perguntando se faz sentido continuar com você. A imprensa especializada publicou: 'SAP torna startups de automação de RH obsoletas?'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Responder com dados: publicar benchmark comparativo mostrando acurácia superior e funcionalidades exclusivas",
        risco: "baixo",
        effects: { reputacao: +4, satisfacao: +3, inovacao: +2, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Dados públicos comparativos são a resposta mais eficiente a anúncios de concorrentes grandes. Comparações objetivas e verificáveis estabelecem credibilidade técnica — e candidatos que pesquisam a categoria confiam mais em benchmarks do que em marketing."
      },
      {
        text: "Ligar para os 6 clientes SAP proativamente antes que eles cancelem",
        risco: "baixo",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { satisfacao: +4, reputacao: +2, financeiro: +1, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Contato proativo antes da reclamação é o melhor sinal de parceria que uma empresa de software pode dar. A maioria dos clientes não cancela imediatamente — eles esperam ver se a empresa vai reagir."
      },
      {
        text: "Buscar parceria com a SAP para complementar o módulo deles com a profundidade técnica do seu produto",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { reputacao: +3, inovacao: +2, financeiro: +2, satisfacao: +2, produtividade: -2 },
        avaliacao: "boa",
        ensinamento: "Parceria com o concorrente-anunciante pode parecer contraintuitivo — mas grandes plataformas precisam de parceiros especializados para preencher lacunas de profundidade. 'Built on SAP' é um posicionamento mais forte do que 'alternativa ao SAP'."
      },
      {
        text: "Ignorar o anúncio — módulos de ERP demoram 2 anos para estar prontos de verdade, o hype é maior que a realidade",
        risco: "alto",
        effects: { satisfacao: -3, reputacao: -3, inovacao: 0, financeiro: -1 },
        avaliacao: "ruim",
        ensinamento: "Ignorar o anúncio da SAP é deixar clientes sem resposta quando eles precisam de uma. Mesmo que o produto da SAP leve 2 anos para madurecer, o silêncio da sua empresa hoje é interpretado como confirmação da ameaça."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R8 · PRESSÃO · O Cliente Âncora Quer Mais
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Cliente Âncora Quer Mais",
    description: "A Construtora Andrade, seu maior cliente (R$780k/ano), quer expandir o uso para mais 3 plantas industriais — mas em troca pede desconto de 35% no contrato expandido e features exclusivas de compliance para o setor de construção civil. A expansão geraria R$1,4M adicionais por ano, mas as features exclusivas exigem 4 meses de desenvolvimento dedicado.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aceitar a expansão com desconto de 20% (não 35%) e features que beneficiem todos os clientes de manufatura",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +5, satisfacao: +3, reputacao: +2, produtividade: -2, inovacao: +2 },
        avaliacao: "boa",
        ensinamento: "Negociar o desconto e condicionar o desenvolvimento ao benefício de múltiplos clientes é a resposta certa. Features exclusivas para um cliente criam dívida técnica que prejudica toda a plataforma — e você paga o custo sem o benefício de escala."
      },
      {
        text: "Aceitar as condições integralmente — R$1,4M adicionais resolve problemas maiores do que o custo de features exclusivas",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +6, satisfacao: +2, reputacao: +1, qualidade: -3, produtividade: -4, inovacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Features exclusivas para o maior cliente é uma armadilha clássica em SaaS. Em 12 meses, o produto está fragmentado entre o que o cliente âncora precisa e o que o mercado precisa — e os dois raramente convergem."
      },
      {
        text: "Recusar o desconto de 35% mas aceitar as features — manter a margem mesmo perdendo o deal",
        risco: "medio",
        effects: { financeiro: -1, reputacao: -1, inovacao: +2, produtividade: -2, qualidade: +1 },
        avaliacao: "media",
        ensinamento: "Manter disciplina de preço protege a margem e o posicionamento, mas perder R$1,4M em expansão de um cliente satisfeito é custoso. A negociação é o caminho — não a recusa."
      },
      {
        text: "Propor uma joint venture para desenvolver as features: cliente financia, startup entrega e compartilha IP",
        risco: "baixo",
        effects: { financeiro: +3, inovacao: +3, satisfacao: +3, reputacao: +2, produtividade: -1 },
        avaliacao: "boa",
        ensinamento: "Co-desenvolvimento financiado pelo cliente distribui o risco e cria um case de sucesso conjunto. O cliente se torna co-autor da solução — o que aumenta a adoção e reduz o risco de cancelamento futuro."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R9 · PRESSÃO · O Modelo de IA Generativa Entra em Cena
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Modelo de IA Generativa Entra em Cena",
    description: "O mercado está em euforia com IA generativa e clientes potenciais estão perguntando se o produto usa 'ChatGPT' ou algo similar. Sua tecnologia usa modelos preditivos clássicos — mais confiáveis para compliance, mas menos 'sexy' no pitch. O CTO propõe integrar um modelo de linguagem para criar uma interface conversacional. Custo: R$520k e 3 meses. O risco: latência e alucinações do LLM em contexto de compliance.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Integrar IA generativa apenas na interface — o usuário conversa com o produto, mas as decisões são dos modelos preditivos confiáveis",
        risco: "medio",
        effects: { inovacao: +4, reputacao: +4, satisfacao: +3, financeiro: -3, seguranca: -1 },
        avaliacao: "boa",
        ensinamento: "Usar IA generativa como interface e modelos preditivos como motor é o design correto para casos de uso críticos. O usuário ganha a experiência conversacional sem os riscos de alucinação em contexto de compliance regulatório."
      },
      {
        text: "Adotar IA generativa completa — é o que o mercado pede e a diferenciação que vai desbloquear o pipeline",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +1 },
        effects: { inovacao: +5, reputacao: +3, seguranca: -4, satisfacao: -2, financeiro: -4 },
        avaliacao: "ruim",
        ensinamento: "IA generativa em compliance trabalhista sem camadas de verificação é um risco regulatório grave. Um erro de LLM que resulta em descumprimento de NR ou não conformidade trabalhista pode destruir a reputação do produto com um único incidente."
      },
      {
        text: "Não integrar — posicionar ativamente a confiabilidade dos modelos preditivos como diferencial frente à euforia do generativo",
        risco: "baixo",
        effects: { inovacao: -1, reputacao: +2, seguranca: +3, satisfacao: +1, financeiro: +1 },
        avaliacao: "boa",
        ensinamento: "Contracorrente inteligente: posicionar-se como 'IA confiável para compliance' em um mercado de hype é uma diferenciação real. Empresas que precisam de auditoria preferem previsibilidade à capacidade generativa."
      },
      {
        text: "Criar um produto separado com IA generativa — manter o produto core intacto e testar o novo em paralelo",
        risco: "medio",
        effects: { inovacao: +3, financeiro: -4, produtividade: -3, qualidade: -1, reputacao: +2 },
        avaliacao: "media",
        ensinamento: "Produto paralelo distribui o risco mas fragmenta o foco e o time. Com os recursos limitados de uma scale-up, dois produtos raramente atingem a excelência que um produto focado consegue."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R10 · PRESSÃO · O Round de Investimento Bate à Porta
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Round de Investimento Bate à Porta",
    description: "Um fundo de venture capital especializado em IA B2B quer liderar uma rodada Serie A de R$18M com valuation de R$60M. A due diligence vai começar em 2 semanas. Os pontos de atenção que o fundo levantou: pipeline com baixa taxa de conversão, clima do time em nível baixo e concentração de receita nos 5 maiores clientes (64% do ARR). Você tem 2 semanas para preparar as respostas.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Ser completamente transparente com o fundo — apresentar os problemas e o plano de solução",
        risco: "baixo",
        gestorEffects: { capitalPolitico: +2, reputacaoInterna: +1 },
        effects: { reputacao: +4, satisfacao: +1, financeiro: +2 },
        avaliacao: "boa",
        ensinamento: "Fundos de venture experientes valorizam founders que conhecem seus problemas e têm plano claro mais do que founders que escondem as fraquezas. A due diligence vai encontrar tudo de qualquer forma — melhor liderar a narrativa."
      },
      {
        text: "Acelerar 3 conversões de pipeline antes da due diligence para melhorar as métricas",
        risco: "alto",
        gestorEffects: { capitalPolitico: +1, esgotamento: +2 },
        effects: { financeiro: +3, satisfacao: +2, reputacao: +1, produtividade: -3, qualidade: -2 },
        avaliacao: "media",
        ensinamento: "Converter pipeline acelerando o processo pode criar contratos com expectativas desalinhadas. Clientes que entram por pressão de timing geralmente têm churn mais alto — o que aparece nos próximos relatórios que o fundo vai pedir."
      },
      {
        text: "Negociar com os 5 maiores clientes expansões de contrato para diluir a concentração de receita",
        risco: "medio",
        effects: { financeiro: +4, satisfacao: +3, produtividade: -1, reputacao: +2 },
        avaliacao: "boa",
        ensinamento: "Expansão de contratos existentes é a forma mais rápida e confiável de melhorar a concentração de receita. Clientes satisfeitos que expandem sinalizam retenção forte — o dado que fundos de SaaS mais valorizam."
      },
      {
        text: "Pedir mais 4 semanas de due diligence para preparar melhor a empresa",
        risco: "medio",
        effects: { reputacao: -1, financeiro: 0, clima: +2, produtividade: +2 },
        avaliacao: "media",
        ensinamento: "Pedir mais tempo na due diligence raramente é visto negativamente por fundos sérios. O risco é que o fundo pode interpretar como falta de preparo — ou pode ter outros deals na fila."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R11 · DECISÃO CRÍTICA · O Partnership Estratégico
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Partnership Estratégico",
    description: "A consultoria EY quer fazer um partnership de go-to-market: eles indicam a sua plataforma para os clientes deles em troca de 15% de comissão e exclusividade de integração com os projetos de transformação de RH deles. Volume potencial: 30 novos clientes por ano. A exclusividade, porém, impede parcerias com outras consultorias pelo prazo de 2 anos.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aceitar sem exclusividade — 15% de comissão sim, exclusividade não",
        risco: "medio",
        gestorEffects: { capitalPolitico: +1 },
        effects: { financeiro: +4, satisfacao: +3, reputacao: +3, inovacao: +1 },
        avaliacao: "boa",
        ensinamento: "Exclusividade de canal por 2 anos é uma das concessões mais perigosas para uma startup em crescimento. As melhores parcerias de distribuição não exigem exclusividade — elas ganham sua lealdade pelo volume."
      },
      {
        text: "Aceitar com exclusividade — 30 clientes por ano resolve o problema de pipeline de uma vez",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +5, satisfacao: +4, reputacao: +2, inovacao: -2, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "EY como canal exclusivo é poderoso — até o dia em que eles lançarem seu próprio produto ou deixarem de priorizar o seu. 2 anos de exclusividade é tempo demais para ficar refém de um canal único."
      },
      {
        text: "Recusar e investir em construção de canal próprio de parcerias — menos dependência de um único parceiro",
        risco: "medio",
        effects: { financeiro: -2, inovacao: +2, reputacao: +1, produtividade: -1, satisfacao: 0 },
        avaliacao: "media",
        ensinamento: "Canal próprio de parcerias demora mais para construir mas é mais resiliente. O risco é o tempo — em um mercado que está se consolidando, cada mês sem volume de vendas importa."
      },
      {
        text: "Propor um modelo de parceiro preferencial: EY tem acesso antecipado a features e suporte dedicado sem exclusividade",
        risco: "baixo",
        effects: { financeiro: +3, satisfacao: +3, reputacao: +3, inovacao: +2, produtividade: 0 },
        avaliacao: "boa",
        ensinamento: "Parceiro preferencial dá os benefícios da exclusividade para quem recebe — sem as restrições para quem oferece. É um modelo que consultorias experientes reconhecem como justo e frequentemente aceitam."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R12 · DECISÃO CRÍTICA · A Simplificação do Produto
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Simplificação do Produto",
    description: "O diagnóstico de UX confirmou: 60% das features nunca são usadas. O head de produto propõe uma reformulação radical — reduzir o produto para as 40% de features mais usadas e criar uma experiência completamente nova e intuitiva. O CTO alerta: 'A reformulação vai gerar breaking changes para 8 clientes que usam as features que vamos remover.' O head de produto responde: '8 clientes em 40 é o custo de evoluir.'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Aprovar a reformulação e conversar com os 8 clientes afetados antes de executar",
        risco: "medio",
        gestorEffects: { reputacaoInterna: +1 },
        effects: { qualidade: +5, satisfacao: +3, inovacao: +3, produtividade: -2, financeiro: -2 },
        avaliacao: "boa",
        ensinamento: "Produto mais simples e focado é quase sempre mais adotado do que produto com muitas features. Conversar com os 8 afetados antes — não depois — é a diferença entre um cliente que participa da mudança e um cliente que cancela por surpresa."
      },
      {
        text: "Manter todas as features e criar uma camada de UX mais simples por cima — não remover, simplificar a descoberta",
        risco: "medio",
        effects: { qualidade: +2, satisfacao: +2, inovacao: +1, produtividade: -2, financeiro: -2 },
        avaliacao: "media",
        ensinamento: "UX sobre feature bloat é um compromisso que não resolve a causa. O produto continua complexo por baixo — e a dívida técnica de manter features não usadas continua crescendo."
      },
      {
        text: "Fazer a reformulação apenas para novos clientes — manter a versão atual para os clientes existentes indefinidamente",
        risco: "alto",
        effects: { qualidade: -1, inovacao: +2, produtividade: -4, financeiro: -3, satisfacao: 0 },
        avaliacao: "ruim",
        ensinamento: "Manter duas versões do produto em paralelo é a decisão mais cara tecnicamente. O time vai gastar o dobro de esforço em cada mudança — e os clientes existentes nunca vão migrar por conta própria."
      },
      {
        text: "Fazer um teste A/B: metade dos novos clientes usa a versão reformulada por 3 meses antes de decidir",
        risco: "baixo",
        effects: { qualidade: +2, inovacao: +2, satisfacao: +1, produtividade: -1, financeiro: -1 },
        avaliacao: "boa",
        ensinamento: "Teste controlado antes de breaking change é a abordagem científica correta. 3 meses de dados reais valem mais do que qualquer projeção interna de adoção."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R13 · DECISÃO CRÍTICA · A Equipe de Customer Success
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Equipe de Customer Success",
    description: "O churn dos últimos 6 meses foi de 14% — muito acima dos 7% que o modelo financeiro suporta. O head de CS identifica a causa: clientes contratam animados mas ficam sem suporte depois do onboarding. 'Precisamos de 4 CSMs dedicados. Hoje atendo 40 clientes sozinho.' A contratação custa R$520k/ano. O CFO apresenta o contra-argumento: 'Cada cliente que sai tira R$170k do ARR. 14% de churn custa R$950k/ano.'",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Contratar os 4 CSMs e estruturar playbooks de sucesso do cliente para os primeiros 90 dias",
        risco: "medio",
        effects: { satisfacao: +5, reputacao: +3, financeiro: -3, clima: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "O math é simples: R$520k em CS elimina R$950k de churn. Em SaaS B2B, CS não é um custo — é a função que protege a receita que a empresa já conquistou. Cada cliente retido financia a aquisição do próximo."
      },
      {
        text: "Contratar 2 CSMs e um gerente de CS para estruturar o processo antes de escalar",
        risco: "baixo",
        effects: { satisfacao: +3, reputacao: +2, financeiro: -2, clima: +2, produtividade: +1 },
        avaliacao: "boa",
        ensinamento: "Escalar CS gradualmente com estrutura de gestão é a abordagem correta. Contratar 4 CSMs sem processo os transforma em bombeiros — apagando incêndios sem sistema para preveni-los."
      },
      {
        text: "Criar programa de health score automatizado — identificar clientes em risco antes que cancelem",
        risco: "baixo",
        effects: { satisfacao: +2, inovacao: +3, qualidade: +2, financeiro: -1, produtividade: -1 },
        avaliacao: "media",
        ensinamento: "Health score é uma ferramenta poderosa — mas alertar sobre risco sem capacidade de agir não resolve o churn. Precisam das duas coisas: dados para identificar e CS para intervir."
      },
      {
        text: "Não contratar CS — usar o produto para ser tão simples que não precise de suporte humano",
        risco: "alto",
        gestorEffects: { reputacaoInterna: -1 },
        effects: { satisfacao: -3, financeiro: +1, qualidade: +1, inovacao: +1, reputacao: -2 },
        avaliacao: "ruim",
        ensinamento: "Produto self-service é um objetivo nobre — mas em SaaS B2B enterprise, humanos no sucesso do cliente são o padrão do mercado, não uma falha de produto. Clientes que pagam R$100k/ano por contrato esperam relacionamento."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R14 · DECISÃO CRÍTICA · A Aquisição Surge
  ═══════════════════════════════════════════════════════ */
  {
    title: "A Aquisição Surge",
    description: "A Totvs, maior empresa de software de gestão da América Latina, fez uma proposta de aquisição: R$42M por 80% da empresa, com earnout de R$12M se as metas dos próximos 2 anos forem atingidas. A oferta é 6,2x o ARR atual. Os fundadores originais têm posições diferentes: dois querem vender (o produto escala com a base de clientes da Totvs), um quer manter a independência.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Negociar contra-proposta: 70% de participação a R$50M com earnout maior — manter algum controle e upside",
        risco: "medio",
        gestorEffects: { capitalPolitico: +2 },
        effects: { financeiro: +6, reputacao: +3, inovacao: +2, satisfacao: +2, clima: +1 },
        avaliacao: "boa",
        ensinamento: "Toda proposta de aquisição tem gordura. Negociar participação menor e earnout maior com métricas que você controla é preservar upside sem recusar um exit que pode não voltar."
      },
      {
        text: "Recusar — a Totvs vai engessar o produto nas necessidades dos clientes de ERP deles",
        risco: "alto",
        gestorEffects: { capitalPolitico: -1, esgotamento: +2 },
        effects: { financeiro: -1, inovacao: +3, reputacao: +1, clima: -1, produtividade: +2 },
        avaliacao: "media",
        ensinamento: "Recusar aquisição estratégica por medo de perder independência é válido — se você tem um plano claro para criar mais valor sozinho. Sem o plano, a independência pode custar mais do que o controle que você está preservando."
      },
      {
        text: "Aceitar as condições da Totvs integralmente — o acesso à base de 40k clientes deles acelera o crescimento em 10x",
        risco: "alto",
        gestorEffects: { capitalPolitico: +2, esgotamento: +1 },
        effects: { financeiro: +8, satisfacao: +3, reputacao: +2, inovacao: -3, clima: -2 },
        avaliacao: "media",
        ensinamento: "A base de clientes da Totvs é o maior ativo estratégico dessa aquisição — mas 80% de uma empresa dentro de uma grande corporação muda radicalmente a cultura e a velocidade. Os 20% que ficam raramente têm a influência que imaginavam."
      },
      {
        text: "Usar a oferta da Totvs como alavanca para reabrir negociações com o fundo de VC que propôs a Serie A",
        risco: "medio",
        effects: { financeiro: +4, reputacao: +3, inovacao: +2, satisfacao: +1, clima: +1 },
        avaliacao: "boa",
        ensinamento: "Uma oferta de aquisição é o melhor argumento de negociação para uma rodada de venture. Ela prova o valor de mercado da empresa e cria urgência real para o investidor — exatamente o que transforma uma conversa em cheque."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════
     R15 · DECISÃO FINAL · O Futuro da IA Corporativa
  ═══════════════════════════════════════════════════════ */
  {
    title: "O Futuro da IA Corporativa",
    description: "O pipeline desbloqueou, o time está mais engajado e o produto ganhou clareza. Você precisa agora definir a estratégia de longo prazo: onde quer estar em 3 anos e como chegar lá.",
    tags: ["tecnologia"],
    choices: [
      {
        text: "Plataforma vertical de IA para RH e compliance: líder técnico no segmento com os modelos mais precisos do mercado",
        effects: { financeiro: +4, reputacao: +5, inovacao: +5, satisfacao: +3, qualidade: +3, clima: +2 },
        avaliacao: "boa",
        ensinamento: "Liderança técnica vertical é o caminho mais defensável para uma startup de IA. Ser o melhor em um problema específico cria barreiras de dados, de conhecimento de domínio e de relacionamento que os grandes players demoram anos para replicar."
      },
      {
        text: "Marketplace de IA para RH: abrir a plataforma para outros modelos e criar ecossistema de parceiros",
        effects: { inovacao: +5, reputacao: +4, financeiro: +3, satisfacao: +2, qualidade: +1, produtividade: +2 },
        avaliacao: "boa",
        ensinamento: "Plataforma de ecossistema multiplica o valor sem multiplicar o custo de desenvolvimento. Cada parceiro que integra no marketplace traz casos de uso que você não teria capacidade de construir sozinho."
      },
      {
        text: "Expansão internacional: validar o produto no Chile e na Colômbia antes de entrar no México",
        requisitos: { indicadorMinimo: { financeiro: 11, reputacao: 12 } },
        effects: { financeiro: +3, reputacao: +4, inovacao: +3, produtividade: -2, qualidade: -1 },
        avaliacao: "boa",
        ensinamento: "Expansão gradual por mercados com regulação trabalhista similar ao Brasil é a rota correta. Chile e Colômbia têm compliance trabalhista menos complexo — ideal para validar o produto antes do México, que exige localização profunda."
      },
      {
        text: "Infraestrutura de IA: transformar os modelos internos em APIs que qualquer empresa pode usar",
        effects: { inovacao: +5, financeiro: +2, qualidade: +3, satisfacao: -2, reputacao: +2, produtividade: -3 },
        avaliacao: "media",
        ensinamento: "APIs de modelo é uma estratégia de infraestrutura que requer volume massivo para ser sustentável. Empresas que tentam ser 'AWS da IA' sem a escala necessária terminam com produto sem foco e sem cliente dominante."
      }
    ]
  }

]

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
/* Histórias [1] e [2] adicionadas abaixo */
,
[

  { title: "O Mapa da Nova Concorrência",
    description: "O relatório de inteligência chega: Raia Drogasil e Pague Menos abriram 31 lojas na sua região em 18 meses. Das suas 24 lojas, 9 estão em raio de 800m de um concorrente nacional. O ticket médio caiu de R$98 para R$81. Mas o NPS da sua rede é 72 — o dos concorrentes na região é 61. Por onde começa?",
    tags: ["varejo"],
    choices: [
      { text: "Mapear as 9 lojas em rota de colisão e calcular quais têm vantagem defensável de localização", risco: "baixo", effects: { financeiro: +1, processos: +3, margem: +1, clientes: +1 }, avaliacao: "boa", ensinamento: "Diagnóstico por loja evita decisões generalizadas que fecham unidades que poderiam sobreviver. Localização, base fiel e mix definem quais têm vantagem real." },
      { text: "Reduzir preços dos 50 produtos mais vendidos para competir com as redes nacionais", risco: "alto", effects: { clientes: +2, margem: -4, financeiro: -3 }, avaliacao: "ruim", ensinamento: "Guerra de preços com Raia Drogasil é batalha perdida. As redes têm poder de compra centralizado com custo 15-20% menor — cada centavo de desconto é sangramento de margem sem retorno." },
      { text: "Comunicar o diferencial de atendimento usando o NPS superior como argumento de posicionamento", risco: "baixo", effects: { marca: +3, clientes: +2, digital: +1 }, avaliacao: "boa", ensinamento: "NPS 72 vs 61 é um diferencial mensurável. Clientes que escolhem pelo atendimento têm fidelidade alta e menor sensibilidade a preço — o segmento que a farmácia regional precisa defender." },
      { text: "Contratar consultoria de varejo farmacêutico para benchmarking de respostas a concorrentes nacionais", risco: "medio", effects: { financeiro: -2, processos: +3 }, avaliacao: "media", ensinamento: "Benchmarking é valioso — mas farmácias regionais que sobreviveram à entrada de grandes redes geralmente o fizeram com conhecimento interno e agilidade local, não com planos de consultoria." }
    ]
  },

  { title: "O Farmacêutico Que Quer Sair",
    description: "Cristiane, farmacêutica sênior com 11 anos de empresa, pede conversa. A Raia Drogasil ofereceu R$2.200 a mais por mês. 'Não é só o dinheiro — é que aqui parece que a farmácia não tem futuro.' Sete dos 24 postos de farmacêutico têm defasagem salarial acima de 20%. Perder farmacêuticos experientes afeta diretamente o diferencial de atendimento.",
    tags: ["varejo"],
    choices: [
      { text: "Reajustar o salário de todos os farmacêuticos defasados para o nível de mercado", risco: "medio", effects: { rh: +5, margem: -3, financeiro: -3, clientes: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Farmacêutico experiente é o principal ativo diferencial de uma farmácia regional. O custo do reajuste é real — mas o custo de perder 7 farmacêuticos e substituir por perfis inexperientes é muito maior." },
      { text: "Contra-oferta apenas para a Cristiane — reter quem ameaça sair, não todos", risco: "medio", gestorEffects: { reputacaoInterna: -1 }, effects: { rh: +1, margem: -1, financeiro: -1 }, avaliacao: "ruim", ensinamento: "Contra-oferta seletiva vira informação interna em dias. Os outros 6 farmacêuticos vão aprender que precisam ameaçar sair para receber reajuste." },
      { text: "Criar plano de carreira: farmacêutico clínico, farmacêutico gestor e especialista em manipulação", risco: "baixo", effects: { rh: +4, marca: +2, clientes: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Plano de carreira cria perspectiva de futuro que dinheiro sozinho não garante. Farmacêuticos em trilhas especializadas têm retenção naturalmente maior." },
      { text: "Aceitar a saída e contratar substituto recém-formado com salário menor", risco: "alto", gestorEffects: { reputacaoInterna: -2 }, effects: { rh: -4, clientes: -3, marca: -3, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Substituir farmacêutico de 11 anos por recém-formado economiza R$2.200/mês mas perde anos de conhecimento de pacientes crônicos e relacionamento médico. O custo invisível é muito maior." }
    ]
  },

  { title: "O Sistema de Estoque Quebrado",
    description: "Ruptura de 14,3% — quase o dobro do benchmark de 8%. Em medicamentos crônicos, é 9,2%. Clientes com prescrição de uso contínuo que encontram ruptura frequentemente não voltam. O sistema tem 9 anos e não integra com fornecedores. Reposição feita por planilha em cada loja.",
    tags: ["varejo"],
    choices: [
      { text: "Implementar sistema de reposição automática com integração com as principais distribuidoras farmacêuticas", risco: "medio", effects: { processos: +5, estoque: +5, clientes: +3, financeiro: -4, margem: +1 }, avaliacao: "boa", ensinamento: "Ruptura zero em crônicos é a condição mínima para fidelização em farmácia. Integração elimina o erro humano da planilha e o custo de compra de emergência com preço spot." },
      { text: "Focar apenas nos 200 SKUs crônicos mais críticos — resolver onde o impacto na fidelização é maior", risco: "baixo", effects: { estoque: +3, clientes: +3, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Priorizar os 200 SKUs de maior impacto na fidelização resolve 70% do problema com 30% do investimento. Pareto funciona em estoque farmacêutico." },
      { text: "Criar time centralizado de supply chain para supervisionar o estoque das 24 lojas", risco: "medio", effects: { processos: +3, estoque: +3, financeiro: -2, rh: +1 }, avaliacao: "media", ensinamento: "Time centralizado melhora a supervisão — mas sem sistema adequado, o time gerencia planilhas com mais experiência. O gargalo é a ferramenta, não o número de pessoas." },
      { text: "Treinar os gerentes de loja em métodos melhores de previsão de demanda manual", risco: "baixo", effects: { processos: +1, estoque: +1, rh: +1 }, avaliacao: "ruim", ensinamento: "Humanos fazendo previsão manual de 1.500+ SKUs farmacêuticos é sistematicamente inferior a qualquer sistema automatizado." }
    ]
  },

  { title: "O App de Delivery Chega à Cidade",
    description: "iFood Saúde e Rappi Farmácia chegaram com entrega em 60 minutos. As redes nacionais já estão integradas. Suas 24 lojas não têm presença digital além de um perfil no Google desatualizado. 23% dos clientes de 18-35 anos estão usando os apps.",
    tags: ["varejo"],
    choices: [
      { text: "Integrar com iFood Saúde e Rappi nas 24 lojas — usar o canal que já tem o cliente", risco: "medio", effects: { digital: +4, clientes: +3, marca: +1, financeiro: -2, margem: -1 }, avaliacao: "boa", ensinamento: "Marketplaces de delivery já têm o cliente. Entrar nos apps em 2 semanas é mais inteligente do que 12 meses construindo canal próprio com R$500k de investimento." },
      { text: "Criar serviço de delivery próprio via WhatsApp Business — atendimento farmacêutico personalizado", risco: "baixo", effects: { digital: +2, clientes: +3, marca: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "WhatsApp para delivery regional é o canal mais eficiente para pacientes crônicos acima de 40 anos que preferem conversar com farmacêutico de confiança a navegar em apps." },
      { text: "Desenvolver app próprio de delivery com fidelização integrada", risco: "alto", gestorEffects: { esgotamento: +2 }, effects: { digital: +3, financeiro: -5, processos: -2, clientes: +1 }, avaliacao: "ruim", ensinamento: "App próprio com escala de 24 lojas regionais não compete com iFood em downloads. O investimento resulta em app com base de usuários insuficiente para ser sustentável." },
      { text: "Ignorar o digital por enquanto — o atendimento presencial representa 100% da receita", risco: "medio", effects: { digital: -2, clientes: -2, marca: -1 }, avaliacao: "ruim", ensinamento: "Ignorar o digital é perder os próximos 3 anos de captação de clientes mais jovens. Cada mês sem presença digital é participação cedida para quem já está presente." }
    ]
  },

  { title: "A Loja com Pior Resultado",
    description: "A loja do Centro tem resultado negativo há 8 meses. A Raia Drogasil abriu a 200m há 6 meses. Aluguel vence em 90 dias — R$18k/mês. A loja ainda tem 40 clientes crônicos fiéis. O gerente tem 14 anos de empresa.",
    tags: ["varejo"],
    choices: [
      { text: "Não renovar o aluguel e migrar os 40 clientes crônicos para a loja mais próxima com suporte do farmacêutico", risco: "medio", gestorEffects: { reputacaoInterna: -1 }, effects: { financeiro: +4, margem: +3, rh: -2, clientes: -2 }, avaliacao: "boa", ensinamento: "Manter loja cronicamente deficitária por lealdade ao gerente é R$216k/ano de prejuízo. Migração cuidadosa dos crônicos minimiza o churn." },
      { text: "Renegociar o aluguel para R$10k e reformular a loja para especialização em manipulação", risco: "medio", effects: { financeiro: +2, margem: +2, clientes: +2, marca: +3 }, avaliacao: "boa", ensinamento: "Manipulação é o segmento que as redes nacionais não replicam competitivamente. Loja especializada cria moat real e atrai prescrições médicas com ticket muito superior." },
      { text: "Dar mais 3 meses com meta de reversão — se não atingir breakeven, fechar", risco: "medio", effects: { financeiro: -2, processos: -1, margem: -2 }, avaliacao: "ruim", ensinamento: "Mais 3 meses sem mudança estrutural são mais 3 meses de prejuízo. A causa do déficit é a concorrência do Raia a 200m — nenhuma meta muda essa realidade geográfica." },
      { text: "Converter a loja em ponto de retirada de pedidos online — custo menor, mantém o endereço", risco: "baixo", effects: { digital: +2, financeiro: +2, margem: +1, rh: -2 }, avaliacao: "media", ensinamento: "Dark store para delivery é viável — mas requer volume digital que ainda não existe. A conversão pode ser prematura sem a base digital construída." }
    ]
  },

  { title: "O Programa de Fidelidade dos Grandes",
    description: "A Raia lançou o Programa Fidelidade Sempre — 10% de desconto em crônicos por R$9,90/mês. Em 2 semanas, 800 clientes da sua base se cadastraram. Você não tem programa de fidelidade digital.",
    tags: ["varejo"],
    choices: [
      { text: "Lançar programa de fidelidade digital em 60 dias com benefícios focados em atendimento, não apenas desconto", risco: "medio", effects: { digital: +3, clientes: +4, marca: +3, financeiro: -3, margem: -1 }, avaliacao: "boa", ensinamento: "Fidelidade em farmácia regional vai além do desconto: consulta prioritária, lembretes de medicação, entrega para crônicos. Benefícios de serviço são mais difíceis de replicar do que pontos." },
      { text: "Usar o WhatsApp como fidelidade manual — farmacêutico avisa quando o medicamento do paciente chega", risco: "baixo", effects: { clientes: +3, marca: +2, digital: +1, rh: -1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Farmacêutico que avisa que o medicamento chegou é um programa de fidelidade mais eficiente do que qualquer app. Relacionamento personalizado é o que as redes não conseguem escalar." },
      { text: "Criar desconto linear de 8% em crônicos para todos os clientes cadastrados", risco: "alto", effects: { clientes: +3, margem: -4, financeiro: -3 }, avaliacao: "ruim", ensinamento: "Desconto permanente em crônicos é o caminho mais rápido para destruir margem farmacêutica. Com custo de mercadoria similar ao da Raia, o desconto vai direto do lucro." },
      { text: "Ignorar o programa dos concorrentes — quem paga por serviço não troca por desconto", risco: "medio", effects: { marca: +2, clientes: -2, digital: -1 }, avaliacao: "media", ensinamento: "Nem todos que se cadastraram vão migrar. Mas ignorar completamente cria percepção de que a empresa não está reagindo — e isso acelera a migração dos clientes indecisos." }
    ]
  },

  { title: "A Parceria com Planos de Saúde",
    description: "Uma operadora regional com 120 mil beneficiários quer parceria: suas farmácias entram na rede credenciada com desconto de 25% nos medicamentos do rol ANS. Pagamento em 45 dias, volume mínimo de R$400k/mês. A margem por transação cai 8 pontos.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar com limite: apenas as 12 lojas com melhor fluxo de caixa para suportar o prazo de 45 dias", risco: "medio", effects: { clientes: +4, margem: -2, financeiro: +2, processos: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Entrar com as lojas mais saudáveis primeiro protege o caixa e permite aprender o processo antes de escalar. O volume de 120k beneficiários justifica o desconto." },
      { text: "Negociar prazo de 30 dias e desconto de 20% antes de assinar", risco: "medio", effects: { clientes: +3, margem: -1, financeiro: +1, processos: +1, marca: +2 }, avaliacao: "boa", ensinamento: "Condições de parceria de plano sempre têm margem de negociação. 10 pontos de desconto a menos e 15 dias a menos fazem diferença enorme no fluxo de caixa." },
      { text: "Aceitar para todas as 24 lojas — volume de R$400k/mês justifica qualquer pressão de caixa", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +1 }, effects: { clientes: +5, margem: -4, financeiro: -3, processos: -2 }, avaliacao: "ruim", ensinamento: "45 dias de prazo em 24 lojas com margem pressionada pode estrangular o fluxo antes do volume compensar. Parceria de plano precisa de capital de giro." },
      { text: "Recusar — a margem de 8 pontos a menos torna a operação inviável", risco: "medio", effects: { clientes: -2, marca: -1 }, avaliacao: "media", ensinamento: "Rede sem credenciamento em planos perde sistematicamente pacientes com cobertura — um mercado crescente. Recusar pode ser correto se a margem está no limite absoluto." }
    ]
  },

  { title: "A Rede Nacional Baixa o Preço nos Crônicos",
    description: "A Raia anunciou campanha regional: genéricos e similares em crônicos com desconto de até 32% por 60 dias. Objetivo: capturar a base de pacientes crônicos. Sua gerente estima que 20% dos 94k clientes cadastrados podem migrar nos próximos 30 dias.",
    tags: ["varejo"],
    choices: [
      { text: "Campanha de contra-ataque: 'Aqui você tem farmacêutico de confiança, não só preço baixo' — eventos de orientação farmacêutica", risco: "baixo", effects: { marca: +4, clientes: +3, rh: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Disputar por serviço onde você tem vantagem é melhor do que disputar por preço onde o concorrente tem escala. Pacientes crônicos com farmacêutico de confiança têm fidelidade alta." },
      { text: "Igualar o desconto de 32% nos 20 medicamentos crônicos mais vendidos", risco: "alto", effects: { clientes: +3, margem: -5, financeiro: -4 }, avaliacao: "ruim", ensinamento: "A Raia pode manter o desconto por 60 dias e depois retirar — você pode ficar preso em guerra de preço que não pode ganhar." },
      { text: "Oferecer desconto apenas para clientes cadastrados com mais de 12 meses — recompensar a fidelidade", risco: "medio", effects: { clientes: +3, margem: -2, financeiro: -1, marca: +3 }, avaliacao: "boa", ensinamento: "Desconto segmentado para fiéis é estratégia diferente de desconto universal. Você recompensa quem escolheu sua farmácia sem abrir para quem está mirando só o preço." },
      { text: "Não reagir — campanha de 60 dias é temporária e crônicos voltam quando acabar", risco: "medio", effects: { clientes: -4, marca: -1 }, avaliacao: "ruim", ensinamento: "Paciente crônico que muda de farmácia durante promoção tem probabilidade baixa de retornar. O farmacêutico da nova farmácia aprende o histórico — cada migração em crônico é perda de longo prazo." }
    ]
  },

  { title: "O Serviço de Farmacêutico Online",
    description: "Uma startup de saúde digital propõe parceria: seus farmacêuticos atendem por videochamada na plataforma deles (20h-23h e fins de semana). A startup paga R$80/hora e envia as receitas para retirada ou delivery nas suas lojas. Volume estimado: 40 atendimentos/semana.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar com 4 farmacêuticos voluntários pagos por hora — canal de captação sem custo de marketing", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { digital: +3, clientes: +3, rh: +2, marca: +3, financeiro: +1 }, avaliacao: "boa", ensinamento: "Farmacêutico online que converte em receita para retirada ou delivery na sua loja é um canal de captação com custo zero de marketing. A startup faz o tráfego — você faz a conversão." },
      { text: "Aceitar apenas como piloto de 90 dias com 2 farmacêuticos antes de expandir", risco: "baixo", effects: { digital: +2, clientes: +2, rh: +1, marca: +2 }, avaliacao: "boa", ensinamento: "Piloto de escala menor reduz o risco operacional e permite avaliar se os atendimentos online realmente convertem em vendas antes de comprometer mais farmacêuticos." },
      { text: "Criar a própria plataforma de teleconsulta farmacêutica — controlar o canal", risco: "alto", gestorEffects: { esgotamento: +1 }, effects: { digital: +2, financeiro: -4, processos: -2 }, avaliacao: "ruim", ensinamento: "Plataforma própria exige desenvolvimento, regulação de tele-farmácia e aquisição de usuários. A startup já resolveu os três — competição interna desperdiça recursos escassos." },
      { text: "Recusar — farmacêutico online pode canibalizar o atendimento presencial", risco: "medio", effects: { digital: -1, clientes: -1 }, avaliacao: "ruim", ensinamento: "Atendimento presencial e digital são complementares. Paciente que consulta online e retira na loja é cliente que você não teria alcançado de outra forma." }
    ]
  },

  { title: "A Crise de Ruptura em Crônicos",
    description: "Falha no sistema causou ruptura simultânea em 8 medicamentos crônicos nas lojas da região norte por 5 dias. 340 clientes afetados. 67 compraram no Raia, 43 no Pague Menos. Vinte e dois já sinalizaram que vão continuar no concorrente. Cada crônico representa R$1.100/ano.",
    tags: ["varejo"],
    choices: [
      { text: "Ligar para os 22 clientes que sinalizaram migração com o farmacêutico pessoalmente", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +4, marca: +3, rh: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "22 ligações que podem recuperar R$24k/ano em receita recorrente é o melhor ROI possível. Paciente crônico que conhece o farmacêutico pelo nome responde diferente de qualquer campanha." },
      { text: "Criar alerta automático de stock-out para farmacêuticos pedirem antes de zerar o estoque", risco: "baixo", effects: { processos: +4, estoque: +3, clientes: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Alerta baseado na velocidade de venda elimina 80% das rupturas antes que aconteçam. Prevenção sempre é mais barata que remediação." },
      { text: "Criar estoque de segurança de 30 dias para os 50 medicamentos crônicos mais vendidos", risco: "medio", effects: { estoque: +4, clientes: +2, financeiro: -3, processos: +2 }, avaliacao: "boa", ensinamento: "A ruptura em crônicos é tão cara em fidelização que o custo do estoque extra raramente supera o custo do cliente perdido." },
      { text: "Oferecer desconto de 15% para os 340 afetados na próxima compra como compensação", risco: "medio", effects: { clientes: +3, margem: -2, financeiro: -2, marca: +1 }, avaliacao: "media", ensinamento: "Desconto de compensação funciona melhor para clientes que ainda não foram ao concorrente. Para quem já foi e gostou, o desconto pode não ser suficiente para reverter." }
    ]
  },

  { title: "A Especialização que Define o Futuro",
    description: "O board pede uma decisão estratégica: três caminhos possíveis — manipulação farmacêutica (ticket 3x maior, redes não atuam), farmácia clínica para crônicos (triagem e acompanhamento farmacoterapêutico) ou transformação digital completa com delivery prioritário.",
    tags: ["varejo"],
    choices: [
      { text: "Manipulação: converter 6 lojas estratégicas em farmácias de manipulação com laboratório próprio", risco: "medio", effects: { margem: +5, marca: +4, clientes: +3, financeiro: -4, processos: +2 }, avaliacao: "boa", ensinamento: "Farmácia de manipulação é o segmento mais protegido contra redes. Ticket médio de R$280 vs R$81 da rede convencional — e nenhuma grande rede opera competitivamente nesse espaço." },
      { text: "Farmácia clínica: acompanhamento farmacoterapêutico para crônicos em parceria com médicos da região", risco: "medio", effects: { marca: +5, clientes: +4, rh: +3, financeiro: -3, margem: +2 }, avaliacao: "boa", ensinamento: "Farmacêutico clínico que acompanha o paciente cria vínculo de saúde sem preço. Pacientes que veem a farmácia como parceira de saúde têm fidelidade absoluta." },
      { text: "Digital-first: transformar as 24 lojas em hubs de delivery com 1 hora de entrega e app próprio", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { digital: +5, clientes: +2, financeiro: -5, processos: -2 }, avaliacao: "media", ensinamento: "Delivery em 1 hora como diferencial exige operação logística que as 24 lojas não têm e app com base de usuários suficiente. As redes nacionais já estão mais avançadas nesse caminho." },
      { text: "Manter o modelo atual com execução melhorada — fazer tudo mais bem feito sem especializar", risco: "medio", effects: { processos: +2, marca: +1 }, avaliacao: "ruim", ensinamento: "Em mercado com concorrentes de escala nacional, 'fazer mais bem feito' sem diferencial claro é perder participação em câmera lenta." }
    ]
  },

  { title: "A Fusão com Rede Regional Menor",
    description: "Uma rede concorrente com 11 farmácias em cidades onde você não atua propõe fusão. Resultado: 35 lojas, poder de negociação 12% melhor com distribuidoras. Problema: a rede menor tem dívida de R$3,2M e 3 lojas deficitárias que você precisaria assumir.",
    tags: ["varejo"],
    choices: [
      { text: "Propor compra apenas das 8 lojas lucrativas — não assumir a dívida nem as deficitárias", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: -3, clientes: +3, margem: +3, processos: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Aquisição seletiva de ativos sem a dívida do vendedor é a forma mais inteligente de crescer. As 8 lojas lucrativas adicionam escala sem os problemas que fizeram a outra rede vender." },
      { text: "Propor aliança de compras conjunta sem fusão societária — capturar a escala sem o risco", risco: "baixo", effects: { financeiro: 0, margem: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Consórcio de compras captura o benefício de escala na negociação com distribuidoras sem os riscos de integração de uma fusão." },
      { text: "Aceitar a fusão completa — 35 lojas criam poder de barganha que nenhuma das duas tem separada", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +2 }, effects: { financeiro: -5, clientes: +3, margem: +1, processos: -4, rh: -2 }, avaliacao: "ruim", ensinamento: "Assumir R$3,2M de dívida mais 3 lojas deficitárias em momento de margem pressionada é dobrar um problema. A integração de culturas pode demorar 3 anos." },
      { text: "Comprar as 11 lojas integralmente e usar 12 meses para sanear as deficitárias", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +3 }, effects: { financeiro: -6, clientes: +3, margem: -2, processos: -4 }, avaliacao: "ruim", ensinamento: "Sanear 3 lojas deficitárias enquanto gere 8 novas e as 24 originais é sobrecarga operacional que raramente termina bem." }
    ]
  },

  { title: "O Medicamento Manipulado Como Âncora",
    description: "O diretor médico de uma clínica de endocrinologia com 1.800 pacientes quer parceria exclusiva de manipulação. Volume potencial: R$180k/mês. Em troca, quer 18% de desconto e uma salinha de atendimento farmacêutico dentro da clínica. Investimento: R$280k em laboratório.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar e abrir o laboratório — R$180k/mês com margem de 55% paga o investimento em 3 meses", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { margem: +5, clientes: +4, marca: +4, financeiro: -3, processos: +3 }, avaliacao: "boa", ensinamento: "Parceria com prescriptor de alto volume é o modelo de crescimento mais eficiente em manipulação. O barreira de entrada criada por prescrições exclusivas é real." },
      { text: "Aceitar apenas a salinha — sem o laboratório, terceirize a manipulação com farmácia parceira", risco: "baixo", effects: { clientes: +3, marca: +3, margem: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Terceirizar enquanto controla o relacionamento é estratégia de baixo risco. Quando o volume justificar, você abre o laboratório com demanda garantida." },
      { text: "Negociar para reduzir o desconto para 12% — a margem de manipulação não suporta 18%", risco: "medio", effects: { clientes: +2, marca: +2, margem: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Desconto de 18% em manipulação comprime a margem que é o principal argumento do negócio. Negociar é correto — o médico quer o relacionamento tanto quanto o desconto." },
      { text: "Recusar — concentrar 1.800 pacientes em um único médico cria dependência perigosa", risco: "medio", effects: { clientes: -1, marca: -1 }, avaliacao: "ruim", ensinamento: "1.800 pacientes crônicos de manipulação é base que você não construiria em 3 anos organicamente. A dependência pode ser mitigada desenvolvendo outros canais de prescrição em paralelo." }
    ]
  },

  { title: "O Investimento no Digital",
    description: "Um fundo regional quer aportar R$4M para digitalização — mas exige 40% das vendas por canal digital em 18 meses (hoje é 0%) em troca de 15% da empresa. O conselho está dividido sobre a meta e sobre ceder participação.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar com meta renegociada: 20% das vendas online em 18 meses, não 40%", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { digital: +5, financeiro: +4, processos: +2, clientes: +2, marca: +2 }, avaliacao: "boa", ensinamento: "Capital para digitalização com meta negociada é melhor do que com meta inatingível. 40% digital em 18 meses para rede sem presença digital é irreal — metas assim criam conflito com investidores." },
      { text: "Aceitar apenas R$2M em troca de 8% — menos capital, menos pressão, menos diluição", risco: "baixo", effects: { digital: +3, financeiro: +2, processos: +1, clientes: +1 }, avaliacao: "boa", ensinamento: "Capital menor com menos diluição e meta razoável pode ser o melhor deal. R$2M para delivery + fidelidade digital entrega impacto real sem comprometer a identidade farmacêutica." },
      { text: "Recusar e digitalizar com recursos próprios — sem pressão de investidor", risco: "medio", effects: { digital: +2, financeiro: -2, processos: +1 }, avaliacao: "media", ensinamento: "Digitalização própria é mais lenta mas preserva o controle. Com margem pressionada, o custo de não ter capital externo pode ser maior do que ceder 15%." },
      { text: "Aceitar as condições integralmente — 40% digital em 18 meses mobiliza o time", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { digital: +4, financeiro: +3, processos: -3, rh: -2 }, avaliacao: "ruim", ensinamento: "Meta de 40% digital em 18 meses partindo do zero distorce toda a operação. A urgência pode comprometer o atendimento presencial que é o principal diferencial da rede." }
    ]
  },

  { title: "O Futuro da Farmácia Regional",
    description: "Você atravessou um ciclo intenso de transformação. A rede está mais sólida, com posicionamento mais claro e novas alavancas de crescimento. O board pede a visão para os próximos 3 anos.",
    tags: ["varejo"],
    choices: [
      { text: "Farmácia de saúde integral: manipulação + farmácia clínica + digital em um modelo integrado único na região", effects: { margem: +5, marca: +5, clientes: +4, rh: +3, digital: +3, financeiro: +4 }, avaliacao: "boa", ensinamento: "O futuro das farmácias regionais não é competir com as redes em volume — é ser a referência de saúde da comunidade. Esse ecossistema não é replicável por nenhuma rede nacional localmente." },
      { text: "Expansão regional focada: 12 lojas de excelência em vez de 24 com desempenho variado", effects: { margem: +4, financeiro: +5, processos: +4, marca: +3, rh: +2 }, avaliacao: "boa", ensinamento: "Menos lojas com mais qualidade é estratégia válida quando a dispersão dilui a capacidade de manter o padrão que diferencia a rede." },
      { text: "Franquia regional: transformar o modelo em franquia para farmacêuticos independentes da região", requisitos: { indicadorMinimo: { processos: 8, marca: 12 } }, effects: { financeiro: +5, marca: +4, processos: +3, clientes: +3 }, avaliacao: "boa", ensinamento: "Franquear para farmacêuticos locais multiplica a presença sem custo de propriedade direta. O franchisee tem o incentivo de dono e o conhecimento da comunidade que as redes não replicam." },
      { text: "Vender para rede nacional com cláusula de manutenção de marca regional por 3 anos", effects: { financeiro: +8, clientes: +2, rh: -3, marca: -4, margem: -2 }, avaliacao: "media", ensinamento: "Venda para rede nacional resolve o financeiro — mas 'manutenção de marca por 3 anos' raramente sobrevive à integração na cultura da compradora. É solução de curto prazo para o acionista." }
    ]
  }

]
,
/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Atacarejo Regional · Autosserviço
   Contexto: 7 lojas (era 2), 980 funcionários, R$420M receita,
   3 lojas abaixo do breakeven, dívida 2,8x EBITDA, gestão
   sobrecarregada, perdas subindo de 1,4% para 2,9%.

   INDICADORES: financeiro:6, rh:7, clientes:8, processos:5,
                margem:5, estoque:7, marca:8, digital:4

   ATENÇÃO: financeiro (6) e margem (5) sob pressão da dívida.
   processos (5) baixo reflete gestão descentralizada.
   margem<=4 drena financeiro automaticamente.
══════════════════════════════════════════════════════════════════ */

[

  {
    title: "O Peso da Expansão Rápida",
    description: "O CFO apresenta o balanço: dívida de R$38M (2,8x EBITDA), três lojas consumindo R$420k/mês a mais do que geram, perdas por quebra e furto em R$12M/ano (2,9% da receita). Você foi rápido demais — e o crescimento cobrou a conta. Por onde começa o diagnóstico?",
    tags: ["varejo"],
    choices: [
      { text: "Fazer auditoria completa das 3 lojas deficitárias — entender a causa antes de agir", risco: "baixo", effects: { processos: +3, financeiro: +1, margem: +1 }, avaliacao: "boa", ensinamento: "Diagnóstico granular por loja é o primeiro passo de qualquer turnaround. Sem entender se o déficit é estrutural (localização, concorrência) ou operacional (gestão, mix), qualquer decisão é arriscada." },
      { text: "Fechar as 3 lojas deficitárias imediatamente para parar o sangramento", risco: "alto", gestorEffects: { reputacaoInterna: -2, capitalPolitico: +1 }, effects: { financeiro: +4, rh: -5, clientes: -3, marca: -2 }, avaliacao: "ruim", ensinamento: "Fechar sem diagnóstico pode eliminar lojas que teriam reversão viável com ajustes operacionais. Além disso, o custo humano e de imagem de fechar 3 lojas de uma vez é alto — e permanente." },
      { text: "Contratar gerente de turnaround especializado em varejo alimentar para liderar o processo", risco: "medio", effects: { processos: +3, financeiro: -2, rh: +1 }, avaliacao: "boa", ensinamento: "Um especialista em turnaround de varejo traz metodologia e benchmarks que o time interno raramente tem. O custo da contratação é pequeno frente às perdas mensais das 3 lojas." },
      { text: "Renegociar a dívida com o banco antes de qualquer outra decisão — o problema raiz é financeiro", risco: "medio", effects: { financeiro: +3, processos: -1, margem: +1 }, avaliacao: "media", ensinamento: "Renegociar dívida estende o runway mas não resolve as lojas deficitárias. Sem mudança operacional, o problema volta em 6 meses com a dívida renegociada." }
    ]
  },

  {
    title: "O Gerente Que Não Escala",
    description: "Com 7 lojas, o modelo de gestão que funcionava com 2 está quebrando. Cada gerente de loja toma decisões de compra, precificação e promoção de forma independente. O resultado: mix de produtos diferente em cada loja, preços inconsistentes e negociações isoladas com fornecedores que custam R$3M/ano a mais em custo de mercadoria.",
    tags: ["varejo"],
    choices: [
      { text: "Centralizar as compras e precificação — criar uma estrutura de trade marketing para todas as lojas", risco: "medio", effects: { processos: +5, margem: +3, financeiro: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Centralização de compras é o maior alavanca financeiro disponível. R$3M em custo de mercadoria recuperados é mais impactante do que qualquer promoção de vendas." },
      { text: "Contratar 3 supervisores regionais para coordenar as lojas sem tirar a autonomia dos gerentes", risco: "medio", effects: { processos: +3, rh: +1, financeiro: -2 }, avaliacao: "media", ensinamento: "Supervisores regionais melhoram a coordenação mas não eliminam a ineficiência de negociações descentralizadas. É uma evolução parcial." },
      { text: "Manter a autonomia dos gerentes — eles conhecem o cliente local melhor do que qualquer estrutura central", risco: "medio", effects: { processos: -2, margem: -2, financeiro: -1, rh: +2 }, avaliacao: "ruim", ensinamento: "Autonomia local tem valor no atendimento — não na negociação com fornecedores. Cada gerente comprando separado paga preço de pequeno varejista em um negócio que tem volume de rede." },
      { text: "Implementar sistema ERP integrado para dar visibilidade sem retirar autonomia decisória local", risco: "baixo", effects: { processos: +4, estoque: +2, financeiro: -3, margem: +1 }, avaliacao: "boa", ensinamento: "ERP não centraliza decisões — centraliza informação. Gerentes com dados em tempo real tomam decisões melhores do que gerentes no escuro. Visibilidade é o primeiro passo para a coordenação." }
    ]
  },

  {
    title: "A Perda Que Sangra",
    description: "O inventário das 7 lojas revelou R$12M em perdas anuais — 2,9% da receita. A média nacional do setor de atacarejo é 1,6%. A distribuição: 40% é furto externo, 35% é quebra operacional por manuseio, 25% é furto interno. Três lojas têm índice acima de 4%. A cultura do time é de tolerância implícita — 'sempre foi assim'.",
    tags: ["varejo"],
    choices: [
      { text: "Implementar câmeras, portais de detecção e auditoria de saídas nas 3 lojas com maior índice de perda", risco: "medio", effects: { processos: +4, seguranca: +3, financeiro: +3, margem: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Tecnologia de prevenção de perdas tem ROI medido em semanas em atacarejo. Cada 0,5% de redução de perda em R$420M de receita representa R$2,1M — o custo das câmeras é recuperado no primeiro mês." },
      { text: "Contratar empresa especializada em prevenção de perdas para auditoria e treinamento de toda a rede", risco: "medio", effects: { processos: +3, financeiro: -2, margem: +2, estoque: +1 }, avaliacao: "boa", ensinamento: "Especialistas em prevenção de perdas trazem metodologia de combate ao furto interno e externo que o time interno raramente desenvolve sozinho. O custo da consultoria é marginal frente ao problema." },
      { text: "Demitir os gerentes das 3 lojas com maior índice e contratar novos com perfil mais rigoroso", risco: "alto", gestorEffects: { reputacaoInterna: -2, capitalPolitico: 0 }, effects: { rh: -4, processos: +1, margem: +1, financeiro: -1 }, avaliacao: "ruim", ensinamento: "Demitir gerentes por índice de perda sem investigar as causas pode punir quem está em localização de alto risco. Demissão sem processo gera clima de medo que normalmente aumenta o furto interno." },
      { text: "Criar programa de bônus para lojas que reduzirem o índice de perda abaixo de 1,8% em 6 meses", risco: "baixo", effects: { processos: +3, margem: +2, rh: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Incentivo financeiro alinhado à meta correta muda comportamento rapidamente. Gerente que ganha bônus por reduzir perda tem interesse pessoal em cada real recuperado." }
    ]
  },

  {
    title: "O Assaí Chegou na Cidade",
    description: "O Assaí Atacadista abriu uma loja de 8.500m² a 3 km da sua unidade principal — a maior e mais rentável da rede. Nos primeiros 30 dias, o volume de clientes da sua loja principal caiu 18%. O Assaí tem escala nacional, 4.000m² a mais de área, e preços que você não consegue igualar com sua estrutura de custo atual.",
    tags: ["varejo"],
    choices: [
      { text: "Diferenciar pelo serviço ao pequeno comerciante: fracionamento, crédito e entrega que o Assaí não oferece", risco: "baixo", effects: { clientes: +4, marca: +3, processos: +2, margem: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "O pequeno comerciante precisa de mais do que preço baixo — precisa de crédito, fracionamento de embalagens e prazo de entrega. São serviços que o Assaí com modelo padronizado não consegue oferecer de forma competitiva." },
      { text: "Reduzir preços nos 50 itens mais comparados para não perder a percepção de preço competitivo", risco: "alto", effects: { clientes: +2, margem: -4, financeiro: -3 }, avaliacao: "ruim", ensinamento: "Guerra de preços com Assaí em margem já pressionada é caminho para o prejuízo. O Assaí tem poder de compra nacional que garante custo de mercadoria 20% menor — cada centavo de desconto é tirado direto da margem restante." },
      { text: "Analisar o mix de clientes da loja principal e focar em categorias onde o Assaí não compete", risco: "medio", effects: { margem: +2, processos: +2, clientes: +1, estoque: +2 }, avaliacao: "boa", ensinamento: "Especialização de mix em categorias subrepresentadas pelo concorrente é a estratégia correta para coexistência. O Assaí força você a descobrir onde você é verdadeiramente bom." },
      { text: "Investir na localização: reformar e ampliar a loja principal para competir em estrutura física", risco: "alto", gestorEffects: { esgotamento: +2, capitalPolitico: -1 }, effects: { financeiro: -5, clientes: +2, marca: +2 }, avaliacao: "ruim", ensinamento: "Ampliar loja para competir com Assaí em tamanho com a dívida atual é acumular investimento de capital em uma batalha onde o adversário tem vantagem estrutural permanente de escala." }
    ]
  },

  {
    title: "A Dívida que Aperta o Caixa",
    description: "O banco credor enviou carta: com o EBITDA em queda por 3 trimestres seguidos, o covenant financeiro (dívida/EBITDA máximo de 2,5x) foi violado. O banco pode exigir antecipação de R$15M em 90 dias se não houver renegociação. O custo financeiro atual consome R$560k/mês em juros. Você tem 30 dias para apresentar um plano.",
    tags: ["varejo"],
    choices: [
      { text: "Apresentar ao banco um plano de desinvestimento das 3 lojas deficitárias como garantia de geração de caixa", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { financeiro: +4, processos: +2, margem: +2, rh: -2, clientes: -1 }, avaliacao: "boa", ensinamento: "Bancos preferem devedores com plano claro a devedores em default. Apresentar um plano de desinvestimento com cronograma e geração de caixa projetada transforma a conversa de cobrança em parceria de reestruturação." },
      { text: "Vender ativos imobilizados (terrenos próprios de 2 lojas) para quitar parte da dívida", risco: "medio", effects: { financeiro: +6, processos: -1, margem: +2, estoque: 0 }, avaliacao: "boa", ensinamento: "Sale-and-leaseback de imóveis é um instrumento clássico de gestão de crise financeira. Converte ativo imobilizado em caixa sem perder a operação — o aluguel substitui o custo de capital que está pesando no fluxo." },
      { text: "Buscar novo investidor para capitalização e quitação parcial da dívida", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { financeiro: +5, processos: -1, rh: 0, clientes: 0 }, avaliacao: "media", ensinamento: "Capitalização resolve o problema imediato mas dilui o controle acionário em um momento de crise — quando o valuation é mais baixo. O custo do capital captado em crise é alto." },
      { text: "Ignorar o covenant e continuar operando normalmente — bancos raramente executam a antecipação imediatamente", risco: "alto", gestorEffects: { capitalPolitico: -2, esgotamento: +1 }, effects: { financeiro: -4, processos: -2, clientes: -1, marca: -2 }, avaliacao: "ruim", ensinamento: "Ignorar covenant violado é apostar que o banco vai ser passivo. Bancos que notificam formalmente geralmente são sérios. O risco de antecipação forçada de R$15M pode quebrar a empresa." }
    ]
  },

  {
    title: "O Estoque de Perecíveis Fora de Controle",
    description: "O relatório de perdas de perecíveis chega: R$2,1M em hortifrúti, carnes e laticínios descartados no último trimestre por vencimento e má conservação. A média do setor é R$600k para o mesmo volume. As 3 lojas novas — ainda sem volume suficiente — têm o pior índice. A central de compras compra o mesmo volume para todas as lojas independente do giro real.",
    tags: ["varejo"],
    choices: [
      { text: "Implementar sistema de compra por loja baseado no giro real dos últimos 30 dias para cada categoria de perecível", risco: "medio", effects: { estoque: +5, margem: +3, processos: +3, financeiro: +2 }, avaliacao: "boa", ensinamento: "Compra de perecível por giro real elimina o principal driver de perda. Loja nova com volume menor que a loja madura não pode receber o mesmo pedido semanal — a diferença vai para o lixo." },
      { text: "Contratar gerentes de perecíveis especializados para as 3 lojas novas", risco: "medio", effects: { estoque: +3, financeiro: -2, rh: +1, margem: +1 }, avaliacao: "media", ensinamento: "Especialização em perecíveis melhora o gerenciamento — mas sem o sistema de compra ajustado, o gerente especializado ainda vai receber volume errado para gerenciar." },
      { text: "Reduzir o mix de perecíveis nas lojas novas até que o volume justifique a variedade atual", risco: "baixo", effects: { estoque: +4, margem: +3, clientes: -2, processos: +2 }, avaliacao: "boa", ensinamento: "Mix reduzido de perecível em loja nova é prática correta de gestão de risco. Melhor ter 60 SKUs de perecível com ruptura zero do que 120 SKUs com 30% de descarte." },
      { text: "Criar sistema de descontos progressivos para perecíveis próximos ao vencimento em todas as lojas", risco: "baixo", effects: { estoque: +2, clientes: +2, margem: -1, financeiro: +1 }, avaliacao: "media", ensinamento: "Desconto em perecível próximo ao vencimento é melhor do que descarte — mas é sintoma, não cura. O problema raiz é o volume de compra errado, não a falta de mecanismo de liquidação." }
    ]
  },

  {
    title: "A Loja Que Não Decola",
    description: "A loja de Ribeirão Vermelho, inaugurada há 14 meses, ainda opera 28% abaixo do breakeven. O estudo de viabilidade previa breakeven em 8 meses. O problema identificado: a cidade tem 45k habitantes — metade do público mínimo que o modelo de atacarejo requer para ser viável. O aluguel de R$32k/mês e os R$8M de investimento em estrutura foram realizados.",
    tags: ["varejo"],
    choices: [
      { text: "Converter a loja para atacado de venda direta para pequenos comerciantes — mudar o modelo, não fechar", risco: "medio", effects: { clientes: +2, margem: +2, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Loja em cidade pequena pode ser viável com modelo B2B puro — venda para mercearias, restaurantes e bares locais que precisam de volume sem fazer 80km para o atacado mais próximo." },
      { text: "Fechar a loja e negociar a saída do aluguel com indenização para o proprietário", risco: "alto", gestorEffects: { reputacaoInterna: -1, capitalPolitico: +1 }, effects: { financeiro: +3, rh: -3, clientes: -1, margem: +2 }, avaliacao: "boa", ensinamento: "Parar de sangrar R$420k/mês de prejuízo é uma decisão correta mesmo com o custo de saída. A alternativa é continuar queimando caixa em um mercado sem tamanho suficiente para o modelo." },
      { text: "Dar mais 12 meses e dobrar o investimento em marketing local para acelerar o reconhecimento de marca", risco: "alto", effects: { financeiro: -4, clientes: +1, marca: +1, margem: -2 }, avaliacao: "ruim", ensinamento: "Marketing não cria clientes onde não existem. Uma cidade de 45k habitantes tem demanda física limitada — mais marketing não multiplica a população que pode sustentar um atacarejo." },
      { text: "Subarrendar parte da loja para outros varejistas complementares — reduzir o custo de ocupação", risco: "baixo", effects: { financeiro: +2, margem: +2, processos: -1 }, avaliacao: "media", ensinamento: "Subarrendamento de espaço excedente é uma solução criativa de curto prazo que reduz o custo de ocupação sem fechar a loja. Funciona melhor quando há demanda local por espaço comercial." }
    ]
  },

  {
    title: "O Mix do Pequeno Comerciante",
    description: "O estudo de clientes revela: 34% da receita vem de pequenos comerciantes (mercearias, bares, restaurantes). Esse segmento tem ticket médio 4x maior e frequência 2x menor que o consumidor final. Mas as lojas foram desenhadas para o consumidor final — o layout, o fracionamento e os serviços são todos voltados para quem compra para casa, não para revender.",
    tags: ["varejo"],
    choices: [
      { text: "Criar uma área exclusiva B2B em cada loja: embalagem fechada, preço de atacado, crédito e entrega para comerciantes", risco: "medio", effects: { clientes: +4, margem: +3, processos: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Segregar o atendimento B2B do B2C é padrão em atacarejo bem gerido. O comerciante não quer esperar na fila do consumidor final e o consumidor final não quer ver o carrinho do restaurante ocupando espaço." },
      { text: "Criar um horário exclusivo para comerciantes: das 7h às 9h sem concorrência com o consumidor final", risco: "baixo", effects: { clientes: +3, processos: +2, rh: -1, margem: +1 }, avaliacao: "boa", ensinamento: "Horário preferencial para B2B é a solução de menor investimento e maior impacto na experiência do comerciante. Resolve o atrito sem reformar o layout." },
      { text: "Lançar um aplicativo de pedidos para comerciantes com entrega no dia seguinte", risco: "alto", gestorEffects: { esgotamento: +1 }, effects: { digital: +3, clientes: +3, financeiro: -4, processos: -2 }, avaliacao: "media", ensinamento: "Delivery B2B para pequenos comerciantes tem mercado real — mas exige logística, sistema de pedidos e carteira de crédito. Com os problemas operacionais atuais, adicionar um novo canal pode ser distração." },
      { text: "Focar no consumidor final — o B2B de pequenos comerciantes tem margem melhor mas escala menor", risco: "medio", effects: { clientes: +1, margem: -1, processos: +1 }, avaliacao: "ruim", ensinamento: "Ignorar o segmento que representa 34% da receita com ticket 4x maior é uma escolha estratégica difícil de justificar. Pequenos comerciantes são a base mais resistente à entrada do Assaí." }
    ]
  },

  {
    title: "A Tecnologia de Prevenção de Perdas",
    description: "O orçamento de tecnologia para o próximo semestre precisa ser decidido. Duas opções competem pelos mesmos recursos: sistema de câmeras inteligentes com IA para detecção de furto (R$1,8M para as 7 lojas, ROI estimado de 8 meses) ou sistema ERP integrado com compras, estoque e financeiro (R$2,2M, ROI de 14 meses). O CFO diz que só tem R$1,5M aprovado para tecnologia.",
    tags: ["varejo"],
    choices: [
      { text: "Priorizar câmeras de IA nas 3 lojas com maior índice de perda — ROI mais rápido, custo menor", risco: "baixo", effects: { processos: +3, financeiro: +3, margem: +2, estoque: +1 }, avaliacao: "boa", ensinamento: "ROI de 8 meses em prevenção de perdas é raramente igualado em qualquer outro investimento de varejo. Começar pelas 3 lojas críticas com R$800k entrega 65% do resultado com 44% do custo total." },
      { text: "Priorizar o ERP — sem gestão integrada, qualquer outra solução é band-aid", risco: "medio", effects: { processos: +5, estoque: +3, financeiro: -2, margem: +1 }, avaliacao: "boa", ensinamento: "ERP integrado é a fundação de qualquer operação de varejo escalável. Sem dados centralizados de compra, estoque e venda por loja, cada decisão operacional é baseada em suposição." },
      { text: "Buscar financiamento adicional de R$700k para implementar os dois sistemas simultaneamente", risco: "alto", gestorEffects: { capitalPolitico: -1, esgotamento: +1 }, effects: { processos: +5, financeiro: -3, margem: +2, estoque: +3 }, avaliacao: "media", ensinamento: "Mais dívida para tecnologia com o covenant já violado e o banco em alerta é uma decisão de risco alto. A tecnologia é necessária — o timing do financiamento precisa ser mais cuidadoso." },
      { text: "Implementar controles manuais de prevenção de perdas e adiar o investimento em tecnologia para o próximo ano", risco: "medio", effects: { processos: -1, financeiro: -1, margem: -1, estoque: -1 }, avaliacao: "ruim", ensinamento: "Controles manuais em 7 lojas com 980 funcionários não são escaláveis. Cada mês sem tecnologia de prevenção de perdas custa em média R$1M — mais do que o investimento adiado." }
    ]
  },

  {
    title: "A Negociação com o Banco",
    description: "O banco aceitou negociar. As opções na mesa: (A) Alongar o prazo da dívida de 5 para 9 anos com taxa 1,8% maior — parcela menor, custo total maior. (B) Carência de 12 meses no principal com pagamento de juros apenas — alivia o caixa agora. (C) Conversão de R$12M de dívida em participação acionária de 8% — banco vira sócio. O CFO recomenda a opção A.",
    tags: ["varejo"],
    choices: [
      { text: "Aceitar a opção A: prazo maior, custo maior, mas sem diluição e sem carência que cria falsa sensação de folga", risco: "baixo", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +3, margem: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Alongar o prazo é a opção mais conservadora e mais previsível. O custo financeiro total é maior, mas a previsibilidade do fluxo de caixa permite planejar melhor a operação." },
      { text: "Aceitar a opção B: carência de 12 meses libera R$560k/mês para investir na recuperação operacional", risco: "medio", effects: { financeiro: +4, margem: +2, processos: +2, estoque: +1 }, avaliacao: "boa", ensinamento: "Carência no principal é a opção mais inteligente quando os recursos liberados são investidos na correção do problema que gerou a crise. R$560k/mês durante 12 meses é o capital necessário para implementar as mudanças operacionais." },
      { text: "Aceitar a opção C: banco como sócio com 8% elimina R$12M de dívida sem custo de juros futuros", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +1 }, effects: { financeiro: +5, processos: -1, rh: -1 }, avaliacao: "media", ensinamento: "Banco como sócio muda a dinâmica da empresa. Bancos não são sócios passivos — eles exigem reporting, têm critérios de saída e podem forçar decisões que conflitam com a visão operacional." },
      { text: "Rejeitar todas as opções e buscar outro banco com condições melhores", risco: "alto", gestorEffects: { capitalPolitico: -2 }, effects: { financeiro: -3, processos: -1 }, avaliacao: "ruim", ensinamento: "Rejeitar a negociação com o banco credor sem ter alternativa concreta é arriscar a execução imediata do covenant. Buscar outro banco leva de 60 a 120 dias — tempo que você não tem." }
    ]
  },

  {
    title: "O Crescimento Suspenso",
    description: "O board decidiu: nenhuma nova loja nos próximos 2 anos. O foco é consolidar as 7 existentes. O problema: a equipe que foi contratada para liderar a expansão — 3 gerentes de expansão e 2 consultores de ponto — agora não tem função. Manter custa R$680k/ano. A demissão custa R$420k em indenizações.",
    tags: ["varejo"],
    choices: [
      { text: "Realocar os gerentes de expansão para funções de turnaround nas lojas deficitárias — eles conhecem abertura de loja", risco: "baixo", effects: { processos: +3, rh: +2, financeiro: -1, margem: +1 }, avaliacao: "boa", ensinamento: "Gerentes de expansão que conhecem abertura de loja entendem de layout, mix, operação inicial e captação de clientes — habilidades diretamente transferíveis para turnaround de loja existente." },
      { text: "Desligar os 5 profissionais de expansão — o projeto de crescimento foi encerrado", risco: "medio", gestorEffects: { reputacaoInterna: -1 }, effects: { financeiro: +2, rh: -3, processos: -1 }, avaliacao: "media", ensinamento: "Desligar quando a função desaparece é uma decisão difícil mas legítima. O custo da indenização é menor que o custo de manter profissionais sem função clara por 2 anos." },
      { text: "Manter os gerentes de expansão explorando oportunidades de M&A — comprar lojas de terceiros em vez de abrir", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +1 }, effects: { financeiro: -2, processos: +1, clientes: +1 }, avaliacao: "ruim", ensinamento: "M&A com dívida de 2,8x EBITDA e 3 lojas no prejuízo é prioridade errada. A equipe de expansão sem fundo de aquisição é um custo sem resultado." },
      { text: "Contratar apenas os 2 perfis mais estratégicos e desligar os outros 3 com pacote de recolocação", risco: "baixo", effects: { financeiro: +1, rh: -1, processos: +2 }, avaliacao: "boa", ensinamento: "Manutenção seletiva de talento estratégico é a solução de equilíbrio. Preservar os 2 melhores para a próxima fase de crescimento minimiza o custo humano sem manter capacidade ociosa." }
    ]
  },

  {
    title: "A Proposta do Atacadão",
    description: "O Atacadão (Carrefour) quer adquirir suas 4 melhores lojas por R$85M — um múltiplo de 5,2x EBITDA dessas unidades. As 3 lojas deficitárias e os ativos imobilizados ficam com você. O dinheiro quita a dívida integralmente e sobram R$47M para recomeçar. Mas você perde o coração da rede — as 4 lojas que geram 76% do resultado.",
    tags: ["varejo"],
    choices: [
      { text: "Negociar: vender apenas 2 das 4 melhores lojas por R$42M — quitar metade da dívida e manter o controle operacional", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +5, clientes: -2, margem: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Venda parcial que resolve o passivo sem sacrificar o negócio inteiro é o equilíbrio correto. Ficar com 5 lojas — 2 das melhores e 3 em recuperação — com dívida quitada cria condições para reconstrução." },
      { text: "Aceitar a proposta integralmente — R$47M de sobra permite reconstruir sem o peso da dívida", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +1 }, effects: { financeiro: +8, clientes: -5, rh: -4, marca: -4, processos: -3 }, avaliacao: "media", ensinamento: "Vender as 4 melhores lojas resolve a dívida mas deixa você com R$47M e 3 lojas deficitárias para recomeçar. A questão é se você consegue construir um novo negócio viável com esse capital partindo de 3 unidades problemáticas." },
      { text: "Recusar e buscar um investidor de private equity para capitalização", risco: "alto", gestorEffects: { capitalPolitico: -1, esgotamento: +2 }, effects: { financeiro: +3, clientes: 0, processos: -1 }, avaliacao: "media", ensinamento: "PE como alternativa ao Atacadão pode funcionar se houver interesse real e timing compatível com a pressão do banco. O risco é que a negociação com PE dura 4-6 meses — tempo que o fluxo de caixa atual talvez não suporte." },
      { text: "Aceitar mas incluir cláusula de recompra: direito de recomprar 2 lojas em 3 anos por múltiplo definido", risco: "medio", effects: { financeiro: +6, clientes: -3, margem: +2, processos: -1 }, avaliacao: "boa", ensinamento: "Cláusula de recompra preserva a opcionalidade de reconstruir o negócio depois de sanear o passivo. Se a recuperação funcionar, você recompra as melhores lojas com a empresa saudável." }
    ]
  },

  {
    title: "A Recuperação das Lojas Deficitárias",
    description: "Com a dívida renegociada ou reduzida, você tem uma janela para recuperar as 3 lojas que ainda estão no prejuízo. O diretor de operações apresenta 3 estratégias distintas para as 3 lojas: fechar a de Ribeirão Vermelho (cidade pequena demais), converter a de Santo André para formato de atacado B2B puro, e reformular a de Campinas com foco em hortifrúti e perecíveis premium.",
    tags: ["varejo"],
    choices: [
      { text: "Executar o plano triplo: fechar Ribeirão, converter Santo André e reformular Campinas simultaneamente", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +3 }, effects: { financeiro: +3, processos: -3, rh: -3, margem: +3, clientes: -1 }, avaliacao: "media", ensinamento: "Três transformações simultâneas em lojas deficitárias sobrecarregam o time de gestão que já está no limite. O risco de execução parcial de todas é maior do que executar uma por vez com excelência." },
      { text: "Priorizar a conversão de Santo André em B2B — menor investimento, maior margem, diferenciação real", risco: "baixo", effects: { margem: +3, clientes: +2, processos: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Começar pela conversão mais clara (B2B em Santo André) entrega resultado mais rápido e libera o aprendizado para as próximas. Execução sequencial em turnaround é mais eficaz do que execução paralela com recursos limitados." },
      { text: "Fechar as 3 lojas deficitárias de uma vez e realocar os 340 funcionários para as lojas saudáveis", risco: "alto", gestorEffects: { reputacaoInterna: -3, capitalPolitico: +2 }, effects: { financeiro: +5, rh: -5, clientes: -3, marca: -3, margem: +4 }, avaliacao: "ruim", ensinamento: "Fechar 3 lojas de uma vez com 340 demissões tem impacto humano e de marca que vai além dos números. A comunidade local e o restante do time lembram — e a reputação como empregador sofre por anos." },
      { text: "Testar novos formatos em cada loja deficitária: uma como dark store, uma B2B e uma perecíveis premium — medir e decidir", risco: "medio", effects: { inovacao: +3, processos: -2, financeiro: -2, clientes: +1 }, avaliacao: "media", ensinamento: "Testar formatos diferentes em paralelo é a abordagem de maior aprendizado — mas de maior custo de execução. Com recursos ainda escassos, testar 3 formatos diferentes pode diluir o resultado de cada um." }
    ]
  },

  {
    title: "O Crescimento Responsável",
    description: "As lojas estabilizadas, a dívida renegociada e os processos melhorados. É hora de definir a estratégia de crescimento para os próximos 3 anos — desta vez, com mais responsabilidade do que na expansão anterior.",
    tags: ["varejo"],
    choices: [
      { text: "Crescimento orgânico disciplinado: máximo de 1 loja por ano, apenas em cidades acima de 80k habitantes com estudo de viabilidade detalhado", effects: { financeiro: +4, processos: +4, margem: +3, rh: +2, clientes: +3 }, avaliacao: "boa", ensinamento: "Crescimento disciplinado com critério de viabilidade claro é a lição aprendida na crise. Uma loja por ano — bem escolhida e bem executada — constrói uma rede saudável. Velocidade sem critério foi o erro que trouxe a crise." },
      { text: "Consolidação total: sem novas lojas, foco 100% em rentabilidade e eficiência das 7 existentes por 3 anos", effects: { margem: +5, financeiro: +5, processos: +5, clientes: +2, rh: +2 }, avaliacao: "boa", ensinamento: "Consolidação total após uma crise de expansão é uma estratégia legítima e poderosa. Três anos de foco em eficiência com as lojas existentes podem dobrar a margem sem o risco de um novo ponto." },
      { text: "Franquia para operadores regionais: crescer sem capital próprio, com o know-how como ativo", requisitos: { indicadorMinimo: { processos: 9, marca: 12 } }, effects: { financeiro: +4, marca: +3, clientes: +4, processos: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Franquia de atacarejo regional permite crescimento de marca sem capital de abertura. O franchisee assume o risco de ponto — você fornece o modelo, o know-how e o poder de compra negociado." },
      { text: "Pivô para B2B puro: transformar toda a rede em atacado exclusivo para pequenos comerciantes e fechar o varejo ao consumidor final", effects: { margem: +4, clientes: -4, financeiro: +2, processos: +3, marca: -3 }, avaliacao: "ruim", ensinamento: "Pivô total para B2B abandona a base de consumidores finais construída em anos e que representa 66% da receita atual. A especialização B2B pode ser um canal a mais — não a substituição do modelo inteiro." }
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

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Logística Refrigerada · Cadeia do Frio
   Contexto: 190 colaboradores, 87 veículos refrigerados, 3 armazéns
   R$38M receita. Sensor falhou → R$620k em medicamentos devolvidos.
   18% da frota com monitoramento desatualizado. Auditoria iminente.

   INDICADORES: financeiro:7, rh:6, clientes:7, processos:4,
                sla:5, frota:7, seguranca:8, tecnologia:4

   ATENÇÃO: tecnologia (4) é o indicador mais crítico.
   tecnologia≤4 → sla-2 automaticamente. sla≤4 → clientes-2.
   frota≤5 → seguranca-2 → rh-2.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "A Falha que Expôs Tudo",
    description: "Você assume a gestão 72 horas após o incidente. O cliente farmacêutico acionou a cláusula de auditoria. O relatório interno de diagnóstico revela: 18% da frota tem sensores desatualizados, 3 armazéns com registro de temperatura manual (não automatizado), e o último treinamento de cold chain foi há 2 anos. O auditor chega em 15 dias. Por onde você começa?",
    tags: ["logistica"],
    choices: [
      { text: "Mapear os 87 veículos e classificar por criticidade de monitoramento — priorizar os que transportam medicamentos", risco: "baixo", effects: { processos: +4, tecnologia: +2, frota: +2, seguranca: +1 }, avaliacao: "boa", ensinamento: "Diagnóstico cirúrgico por prioridade é a primeira ação certa em qualquer crise operacional. Tratar todos os veículos igualmente desperdiça recursos que precisam ir para onde o risco é maior." },
      { text: "Suspender imediatamente todos os veículos com sensores desatualizados — zero risco de novo incidente", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { sla: -3, clientes: -3, financeiro: -3, seguranca: +4, tecnologia: +1 }, avaliacao: "media", ensinamento: "Suspensão total elimina o risco mas paralisa a operação. Com 87 veículos e 18% afetados, suspender 16 veículos de uma vez pressiona o SLA. A solução equilibrada é substituição escalonada com prioridade nos medicamentos." },
      { text: "Contratar empresa de monitoramento IoT para instalar sensores em toda a frota antes da auditoria", risco: "medio", effects: { tecnologia: +4, frota: +2, seguranca: +2, financeiro: -4, processos: +2 }, avaliacao: "boa", ensinamento: "Atualização completa de monitoramento é a solução estrutural. Investir antes da auditoria demonstra comprometimento real com a mudança — e sensores IoT têm custo marginal frente ao custo de um novo incidente." },
      { text: "Focar na preparação para a auditoria — apresentar um plano de ação detalhado mesmo sem ter executado", risco: "alto", gestorEffects: { capitalPolitico: -2 }, effects: { clientes: -3, processos: +1, seguranca: -2 }, avaliacao: "ruim", ensinamento: "Auditores farmacêuticos são treinados para distinguir plano de ação de ação em andamento. Apresentar plano sem execução concreta em uma auditoria de causa é percebido como gestão de aparências." }
    ]
  },
  {
    title: "A Auditoria do Cliente Farmacêutico",
    description: "O auditor passou 2 dias na operação. Relatório preliminar: 4 não-conformidades críticas — monitoramento de temperatura, rastreabilidade de lote, treinamento de operadores e documentação de desvios de temperatura. O cliente deu 30 dias para plano de ação com evidências de implementação. Se não aprovado, rescisão antecipada do contrato (R$9,2M/ano).",
    tags: ["logistica"],
    choices: [
      { text: "Responder às 4 não-conformidades em paralelo com times dedicados a cada uma — entregar evidências em 25 dias", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { processos: +5, tecnologia: +3, seguranca: +3, financeiro: -3, rh: -1 }, avaliacao: "boa", ensinamento: "Resposta paralela às não-conformidades demonstra capacidade de gestão de crise e comprometimento real. Entregar antes do prazo com evidências concretas reverte a percepção de risco do cliente." },
      { text: "Priorizar as 2 não-conformidades mais fáceis de resolver e pedir extensão de prazo para as outras 2", risco: "medio", effects: { processos: +2, seguranca: +2, clientes: -2, tecnologia: +1 }, avaliacao: "ruim", ensinamento: "Pedir extensão de prazo em auditoria de causa é sinal de gestão fraca. O cliente farmacêutico tem cronograma de conformidade de fornecedores — qualquer desvio vai para o relatório de risco de supply chain." },
      { text: "Contratar consultoria especializada em boas práticas de armazenamento farmacêutico para liderar o plano", risco: "medio", effects: { processos: +4, tecnologia: +2, seguranca: +2, financeiro: -4 }, avaliacao: "boa", ensinamento: "Consultoria especializada em GDP (Good Distribution Practices) farmacêutico traz credibilidade com o auditor e acelera a implementação. O custo é marginal frente ao contrato de R$9,2M em risco." },
      { text: "Reunir-se com o cliente para negociar a manutenção do contrato enquanto as não-conformidades são resolvidas", risco: "baixo", effects: { clientes: +3, processos: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Comunicação proativa com o cliente durante o processo de correção transforma uma auditoria adversarial em uma parceria de melhoria. Clientes que veem comprometimento genuíno raramente exercem cláusulas de rescisão imediatamente." }
    ]
  },
  {
    title: "A Frota Que Envelhece",
    description: "O relatório técnico da frota chega: dos 87 veículos refrigerados, 34 têm mais de 8 anos de uso — acima do recomendado para manutenção preventiva de sistemas de refrigeração. Renovar toda a frota custaria R$12M. Renovar apenas os 34 mais críticos custaria R$4,8M. Cada falha de temperatura não detectada pode resultar em descarte de carga e multa contratual.",
    tags: ["logistica"],
    choices: [
      { text: "Renovar os 12 veículos mais críticos (acima de 10 anos) e implementar manutenção preventiva reforçada para os outros 22", risco: "medio", effects: { frota: +5, seguranca: +3, financeiro: -3, sla: +2 }, avaliacao: "boa", ensinamento: "Renovação priorizada pelo risco real é a alocação mais eficiente. Veículos acima de 10 anos têm falha de compressor 4x mais frequente — substituí-los elimina a maior concentração de risco com metade do investimento." },
      { text: "Fazer leasing de 20 veículos novos para substituir os mais velhos — custo mensal menor, frota mais nova", risco: "medio", effects: { frota: +4, financeiro: -2, seguranca: +3, sla: +2 }, avaliacao: "boa", ensinamento: "Leasing de frota distribui o custo de renovação sem comprometer o capital de giro. Para operações de cold chain com margem pressionada, lease é frequentemente superior à compra." },
      { text: "Adiar a renovação e intensificar a manutenção preventiva de toda a frota", risco: "alto", effects: { frota: +2, financeiro: +1, seguranca: -2, sla: -1 }, avaliacao: "ruim", ensinamento: "Manutenção preventiva intensificada em veículo velho reduz a frequência de falha — mas não elimina o risco de colapso de sistema de refrigeração em rota. Para cold chain farmacêutico, 'reduzir risco' não é suficiente." },
      { text: "Vender os 34 veículos mais velhos como sucata e usar o recurso para financiar a renovação", risco: "baixo", effects: { frota: +3, financeiro: +2, seguranca: +2, sla: -1 }, avaliacao: "media", ensinamento: "Venda de frota velha como parcial do financiamento da nova é razoável — mas o gap de tempo entre a venda e a chegada dos novos veículos pode pressionar o SLA se não for planejado." }
    ]
  },
  {
    title: "O Responsável Técnico que Sumiu",
    description: "O responsável técnico de qualidade e rastreabilidade, que detinha todas as certificações ANVISA da operação, pediu demissão 3 dias após o incidente. Com ele foram: o conhecimento dos procedimentos de desvio, os contatos regulatórios e a memória dos processos de certificação. A renovação anual das licenças de operação farmacêutica vence em 4 meses.",
    tags: ["logistica"],
    choices: [
      { text: "Contratar imediatamente um consultor regulatório farmacêutico para cobrir o gap enquanto busca substituto permanente", risco: "medio", effects: { processos: +3, seguranca: +2, tecnologia: +1, financeiro: -2 }, avaliacao: "boa", ensinamento: "Consultor regulatório é a solução mais rápida para o gap de conhecimento. Um profissional com experiência em ANVISA pode cobrir as certificações em tempo menor que qualquer contratação CLT." },
      { text: "Promover internamente o assistente de qualidade mais experiente e pagar a certificação dele urgentemente", risco: "baixo", effects: { rh: +3, processos: +2, seguranca: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Promoção interna preserva o conhecimento institucional já existente. O assistente que trabalhava com o responsável técnico conhece os processos — falta apenas a certificação formal que pode ser obtida em semanas." },
      { text: "Documentar todos os processos existentes em 2 semanas antes de contratar alguém novo", risco: "medio", effects: { processos: +4, tecnologia: +2, financeiro: -1, sla: -1 }, avaliacao: "media", ensinamento: "Documentação antes da contratação garante que o conhecimento não está concentrado numa única pessoa de novo. O risco é o tempo — 2 semanas de documentação em paralelo com a auditoria pode sobrecarregar o time." },
      { text: "Contratar no mercado o perfil mais qualificado disponível com salário acima da média para fechar rápido", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: -4, rh: +1, processos: +2, seguranca: +1 }, avaliacao: "media", ensinamento: "Pagar prêmio de urgência por profissional regulatório é justificável com licença ANVISA vencendo em 4 meses. O custo da contratação é marginal frente à multa e suspensão de licença." }
    ]
  },
  {
    title: "O Segundo Cliente Pede Auditoria",
    description: "O cliente de alimentos perecíveis — que representa R$6,8M/ano — leu sobre o incidente farmacêutico no setor e também acionou cláusula de auditoria. 'Não é que a gente desconfie de vocês', diz o diretor de supply chain deles. 'É que temos obrigação com nossos próprios auditores de verificar todos os fornecedores de frio.' Você ainda está gerenciando a auditoria farmacêutica.",
    tags: ["logistica"],
    choices: [
      { text: "Agendar a auditoria de alimentos para 45 dias — depois que a farmacêutica for concluída — e comunicar proativamente o cronograma", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +3, processos: +1, sla: +1 }, avaliacao: "boa", ensinamento: "Gerenciar o timing das duas auditorias evita a sobrecarga do time de qualidade. Comunicar proativamente o cronograma mostra organização e respeito ao cliente." },
      { text: "Aceitar as duas auditorias em paralelo — mostrar que a empresa tem capacidade de gestão sob pressão", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { processos: -3, rh: -2, sla: -1, seguranca: +1 }, avaliacao: "ruim", ensinamento: "Duas auditorias simultâneas sobrecarregam o mesmo time de qualidade que está tentando corrigir os problemas. O risco de execução ruim nas duas é maior do que o benefício de demonstrar capacidade." },
      { text: "Transformar a auditoria de alimentos em visita de parceria — mostrar as melhorias implementadas pós-incidente", risco: "baixo", effects: { clientes: +4, marca: +2, processos: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Converter uma auditoria defensiva em demonstração de melhoria muda a dinâmica do relacionamento. O cliente que vem para verificar e sai impressionado com as mudanças se torna um defensor da empresa." },
      { text: "Oferecer ao cliente de alimentos acesso ao relatório e plano de ação da auditoria farmacêutica como transparência", risco: "medio", effects: { clientes: +4, processos: +1, sla: +1 }, avaliacao: "boa", ensinamento: "Transparência radical com clientes em crise constrói confiança que anos de relacionamento normal não criam. Compartilhar o relatório completo demonstra que você não tem nada a esconder." }
    ]
  },
  {
    title: "A Tecnologia de Rastreabilidade em Tempo Real",
    description: "O CTO apresenta a proposta: R$1,1M para implementar rastreabilidade em tempo real com IoT em toda a frota e armazéns — temperatura, localização e umidade com alertas automáticos para desvios. O sistema integra diretamente com o dashboard dos clientes. O ROI projetado: redução de 90% nos incidentes de temperatura e eliminação de R$2M/ano em perdas de carga.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar o investimento completo — rastreabilidade em tempo real é o novo padrão do mercado farmacêutico", risco: "medio", effects: { tecnologia: +6, seguranca: +3, frota: +2, clientes: +3, financeiro: -4 }, avaliacao: "boa", ensinamento: "Tecnologia de rastreabilidade em cold chain farmacêutico migrou de diferencial para requisito de entrada. Empresas que não implementam em 24 meses perdem acesso a contratos de distribuição de medicamentos regulados." },
      { text: "Implementar apenas nos veículos que atendem clientes farmacêuticos — R$380k em vez de R$1,1M", risco: "baixo", effects: { tecnologia: +3, seguranca: +2, frota: +1, clientes: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Implementação faseada por criticidade do cliente entrega 80% do resultado com 35% do custo. Os veículos de alimentos podem ser integrados numa segunda fase quando o ROI da primeira fase for validado." },
      { text: "Buscar financiamento de fornecedor de IoT via contrato de serviço mensal — sem capex inicial", risco: "baixo", effects: { tecnologia: +4, seguranca: +3, financeiro: -2, frota: +2, sla: +2 }, avaliacao: "boa", ensinamento: "Modelo SaaS de monitoramento IoT existe no mercado — você paga por dispositivo por mês sem capex. Para empresas com fluxo de caixa pressionado, opex é preferível a capex." },
      { text: "Adiar — a prioridade agora é passar nas auditorias com o que temos, tecnologia é próximo passo", risco: "alto", effects: { tecnologia: -1, seguranca: -2, clientes: -2, sla: -1 }, avaliacao: "ruim", ensinamento: "Passar na auditoria sem implementar rastreabilidade em tempo real é uma contradição. O auditor vai perguntar exatamente o que você está fazendo para evitar o próximo incidente — 'plano para o próximo passo' não é uma resposta satisfatória." }
    ]
  },
  {
    title: "A Proposta do Concorrente ao Seu Cliente",
    description: "Você soube por um contato no mercado que dois concorrentes estão prospectando ativamente o seu cliente farmacêutico, aproveitando o momento de vulnerabilidade. Um deles apresentou proposta com preço 12% abaixo do seu e frota 100% com rastreabilidade IoT. O contrato do cliente vence em 8 meses.",
    tags: ["logistica"],
    choices: [
      { text: "Antecipar a renovação: propor contrato de 3 anos com as melhorias implementadas como argumento principal", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, financeiro: +3, sla: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Renovação antecipada com empresa em processo de melhoria visível é estratégia correta. O cliente que assina agora está apostando na trajetória — e você está demonstrando que a trajetória é positiva." },
      { text: "Reduzir o preço em 10% para tornar a proposta do concorrente menos atraente", risco: "alto", effects: { clientes: +2, financeiro: -4, sla: 0 }, avaliacao: "ruim", ensinamento: "Redução de preço sem argumento de valor é mensagem de desespero. O cliente farmacêutico toma decisão de fornecedor de cold chain por confiabilidade, não por preço — especialmente após um incidente." },
      { text: "Apresentar ao cliente o roadmap de tecnologia dos próximos 6 meses como demonstração de comprometimento", risco: "baixo", effects: { clientes: +3, tecnologia: +2, sla: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Roadmap de investimento é o argumento mais poderoso para retenção de cliente em momento de crise. Ele demonstra que a empresa aprendeu com o incidente e está investindo — não apenas prometendo." },
      { text: "Buscar informações sobre as propostas dos concorrentes antes de reagir", risco: "baixo", effects: { processos: +2, clientes: +1 }, avaliacao: "media", ensinamento: "Inteligência competitiva antes de reagir é prudente — mas com contrato vencendo em 8 meses e concorrentes ativos, o tempo de espera tem custo. Cada semana sem ação é semana que o concorrente usa para construir relacionamento." }
    ]
  },
  {
    title: "A Certificação ANVISA em Risco",
    description: "O responsável técnico substituto identifica um problema grave: dois dos três armazéns frigorificados têm procedimentos de controle de temperatura que não atendem mais a RDC 430/2020 da ANVISA. A renovação da licença sanitária é em 3 meses. Sem ela, você não pode operar distribuição de medicamentos.",
    tags: ["logistica"],
    choices: [
      { text: "Contratar consultoria regulatória para adequação imediata dos dois armazéns — prioridade máxima", risco: "medio", effects: { seguranca: +4, processos: +4, tecnologia: +2, financeiro: -3, conformidade: +3 }, avaliacao: "boa", ensinamento: "Adequação regulatória com prazo fixo não tem alternativa: ou você implementa ou perde a licença. A consultoria especializada reduz o risco de interpretar incorretamente a regulação e reprovar na inspeção." },
      { text: "Fazer as adequações internamente com a equipe atual para economizar o custo da consultoria", risco: "alto", effects: { processos: +2, seguranca: +2, financeiro: +1, tecnologia: -1 }, avaliacao: "ruim", ensinamento: "Adequação regulatória farmacêutica sem especialista é alto risco. A RDC 430 tem especificidades técnicas que exigem profissional habilitado — uma interpretação errada pode resultar em reprovação na inspeção sanitária." },
      { text: "Contatar a ANVISA proativamente para apresentar o plano de adequação antes da inspeção", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { processos: +3, seguranca: +3, clientes: +2 }, avaliacao: "boa", ensinamento: "Órgãos regulatórios respondem positivamente a empresas que buscam orientação antes de serem autuadas. Contato proativo transforma a relação de policiamento em parceria de conformidade." },
      { text: "Migrar temporariamente as operações farmacêuticas para o armazém já adequado enquanto faz as reformas", risco: "medio", effects: { sla: -2, processos: +2, seguranca: +2, clientes: -1 }, avaliacao: "media", ensinamento: "Concentração temporária das operações farmacêuticas reduz a exposição regulatória — mas aumenta o volume no único armazém adequado, pressionando o SLA dos clientes farmacêuticos." }
    ]
  },
  {
    title: "O Treinamento que Nunca Aconteceu",
    description: "A auditoria identificou que 67% dos motoristas e 82% dos operadores de armazém nunca fizeram treinamento em cadeia do frio. O último treinamento foi há 2 anos para um grupo de 12 pessoas. Com 190 colaboradores, o treinamento completo leva 3 semanas e custa R$85k. O auditor incluiu o treinamento como não-conformidade crítica.",
    tags: ["logistica"],
    choices: [
      { text: "Contratar empresa de treinamento especializada em GDP para capacitar toda a equipe em 3 semanas", risco: "medio", effects: { rh: +5, seguranca: +4, processos: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Treinamento de GDP (Good Distribution Practices) não é custo — é a única forma de garantir que todos os colaboradores tomem as decisões corretas no momento certo. 190 pessoas treinadas são 190 barreiras contra o próximo incidente." },
      { text: "Treinar primeiro os 40 colaboradores que operam os veículos e armazéns farmacêuticos", risco: "baixo", effects: { rh: +3, seguranca: +3, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Treinamento priorizado por exposição ao risco é a alocação correta. Os 40 que operam diretamente com medicamentos são os que mais precisam do treinamento — e são os que o auditor vai verificar." },
      { text: "Criar um e-learning interno com o conteúdo básico de cold chain — mais rápido e mais barato", risco: "medio", effects: { rh: +2, seguranca: +1, processos: +1, financeiro: 0 }, avaliacao: "ruim", ensinamento: "E-learning genérico em cold chain não substitui treinamento presencial com simulações de desvio de temperatura. Auditores farmacêuticos sabem a diferença — e o e-learning sem aplicação prática raramente muda comportamento." },
      { text: "Implementar sistema de multiplicadores internos — treinar 10 líderes que replicam para toda a equipe", risco: "baixo", effects: { rh: +4, seguranca: +2, processos: +3, financeiro: -1 }, avaliacao: "boa", ensinamento: "Multiplicadores internos criam capacidade de treinamento contínuo, não apenas pontual. Operação de cold chain muda com a equipe — multiplicadores garantem que os novos colaboradores sejam treinados no padrão." }
    ]
  },
  {
    title: "O Novo Cliente de Vacinas",
    description: "O Ministério da Saúde abriu licitação para distribuição de vacinas em 4 estados — contrato de R$14M por 2 anos. Os requisitos são os mais rigorosos da cadeia do frio: temperatura entre 2°C e 8°C com desvio máximo de 0,5°C, rastreabilidade em tempo real obrigatória e certificação ANVISA específica para vacinas. Você ainda está em processo de adequação.",
    tags: ["logistica"],
    choices: [
      { text: "Não participar da licitação — as adequações atuais precisam ser concluídas antes de assumir um contrato mais exigente", risco: "baixo", gestorEffects: { capitalPolitico: -1 }, effects: { processos: +2, seguranca: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Disciplina de não assumir contratos acima da capacidade atual é sinal de maturidade operacional. Um contrato de vacinas com falha é muito mais danoso do que não participar da licitação." },
      { text: "Participar da licitação com proposta condicional: contrato inicia em 6 meses quando as adequações estiverem concluídas", risco: "medio", effects: { clientes: +2, financeiro: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Proposta condicional com cronograma honesto é melhor do que proposta que você não pode cumprir. Alguns órgãos públicos aceitam prazos escalonados de implementação quando a justificativa é técnica e documentada." },
      { text: "Participar da licitação em parceria com empresa já certificada para vacinas — dividir receita e risco", risco: "medio", effects: { clientes: +3, financeiro: +3, tecnologia: +2, sla: +1 }, avaliacao: "boa", ensinamento: "Parceria para capturar contrato que exige certificação que você ainda não tem é a forma mais inteligente de crescer no segmento. O parceiro certifica, você opera — e os dois aprendem juntos." },
      { text: "Assumir o compromisso e acelerar as adequações para cumprir os requisitos até o início do contrato", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +2 }, effects: { financeiro: -4, processos: -2, seguranca: +2, sla: -2 }, avaliacao: "ruim", ensinamento: "Assumir contrato de vacinas antes de estar pronto cria risco sanitário real. Uma falha na cadeia do frio de vacinas tem impacto de saúde pública — não apenas financeiro." }
    ]
  },
  {
    title: "O Motoboy que Filma a Operação",
    description: "Um colaborador publicou um vídeo nas redes sociais mostrando um veículo refrigerado descarregando caixas de medicamentos ao sol por 8 minutos em frente a uma farmácia. O vídeo atingiu 340k visualizações em 12 horas. O cliente farmacêutico ligou na mesma hora. O colaborador estava correto no procedimento — a entrega em farmácias pequenas sem doca exige exposição breve ao ambiente.",
    tags: ["logistica"],
    choices: [
      { text: "Responder publicamente com explicação técnica do procedimento e demonstração das temperaturas registradas no momento", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +3, rh: +1, tecnologia: +1, seguranca: +1 }, avaliacao: "boa", ensinamento: "Transparência com dados técnicos é a resposta correta a críticas de operação baseadas em aparência. Se o procedimento está correto e a temperatura foi mantida, os dados da rastreabilidade são a prova mais eficiente." },
      { text: "Criar procedimento formal de entrega com cobertura térmica para todos os pontos sem doca", risco: "baixo", effects: { seguranca: +3, processos: +3, frota: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Mesmo que o procedimento estivesse correto, criar um padrão mais rigoroso visível é a resposta proativa que demonstra liderança em qualidade. Coberturas térmicas para entrega custam R$180 por veículo." },
      { text: "Acionar a equipe jurídica para avaliar a publicação do colaborador como falta grave", risco: "alto", gestorEffects: { reputacaoInterna: -3 }, effects: { rh: -5, clientes: -2, sla: -1 }, avaliacao: "ruim", ensinamento: "Punir colaborador por expor uma prática operacional real — mesmo que correta — cria clima de medo e silêncio que é muito mais perigoso do que o vídeo. Problemas reais que ninguém reporta são os mais caros." },
      { text: "Contatar o colaborador para entender a motivação e resolver internamente antes de qualquer ação pública", risco: "baixo", effects: { rh: +2, clientes: +1 }, avaliacao: "media", ensinamento: "Entender o colaborador antes de agir é prudente — mas com 340k visualizações em 12h, o público externo já está formando opinião. A resposta interna precisa ser acompanhada de uma posição pública." }
    ]
  },
  {
    title: "A Proposta de Fusão com Operador de Frio",
    description: "O maior operador de frio da região Sul quer fusão: eles têm 140 veículos refrigerados e 5 armazéns, mas estão com problemas financeiros por má gestão. A fusão criaria a maior operação de cold chain do Sul e Sudeste com R$92M de receita combinada. Mas eles têm R$8M em dívida e cultura operacional diferente da sua.",
    tags: ["logistica"],
    choices: [
      { text: "Recusar a fusão e propor aquisição apenas dos ativos físicos — comprar frota e armazéns sem a dívida", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { frota: +4, tecnologia: +2, financeiro: -3, sla: +2 }, avaliacao: "boa", ensinamento: "Comprar ativos sem a dívida é a forma mais inteligente de crescer em operações com problemas financeiros. Frota e armazéns têm valor sem o passivo do vendedor." },
      { text: "Aceitar a fusão com due diligence completa e plano de integração de 12 meses", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +2 }, effects: { financeiro: -4, frota: +5, clientes: +3, processos: -3, sla: -1 }, avaliacao: "media", ensinamento: "Fusão com empresa com problemas financeiros pode criar escala — ou dobrar os problemas. A due diligence precisa avaliar não apenas os números, mas a cultura operacional de cold chain." },
      { text: "Propor aliança operacional sem fusão societária — compartilhar frota e CD em picos sem assumir dívida", risco: "baixo", effects: { frota: +2, sla: +2, clientes: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Aliança operacional captura a escala nos momentos que importam sem os riscos de integração. É o caminho mais eficiente quando as culturas e as situações financeiras são muito diferentes." },
      { text: "Recusar completamente — você está em processo de adequação e uma fusão agora compromete o foco", risco: "baixo", effects: { processos: +2, seguranca: +1, financeiro: +1 }, avaliacao: "media", ensinamento: "Recusar durante um processo de adequação ativa é razoável. Integrar outra empresa enquanto você está corrigindo problemas internos pode comprometer os dois processos." }
    ]
  },
  {
    title: "O Reconhecimento de Mercado",
    description: "Depois de 12 meses de trabalho intenso, a operação está transformada. O cliente farmacêutico renovou o contrato por 3 anos. A ABRAFRIO (associação do setor) convidou você para apresentar o case de recuperação em evento nacional. Dois novos prospectos de clientes farmacêuticos entraram em contato espontaneamente. O time pergunta: 'O que vem a seguir?'",
    tags: ["logistica"],
    choices: [
      { text: "Aceitar o convite da ABRAFRIO e publicar o case — posicionar a empresa como referência em recuperação de qualidade", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { reputacao: +4, clientes: +3, rh: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Um case de recuperação bem documentado é ativo de marketing poderoso. Empresas que transformaram crise em excelência têm credibilidade superior às que nunca passaram por crises." },
      { text: "Priorizar os dois novos prospectos antes do evento — converter em contratos enquanto o momentum é alto", risco: "medio", effects: { clientes: +4, financeiro: +3, sla: +1 }, avaliacao: "boa", ensinamento: "Converter prospectos inbound enquanto a reputação está em alta é a janela de menor custo de aquisição. Clientes que chegam até você por indicação ou reputação têm ciclo de venda 60% menor." },
      { text: "Certificar a operação na ISO 13485 (dispositivos médicos) para ampliar o portfólio de segmentos atendíveis", risco: "medio", effects: { tecnologia: +3, seguranca: +3, financeiro: -3, processos: +3, clientes: +2 }, avaliacao: "boa", ensinamento: "ISO 13485 abre o mercado de dispositivos médicos e materiais hospitalares — segmento com margens mais altas e contratos mais longos do que medicamentos. A base de qualidade que você construiu é a fundação." },
      { text: "Focar exclusivamente em consolidar a operação atual por mais 6 meses antes de qualquer expansão", risco: "baixo", effects: { processos: +2, sla: +2, rh: +1, seguranca: +1 }, avaliacao: "media", ensinamento: "Consolidação antes de expansão é prudente — mas com dois prospectos inbound e o contrato renovado, a janela de crescimento está aberta. Esperar 6 meses pode significar perder o timing de mercado." }
    ]
  },
  {
    title: "A Decisão de Precificação",
    description: "Com a operação recuperada e certificada, você tem poder de precificação que não tinha antes. Dois novos clientes farmacêuticos propõem contratos — um aceita seu preço atual, outro pede 8% de desconto argumentando volume. A consultoria financeira indica que você poderia aumentar a tabela em 15% para novos contratos sem perder competitividade, dado o diferencial técnico construído.",
    tags: ["logistica"],
    choices: [
      { text: "Reajustar a tabela de preços em 12% para novos contratos — capturar o valor do diferencial construído", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +5, margem: +3, clientes: +1, sla: +1 }, avaliacao: "boa", ensinamento: "Pricing power é o resultado de diferenciação real. Uma operação com rastreabilidade IoT, equipe certificada e histórico de recuperação de crise vale mais do que uma operação genérica. Cobrar mais é legítimo e necessário para sustentar o investimento feito." },
      { text: "Manter o preço atual e focar em volume — crescer a carteira antes de reajustar", risco: "baixo", effects: { clientes: +3, financeiro: +2, sla: +1, frota: +1 }, avaliacao: "media", ensinamento: "Volume antes de preço é uma estratégia válida para construir case de escala. O risco é que o custo de operação em cold chain farmacêutico de alta qualidade não se sustenta indefinidamente com preço pré-diferenciação." },
      { text: "Aceitar o desconto de 8% do cliente de volume e compensar no ticket médio geral", risco: "medio", effects: { financeiro: +2, clientes: +4, sla: +1, frota: +2 }, avaliacao: "media", ensinamento: "Desconto por volume é aceitável quando o contrato tem escala suficiente para compensar na margem absoluta. O risco é criar precedente de que seu preço é negociável." },
      { text: "Reajustar em 18% apenas para contratos de maior risco técnico — vacinas e medicamentos controlados", risco: "baixo", effects: { financeiro: +4, margem: +4, clientes: +1, seguranca: +1 }, avaliacao: "boa", ensinamento: "Precificação diferenciada por complexidade e risco técnico é o modelo correto para cold chain especializado. Quem exige mais paga mais — e o cliente que entende o risco aceita o prêmio de preço." }
    ]
  },
  {
    title: "O Futuro da Cadeia do Frio",
    description: "Após um ciclo de transformação profunda, você precisa definir a direção estratégica dos próximos 3 anos. O setor de cold chain farmacêutico cresce 18% ao ano no Brasil. O board quer saber qual posicionamento vai sustentar o crescimento.",
    tags: ["logistica"],
    choices: [
      { text: "Especialista em cold chain farmacêutico e hospitalar: ser a referência técnica no segmento mais exigente do setor", effects: { financeiro: +5, clientes: +5, seguranca: +5, tecnologia: +4, rh: +3, sla: +3 }, avaliacao: "boa", ensinamento: "Especialização no segmento mais exigente cria barreiras de entrada que protegem a margem. Certificações, know-how e reputação construídos levam anos para um concorrente replicar." },
      { text: "Expansão nacional: replicar o modelo de cold chain certificado para outras regiões do Brasil", requisitos: { indicadorMinimo: { tecnologia: 10, seguranca: 12 } }, effects: { financeiro: +4, clientes: +4, sla: +2, frota: +3, rh: +2 }, avaliacao: "boa", ensinamento: "Expansão com modelo certificado e comprovado é mais segura do que a maioria das expansões logísticas. A certificação ANVISA é federal — o que você construiu no Sudeste replica para outros estados com ajustes menores." },
      { text: "Plataforma de cold chain as-a-service: abrir a infraestrutura para outros operadores menores como B2B", effects: { tecnologia: +5, financeiro: +3, processos: +3, clientes: +2, sla: +1 }, avaliacao: "boa", ensinamento: "Infraestrutura como serviço multiplica o retorno do investimento em tecnologia e armazéns. Outros operadores que não têm condições de certificar sozinhos pagam pelo acesso à sua infraestrutura." },
      { text: "Diversificação para alimentos premium: ampliar o mix de clientes além do farmacêutico", effects: { clientes: +3, financeiro: +3, sla: +2, frota: +2, seguranca: -1 }, avaliacao: "media", ensinamento: "Alimentos premium têm requisitos de cold chain rigorosos mas diferentes dos farmacêuticos. A diversificação reduz a concentração de receita em um setor — ao custo de diluir um pouco a especialização que é o principal diferencial." }
    ]
  }
],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Fulfillment E-commerce · Operação Omnichannel
   Contexto: 310 funcionários, 2 CDs em Campinas, 18k pedidos/dia,
   R$45M faturamento. Volume cresceu 62% com novo marketplace.
   Índice de problema: 1,2% → 4,7% (limite contratual: 2%).
   Marketplace emitiu alerta formal com cláusula de rescisão.

   INDICADORES: financeiro:7, rh:6, clientes:7, processos:4,
                sla:5, frota:7, seguranca:8, tecnologia:4

   ATENÇÃO: processos (4) e tecnologia (4) já estão no limite.
   A operação foi projetada para 11k pedidos — está em 18k.
   tecnologia≤4 → sla-2. sla≤3 → financeiro-1.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "O Volume que Ninguém Esperava",
    description: "O contrato com o marketplace entrou em vigor há 45 dias. Em vez dos 6.500 pedidos/dia projetados, chegaram 10.800 no primeiro mês. O CD principal opera a 118% da capacidade. A taxa de erro está em 4,7% — 2,35x acima do limite contratual de 2%. Você tem 30 dias antes de o marketplace acionar a cláusula de rescisão. O que você faz primeiro?",
    tags: ["logistica"],
    choices: [
      { text: "Implementar triplo turno de operação nos dois CDs — maximizar capacidade antes de qualquer outra solução", risco: "medio", effects: { sla: +3, rh: -3, financeiro: -2, processos: +2 }, avaliacao: "boa", ensinamento: "Triplo turno é a solução mais rápida para aumentar capacidade sem investimento de capital. O custo humano é real — adicional noturno e desgaste do time — mas a alternativa é perder R$14M de contrato." },
      { text: "Alugar um terceiro CD de emergência para distribuir o volume excedente imediatamente", risco: "medio", effects: { sla: +2, processos: +2, financeiro: -4, clientes: +2 }, avaliacao: "boa", ensinamento: "CD adicional elimina o gargalo físico que é a causa raiz do problema de SLA. R$80-120k/mês de aluguel é custo marginal frente ao contrato do marketplace." },
      { text: "Negociar com o marketplace uma rampa de crescimento mais gradual — limitar o volume nos próximos 60 dias", risco: "baixo", effects: { sla: +3, clientes: -2, financeiro: -1 }, avaliacao: "media", ensinamento: "Renegociar o volume com o marketplace pode ser possível se a comunicação for proativa e o plano de expansão de capacidade for crível. O risco é que o marketplace pode preferir rescindir a aceitar limitação de volume." },
      { text: "Focar na redução do erro nos 18k pedidos atuais antes de pensar em capacidade — qualidade antes de volume", risco: "alto", effects: { processos: +2, sla: -2, clientes: -2, financeiro: -1 }, avaliacao: "ruim", ensinamento: "Focar em qualidade sem resolver o gargalo de capacidade é gerenciar o sintoma da doença. Com CD a 118%, o erro é estrutural — não operacional. Mais atenção com o mesmo gargalo não reduz o índice de 4,7%." }
    ]
  },
  {
    title: "Os Clientes Originais Reclamam",
    description: "Os 37 clientes que operavam com você antes do contrato do marketplace estão reclamando que o SLA deles piorou. Três enviaram carta formal. Dois ameaçam migrar para outro operador. Eles representam R$31M em receita — 69% do faturamento total. O novo marketplace representa R$14M — mas a atenção operacional está toda nele.",
    tags: ["logistica"],
    choices: [
      { text: "Criar SLA dedicado para os clientes originais: time separado, área do CD reservada, não competem com o marketplace pelo recurso", risco: "medio", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +4, processos: +2, financeiro: -2, sla: +2 }, avaliacao: "boa", ensinamento: "Segregação de operação por cliente é a solução estrutural para conflito de capacidade. Clientes que pagam mais não podem perder SLA por causa de um cliente maior em volume." },
      { text: "Reunir-se pessoalmente com os 3 clientes que enviaram carta formal e apresentar plano de recuperação", risco: "baixo", gestorEffects: { capitalPolitico: +1 }, effects: { clientes: +3, sla: +1 }, avaliacao: "boa", ensinamento: "Clientes que se deram ao trabalho de escrever uma carta formal querem atenção, não apenas solução técnica. A presença do gestor na reunião comunica que o relacionamento importa." },
      { text: "Oferecer desconto temporário de 10% para os clientes originais como compensação pelo período de queda de SLA", risco: "alto", effects: { clientes: +2, financeiro: -3, sla: 0 }, avaliacao: "ruim", ensinamento: "Desconto como compensação de SLA é a solução mais cara e menos eficiente. Você paga pela falha operacional sem corrigi-la — e cria precedente de que queda de SLA tem preço, não solução." },
      { text: "Priorizar temporariamente o marketplace para estabilizar o SLA mais urgente e voltar aos clientes originais em 30 dias", risco: "alto", effects: { clientes: -3, sla: +1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Priorizar o novo cliente em detrimento dos clientes que construíram sua empresa é uma troca que raramente compensa. Os clientes originais têm memória longa — e as cartas formais indicam que a paciência já acabou." }
    ]
  },
  {
    title: "O Sistema WMS Sobrecarregado",
    description: "O WMS (Warehouse Management System) foi dimensionado para 12k pedidos/dia. Com 18k, o sistema trava 3 a 5 vezes por turno, causando filas de triagem de até 90 minutos. O fornecedor do WMS diz que a atualização para suportar 25k pedidos/dia custa R$380k e leva 6 semanas de implementação. Nas 6 semanas, a operação continua no WMS atual.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar a atualização do WMS e implementar workarounds manuais para os próximos 6 weeks", risco: "medio", effects: { tecnologia: +5, processos: +4, sla: +2, financeiro: -4, rh: -2 }, avaliacao: "boa", ensinamento: "Atualização de WMS é investimento estrutural necessário. Os 6 weeks de implementação são inevitáveis — quanto mais você adia, mais a operação degrada. Os workarounds manuais são o custo da transição." },
      { text: "Migrar para WMS SaaS de novo fornecedor — implementação mais rápida (3 semanas) mas R$520k/ano", risco: "alto", gestorEffects: { esgotamento: +1 }, effects: { tecnologia: +4, processos: +3, sla: +3, financeiro: -3, rh: -3 }, avaliacao: "media", ensinamento: "Troca de WMS em operação a 118% de capacidade é risco extremamente alto. Migrações de sistema em operação plena frequentemente resultam em perdas de dados e paralisação parcial." },
      { text: "Implementar processamento em fila — o WMS processa em batches de 2h em vez de tempo real", risco: "baixo", effects: { tecnologia: +2, processos: +1, sla: -1, rh: +1 }, avaliacao: "media", ensinamento: "Processamento em batch reduz a sobrecarga do WMS sem custo de atualização — mas aumenta a latência de cada pedido. Para e-commerce com SLA de 4h para despacho, batches de 2h podem comprometer o timing de expedição." },
      { text: "Dividir o volume entre os dois CDs manualmente para reduzir a pressão no WMS principal", risco: "medio", effects: { processos: +2, sla: +1, rh: -2, financeiro: -1 }, avaliacao: "media", ensinamento: "Distribuição manual de volume entre CDs alivia o WMS sem custo de sistema — mas cria outro gargalo: coordenação humana de volume em dois locais sem sistema integrado é fonte de erro." }
    ]
  },
  {
    title: "A Qualidade dos Entregadores Terceirizados",
    description: "O relatório de incidentes revela: 73% dos erros de entrega (endereço errado, produto trocado, embalagem danificada) ocorrem nos 18 transportadores terceirizados que o marketplace exige usar. Você não tem controle sobre eles — são parceiros do marketplace. Os clientes reclamam na sua empresa, não no marketplace.",
    tags: ["logistica"],
    choices: [
      { text: "Documentar os incidentes por transportador e apresentar relatório formal ao marketplace solicitando substituição dos piores", risco: "baixo", gestorEffects: { capitalPolitico: +1 }, effects: { clientes: +3, sla: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Dados concretos de performance por transportador são o argumento correto para forçar mudança. O marketplace não quer incidentes — ele vai agir se você provar com dados qual transportador está destruindo a experiência do cliente final." },
      { text: "Adicionar uma etapa extra de verificação antes da saída do CD — double-check em 100% dos pedidos do marketplace", risco: "medio", effects: { sla: +2, processos: +3, rh: -3, financeiro: -1 }, avaliacao: "boa", ensinamento: "Double-check antes da expedição captura os erros de embalagem e produto antes de sair do seu controle. O custo em tempo de processamento é real — mas a taxa de erro cai para um nível que você pode defender." },
      { text: "Tentar absorver os transportadores terceirizados como frota própria — assumir o controle da entrega", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { financeiro: -5, sla: +3, rh: -3, frota: +3, clientes: +2 }, avaliacao: "media", ensinamento: "Trazer para frota própria dá controle mas requer capital para compra de veículos e contratação em escala. Com a operação já sobrecarregada, absorver 18 transportadores pode ser uma sobrecarga operacional adicional." },
      { text: "Negociar com o marketplace a possibilidade de usar transportadores próprios nos corredores com pior performance", risco: "medio", effects: { clientes: +3, sla: +2, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Substituição gradual em corredores específicos é a negociação mais razoável com o marketplace. Você demonstra capacidade onde o terceirizado falha — e o marketplace tem dados para justificar a mudança." }
    ]
  },
  {
    title: "O Pico de Black Friday se Aproxima",
    description: "Black Friday em 60 dias. No ano passado, o volume triplicou em 24 horas. Com o volume base atual de 18k pedidos/dia, o pico pode chegar a 54k pedidos/dia. O marketplace exige que você mantenha o SLA durante o pico. O plano operacional precisa ser apresentado em 2 semanas. Você ainda está resolvendo os problemas do volume atual.",
    tags: ["logistica"],
    choices: [
      { text: "Apresentar plano realista ao marketplace: capacidade máxima de 32k pedidos/dia no pico — solicitar limite de volume acima disso", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { clientes: +2, processos: +3, sla: +2, financeiro: +1 }, avaliacao: "boa", ensinamento: "Honestidade sobre a capacidade máxima é melhor do que comprometer um SLA impossível. O marketplace prefere um operador que sabe seus limites a um que promete 54k e entrega 18k com 8% de erro." },
      { text: "Contratar 80 operadores temporários e alugar um terceiro CD por 45 dias para o pico", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { sla: +3, financeiro: -5, rh: -2, processos: +2 }, avaliacao: "media", ensinamento: "Operação de pico com temporários e CD extra é viável — mas o tempo de treinamento para 80 pessoas é de 2 a 3 semanas. Com 60 dias, a janela é apertada e o risco de erro de temporário no pico é alto." },
      { text: "Propor ao marketplace cobrança por pedido no pico (acima de 25k/dia) para financiar a capacidade adicional necessária", risco: "medio", effects: { financeiro: +3, clientes: +1, processos: +2 }, avaliacao: "boa", ensinamento: "Precificação por demanda em pico é prática normal em logística de e-commerce. O marketplace sabe que o custo operacional de Black Friday é diferente — a maioria aceita precificação diferenciada para volume acima da capacidade contratada." },
      { text: "Terceirizar o excesso de volume acima de 25k pedidos/dia para outro operador de fulfillment parceiro", risco: "medio", effects: { sla: +2, financeiro: -2, clientes: +1, processos: -1 }, avaliacao: "media", ensinamento: "Overflow para parceiro de fulfillment é solução que os maiores players usam no pico. O risco é a inconsistência de padrão entre operadores — e o cliente final não vê a diferença entre o seu serviço e o do parceiro." }
    ]
  },
  {
    title: "A Automação que Transforma o CD",
    description: "Uma empresa de automação propõe instalar esteiras automatizadas e sorters no CD principal: capacidade sobe de 12k para 28k pedidos/dia, taxa de erro cai de 4,7% para 0,8%, e o custo por pedido cai 38%. Investimento: R$3,2M. Prazo de implantação: 4 meses. Durante os 4 meses, a operação convive com obras e pode cair para 9k pedidos/dia.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar a automação e negociar com o marketplace uma redução temporária de volume pelos 4 meses de obras", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { tecnologia: +6, processos: +5, financeiro: -4, sla: -2, clientes: -1 }, avaliacao: "boa", ensinamento: "Automação com negociação proativa de impacto temporário é a decisão estrategicamente correta. A degradação de 4 meses é real — mas a plataforma automatizada entrega vantagem competitiva permanente." },
      { text: "Automatizar primeiro o CD secundário como piloto antes de comprometer o CD principal", risco: "baixo", effects: { tecnologia: +3, processos: +3, financeiro: -2, sla: +1 }, avaliacao: "boa", ensinamento: "Pilotar no CD menor protege a operação principal durante a validação. Se a automação funcionar como prometido, o argumento para automatizar o CD principal é muito mais forte — com dados reais." },
      { text: "Negociar com a empresa de automação uma implantação faseada por área do CD para manter a operação", risco: "medio", effects: { tecnologia: +4, processos: +4, financeiro: -3, rh: -1, sla: 0 }, avaliacao: "boa", ensinamento: "Implantação faseada por área é padrão em automação de CD em operação. Área por área, você mantém o volume total enquanto parte do CD vai para automação — sem o risco de queda para 9k pedidos." },
      { text: "Adiar a automação para depois que a operação estiver estabilizada", risco: "alto", effects: { tecnologia: -1, processos: -1, sla: -1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Adiar automação que resolve o problema estrutural de capacidade e erro é postergar a solução definitiva. Com 4,7% de erro e SLA em risco, a operação não vai 'estabilizar' com o modelo manual atual." }
    ]
  },
  {
    title: "O Contrato do Marketplace em Renegociação",
    description: "Após 6 meses difíceis, o marketplace quer renegociar o contrato. Eles pedem: redução de 15% no preço, SLA de 2h para despacho (hoje é 4h), e expansão para mais 3 estados. Em troca, garantem volume mínimo de R$18M/ano por 2 anos. O CFO calcula: a redução de 15% no preço com o volume garantido resulta em receita líquida 8% maior do que o contrato atual.",
    tags: ["logistica"],
    choices: [
      { text: "Aceitar com condicionante: o SLA de 2h entra em vigor em 6 meses após a automação do CD", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +3, financeiro: +4, sla: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Aceitar com prazo condicionado à automação é o equilíbrio correto. Você garante o volume e a receita sem comprometer um SLA que ainda não tem infraestrutura para suportar." },
      { text: "Aceitar integralmente — volume mínimo garantido de R$18M é o que a empresa precisa para crescer", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { financeiro: +5, sla: -3, processos: -2, rh: -2, clientes: -1 }, avaliacao: "ruim", ensinamento: "Aceitar SLA de 2h sem ter a infraestrutura para cumprir é criar um novo ciclo de crise. O volume garantido não compensa a multa contratual de descumprimento de SLA — que agora você aceita sendo 2h." },
      { text: "Recusar a expansão para 3 estados e aceitar o restante — crescimento que não temos capacidade de suportar", risco: "medio", effects: { financeiro: +3, processos: +1, sla: +1, clientes: +2 }, avaliacao: "boa", ensinamento: "Disciplina de não crescer além da capacidade real é a lição mais importante da crise que você acabou de passar. O marketplace vai respeitar um operador que conhece seus limites — especialmente depois de terem operado juntos sob pressão." },
      { text: "Usar a proposta como alavanca para renegociar com os clientes originais — mostrar que tem opções", risco: "baixo", effects: { clientes: +2, financeiro: +2, processos: +1 }, avaliacao: "media", ensinamento: "Ter alternativas de receita melhora sua posição em todas as negociações simultâneas. Clientes originais que veem que você tem demanda suficiente para escolher têm incentivo de renovar em condições melhores." }
    ]
  },
  {
    title: "O Problema das Devoluções",
    description: "Em e-commerce, devoluções são parte da operação. Mas a taxa de devolução do marketplace chegou a 12,3% — a média do setor é 8%. O custo de processamento de cada devolução é de R$18. Com 18k pedidos/dia, isso representa R$398k/mês em custo de devolução. O marketplace tem uma política de devolução sem custo para o comprador — você absorve tudo.",
    tags: ["logistica"],
    choices: [
      { text: "Criar área dedicada de reverse logistics com processo automatizado para reduzir o custo por devolução", risco: "medio", effects: { processos: +4, financeiro: +3, tecnologia: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Reverse logistics eficiente transforma custo em processo. Área dedicada com fluxo automatizado reduz o custo por devolução de R$18 para R$9-11 e o tempo de reprocessamento de dias para horas." },
      { text: "Negociar com o marketplace compartilhamento do custo de devolução acima de 9% de taxa", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +4, clientes: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Custo de devolução acima da média do setor é um argumento legítimo de renegociação. O marketplace tem interesse em reduzir a taxa de devolução — compartilhar o custo cria incentivo mútuo." },
      { text: "Analisar as causas das devoluções e apresentar ao marketplace relatório de produto com maior incidência", risco: "baixo", effects: { processos: +3, clientes: +2, tecnologia: +1 }, avaliacao: "boa", ensinamento: "Dados de devolução por produto são valiosos para o marketplace — eles revelam problemas na descrição, no packaging ou na qualidade do produto do vendedor. Você se posiciona como parceiro estratégico, não apenas operador." },
      { text: "Absorver o custo e focar em outros problemas mais urgentes", risco: "medio", effects: { financeiro: -2, processos: -1 }, avaliacao: "ruim", ensinamento: "R$398k/mês de custo de devolução não é um problema que se pode ignorar com outros pendentes. Em margem de fulfillment, esse custo pode ser a diferença entre a operação lucrativa e deficitária." }
    ]
  },
  {
    title: "A Expansão para São Paulo Capital",
    description: "Um grande varejista de moda quer que você opere o fulfillment das lojas físicas deles em São Paulo — ship-from-store. O modelo é diferente do fulfillment de CD: você opera dentro das 12 lojas deles, separando pedidos online diretamente do estoque de loja. Volume: 4.200 pedidos/dia adicionais. Receita: R$8,4M/ano. Requer contratar 48 operadores e abrir uma célula de gestão dedicada.",
    tags: ["logistica"],
    choices: [
      { text: "Aceitar com início em 3 meses — tempo para contratar e treinar antes de iniciar a operação", risco: "medio", effects: { clientes: +3, financeiro: +4, rh: -2, processos: +2, sla: +1 }, avaliacao: "boa", ensinamento: "Aceitar com prazo adequado de implementação é a diferença entre o crescimento sustentável e o que gerou a crise atual. 3 meses para contratar 48 pessoas e desenvolver o processo de ship-from-store é um prazo honesto." },
      { text: "Recusar — ship-from-store é um modelo operacional diferente do fulfillment de CD que você domina", risco: "baixo", effects: { financeiro: -1, processos: +1 }, avaliacao: "media", ensinamento: "Recusar modelo novo quando você ainda está consolidando o atual é uma decisão conservadora mas defensável. Ship-from-store exige gestão de microestoque em 12 pontos diferentes — uma complexidade nova." },
      { text: "Aceitar e adaptar o processo de CD para o ship-from-store com a equipe atual", risco: "alto", gestorEffects: { esgotamento: +2 }, effects: { financeiro: +3, rh: -4, processos: -3, sla: -2, clientes: -1 }, avaliacao: "ruim", ensinamento: "Adaptar equipe atual sobrecarregada para um modelo operacional diferente é a mesma decisão que criou a crise do marketplace. Crescimento sem capacidade adequada cria o próximo ciclo de problema." },
      { text: "Aceitar como piloto em 3 lojas por 60 dias antes de comprometer as 12 lojas inteiras", risco: "baixo", effects: { financeiro: +2, processos: +3, clientes: +2, rh: -1 }, avaliacao: "boa", ensinamento: "Piloto em escala menor valida o modelo operacional antes de comprometer toda a capacidade. Se as 3 lojas funcionarem, você aceita as outras 9 com dados reais de custo e processo." }
    ]
  },
  {
    title: "A Liderança que Pediu Demissão",
    description: "Bruno, seu gerente de operações — que coordenou a crise dos últimos meses com dedicação total — pediu demissão. 'Trabalhei 14 horas por dia por 6 meses. Preciso de um trabalho que me dê vida fora do trabalho.' Ele tem todo o conhecimento operacional do crescimento recente. Dois coordenadores de turno demonstraram interesse no cargo.",
    tags: ["logistica"],
    choices: [
      { text: "Tentar reter o Bruno com equilíbrio de vida melhor: redução de jornada, home office nas tarefas estratégicas e bônus", risco: "medio", gestorEffects: { reputacaoInterna: +2 }, effects: { rh: +3, processos: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Reter talento que identificou o problema correto (desequilíbrio de vida) com a solução correspondente demonstra que a empresa aprendeu. Um gestor de operações que pediu demissão por sobrecarga precisa de menos carga, não apenas de mais dinheiro." },
      { text: "Aceitar a demissão e promover o coordenador mais experiente com programa de mentoria acelerado", risco: "medio", effects: { rh: +2, processos: -1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Sucessão interna preserva parte do conhecimento e envia mensagem de que há crescimento de carreira. O gap de experiência do coordenador é real mas recuperável com mentoria estruturada." },
      { text: "Contratar um novo gerente de operações sênior no mercado — aproveitar a oportunidade de upgrading", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { rh: -2, processos: -2, financeiro: -3 }, avaliacao: "media", ensinamento: "Contratação externa em posição crítica de operação tem custo de adaptação alto. Um novo gerente leva 3-6 meses para dominar a operação — tempo em que você está vulnerável." },
      { text: "Criar uma estrutura de gestão compartilhada com os dois coordenadores em vez de um único gerente", risco: "baixo", effects: { rh: +2, processos: +1, financeiro: 0 }, avaliacao: "media", ensinamento: "Co-gestão distribui a carga que quebrou o Bruno — mas pode criar conflito de decisão em operação que precisa de comando único nos momentos de crise." }
    ]
  },
  {
    title: "A Concorrência do Fulfillment dos Marketplaces",
    description: "Dois grandes marketplaces anunciaram que vão oferecer fulfillment próprio para todos os vendedores da plataforma deles — concorrendo diretamente com operadores independentes como você. Eles têm CDs próprios em 12 estados e capacidade ilimitada de escala. O mercado pergunta: qual é o futuro dos fulfillments independentes?",
    tags: ["logistica"],
    choices: [
      { text: "Especializar em clientes fora dos grandes marketplaces — varejistas próprios e D2C que não querem depender de marketplace", risco: "medio", effects: { clientes: +3, processos: +3, sla: +2, financeiro: +2 }, avaliacao: "boa", ensinamento: "O cliente D2C que não quer depender de marketplace é exatamente aquele que precisa de um operador de fulfillment independente de confiança. Esse segmento cresce à medida que os marketplaces avançam." },
      { text: "Criar oferta de valor superior: personalização, relatórios avançados e integração com múltiplos canais que os marketplaces não oferecem", risco: "medio", effects: { tecnologia: +4, clientes: +3, processos: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Fulfillment como plataforma de dados e personalização compete em dimensão diferente do fulfillment de commodity dos grandes marketplaces. Clientes que precisam de visibilidade e flexibilidade pagam prêmio por isso." },
      { text: "Fazer parceria com os marketplaces — ser o operador regional de fulfillment para eles nos mercados que eles não chegam", risco: "baixo", effects: { clientes: +2, financeiro: +3, sla: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Ser o fulfillment regional dos grandes marketplaces é uma estratégia de sobrevivência e crescimento. Você não compete com eles — você opera onde eles não querem construir CD próprio." },
      { text: "Vender a operação enquanto o negócio ainda tem valor — antes que os marketplaces destruam a margem do setor", risco: "alto", gestorEffects: { capitalPolitico: +2, esgotamento: +1 }, requisitos: { indicadorMinimo: { financeiro: 10, clientes: 10 } }, effects: { financeiro: +8, rh: -3, clientes: -2 }, avaliacao: "media", ensinamento: "A janela de venda de operações de fulfillment independente pode estar se fechando com a verticalização dos grandes marketplaces. Se o timing é favorável e o valuation é justo, a saída pode ser a decisão mais inteligente." }
    ]
  },
  {
    title: "A Inteligência Artificial na Operação",
    description: "O CTO apresenta um projeto de IA para otimização de rotas, previsão de volume e alocação de operadores: R$680k de investimento, 4 meses de implementação. Os resultados projetados: redução de 22% no custo por pedido, aumento de 15% na produtividade dos operadores e redução de 40% no tempo de resposta a picos de demanda.",
    tags: ["logistica"],
    choices: [
      { text: "Aprovar o projeto de IA como investimento estratégico para 2025 — a eficiência operacional é o próximo diferencial", risco: "medio", effects: { tecnologia: +5, processos: +4, financeiro: -3, sla: +3, rh: +1 }, avaliacao: "boa", ensinamento: "IA em operações de fulfillment já é realidade nos maiores players do setor. Previsão de volume e alocação dinâmica de operadores eliminam os dois maiores drivers de custo variável em e-commerce." },
      { text: "Testar IA primeiro apenas na otimização de rotas — o impacto mais mensurável e de menor risco", risco: "baixo", effects: { tecnologia: +3, processos: +2, financeiro: -1, sla: +2 }, avaliacao: "boa", ensinamento: "Começar pela aplicação de IA com ROI mais previsível e risco menor é a abordagem científica correta. Rotas otimizadas têm resultado medido em 30 dias — não em 4 meses de implementação completa." },
      { text: "Adiar para depois da automação do CD — não sobrecarregar o time com dois projetos tecnológicos simultâneos", risco: "baixo", effects: { tecnologia: -1, processos: +1, financeiro: +1 }, avaliacao: "media", ensinamento: "Sequenciar projetos tecnológicos grandes é razoável quando os dois projetos competem pela mesma equipe técnica e de operações. O risco é que o atraso na IA deixa espaço para concorrentes que já implementaram." },
      { text: "Usar solução de IA SaaS em vez do desenvolvimento próprio — implementação em 6 semanas com R$8k/mês", risco: "baixo", effects: { tecnologia: +4, processos: +3, financeiro: -1, sla: +2 }, avaliacao: "boa", ensinamento: "SaaS de IA logística existe no mercado a preços acessíveis — você não precisa construir o que já existe. Soluções como Intelipost, Beepe ou LogGI têm APIs de IA para roteirização e previsão de demanda." }
    ]
  },
  {
    title: "O Futuro do Fulfillment",
    description: "A operação foi estabilizada, os contratos estão renovados e o time está mais estruturado. O board quer a visão para os próximos 3 anos em um setor que está mudando rapidamente.",
    tags: ["logistica"],
    choices: [
      { text: "Tech-enabled fulfillment: ser o operador mais tecnológico do mercado mid-market com IA, rastreabilidade total e dashboard em tempo real", effects: { tecnologia: +6, processos: +5, clientes: +4, sla: +4, financeiro: +3, rh: +2 }, avaliacao: "boa", ensinamento: "Differenciação por tecnologia em fulfillment cria vantagem defensável. O operador que oferece visibilidade em tempo real, previsão de demanda e integração omnichannel retém clientes que querem crescer — não apenas um serviço de caixa." },
      { text: "Especialista em nicho premium: fashion, beleza e produtos delicados que exigem manuseio especializado e embalagem premium", effects: { clientes: +4, margem: +4, processos: +4, rh: +3, financeiro: +3 }, avaliacao: "boa", ensinamento: "Fulfillment especializado em nicho premium tem margem 30-50% superior ao fulfillment de commodity. Fashion e beleza têm embalagem, manuseio e devolução com especificidades que operadores generalistas não atendem bem." },
      { text: "Plataforma de fulfillment: abrir a infraestrutura para outros pequenos varejistas se beneficiarem da sua escala", effects: { tecnologia: +4, financeiro: +3, processos: +3, clientes: +3, rh: +1 }, avaliacao: "boa", ensinamento: "Modelo de plataforma multiplica a receita da infraestrutura já construída. Pequenos varejistas que precisam de fulfillment profissional mas não têm volume para negociar sozinhos pagam pelo acesso à sua escala." },
      { text: "Expansão geográfica: cobrir todos os estados com CDs próprios antes que os marketplaces fechem o mercado", requisitos: { indicadorMinimo: { financeiro: 11, processos: 9 } }, effects: { financeiro: +3, clientes: +4, sla: +2, rh: -2, processos: -2 }, avaliacao: "media", ensinamento: "Expansão geográfica com a operação estabilizada é muito diferente da expansão desordenada que criou a crise. Com modelo comprovado e processos documentados, a replicação tem chance real de sucesso." }
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

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [1] · Indústria de Embalagens · ESG Urgente
   Contexto: 430 funcionários, 2 plantas, R$94M receita.
   Clientes exigem 30% insumos reciclados até próximo ano.
   Conversão de linha: R$8-12M, 6-10 meses. Cliente âncora
   enviou carta formal com prazo.

   INDICADORES: financeiro:8, rh:6, clientes:7, processos:5,
                seguranca:4, manutencao:5, qualidade:7, conformidade:8

   ATENÇÃO: segurança (4) já está crítica. qualidade≤5 → conformidade-2.
   conformidade≤3 → clientes-2 e financeiro-1.
   manutencao≤4 → seguranca-2 automaticamente.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "A Carta Que Mudou Tudo",
    description: "A carta do cliente âncora — responsável por 31% da receita — chegou com prazo formal de 8 meses para apresentar cronograma de adequação ESG: 30% de insumos reciclados nas embalagens fornecidas. O diretor de operações apresenta o dilema: converter a linha A (maior volume, R$8M, 7 meses) ou a linha B (menor volume mas cliente âncora usa, R$5,5M, 5 meses). Caixa disponível: R$6M.",
    tags: ["industria"],
    choices: [
      { text: "Priorizar a linha B — menor custo, prazo menor e atende diretamente o cliente que enviou a carta", risco: "medio", effects: { clientes: +4, conformidade: +3, financeiro: -4, processos: +2 }, avaliacao: "boa", ensinamento: "Priorizar a conversão que atende o cliente mais urgente é a decisão estratégica correta. Proteger o contrato de 31% da receita vale o investimento focado — e R$5,5M cabe no caixa disponível." },
      { text: "Buscar financiamento para converter as duas linhas simultaneamente nos próximos 12 meses", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +1 }, effects: { clientes: +3, conformidade: +4, financeiro: -3, processos: -2 }, avaliacao: "media", ensinamento: "Converter as duas simultaneamente maximiza o impacto ESG — mas exige capital que a empresa não tem e gestão de projeto que dois projetos paralelos de R$13-20M raramente entregam no prazo." },
      { text: "Apresentar ao cliente âncora um cronograma em fases — 20% até 8 meses, 30% até 14 meses", risco: "medio", effects: { clientes: +2, conformidade: +2, financeiro: +1, processos: +1 }, avaliacao: "media", ensinamento: "Cronograma faseado transparente demonstra comprometimento sem overpromising. Clientes que exigem adequação ESG geralmente preferem um parceiro honesto sobre os prazos a um parceiro que promete o impossível." },
      { text: "Terceirizar a compra de insumos reciclados de outro fornecedor enquanto prepara a conversão própria", risco: "baixo", effects: { clientes: +3, conformidade: +3, financeiro: -2, qualidade: -1, processos: +1 }, avaliacao: "boa", ensinamento: "Terceirizar insumos reciclados para cumprir o prazo imediato enquanto converte a linha própria é uma estratégia de ponte válida. O custo do material terceirizado é maior — mas protege o contrato." }
    ]
  },
  {
    title: "O Fornecedor de Insumo Reciclado",
    description: "A busca por fornecedores de resina reciclada pós-consumo revelou um problema: no Brasil, há apenas 3 fornecedores certificados com volume suficiente. O maior deles, a Recicla Sul, exige contrato de 36 meses com volume mínimo. O preço da resina reciclada é 28% maior que a virgem. Seus concorrentes já assinaram com o Recicla Sul — e o fornecedor pode aceitar apenas mais um cliente grande.",
    tags: ["industria"],
    choices: [
      { text: "Assinar com o Recicla Sul imediatamente para garantir o fornecimento antes dos concorrentes fecharem a capacidade", risco: "alto", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, clientes: +3, financeiro: -3, margem: -2, processos: +2 }, avaliacao: "boa", ensinamento: "Garantir fornecimento de insumo crítico antes que a capacidade do mercado seja totalmente tomada é decisão de supply chain estratégica. Em mercado emergente de reciclados, quem chega primeiro garante o acesso." },
      { text: "Negociar contrato de 18 meses em vez de 36 para reduzir o compromisso", risco: "medio", effects: { conformidade: +3, clientes: +2, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Contrato mais curto reduz o risco de prêmio de preço em mercado que tende a se equalizar com o aumento da oferta de reciclados. Se a resina reciclada cair de preço em 2 anos, você não está preso." },
      { text: "Buscar fornecedores internacionais de resina reciclada como alternativa ao Recicla Sul", risco: "medio", effects: { conformidade: +2, financeiro: -4, processos: -2, clientes: +1 }, avaliacao: "ruim", ensinamento: "Importação de resina reciclada tem custo de frete, câmbio e lead time que tornam a operação mais cara e mais frágil do que o fornecedor nacional. Além disso, certificação de origem reciclada internacional pode não ser aceita pelos clientes." },
      { text: "Desenvolver programa próprio de coleta de embalagens pós-consumo como fonte de insumo reciclado", risco: "alto", gestorEffects: { capitalPolitico: +1, esgotamento: +2 }, effects: { conformidade: +2, processos: -3, financeiro: -3, clientes: +2, inovacao: +3 }, avaliacao: "media", ensinamento: "Programa próprio de coleta é a solução mais sustentável de longo prazo — e cria um diferencial de storytelling ESG que nenhum concorrente que terceiriza tem. O prazo de 8 meses, porém, é incompatível com implantar um programa de logística reversa do zero." }
    ]
  },
  {
    title: "A Segurança que Cobra o Preço",
    description: "Com segurança já em nível crítico (4), o engenheiro de segurança alerta: a linha de produção que vai receber a resina reciclada tem equipamentos de mistura sem o guarda-corpo exigido pela NR-12. A adequação custa R$180k e leva 3 semanas. A conversão não pode começar com a não-conformidade ativa — o risco de acidente com novo insumo e linha não-certificada é inaceitável.",
    tags: ["industria"],
    choices: [
      { text: "Fazer a adequação de NR-12 antes de iniciar a conversão — segurança não é negociável", risco: "baixo", gestorEffects: { reputacaoInterna: +2 }, effects: { seguranca: +4, processos: +2, manutencao: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Iniciar processo de conversão de linha sem adequação de segurança é expor os trabalhadores a risco real. Além do aspecto humano, um acidente durante a conversão paralisa o processo e expõe a empresa a multa do MTE." },
      { text: "Realizar a adequação em paralelo com o início da conversão para ganhar tempo", risco: "alto", effects: { seguranca: +2, processos: -2, manutencao: +1, financeiro: -2, rh: -2 }, avaliacao: "ruim", ensinamento: "Adequação de segurança em paralelo com operação ativa em linha em conversão é o cenário de maior risco de acidente. O ganho de 3 semanas não justifica o risco de um acidente que pode paralisar a operação por meses." },
      { text: "Contratar empresa especializada em NR-12 para fazer a adequação em 10 dias com equipe dedicada", risco: "medio", effects: { seguranca: +4, processos: +3, manutencao: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "Especialista em NR-12 com equipe dedicada comprime o prazo de 3 semanas para 10 dias. O custo adicional da equipe especializada é marginal frente ao tempo ganho no cronograma de conversão." },
      { text: "Mapear todos os demais equipamentos da fábrica com não-conformidades de NR-12 enquanto faz a adequação desta linha", risco: "baixo", effects: { seguranca: +5, processos: +3, manutencao: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "Aproveitar a mobilização de segurança para mapear toda a fábrica é o uso mais inteligente do momento. Um diagnóstico completo de NR-12 previne autuações futuras e demonstra comprometimento genuíno com segurança." }
    ]
  },
  {
    title: "O Cliente Secundário Pergunta Sobre ESG",
    description: "Dois dos seus 5 maiores clientes — que juntos representam 24% da receita — enviaram questionário ESG seguindo o padrão GRI: pegada de carbono, índice de acidentes, percentual de insumo reciclado e política de diversidade. O prazo de resposta é 30 dias. A empresa nunca mediu nenhum desses indicadores formalmente. Não responder pode resultar em desclassificação como fornecedor.",
    tags: ["industria"],
    choices: [
      { text: "Contratar consultoria de ESG para medir e documentar os indicadores existentes e responder com dados reais", risco: "medio", effects: { conformidade: +4, clientes: +3, financeiro: -3, processos: +2 }, avaliacao: "boa", ensinamento: "Responder com dados reais, mesmo que os números não sejam ótimos, é sempre melhor do que não responder. Clientes que pedem questionário ESG sabem que fornecedores estão em processo — eles querem comprometimento, não perfeição." },
      { text: "Responder o questionário com estimativas e dados parciais em vez de não responder", risco: "alto", gestorEffects: { capitalPolitico: -1 }, effects: { conformidade: +1, clientes: +1 }, avaliacao: "ruim", ensinamento: "Estimativas em questionário GRI que depois são auditadas criam risco de greenwashing. Se os dados forem contestados, a perda de credibilidade é muito maior do que não ter respondido." },
      { text: "Implementar um sistema básico de coleta de indicadores ESG para responder com dados reais mesmo que parciais", risco: "baixo", effects: { conformidade: +3, processos: +3, financeiro: -2, clientes: +2 }, avaliacao: "boa", ensinamento: "Criar a capacidade de medição interna é investimento necessário. Empresas que implementam um sistema básico de coleta de ESG respondem ao questionário atual e a todos os próximos — que virão com certeza." },
      { text: "Contatar os clientes e explicar que estão em processo de implementação ESG — pedir 90 dias adicionais", risco: "medio", effects: { clientes: +2, conformidade: +1, processos: +1 }, avaliacao: "media", ensinamento: "Transparência sobre o estágio de implementação é mais honesta do que inventar dados. O risco é que alguns clientes com política rígida de fornecedores não aceitam prazo — mas a maioria respeita honestidade." }
    ]
  },
  {
    title: "A Conversão em Andamento",
    description: "A conversão da linha B está na semana 3 de 5 meses planejados. O engenheiro de processo revela um problema: a resina reciclada tem 12% mais umidade do que a virgem — o que aumenta o tempo de ciclo de moldagem em 18% e reduz a produtividade da linha em 1.100 peças/turno. O cliente âncora já perguntou sobre o cronograma de entrega do primeiro lote certificado.",
    tags: ["industria"],
    choices: [
      { text: "Instalar secadores de resina adicionais para compensar a umidade antes da moldagem", risco: "medio", effects: { qualidade: +3, processos: +2, financeiro: -2, manutencao: +1 }, avaliacao: "boa", ensinamento: "Secagem adicional de resina reciclada é uma adaptação técnica padrão. O custo do equipamento é amortizado pelo volume de produção e pela manutenção do cronograma prometido ao cliente." },
      { text: "Renegociar o prazo com o cliente âncora — apresentar o problema técnico com transparência", risco: "baixo", effects: { clientes: +2, processos: +1, conformidade: +1 }, avaliacao: "boa", ensinamento: "Transparência técnica com o cliente sobre um problema genuíno de processo é sempre preferível ao cumprimento de prazo com qualidade comprometida. Clientes que pedem ESG entendem que a transição tem curva de aprendizado." },
      { text: "Aumentar o turno de trabalho para compensar a queda de produtividade e manter o cronograma", risco: "alto", gestorEffects: { reputacaoInterna: -1 }, effects: { processos: +1, rh: -4, seguranca: -2, financeiro: -2 }, avaliacao: "ruim", ensinamento: "Aumentar turno para compensar problema técnico com insumo novo é a solução mais arriscada. Operadores sobrecarregados com um processo novo que ainda está sendo calibrado têm índice de erro e acidente elevado." },
      { text: "Ajustar o parâmetro de temperatura do molde para compensar a umidade da resina reciclada", risco: "baixo", effects: { qualidade: +2, processos: +3, financeiro: 0 }, avaliacao: "boa", ensinamento: "Ajuste de parâmetro de processo é a solução de menor custo e maior velocidade. A equipe técnica que domina o processo de moldagem geralmente consegue compensar as características do novo insumo com calibração adequada." }
    ]
  },
  {
    title: "O Auditor de Carbono",
    description: "O maior cliente varejista do portfólio — 18% da receita — informou que a partir do próximo ano vai exigir LCA (Life Cycle Assessment) completa das embalagens. O custo de uma LCA certificada é R$85k. Se aprovada, sua embalagem reciclada pode ganhar um selo verde que o varejista usa para marketing. Se reprovada ou não apresentada, você perde acesso ao edital de fornecimento.",
    tags: ["industria"],
    choices: [
      { text: "Contratar a LCA imediatamente — é investimento de R$85k para proteger um contrato de R$17M", risco: "baixo", effects: { conformidade: +4, clientes: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "ROI de R$85k para proteger R$17M de contrato é trivialmente positivo. A LCA além de proteger o contrato abre portas para outros clientes que exigem rastreabilidade de ciclo de vida." },
      { text: "Negociar com o varejista aceitar uma declaração ambiental intermediária enquanto a LCA completa é preparada", risco: "medio", effects: { clientes: +2, conformidade: +2, financeiro: 0 }, avaliacao: "media", ensinamento: "Declaração ambiental intermediária (como EPD simplificado) pode ser aceita por varejistas com política ESG em desenvolvimento. O risco é que o edital já tenha critérios específicos que a declaração intermediária não atende." },
      { text: "Formar consórcio com outros fornecedores para dividir o custo da LCA por categoria de embalagem", risco: "baixo", effects: { clientes: +2, conformidade: +3, financeiro: -1, processos: +1 }, avaliacao: "boa", ensinamento: "LCA compartilhada por categoria de produto é uma prática emergente que distribui o custo sem perder a validade certificada. Fornecedores que colaboram para atender exigência ESG de cliente comum criam uma rede de conformidade." },
      { text: "Incluir a LCA no orçamento do próximo ano e comunicar ao varejista que estará pronta em 14 meses", risco: "alto", effects: { clientes: -3, conformidade: -1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Comunicar 14 meses de prazo para exigência do próximo edital é arriscar perder o contrato por falta de conformidade. O edital provavelmente vai ter prazo mais curto — e concorrentes que já têm a LCA vão ganhar o espaço." }
    ]
  },
  {
    title: "O Processo que Gera Resíduo",
    description: "O diagnóstico ambiental revelou: as duas plantas geram 380 toneladas de resíduo plástico por mês — aparas e rejeitos de processo. Hoje, 60% vai para aterro (custo de R$45/ton), 30% é vendido como sucata de baixo valor, e 10% é reprocessado internamente. Uma empresa de reciclagem propõe comprar todo o resíduo por R$28/ton — mas exige exclusividade.",
    tags: ["industria"],
    choices: [
      { text: "Aceitar a proposta sem exclusividade — vender apenas o resíduo que hoje vai para aterro", risco: "baixo", effects: { conformidade: +3, financeiro: +2, processos: +2 }, avaliacao: "boa", ensinamento: "Transformar custo de aterro em receita de venda de resíduo é uma melhoria imediata de margem e de credencial ESG. A exclusividade pode ser negociada — você não precisa dar o que não pediu." },
      { text: "Aceitar com exclusividade — R$28/ton em todo o volume é melhor do que o modelo atual fragmentado", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +3, financeiro: +3, processos: +3 }, avaliacao: "boa", ensinamento: "Exclusividade em troca de preço garantido é um trade-off razoável. O comprador de resíduo com exclusividade tem incentivo de desenvolver processo para resíduos mais complexos que hoje vão para aterro." },
      { text: "Investir para aumentar o reprocessamento interno de 10% para 40% — usar o próprio resíduo como insumo reciclado", risco: "medio", effects: { conformidade: +4, qualidade: +2, financeiro: -3, processos: +3, manutencao: +1 }, avaliacao: "boa", ensinamento: "Fechar o loop de resíduo internamente é a estratégia de maior valor ESG e de maior independência de fornecedor externo. Resíduo interno reprocessado tem custo de logística zero e rastreabilidade total de origem." },
      { text: "Manter o modelo atual — não assinar exclusividade com nenhum comprador", risco: "baixo", effects: { conformidade: -1, financeiro: -1, processos: 0 }, avaliacao: "ruim", ensinamento: "Manter 60% do resíduo em aterro enquanto há demanda de compra é uma decisão que deteriora a credencial ESG sem benefício. O custo de aterro é real — e cada tonelada em aterro é uma tonelada no relatório de impacto ambiental." }
    ]
  },
  {
    title: "O Segundo Cliente Que Exige ESG",
    description: "Uma multinacional de higiene pessoal — potencial cliente novo com R$8M/ano de volume — colocou a empresa no processo seletivo de fornecedores. A condição: aprovação na auditoria ESG deles em 60 dias. Os critérios: zero acidentes nos últimos 12 meses, 25% de insumo reciclado e política de diversidade de gênero documentada. Você tem 1 acidente nos últimos 12 meses e 15% de insumo reciclado até agora.",
    tags: ["industria"],
    choices: [
      { text: "Ser transparente com a multinacional sobre os critérios que ainda não atende e apresentar o cronograma de adequação", risco: "baixo", effects: { clientes: +2, conformidade: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Transparência no processo seletivo de ESG é a postura que multinacionais com departamento de sustainability valorizam. Quem mente nos critérios para ganhar o contrato enfrenta auditoria periódica que vai encontrar a realidade." },
      { text: "Participar da auditoria com os dados atuais — 15% de reciclado e 1 acidente podem ser aceitos com plano", risco: "medio", effects: { clientes: +3, conformidade: +2, processos: +1, seguranca: +1 }, avaliacao: "boa", ensinamento: "Multinacionais experientes em ESG de fornecedores sabem que poucos fornecedores atendem 100% dos critérios. A auditoria avalia a trajetória — não apenas o snapshot atual." },
      { text: "Recusar o processo seletivo por ora e candidatar-se quando atender todos os critérios", risco: "baixo", effects: { clientes: -1, conformidade: +1, processos: +2 }, avaliacao: "media", ensinamento: "Recusar para candidatar depois é uma opção conservadora — mas processos seletivos de fornecedores não ficam abertos indefinidamente. A multinacional pode fechar a seleção antes de você estar pronto." },
      { text: "Contratar 30% do time operacional com diversidade de gênero rapidamente para atender o critério de política de diversidade", risco: "alto", gestorEffects: { reputacaoInterna: -2 }, effects: { rh: -2, conformidade: +1, clientes: +1 }, avaliacao: "ruim", ensinamento: "Contratar por cota para passar em auditoria ESG é a forma mais eficiente de criar uma política de diversidade inautêntica. Auditores de ESG verificam rotatividade e plano de desenvolvimento — não apenas o headcount." }
    ]
  },
  {
    title: "A Conversão da Segunda Linha",
    description: "A linha B está convertida e funcionando com 28% de insumo reciclado — abaixo da meta de 30%, mas suficiente para satisfazer o cliente âncora que aceitou o cronograma. A diretoria discute agora a conversão da linha A (maior volume, R$8M de investimento): ela representa 60% da produção, mas os clientes dessa linha ainda não exigiram ESG formalmente.",
    tags: ["industria"],
    choices: [
      { text: "Converter a linha A antecipadamente — posicionar-se como liderança ESG antes de ser exigido pelos clientes", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, clientes: +3, financeiro: -5, processos: +2, qualidade: +1 }, avaliacao: "boa", ensinamento: "Converter antes da exigência transforma o ESG de custo reativo em diferencial proativo. Clientes que ainda não exigiram formalmente estão recebendo pressão internamente — quem chega com a solução pronta ganha o contrato seguinte." },
      { text: "Aguardar exigência formal dos clientes da linha A antes de investir — R$8M é capital escasso", risco: "medio", effects: { financeiro: +2, conformidade: -1, clientes: -1, processos: +1 }, avaliacao: "media", ensinamento: "Aguardar a exigência formal é conservador — mas o lead time de conversão é de 6-10 meses. Quando o cliente exigir, você vai estar 6 meses atrás do prazo. A decisão hoje determina se você entrega no prazo amanhã." },
      { text: "Buscar financiamento verde (BNDES Mais Inovação ou banco de desenvolvimento) para conversão da linha A", risco: "baixo", effects: { financeiro: +1, conformidade: +3, processos: +2, clientes: +1 }, avaliacao: "boa", ensinamento: "Linhas de crédito para ESG têm custo 2-4% menor do que crédito convencional. BNDES tem programas específicos para modernização industrial com componente ambiental — e a conversão para insumo reciclado se enquadra." },
      { text: "Converter gradualmente a linha A: 15% de reciclado primeiro, subindo 5% por trimestre para gerenciar o capex", risco: "baixo", effects: { conformidade: +2, financeiro: -3, processos: +2, qualidade: +1 }, avaliacao: "boa", ensinamento: "Conversão gradual distribui o investimento ao longo do tempo e permite calibrar o processo por etapas. Para linha de maior volume, a abordagem gradual reduz o risco de parada de produção por problema técnico em escala." }
    ]
  },
  {
    title: "O Prêmio ESG do Setor",
    description: "A ABIPLAST (associação da indústria de plástico) lançou o Prêmio ESG Embalagem Sustentável. Candidatar-se exige documentação completa, auditoria externa e apresentação de case. O custo de participação é R$45k. O benefício: caso vença, o logotipo é usado pelo maior varejista do Brasil como endosso de fornecedor sustentável — acesso a uma audiência de 200 fornecedores potenciais.",
    tags: ["industria"],
    choices: [
      { text: "Candidatar-se — o investimento de R$45k tem potencial de geração de leads de R$8M em novos contratos", risco: "baixo", effects: { clientes: +3, conformidade: +2, processos: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Prêmio ESG setorial é uma das formas mais eficientes de marketing B2B para indústria. A credibilidade de um prêmio externo independente vale mais do que qualquer materiel de marketing próprio." },
      { text: "Participar apenas da etapa documental para benchmark interno — sem a auditoria cara", risco: "baixo", effects: { processos: +2, conformidade: +1, financeiro: 0 }, avaliacao: "media", ensinamento: "Benchmark interno com os critérios do prêmio tem valor de diagnóstico — mas não gera a visibilidade que a candidatura completa oferece. É usar metade do potencial do investimento." },
      { text: "Preparar a candidatura para o próximo ciclo — usar este ciclo para documentar melhor o case", risco: "baixo", effects: { processos: +2, conformidade: +1 }, avaliacao: "media", ensinamento: "Preparação cuidadosa para o próximo ciclo pode resultar em candidatura mais forte — mas perde a janela atual onde você tem o case fresco da conversão. Juízes de prêmios avaliam trajetória recente." },
      { text: "Candidatar-se e convidar os principais clientes para participarem como referência na documentação do case", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +4, conformidade: +3, processos: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Incluir clientes no case do prêmio transforma a candidatura em uma parceria de visibilidade. O cliente âncora que forçou a adequação ESG agora é co-autor do sucesso — e isso fortalece o relacionamento." }
    ]
  },
  {
    title: "A Decisão de Pricing Verde",
    description: "Com a conversão concluída e os custos de resina reciclada 28% mais caros, a embalagem sustentável custa R$0,08/unidade a mais para produzir. O mercado pergunta: repassar aos clientes, absorver na margem ou criar um diferencial de preço premium? Seus clientes mais exigentes (que forçaram a mudança) esperam absorção. Os demais clientes não sabem a diferença.",
    tags: ["industria"],
    choices: [
      { text: "Criar duas linhas de preço: embalagem certificada com 5% de prêmio e embalagem padrão pelo preço atual", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { financeiro: +3, clientes: +2, conformidade: +2, margem: +2 }, avaliacao: "boa", ensinamento: "Segmentação por produto (certificado vs padrão) captura o prêmio de quem valoriza e não afasta quem ainda não exige. É a estratégia de precificação mais inteligente para mercados em transição ESG." },
      { text: "Absorver o custo na margem — o ESG é o novo custo de fazer negócio neste mercado", risco: "medio", effects: { margem: -3, clientes: +3, conformidade: +2, financeiro: -2 }, avaliacao: "ruim", ensinamento: "Absorver indefinidamente 28% de custo adicional de insumo na margem não é sustentável. O ESG precisa ter valor percebido e preço correspondente — a indústria que subsidia a transição verde dos clientes eventualmente quebra." },
      { text: "Repassar o custo integralmente a todos os clientes com documentação transparente da origem do aumento", risco: "alto", effects: { financeiro: +3, clientes: -3, conformidade: +1, margem: +1 }, avaliacao: "media", ensinamento: "Repasse transparente com documentação é mais honesto do que absorção — mas pode afastar clientes que ainda não veem valor no ESG. A comunicação precisa ser cuidadosa para não parecer punição." },
      { text: "Negociar compartilhamento do custo: 50% absorvido pela empresa, 50% repassado aos clientes que exigiram", risco: "baixo", effects: { financeiro: +1, clientes: +2, conformidade: +2, margem: 0 }, avaliacao: "boa", ensinamento: "Divisão de custo com os clientes que exigiram a mudança é a postura mais justa e mais sustentável. Clientes que forçaram a adequação ESG geralmente aceitam dividir o custo quando apresentado com transparência." }
    ]
  },
  {
    title: "A Expansão da Linha de Embalagens Biodegradáveis",
    description: "Uma empresa de cosméticos naturais quer comprar 2M de unidades/ano de embalagens biodegradáveis — mercado que você não atende hoje. O investimento para criar essa linha seria R$4,2M. O segmento cresce 34% ao ano e o ticket médio é 60% superior ao das embalagens convencionais. Seu atual banco de desenvolvimento sinalizou interesse em financiar até 70% com linha verde.",
    tags: ["industria"],
    choices: [
      { text: "Desenvolver a linha biodegradável com financiamento verde — é a próxima fronteira do mercado ESG de embalagens", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, conformidade: +4, financeiro: -2, inovacao: +4, qualidade: +2 }, avaliacao: "boa", ensinamento: "Biodegradável é onde o mercado de embalagens sustentáveis vai em 5 anos. Entrar agora com cliente âncora e financiamento favorável é o timing ideal — você lidera a transição em vez de segui-la." },
      { text: "Fazer parceria com empresa especializada em materiais biodegradáveis em vez de desenvolver internamente", risco: "baixo", effects: { clientes: +3, conformidade: +3, financeiro: -1, inovacao: +2 }, avaliacao: "boa", ensinamento: "Parceria com especialista em materiais reduz o risco técnico e o tempo de desenvolvimento. Você traz o processo de fabricação e a capacidade produtiva — o parceiro traz o know-how de material." },
      { text: "Recusar — consolidar a linha de reciclados antes de entrar num segundo mercado novo", risco: "baixo", effects: { conformidade: +1, financeiro: +1, processos: +2 }, avaliacao: "media", ensinamento: "Consolidação antes de expansão é prudente — mas rejeitar um cliente âncora e financiamento favorable para uma categoria de crescimento de 34% é difícil de justificar. A janela não fica aberta indefinidamente." },
      { text: "Aceitar o pedido e terceirizar a produção de biodegradáveis com um fornecedor enquanto avalia o investimento", risco: "medio", effects: { clientes: +3, conformidade: +2, financeiro: -1, qualidade: -1 }, avaliacao: "media", ensinamento: "Terceirizar para não perder o cliente âncora é uma estratégia de bridge válida. O risco é a dependência de qualidade e prazo de um terceiro em um produto novo que ainda não foi validado com o cliente final." }
    ]
  },
  {
    title: "O Relatório ESG Anual",
    description: "O CFO apresenta o primeiro relatório ESG da empresa. Os resultados são mistos: insumo reciclado chegou a 23% (meta: 30%), acidentes caíram 40% (mas ainda há 2 no ano), e o resíduo para aterro caiu de 60% para 38%. O cliente âncora quer o relatório publicado no site deles como prova de comprometimento. O time de comunicação alerta: publicar com metas não atingidas pode gerar crítica.",
    tags: ["industria"],
    choices: [
      { text: "Publicar o relatório com os dados reais, incluindo as metas não atingidas e o cronograma revisado", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, clientes: +3, processos: +2 }, avaliacao: "boa", ensinamento: "Transparência ESG com metas não atingidas é mais valorizada do que silêncio ou relatório editado. O GRI e a ISO 14001 exigem divulgação completa — empresas que relatam honestamente constroem reputação de sustentabilidade genuína." },
      { text: "Aguardar mais 6 meses para publicar quando os indicadores estiverem mais próximos das metas", risco: "medio", effects: { conformidade: -1, clientes: -1 }, avaliacao: "ruim", ensinamento: "Atrasar o relatório ESG para esperar melhores números é a definição de greenwashing por omissão. O cliente âncora que pediu o relatório vai perguntar por que está atrasado — e a resposta real vai ser pior do que os números." },
      { text: "Publicar o relatório com foco na trajetória de melhoria — os dados de 40% de redução de acidentes são impactantes", risco: "baixo", effects: { conformidade: +3, clientes: +3, processos: +2 }, avaliacao: "boa", ensinamento: "Enquadrar o relatório na trajetória de melhoria é comunicação legítima — desde que os dados absolutos também estejam presentes. Mostrar que você saiu de zero para 23% de reciclado em 18 meses é uma narrativa poderosa." },
      { text: "Publicar apenas os indicadores que atingiram a meta e omitir os que ficaram abaixo", risco: "alto", gestorEffects: { capitalPolitico: -3 }, effects: { conformidade: -4, clientes: -3 }, avaliacao: "ruim", ensinamento: "Relatório ESG seletivo é greenwashing documentado. Se o cliente âncora ou qualquer stakeholder descobrir a seleção, o dano à reputação é irreversível — e crescentemente há ferramenta de verificação cruzada de dados ESG." }
    ]
  },
  {
    title: "O Futuro da Embalagem Sustentável",
    description: "A empresa atravessou a maior transformação de sua história. O mercado reconhece o progresso. O board pede a visão para os próximos 3 anos.",
    tags: ["industria"],
    choices: [
      { text: "Líder ESG do setor: 100% insumo reciclado até 2027, zero resíduo para aterro e emissão net-zero na operação", effects: { conformidade: +5, clientes: +5, financeiro: +3, qualidade: +3, processos: +4, seguranca: +3 }, avaliacao: "boa", ensinamento: "Liderança ESG total é um posicionamento defensável e crescentemente lucrativo. Empresas com embalagem net-zero têm acesso a editais de multinacionais que competidores com pegada maior não conseguem participar." },
      { text: "Inovação em materiais: criar laboratório de P&D de embalagens biodegradáveis e compostáveis como próxima geração", effects: { inovacao: +5, clientes: +4, conformidade: +4, financeiro: -2, qualidade: +4 }, avaliacao: "boa", ensinamento: "P&D em materiais do futuro transforma uma empresa de manufatura em empresa de tecnologia de materiais. A propriedade intelectual de novos materiais de embalagem tem valor muito superior ao da capacidade produtiva." },
      { text: "Expansão em mercados internacionais: Europa exige ESG mais rigoroso e paga 40% mais por embalagem certificada", requisitos: { indicadorMinimo: { conformidade: 12, qualidade: 10 } }, effects: { financeiro: +5, clientes: +4, conformidade: +4, processos: +3, qualidade: +2 }, avaliacao: "boa", ensinamento: "Exportação para Europa com embalagem certificada ESG é um caminho de margem significativamente superior. O mercado europeu já tem as exigências que o Brasil vai ter em 3-5 anos — você estaria à frente da curva." },
      { text: "Plataforma circular: criar sistema de logística reversa próprio para coletar as embalagens pós-uso e reprocessar internamente", effects: { conformidade: +5, processos: +4, clientes: +3, financeiro: -3, inovacao: +3 }, avaliacao: "boa", ensinamento: "Economia circular completa — da resina reciclada à coleta pós-uso para reprocessar novamente — é o modelo de negócio mais defensável e mais alinhado com a regulação que vem. É o futuro da indústria de embalagens." }
    ]
  }
],

/* ══════════════════════════════════════════════════════════════════
   HISTÓRIA [2] · Indústria Química · Crise Ambiental
   Contexto: 280 funcionários, R$71M receita, ABC paulista.
   IBAMA autuou: R$4,1M de multa, planta em regime parcial,
   responsável técnico ambiental demitiu, imprensa noticiou,
   2 clientes sinalizaram revisão de contrato.

   INDICADORES: financeiro:8, rh:6, clientes:7, processos:5,
                seguranca:4, manutencao:5, qualidade:7, conformidade:8

   ATENÇÃO: segurança (4) e conformidade (8) são os indicadores
   centrais desta história. conformidade≤3 → clientes-2 e financeiro-1.
   A crise requer reconstrução de conformidade que demanda processos.
══════════════════════════════════════════════════════════════════ */
,
[
  {
    title: "A Crise no Dia Seguinte",
    description: "Você assume a gestão 48 horas após a autuação. O IBAMA está monitorando. A planta opera em 60% da capacidade. O responsável técnico ambiental que pediu demissão levou consigo a documentação dos processos de descarte. A imprensa regional publicou o caso. Dois clientes ligaram. Você tem 72 horas para apresentar ao IBAMA o Termo de Ajustamento de Conduta inicial. Por onde começa?",
    tags: ["industria"],
    choices: [
      { text: "Contratar advogado ambiental especializado para liderar o TAC com o IBAMA — urgência máxima", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +4, processos: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "O TAC é um instrumento técnico-jurídico que define os compromissos da empresa com o órgão ambiental. Advogado especializado em direito ambiental é indispensável para negociar prazos e obrigações que a empresa consegue cumprir." },
      { text: "Ligar para os dois clientes que sinalizaram revisão antes de qualquer comunicação pública", risco: "baixo", gestorEffects: { reputacaoInterna: +1 }, effects: { clientes: +3, conformidade: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Clientes que sinalizaram revisão ainda não decidiram. Contato proativo antes da decisão deles — com compromisso claro de regularização — é a janela mais estreita e mais valiosa para preservar o relacionamento." },
      { text: "Emitir nota pública reconhecendo o problema e anunciando o plano de regularização", risco: "medio", effects: { conformidade: +2, clientes: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Nota pública proativa controla a narrativa antes que a imprensa construa uma por conta própria. Empresas que reconhecem e apresentam plano têm cobertura jornalística significativamente mais equilibrada." },
      { text: "Paralisar completamente a planta por 30 dias para investigar e regularizar tudo antes de qualquer comunicação", risco: "alto", gestorEffects: { capitalPolitico: -2 }, effects: { financeiro: -5, conformidade: -1, rh: -2, clientes: -3 }, avaliacao: "ruim", ensinamento: "Paralisação total sem negociação prévia com o IBAMA cria mais problemas do que resolve. O TAC define as condições de operação durante a regularização — você não precisa parar para negociar." }
    ]
  },
  {
    title: "O Responsável Técnico que Sumiu",
    description: "O ex-responsável técnico ambiental era o único que conhecia os procedimentos de descarte, o histórico de licenças e os contatos do IBAMA. Com ele foram os documentos físicos. O sindicato da categoria informou que ele está disposto a retornar como consultor por R$35k/mês por 3 meses para apoiar a regularização. Sem ele, a regularização pode levar o dobro do tempo.",
    tags: ["industria"],
    choices: [
      { text: "Contratar o ex-responsável como consultor pelos 3 meses — o conhecimento dele é crítico para o TAC", risco: "medio", effects: { conformidade: +3, processos: +3, financeiro: -2 }, avaliacao: "boa", ensinamento: "R$105k em consultoria para um processo de regularização que pode custar R$4,1M de multa é uma decisão de ROI óbvio. O conhecimento específico do processo de licenciamento tem valor de mercado real." },
      { text: "Recusar e contratar consultoria ambiental especializada que não tem o conflito de interesse do ex-funcionário", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "Consultoria ambiental independente traz metodologia padronizada e relacionamento com o IBAMA sem o histórico de conflito. O ex-funcionário pode ter motivação de lentidão — um consultor independente não." },
      { text: "Nomear internamente um engenheiro químico como responsável técnico e contratar apoio jurídico para complementar", risco: "baixo", effects: { conformidade: +2, rh: +2, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Responsável técnico interno com apoio jurídico é a solução mais duradoura. A empresa não pode ficar dependente de um único profissional externo para o próximo ciclo de licenciamento também." },
      { text: "Solicitar ao IBAMA extensão do prazo do TAC citando a saída do responsável técnico como circunstância atenuante", risco: "alto", effects: { conformidade: -2, clientes: -2, processos: +1 }, avaliacao: "ruim", ensinamento: "IBAMA raramente concede extensão de TAC por saída voluntária de funcionário. A autarquia pode interpretar a saída como possível destruição de evidências — o que agrava a situação em vez de atenuar." }
    ]
  },
  {
    title: "A Multa de R$4,1 Milhões",
    description: "O advogado ambiental avaliou a multa: há dois caminhos. (A) Pagar a multa integral em 30 dias com desconto de 30% (R$2,87M). (B) Recorrer administrativamente — processo leva 18 a 36 meses, pode reduzir para R$1,8M ou manter em R$4,1M. Durante o recurso, a planta segue em operação parcial. O CFO alerta: pagar R$2,87M agora deixa o caixa em R$5,1M — suficiente para operar, mas sem margem.",
    tags: ["industria"],
    choices: [
      { text: "Pagar com desconto de 30% e usar o TAC para negociar a retomada da operação plena rapidamente", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +3, financeiro: -4, processos: +2, clientes: +2 }, avaliacao: "boa", ensinamento: "Pagar com desconto elimina a incerteza e demonstra comprometimento com a regularização. O IBAMA tende a ser mais colaborativo na negociação do TAC com empresas que pagam a multa sem contestar." },
      { text: "Recorrer administrativamente — 18 meses de processo pode resultar em multa 56% menor", risco: "alto", gestorEffects: { capitalPolitico: -1 }, effects: { conformidade: -2, clientes: -2, financeiro: +1, processos: -1 }, avaliacao: "ruim", ensinamento: "Recorrer enquanto a planta está em operação parcial prolonga a instabilidade por 18-36 meses. Clientes que sinalizaram revisão e imprensa que noticiou o caso não vão esperar o recurso — eles tomam decisões nos próximos 30 dias." },
      { text: "Propor parcelamento da multa em 12 vezes com o IBAMA como parte do TAC", risco: "medio", effects: { conformidade: +2, financeiro: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Parcelamento de multa ambiental é negociável no TAC. Preservar o caixa para as obras de regularização é estrategicamente mais importante do que quitar a multa de uma vez." },
      { text: "Buscar financiamento bancário para pagar a multa com desconto sem comprometer o caixa operacional", risco: "medio", effects: { conformidade: +3, financeiro: -2, processos: +1 }, avaliacao: "boa", ensinamento: "Financiar o pagamento da multa com desconto é matematicamente vantajoso se a taxa de juros do crédito for menor que o desconto de 30%. Preserva o caixa e demonstra capacidade de crédito ao mercado." }
    ]
  },
  {
    title: "A Planta em Operação Parcial",
    description: "Com a planta a 60% da capacidade, você não consegue atender o volume contratado de 4 clientes. O COO apresenta as opções: (A) Priorizar os 2 maiores por receita, deixando os 2 menores sem atendimento. (B) Reduzir o volume proporcionalmente para todos os 4. (C) Terceirizar a produção faltante com indústria parceira temporariamente.",
    tags: ["industria"],
    choices: [
      { text: "Terceirizar a produção faltante com parceiro industrial — manter o compromisso com todos os clientes", risco: "medio", effects: { clientes: +4, qualidade: -1, financeiro: -3, processos: +1 }, avaliacao: "boa", ensinamento: "Terceirização preserva o relacionamento com todos os clientes ao custo de margem menor. A alternativa — deixar clientes sem produto — cria risco de rescisão contratual que é muito mais caro do que a terceirização." },
      { text: "Ser transparente com todos os clientes sobre a situação e negociar redução proporcional temporária", risco: "baixo", effects: { clientes: +2, conformidade: +1, processos: +1, financeiro: -1 }, avaliacao: "boa", ensinamento: "Transparência com os clientes sobre a capacidade real evita surpresas e permite que eles se planejem. Clientes que recebem aviso antecipado têm maior tolerância do que clientes que descobrem o problema no dia da entrega." },
      { text: "Priorizar os 2 maiores clientes e comunicar aos menores que o fornecimento está suspenso temporariamente", risco: "alto", gestorEffects: { reputacaoInterna: -1 }, effects: { clientes: -3, financeiro: +1, processos: -1 }, avaliacao: "ruim", ensinamento: "Priorizar por receita sem avisar os menores é garantir que eles busquem alternativa permanente. Em indústria química, onde a homologação de fornecedor leva meses, perder a homologação de um cliente pequeno tem custo real." },
      { text: "Acelerar a regularização para retornar a 100% da capacidade o mais rápido possível — não terceirizar", risco: "medio", effects: { conformidade: +2, processos: +2, clientes: -2, financeiro: -2 }, avaliacao: "media", ensinamento: "Acelerar a regularização é a solução definitiva — mas enquanto a planta não está a 100%, os clientes continuam sem produto. A aceleração e a terceirização não são mutuamente exclusivas." }
    ]
  },
  {
    title: "A Imprensa Voltou",
    description: "Um portal de notícias regional publicou uma matéria de acompanhamento 30 dias após a autuação. A jornalista ligou para pedir posicionamento. O texto provisório que ela compartilhou é equilibrado mas menciona que a empresa 'ainda não demonstrou ações concretas de regularização'. O advogado recomenda não comentar. O time de comunicação quer uma entrevista completa.",
    tags: ["industria"],
    choices: [
      { text: "Dar a entrevista completa com os dados concretos de regularização já implementados", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +3, clientes: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Uma entrevista com dados concretos de ação — TAC assinado, obras iniciadas, responsável técnico contratado — muda a narrativa de 'empresa na crise' para 'empresa em recuperação'. Silêncio confirma a percepção negativa." },
      { text: "Enviar nota escrita com os principais pontos de regularização em vez de entrevista presencial", risco: "baixo", effects: { conformidade: +2, clientes: +1 }, avaliacao: "boa", ensinamento: "Nota escrita controla a mensagem sem exposição a perguntas fora do escopo. É menos impactante do que entrevista — mas é melhor do que silêncio ou 'sem comentários'." },
      { text: "Seguir o conselho do advogado e não comentar — a matéria vai sair de qualquer forma", risco: "alto", effects: { conformidade: -2, clientes: -2 }, avaliacao: "ruim", ensinamento: "Jornalistas que não recebem posicionamento publicam a matéria com 'empresa não se pronunciou' — que é percebido pelo leitor como confirmação da culpa. Em crise de reputação, silêncio raramente é neutro." },
      { text: "Convidar a jornalista para uma visita à planta para ver as obras de regularização em andamento", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +4, clientes: +3, processos: +1 }, avaliacao: "boa", ensinamento: "Visita à planta transforma a matéria de apuração em reportagem de acompanhamento positivo. Ver as obras fisicamente é mais convincente do que qualquer nota — e jornalistas raramente recusam acesso exclusivo." }
    ]
  },
  {
    title: "O Programa de Gestão de Resíduos",
    description: "O advogado ambiental identificou a causa raiz do descarte irregular: a empresa não tinha programa formal de gestão de resíduos — os descartes eram feitos por decisão ad-hoc dos supervisores de turno. Para o TAC, o IBAMA exige um PGRS (Programa de Gestão de Resíduos Sólidos) implementado e auditável. Você precisa implantar em 90 dias.",
    tags: ["industria"],
    choices: [
      { text: "Contratar empresa especializada em PGRS para implementar o programa completo nos 90 dias", risco: "medio", effects: { conformidade: +5, processos: +4, seguranca: +2, financeiro: -3 }, avaliacao: "boa", ensinamento: "PGRS implementado por especialista tem documentação técnica que o IBAMA aceita e credibilidade de auditoria que equipe interna raramente tem. O custo da consultoria é a garantia de aprovação no prazo." },
      { text: "Desenvolver o PGRS internamente com a equipe de engenharia química — eles conhecem o processo", risco: "alto", effects: { conformidade: +3, processos: +2, financeiro: -1, rh: -2 }, avaliacao: "media", ensinamento: "PGRS desenvolvido internamente tem o risco de não atender os requisitos formais do IBAMA. Regulação ambiental tem linguagem específica — um documento tecnicamente correto mas formalmente inadequado pode ser reprovado." },
      { text: "Implementar o PGRS em parceria com a associação da indústria química local — dividir o custo e os recursos", risco: "baixo", effects: { conformidade: +3, processos: +3, financeiro: -1, clientes: +1 }, avaliacao: "boa", ensinamento: "Programa conjunto com a associação setorial distribui o custo e cria credibilidade adicional. O IBAMA tende a reconhecer positivamente programas de gestão que têm suporte setorial — indica mudança de cultura, não apenas reação individual." },
      { text: "Terceirizar completamente o descarte de resíduos para empresa especializada e evitar gestão interna", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: -2 }, avaliacao: "media", ensinamento: "Terceirização do descarte é uma solução — mas o IBAMA exige que a empresa geradora tenha seu próprio PGRS mesmo terceirizando o descarte. Você ainda precisa do programa, mesmo com terceiro para a execução." }
    ]
  },
  {
    title: "Os Clientes que Ficaram",
    description: "Um mês após a autuação, os dois clientes que sinalizaram revisão comunicaram: um manterá o contrato por mais 6 meses aguardando a regularização. O outro rescindiu. A perda do cliente rescindido representa R$6,8M/ano — 9,6% da receita. O diretor comercial alerta que há 3 outros clientes em 'observação passiva' — podem ou não revisar o contrato dependendo da evolução.",
    tags: ["industria"],
    choices: [
      { text: "Visitar pessoalmente os 3 clientes em 'observação passiva' com o plano de regularização documentado", risco: "baixo", gestorEffects: { capitalPolitico: +2 }, effects: { clientes: +4, conformidade: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Clientes em observação passiva estão esperando um sinal. A visita pessoal com documentação concreta transforma a dúvida em confiança — ou revela que a relação já estava frágil antes da crise ambiental." },
      { text: "Prospectar 3 novos clientes para compensar a perda de receita do contrato rescindido", risco: "medio", effects: { clientes: +2, financeiro: +1, processos: -1 }, avaliacao: "media", ensinamento: "Prospecção durante crise de reputação é o momento mais difícil para vender. Novos clientes pesquisam o histórico do fornecedor — e a autuação do IBAMA vai aparecer. A proteção dos clientes existentes tem prioridade." },
      { text: "Oferecer aos 3 clientes em observação um SLA estendido com garantia de qualidade como incentivo de permanência", risco: "medio", effects: { clientes: +3, qualidade: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "SLA estendido é um benefício tangível que transforma a permanência do cliente em decisão racional. A empresa demonstra que a crise ambiental não afetou a qualidade do produto — e assume uma posição de compromisso maior." },
      { text: "Aceitar a perda do cliente rescindido e focar 100% na regularização para proteger o restante da carteira", risco: "baixo", effects: { clientes: +1, conformidade: +2, processos: +2, financeiro: -1 }, avaliacao: "media", ensinamento: "Foco na regularização é o que vai proteger os clientes restantes no longo prazo. A perda de R$6,8M é dolorosa — mas um segundo cliente rescindindo por falta de ação vai custar mais do que o primeiro." }
    ]
  },
  {
    title: "A Regularização da Área Contaminada",
    description: "O laudo técnico do IBAMA identificou contaminação de solo na área de descarte. A remediação está incluída no TAC: descontaminação da área, análise de água subterrânea por 24 meses e revegetação da zona de proteção permanente. Custo estimado: R$1,9M nos próximos 36 meses. Uma empresa de remediação propõe fazer a obra por R$1,4M com garantia de resultado.",
    tags: ["industria"],
    choices: [
      { text: "Contratar a empresa de remediação pela R$1,4M com garantia de resultado — transferir o risco técnico", risco: "medio", effects: { conformidade: +4, seguranca: +3, financeiro: -3, processos: +2 }, avaliacao: "boa", ensinamento: "Contratar remediação com garantia de resultado é a abordagem mais segura. Se o processo não atender os parâmetros do IBAMA, o contratado é responsável pela execução adicional — não você." },
      { text: "Fazer a remediação com equipe própria para economizar R$500k e ter controle total do processo", risco: "alto", effects: { conformidade: +2, seguranca: +2, financeiro: -2, rh: -2, processos: -2 }, avaliacao: "ruim", ensinamento: "Remediação de solo contaminado por resíduo químico exige expertise técnica específica e equipamentos que uma indústria de embalagens não tem. A economia de R$500k pode virar R$2M+ se a remediação falhar na auditoria do IBAMA." },
      { text: "Negociar com o IBAMA um plano de remediação mais longo (48 meses) para diluir o custo sem comprometer o caixa", risco: "medio", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +2, financeiro: +2, processos: +1 }, avaliacao: "boa", ensinamento: "Prazo mais longo no TAC é negociável quando acompanhado de cronograma detalhado e garantias de monitoramento. O IBAMA aceita prazos de remediação realistas — o que ele não aceita é ausência de ação." },
      { text: "Buscar seguro ambiental retroativo que cubra o custo de remediação", risco: "alto", effects: { conformidade: -1, financeiro: +1 }, avaliacao: "ruim", ensinamento: "Seguros ambientais não cobrem retroativamente eventos já ocorridos e já autuados. A contratação de seguro ambiental agora é para proteger eventos futuros — não o custo de remediação atual." }
    ]
  },
  {
    title: "O Engenheiro Ambiental Novo",
    description: "O novo responsável técnico ambiental — Rodrigo, 32 anos, mestrado em engenharia ambiental — apresenta um diagnóstico completo após 30 dias na empresa. Sua conclusão: 'O problema não foi o descarte pontual que o IBAMA autuou. A empresa tem 7 pontos de não-conformidade ambiental que ainda não foram detectados pelo órgão. Se não corrigirmos, a chance de nova autuação em 12 meses é alta.'",
    tags: ["industria"],
    choices: [
      { text: "Autorizar Rodrigo a corrigir todos os 7 pontos imediatamente — proatividade protege de futuras autuações", risco: "medio", effects: { conformidade: +5, seguranca: +3, processos: +3, financeiro: -3 }, avaliacao: "boa", ensinamento: "Corrigir proativamente 7 pontos de não-conformidade antes de nova autuação é a decisão de menor custo e maior proteção. Cada não-conformidade adicional autuada tem o mesmo potencial de dano que a primeira." },
      { text: "Priorizar os 3 pontos com maior risco de autuação e planejar os outros 4 para o próximo ano", risco: "baixo", effects: { conformidade: +3, seguranca: +2, processos: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Priorização por risco é a alocação correta de recursos limitados. Os 3 pontos de maior risco de autuação corrigidos primeiro protegem a empresa dos danos mais prováveis." },
      { text: "Comunicar voluntariamente os 7 pontos ao IBAMA como ato de boa fé antes de corrigir", risco: "alto", gestorEffects: { capitalPolitico: +1 }, effects: { conformidade: +3, clientes: +2, financeiro: -1 }, avaliacao: "media", ensinamento: "Autodeclaração ao IBAMA demonstra boa fé e pode ser tratada como atenuante em futuras autuações. O risco é que o IBAMA pode incluir os 7 pontos no TAC atual com prazos mais apertados." },
      { text: "Não comunicar ao IBAMA e corrigir em silêncio para não chamar atenção para os outros pontos", risco: "medio", effects: { conformidade: +2, processos: +2, seguranca: +1 }, avaliacao: "media", ensinamento: "Corrigir sem comunicar é tecnicamente correto — você não é obrigado a autodeclarar. O risco é que se o IBAMA inspecionar e encontrar registros dos problemas antes da correção, a intenção de ocultação agrava a situação." }
    ]
  },
  {
    title: "A Pressão dos Colaboradores",
    description: "O sindicato dos químicos convocou assembleia. Os trabalhadores estão preocupados com o futuro da empresa após a autuação e a operação parcial. O presidente do sindicato pede reunião urgente: 'Nossos associados precisam saber se a empresa vai fechar, cortar salários ou demitir.' O RH alerta que o absenteísmo subiu 22% nas últimas 3 semanas.",
    tags: ["industria"],
    choices: [
      { text: "Realizar assembleia aberta com todos os colaboradores — transparência total sobre a situação e o plano", risco: "baixo", gestorEffects: { reputacaoInterna: +3 }, effects: { rh: +5, conformidade: +1, processos: +1 }, avaliacao: "boa", ensinamento: "Transparência com colaboradores em crise é a única forma de combater o rumor. Um colaborador que entende a situação real e acredita no plano é um aliado. Um colaborador com medo e desinformação é fonte de absenteísmo e pedido de demissão." },
      { text: "Reunir-se apenas com as lideranças e os representantes sindicais — não fazer assembleia geral", risco: "medio", effects: { rh: +3, processos: +1 }, avaliacao: "media", ensinamento: "Reunião com lideranças e sindicato é o canal correto para informação oficial — mas as lideranças levam a mensagem para os trabalhadores com o filtro delas. Assembleia direta elimina o filtro." },
      { text: "Comunicar por escrito que a empresa está em regularização e não há previsão de demissões", risco: "medio", effects: { rh: +2, conformidade: +1 }, avaliacao: "media", ensinamento: "Comunicado escrito é o mínimo — mas em contexto de crise, papel não substitui presença. Colaboradores querem olhar nos olhos de quem está gerindo a situação e sentir que alguém está no controle." },
      { text: "Usar o absenteísmo elevado como argumento para demitir os colaboradores que mais faltaram", risco: "alto", gestorEffects: { reputacaoInterna: -4, capitalPolitico: -2 }, effects: { rh: -6, processos: -3, conformidade: -2 }, avaliacao: "ruim", ensinamento: "Demitir em crise por absenteísmo que tem origem na própria gestão da crise é o erro de liderança mais grave possível. O sindicato vai reagir, a imprensa vai noticiar, e o IBAMA pode interpretar como instabilidade da empresa." }
    ]
  },
  {
    title: "A Certificação ISO 14001",
    description: "O responsável técnico Rodrigo recomenda buscar a certificação ISO 14001 (sistema de gestão ambiental) como demonstração de mudança estrutural. Dois clientes já perguntaram se a empresa vai buscar a certificação. O processo leva 12-18 meses e custa R$280k entre consultoria e auditoria. A certificação transforma a crise em caso de transformação.",
    tags: ["industria"],
    choices: [
      { text: "Iniciar o processo de ISO 14001 imediatamente como parte da resposta à crise", risco: "medio", gestorEffects: { capitalPolitico: +2 }, effects: { conformidade: +5, clientes: +3, processos: +3, financeiro: -3 }, avaliacao: "boa", ensinamento: "ISO 14001 em resposta a uma autuação transforma a crise em catalisador de maturidade. A certificação demonstra que a empresa não apenas corrigiu o problema — mudou o sistema que permitiu o problema." },
      { text: "Aguardar a conclusão da regularização do TAC antes de iniciar a ISO 14001", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: +1 }, avaliacao: "media", ensinamento: "Sequenciar TAC antes da ISO é razoável — mas os dois processos têm mais de 50% de sobreposição de atividades. Iniciar a ISO durante o TAC elimina trabalho duplicado e compressa o prazo total." },
      { text: "Buscar ISO 14001 apenas depois de perguntar formalmente se os clientes valorizam a certificação", risco: "baixo", effects: { clientes: +2, conformidade: +1, processos: +1 }, avaliacao: "media", ensinamento: "Perguntar antes de investir é prudente — mas dois clientes já perguntaram sobre a certificação. O sinal está dado. Mais pesquisa pode parecer hesitação em vez de planejamento." },
      { text: "Criar um sistema de gestão ambiental próprio sem buscar a certificação externa — resultado similar sem o custo de auditoria", risco: "medio", effects: { conformidade: +3, processos: +3, financeiro: -1, clientes: +1 }, avaliacao: "media", ensinamento: "Sistema interno sem certificação tem valor operacional real — mas não tem o valor de mercado da ISO 14001. Para clientes que exigem a certificação em edital, o sistema próprio não substitui o certificado externo." }
    ]
  },
  {
    title: "A Retomada Completa da Operação",
    description: "O IBAMA aprovou as obras de remediação e o PGRS implementado. A planta pode retornar a 100% da capacidade em 30 dias. O diretor comercial quer anunciar ao mercado a retomada. O time de comunicação propõe uma campanha de relançamento da empresa com o tema 'Química com Responsabilidade'.",
    tags: ["industria"],
    choices: [
      { text: "Fazer o relançamento com campanha, convite para visita de clientes e parceiros e publicação dos indicadores ambientais", risco: "baixo", gestorEffects: { capitalPolitico: +3 }, effects: { clientes: +4, conformidade: +3, rh: +2, financeiro: -2 }, avaliacao: "boa", ensinamento: "Relançamento com dados concretos e convite para validação in loco é a forma mais eficiente de restaurar a reputação. Ninguém vai acreditar na transformação por comunicado — vendo, acreditam." },
      { text: "Retornar à operação sem anúncio público — deixar os resultados falarem ao longo do tempo", risco: "medio", effects: { conformidade: +2, processos: +2, financeiro: +1 }, avaliacao: "media", ensinamento: "Retorno silencioso é modesto — mas em mercados B2B onde a reputação importa, o silêncio pode ser interpretado como vergonha. Um anúncio estruturado com dados de regularização é mais profissional do que humilde demais." },
      { text: "Contatar individualmente os 5 maiores clientes antes do anúncio público — dar a eles a primícia da retomada", risco: "baixo", effects: { clientes: +4, conformidade: +2, rh: +1 }, avaliacao: "boa", ensinamento: "Dar a primícia da retomada aos clientes mais importantes antes do anúncio geral demonstra que o relacionamento é prioritário. Clientes que souberam diretamente de você têm uma experiência diferente de quem soube pela imprensa." },
      { text: "Convidar o IBAMA para uma visita de verificação antes do anúncio — obter endosso do órgão regulador", risco: "baixo", effects: { conformidade: +5, clientes: +3, processos: +2 }, avaliacao: "boa", ensinamento: "Visita do IBAMA antes do relançamento — e menção ao resultado positivo dela no comunicado — é o endosso mais valioso possível. O regulador que autuou e depois visita a planta regularizada é a prova mais crível de transformação." }
    ]
  },
  {
    title: "O Futuro da Indústria Química Responsável",
    description: "A empresa superou a crise mais grave de sua história. O board pede a visão estratégica para os próximos 3 anos.",
    tags: ["industria"],
    choices: [
      { text: "Química verde: migrar progressivamente para solventes e insumos com menor impacto ambiental, antecipando regulação futura", effects: { conformidade: +5, clientes: +4, qualidade: +4, financeiro: +3, processos: +3, seguranca: +3 }, avaliacao: "boa", ensinamento: "Química verde não é apenas ESG — é antecipação regulatória. A regulação europeia REACH e as tendências do mercado brasileiro sinalizam restrição progressiva de compostos. Migrar antes da obrigação garante vantagem de 3-5 anos." },
      { text: "Centro de excelência ambiental: transformar o conhecimento de gestão ambiental em serviço para outras indústrias", effects: { inovacao: +4, financeiro: +3, conformidade: +4, clientes: +3, processos: +4 }, avaliacao: "boa", ensinamento: "A expertise ambiental construída na crise tem valor comercial. Outras indústrias químicas precisam de consultoria, PGRS e suporte regulatório — e quem já passou pela experiência e saiu do outro lado tem credibilidade única." },
      { text: "Expansão para química de alta especialidade: produtos com margem 5x maior e regulação mais estrita", requisitos: { indicadorMinimo: { conformidade: 13, qualidade: 11 } }, effects: { financeiro: +5, qualidade: +4, conformidade: +4, clientes: +3, inovacao: +3 }, avaliacao: "boa", ensinamento: "Alta especialidade química requer conformidade ambiental exemplar — que você agora tem. Margens de 40-60% em produtos especializados versus 12-18% em commodities justificam o investimento em P&D e certificação." },
      { text: "Parceria com startups de cleantech: ser a planta de referência para novos processos de química sustentável", effects: { inovacao: +5, conformidade: +4, processos: +3, clientes: +2, financeiro: -1 }, avaliacao: "boa", ensinamento: "Ser planta de referência para cleantech cria fluxo de inovação que uma empresa tradicional não consegue desenvolver internamente. A parceria traz tecnologia — você traz a escala industrial e o know-how de processo." }
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
let _isAdmin  = false;
let _settings = { timer: false, cloudStatus: false };
let _setorSelecionado = null;
let _escolhaFeita     = false;
let _feedbackCallback = null;
let _timerInterval    = null;
let _manutencaoInterval = null;
let _globalPollInterval  = null;
let _ultimaMensagemGlobal = '';
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

  // Sempre sai da screen-loading imediatamente
  const saved = LS.get(SK.PLAYER);
  if (saved) {
    _player = saved;
    _verificarSessaoSalva();
    _atualizarHome();
    await _atualizarBotaoAdmin(saved.uid); // aguarda verificar admin ANTES do polling
    _iniciarPollingGlobal(saved.uid); // inicia polling mesmo em sessão restaurada
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
  if (id === 'screen-home') {
    _mostrarBotaoAdmin();
    // Exibe mensagem global se houver
    if (window._mensagemGlobal) {
      setTimeout(() => mostrarSucesso(window._mensagemGlobal), 800);
      window._mensagemGlobal = null;
    }
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
  _pararPollingGlobal();
  LS.remove(SK.PLAYER);
  LS.remove(SK.SESSION);
  _player = null;
  _isAdmin = false;
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

const _NOMES_ALEATORIOS = [
  "Nexora S.A.", "Veltrix Corp", "Aurum Group", "Solera Holding",
  "Kairos Ventures", "Fenix Soluções", "Orbis Gestão", "Zentra S.A.",
  "Caldera Corp", "Lumis Group", "Veritas S.A.", "Ápex Holding",
  "Norax Indústrias", "Solum Gestão", "Acera Corp", "Trivela S.A.",
  "Polaris Group", "Vexor Holding", "Alcora S.A.", "Mantis Corp",
  "Stratum Group", "Fulcrum S.A.", "Helix Ventures", "Crestline Corp"
];

function gerarNomeAleatorio() {
  const el = document.getElementById("companyName");
  if (!el) return;
  // Embaralha e pega um nome diferente do atual
  let nome;
  do {
    nome = _NOMES_ALEATORIOS[Math.floor(Math.random() * _NOMES_ALEATORIOS.length)];
  } while (nome === el.value && _NOMES_ALEATORIOS.length > 1);
  el.value = nome;
  el.classList.remove("input-error-shake");
  // Animação rápida de feedback
  el.style.transition = "border-color .15s";
  el.style.borderColor = "var(--s-primary)";
  setTimeout(() => { el.style.borderColor = ""; }, 400);
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
  _iniciarVerificacaoManutencao();
}

// ─── POLLING UNIVERSAL ─────────────────────────────────────────
// Roda sempre que o usuário está logado (home, jogo, perfil, etc.)
// Verifica: ban + manutenção + mensagem global — a cada 20 segundos

function _iniciarPollingGlobal(uid) {
  _pararPollingGlobal(); // limpa qualquer poll anterior
  if (!window.ADMIN || !uid) return;

  const _tick = async () => {
    try {
      // 1. Verifica ban (admin nunca é banido)
      if (!_isAdmin) {
        const banido = await window.ADMIN.verificarBan(uid);
        if (banido) {
          _forcarSaida('🚫 Sua conta foi suspensa pelo administrador.');
          return;
        }
      }

      // 2. Verifica manutenção + mensagem global
      const cfg = await window.ADMIN.verificarMensagemGlobal();

      if (cfg.manutencao && !_isAdmin) {
        _forcarSaida('🔧 Jogo em manutenção. Você será desconectado.');
        return;
      }

      // 3. Mensagem global — mostra só se mudou desde a última vez
      if (cfg.mensagem && cfg.mensagem !== _ultimaMensagemGlobal) {
        _ultimaMensagemGlobal = cfg.mensagem;
        mostrarSucesso(cfg.mensagem);
      }
    } catch(e) { /* ignora erros de rede temporários */ }
  };

  _tick(); // executa imediatamente no login
  _globalPollInterval = setInterval(_tick, 20000);
}

function _pararPollingGlobal() {
  if (_globalPollInterval) { clearInterval(_globalPollInterval); _globalPollInterval = null; }
  if (_manutencaoInterval) { clearInterval(_manutencaoInterval); _manutencaoInterval = null; }
}

function _forcarSaida(msg) {
  _pararPollingGlobal();
  _pararTimer();
  LS.remove(SK.SESSION);
  LS.remove(SK.PLAYER);
  _player = null;
  _isAdmin = false;
  _aplicarTemaSetor(null);
  if (window.GSPAuth?.isReady()) window.GSPAuth.logout().catch(() => {});
  mostrarTela('screen-login');
  setTimeout(() => mostrarAviso(msg), 600);
}

// Mantido para não quebrar chamadas de comecaJogo/abandonarJogo
function _iniciarVerificacaoManutencao() { /* substituído pelo polling global */ }
function _pararVerificacaoManutencao()  { /* substituído pelo polling global */ }

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
    const risco = (c.risco && state.currentRound < 2) ? `<span class="choice-risk risk-${c.risco}">${c.risco.toUpperCase()}</span>` : "";
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

function reiniciar() { _pararVerificacaoManutencao(); LS.remove(SK.SESSION); _aplicarTemaSetor(null); mostrarTela("screen-home"); }

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
      av.addEventListener('mousedown',  _iniciarHoldAdmin);
      av.addEventListener('touchstart', _iniciarHoldAdmin, { passive: true });
      av.addEventListener('mouseup',    _cancelarHoldAdmin);
      av.addEventListener('mouseleave', _cancelarHoldAdmin);
      av.addEventListener('touchend',   _cancelarHoldAdmin);
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
  _pararVerificacaoManutencao();
  LS.remove(SK.SESSION);
  _aplicarTemaSetor(null);
  mostrarTela('screen-home');
}

/* ════════════════════════════════════════════════════
   CONFIRMAÇÃO DE SAÍDA
════════════════════════════════════════════════════ */
let _saidaTipo = null;

function pedirConfirmacaoSaida(tipo) {
  _saidaTipo = tipo;
  const overlay = document.getElementById('overlay-confirmar-saida');
  const icon    = document.getElementById('confirmar-saida-icon');
  const titulo  = document.getElementById('confirmar-saida-titulo');
  const desc    = document.getElementById('confirmar-saida-desc');
  const btn     = document.getElementById('confirmar-saida-btn');
  if (!overlay) return;

  const configs = {
    conta: {
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      titulo: 'Sair da conta?',
      desc: 'Você será desconectado. Seu progresso salvo na nuvem não será perdido.',
      btnTxt: 'Sair da conta',
      btnClass: 'confirmar-saida-confirmar--neutro',
    },
    convidado: {
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      titulo: 'Sair do modo convidado?',
      desc: 'Seu histórico local desta sessão será apagado. Crie uma conta para salvar seu progresso.',
      btnTxt: 'Sair mesmo assim',
      btnClass: 'confirmar-saida-confirmar--warn',
    },
    partida: {
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
      titulo: 'Abandonar o mandato?',
      desc: 'O progresso desta partida será perdido. As rodadas concluídas não serão salvas no seu histórico.',
      btnTxt: 'Abandonar',
      btnClass: 'confirmar-saida-confirmar--danger',
    },
  };

  const cfg = configs[tipo] || configs.conta;
  if (icon)  icon.innerHTML  = cfg.icon;
  if (titulo) titulo.textContent = cfg.titulo;
  if (desc)  desc.textContent  = cfg.desc;
  if (btn) {
    btn.textContent = cfg.btnTxt;
    btn.className   = 'btn confirmar-saida-confirmar ' + cfg.btnClass;
  }

  // Garante que aparece acima de qualquer overlay (z-index 100001 no HTML)
  if (overlay.parentNode !== document.body) document.body.appendChild(overlay);
  overlay.style.display = 'flex';
}

function cancelarSaida() {
  const overlay = document.getElementById('overlay-confirmar-saida');
  if (overlay) overlay.style.display = 'none';
  _saidaTipo = null;
}

function confirmarSaida() {
  const overlay = document.getElementById('overlay-confirmar-saida');
  if (overlay) overlay.style.display = 'none';
  if (_saidaTipo === 'partida') {
    abandonarJogo();
  } else {
    sair();
  }
  _saidaTipo = null;
}

/* ════════════════════════════════════════════════════
   TOOLTIP DE INDICADORES DO GESTOR
════════════════════════════════════════════════════ */
const INDICADOR_INFO = {
  // ── Indicadores do Gestor ──
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
  // ── Indicadores da Empresa (comuns) ──
  financeiro: {
    titulo: '💰 Financeiro',
    desc: 'Saúde financeira geral da empresa. Afetado por investimentos, cortes de custo e resultados operacionais.',
    consequence: '⚠ Se chegar a 0, a empresa entra em crise de caixa e o mandato é encerrado.',
  },
  rh: {
    titulo: '👥 RH',
    desc: 'Representa o capital humano e o engajamento dos colaboradores. Impactado por políticas de pessoas e cultura organizacional.',
    consequence: '⚠ Valores críticos geram aumento de turnover e queda de produtividade.',
  },
  clientes: {
    titulo: '⭐ Clientes',
    desc: 'Satisfação e fidelidade da base de clientes. Afetado pela qualidade dos produtos, atendimento e experiência.',
    consequence: '⚠ Valores críticos resultam em perda de receita e dano à reputação.',
  },
  processos: {
    titulo: '⚙️ Processos',
    desc: 'Eficiência operacional interna. Reflete a maturidade dos processos e a capacidade de execução.',
    consequence: '⚠ Processos deficientes aumentam custos e reduzem a qualidade das entregas.',
  },
  // ── Varejo ──
  margem: {
    titulo: '📊 Margem Operacional',
    desc: 'Percentual de lucro sobre as vendas. Impactado por precificação, custos e mix de produtos.',
    consequence: '⚠ Margens negativas comprometem a sustentabilidade financeira.',
  },
  estoque: {
    titulo: '📦 Giro de Estoque',
    desc: 'Velocidade com que os produtos são vendidos. Alto giro indica eficiência; baixo giro gera capital parado.',
    consequence: '⚠ Estoque parado aumenta custos e pode gerar obsolescência.',
  },
  marca: {
    titulo: '🏷️ Força da Marca',
    desc: 'Percepção e reconhecimento da marca no mercado. Construída por consistência, qualidade e comunicação.',
    consequence: '⚠ Marca fraca reduz poder de precificação e atração de clientes.',
  },
  digital: {
    titulo: '🖥️ Canal Digital',
    desc: 'Presença e desempenho nos canais digitais de venda. Cada vez mais essencial para o varejo moderno.',
    consequence: '⚠ Atraso digital cede espaço para concorrentes mais ágeis.',
  },
  // ── Logística ──
  sla: {
    titulo: '⏱️ Cumprimento de SLA',
    desc: 'Taxa de entregas dentro do prazo acordado. Principal métrica de confiabilidade para clientes.',
    consequence: '⚠ SLA baixo gera multas contratuais e perda de contratos.',
  },
  frota: {
    titulo: '🚛 Estado da Frota',
    desc: 'Condição e disponibilidade dos veículos. Frota bem mantida garante operação confiável e segura.',
    consequence: '⚠ Frota degradada aumenta paradas e custos de manutenção emergencial.',
  },
  // ── Indústria ──
  manutencao: {
    titulo: '🔧 Manutenção de Ativos',
    desc: 'Estado de conservação das máquinas e equipamentos produtivos. Manutenção preventiva reduz paradas.',
    consequence: '⚠ Ativos degradados causam paradas de produção e acidentes.',
  },
  qualidade: {
    titulo: '🎯 Controle de Qualidade',
    desc: 'Conformidade dos produtos com os padrões estabelecidos. Medido por taxas de defeito e retrabalho.',
    consequence: '⚠ Qualidade baixa gera devoluções, recalls e perda de clientes.',
  },
  conformidade: {
    titulo: '📋 Conformidade Regulatória',
    desc: 'Aderência às normas e regulações do setor. Envolve licenças, certificações e auditorias.',
    consequence: '⚠ Não conformidade pode resultar em multas, interdições e danos à reputação.',
  },
  // ── Tecnologia ──
  clima: {
    titulo: '🧑‍💻 Clima Organizacional',
    desc: 'Bem-estar e satisfação dos colaboradores de tecnologia. Essencial para atrair e reter talentos.',
    consequence: '⚠ Clima ruim aumenta turnover em cargos técnicos críticos.',
  },
  satisfacao: {
    titulo: '⭐ Satisfação do Cliente',
    desc: 'Nível de satisfação dos usuários com os produtos e serviços digitais.',
    consequence: '⚠ Insatisfação leva ao churn e prejudica o crescimento.',
  },
  produtividade: {
    titulo: '⚡ Produtividade',
    desc: 'Velocidade e eficiência das entregas de tecnologia. Impactada por dívida técnica, processos e motivação.',
    consequence: '⚠ Baixa produtividade atrasa lançamentos e aumenta custos.',
  },
  reputacao: {
    titulo: '📣 Reputação de Mercado',
    desc: 'Como a empresa é vista no ecossistema de tecnologia por clientes, parceiros e talentos.',
    consequence: '⚠ Reputação negativa dificulta parcerias e contratações.',
  },
  inovacao: {
    titulo: '🔬 Inovação',
    desc: 'Capacidade de desenvolver novos produtos e tecnologias. Motor de crescimento e diferenciação competitiva.',
    consequence: '⚠ Sem inovação a empresa perde relevância para concorrentes mais ágeis.',
  },
  // ── Segurança (compartilhado) ──
  seguranca: {
    titulo: '🦺 Segurança Operacional',
    desc: 'Nível de segurança nas operações. Envolve prevenção de acidentes, normas e cultura de segurança.',
    consequence: '⚠ Incidentes de segurança geram custos humanos, legais e reputacionais graves.',
  },
  tecnologia: {
    titulo: '📡 TMS / Tecnologia',
    desc: 'Uso de sistemas tecnológicos na operação logística. Permite rastreamento, roteirização e controle em tempo real.',
    consequence: '⚠ Tecnologia defasada reduz visibilidade e eficiência da operação.',
  },
};

function abrirTooltipIndicador(key) {
  const info = INDICADOR_INFO[key];
  if (!info) return;
  const state = BetaState.get();
  // Gestor indicators: reputacaoInterna, capitalPolitico, esgotamento (scale 0-10)
  // Empresa indicators: all others (scale 0-20)
  const GESTOR_KEYS = ['reputacaoInterna', 'capitalPolitico', 'esgotamento'];
  const isGestor = GESTOR_KEYS.includes(key);
  const val = isGestor
    ? (state?.gestor?.[key] ?? '—')
    : (state?.indicators?.[key] ?? '—');
  const maxVal = isGestor ? 10 : 20;
  const overlay = document.getElementById('overlay-tooltip');
  const title   = document.getElementById('tooltip-title');
  const body    = document.getElementById('tooltip-body');
  if (!overlay) return;
  if (title) title.textContent = info.titulo;
  if (body) body.innerHTML = `
    <div class="tooltip-val-block">
      <div class="tooltip-val-num" style="color:var(--s-text)">${val}<span style="font-size:.9rem;color:var(--t3)">/${maxVal}</span></div>
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

  // Verifica se é admin antes de qualquer outra coisa
  await _atualizarBotaoAdmin(player.uid);

  // Verifica manutenção — admin bypassa, usuários comuns são bloqueados
  if (!_isAdmin && window.ADMIN) {
    const cfg = await window.ADMIN.verificarMensagemGlobal().catch(()=>null);
    if (cfg?.manutencao) {
      mostrarTela('screen-login');
      setTimeout(() => mostrarAviso('🔧 Jogo em manutenção. Volte em breve!'), 500);
      return;
    }
    if (cfg?.mensagem) {
      window._mensagemGlobal = cfg.mensagem;
    }
  }

  // Inicia o polling universal (ban + manutenção + mensagem global)
  _iniciarPollingGlobal(player.uid);

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

async function _atualizarBotaoAdmin(uid) {
  if (!uid) return;
  try {
    _isAdmin = await window.ADMIN?.verificarAdmin(uid) || false;
  } catch(e) {
    _isAdmin = false;
  }
  _mostrarBotaoAdmin();
}

function _mostrarBotaoAdmin() {
  const btn = document.getElementById('btn-admin-home');
  if (btn) btn.style.display = _isAdmin ? 'inline-flex' : 'none';
}

let _adminHoldTimer = null;

function _iniciarHoldAdmin() {
  _adminHoldTimer = setTimeout(() => { irParaAdmin(); }, 3000);
}

function _cancelarHoldAdmin() {
  if (_adminHoldTimer) { clearTimeout(_adminHoldTimer); _adminHoldTimer = null; }
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
  pedirConfirmacaoSaida, cancelarSaida, confirmarSaida,
  abrirTooltipIndicador, closeTooltip,
  toggleModoTreino,
  compartilharResultado,
  irParaAdmin,
  gerarNomeAleatorio,
};

// Inicializa o jogo — funciona tanto se DOM já carregou quanto se ainda está carregando
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }
})();
