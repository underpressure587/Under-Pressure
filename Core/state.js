/* ═══════════════════════════════════════════════════════
   BETA · STATE · Estado centralizado do jogo beta
   v5.0 — 8 indicadores por setor, situações filtradas por setor
═══════════════════════════════════════════════════════ */

const BetaState = (() => {
    let _state = null;

    function _indicadoresBase(sector, introIndex = 0) {
        // Tecnologia tem valores iniciais por história pois cada contexto
        // começa em situações muito diferentes (SaaS saudável vs EdTech em crise vs Scale-up IA)
        const TECNOLOGIA_POR_HISTORIA = [
            // [0] SaaS B2B — empresa crescendo, time ainda relativamente ok
            { financeiro: 9, clima: 7, satisfacao: 7, qualidade: 6, produtividade: 7, reputacao: 8, inovacao: 7, seguranca: 6 },
            // [1] EdTech — time sobrecarregado, clima crítico (runway 8 meses)
            { financeiro: 9, clima: 4, satisfacao: 7, qualidade: 6, produtividade: 5, reputacao: 8, inovacao: 7, seguranca: 6 },
            // [2] Scale-up IA — produto bom, pipeline travado, vendas fracas
            { financeiro: 9, clima: 6, satisfacao: 7, qualidade: 6, produtividade: 6, reputacao: 8, inovacao: 7, seguranca: 6 },
        ];

        const BASE = {
            tecnologia: TECNOLOGIA_POR_HISTORIA[introIndex] || TECNOLOGIA_POR_HISTORIA[0],
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

            indicators: _indicadoresBase(sector, 0), // introIndex=0 como padrão; engine chama aplicarIndicadoresHistoria() logo após

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

    // BUG #3 FIX: restaura estado completo salvo pelo _salvarSessao
    function restore(saved) {
        _state = {
            sector:        saved.sector,
            groupName:     saved.groupName || "",
            companyName:   saved.companyName,
            currentRound:  saved.currentRound,
            totalRounds:   saved.totalRounds,
            introIndex:    saved.introIndex || 0,
            indicators:    { ...saved.indicators },
            gestor:        { ...saved.gestor },
            history:       [...(saved.history || [])],
            activeEvents:  JSON.parse(JSON.stringify(saved.activeEvents || [])),
            storyState:    JSON.parse(JSON.stringify(saved.storyState || {
                faseEmpresa: "fundacao", estiloGestao: [], reputacaoMercado: "boa",
                flags: [], conquistas: [], traumas: [], flagMotivos: {}
            })),
            situacaoAtual: saved.situacaoAtual || null,
            companyInfo:   saved.companyInfo   || null,
            situacaoStatus: saved.situacaoStatus || null,
            stakeholderLog: saved.stakeholderLog || [],
            gameRounds:    [],   // será re-carregado pelo engine
            phase:         "playing",
        };
        return _state;
    }

    // Chamado pelo engine após sortear o introIndex,
    // garante que cada história começa com os indicadores corretos
    function aplicarIndicadoresHistoria(introIndex) {
        if (!_state) return;
        _state.indicators = _indicadoresBase(_state.sector, introIndex);
        _state.introIndex  = introIndex;
    }

    return {
        init, get, getIndicators, applyEffects,
        applyGestorEffects, getGestor, addStakeholderLog,
        addHistory, addEvent, nextRound, setPhase,
        addFlag, setFase, setReputacao, addEstiloGestao,
        addConquista, addTrauma, setSituacaoStatus, restore,
        aplicarIndicadoresHistoria,
    };
})();
