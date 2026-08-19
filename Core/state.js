

const BetaState = (() => {
    let _state = null;

    function _indicadoresBase(sector, introIndex = 0) {
        
        
        const TECNOLOGIA_POR_HISTORIA = [
            
            { financeiro: 9, rh: 7, clientes: 7, qualidade: 6, produtividade: 7, reputacao: 8, inovacao: 7, seguranca: 6 },
            
            { financeiro: 9, rh: 4, clientes: 7, qualidade: 6, produtividade: 5, reputacao: 8, inovacao: 7, seguranca: 6 },
            
            { financeiro: 9, rh: 6, clientes: 7, qualidade: 6, produtividade: 6, reputacao: 8, inovacao: 7, seguranca: 6 },
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

            indicators: _indicadoresBase(sector, 0), 

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
                esgotamento:      0,  
            },

            
            situacaoStatus: null,

            stakeholderLog: [],

            storyState: {
                faseEmpresa:      "fundacao",
                estiloGestao:     [],
                reputacaoMercado: "boa",
                flags:            [],
                conquistas:       [],
                traumas:          [],
                flagMotivos:      {},   
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

    
    function addHistory(entry, maxEntries = 100) {
        _state.history.push(entry);
        if (_state.history.length > maxEntries) {
            _state.history.splice(0, _state.history.length - maxEntries);
        }
    }
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
            storyState:    (() => {
                
                const ss = saved.storyState || {};
                return JSON.parse(JSON.stringify({
                    faseEmpresa:       ss.faseEmpresa      || "fundacao",
                    estiloGestao:      Array.isArray(ss.estiloGestao)  ? ss.estiloGestao  : [],
                    reputacaoMercado:  ss.reputacaoMercado || "boa",
                    flags:             Array.isArray(ss.flags)         ? ss.flags         : [],
                    conquistas:        Array.isArray(ss.conquistas)    ? ss.conquistas    : [],
                    traumas:           Array.isArray(ss.traumas)       ? ss.traumas       : [],
                    flagMotivos:       (ss.flagMotivos && typeof ss.flagMotivos === 'object') ? ss.flagMotivos : {},
                }));
            })(),
            situacaoAtual: saved.situacaoAtual || null,
            companyInfo:   saved.companyInfo   || null,
            situacaoStatus: saved.situacaoStatus || null,
            stakeholderLog: saved.stakeholderLog || [],
            gameRounds:    [],   
            phase:         "playing",
        };
        return _state;
    }

    
    
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
