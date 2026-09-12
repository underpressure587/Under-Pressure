

const BetaImprevisto = (() => {

    
    const MULT_CAP = 2.0;

    
    const POOL = [
        {
            id: "greve",
            titulo: `${Icone('triangle-alert',13,'var(--warn)')} Risco de Greve`,
            descricao: "A equipe está agitada. Decisões que prejudiquem RH têm impacto dobrado.",
            modifierPorSetor: {
                default: { rh: 2.0 },
            },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "crise_cambial",
            titulo: `${Icone('arrow-left-right',13)} Crise Cambial`,
            descricao: "Oscilação do câmbio amplifica os efeitos financeiros.",
            modifierPorSetor: {
                default: { financeiro: 1.5 },
            },
            gestorEffects: { esgotamento: +1 },
            duracao: 2
        },
        {
            id: "viral_positivo",
            titulo: `${Icone('megaphone',13)} Campanha Viral`,
            descricao: "A empresa ganhou atenção positiva. Ganhos com clientes são maiores.",
            modifierPorSetor: {
                default: { clientes: 1.5 },
                varejo:  { clientes: 1.5, marca: 1.5 },
            },
            gestorEffects: { capitalPolitico: +1 },
            duracao: 1
        },
        {
            id: "auditoria",
            titulo: `${Icone('search',13)} Auditoria Surpresa`,
            descricao: "Auditores na casa. Decisões que impactam processos e conformidade têm efeito amplificado.",
            modifierPorSetor: {
                tecnologia: { processos: 2.0, qualidade: 2.0, seguranca: 1.5 },
                varejo:     { processos: 2.0 },
                logistica:  { processos: 2.0, seguranca: 1.5 },
                industria:  { processos: 2.0, qualidade: 2.0, conformidade: 2.0 },
            },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "investidor",
            titulo: `${Icone('briefcase',13)} Visita de Investidor`,
            descricao: "Investidor presente. Ganhos financeiros são maiores, perdas também.",
            modifierPorSetor: {
                default: { financeiro: 2.0 },
            },
            gestorEffects: { capitalPolitico: +2 },
            duracao: 1
        },
        {
            id: "rotatividade",
            titulo: `${Icone('door-open',13)} Alta Rotatividade`,
            descricao: "Muitas saídas simultâneas. O indicador de pessoas está hipersensível.",
            
            modifierPorSetor: {
                default: { rh: 2.0 },
            },
            gestorEffects: { reputacaoInterna: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "acidente_operacional",
            titulo: `${Icone('siren',13)} Incidente Operacional`,
            descricao: "Ocorrência inesperada na operação. Decisões de segurança têm impacto dobrado.",
            modifierPorSetor: {
                tecnologia: { seguranca: 2.0, qualidade: 1.5 },
                varejo:     { processos: 2.0, rh: 1.5 },
                logistica:  { seguranca: 2.0, frota: 1.5 },
                industria:  { seguranca: 2.0, manutencao: 1.5 },
            },
            gestorEffects: { capitalPolitico: -1, esgotamento: +1 },
            duracao: 2
        },
        {
            id: "reconhecimento_setor",
            titulo: `${Icone('medal',13,'#FFD700')} Reconhecimento do Setor`,
            descricao: "A empresa foi citada positivamente pela mídia especializada.",
            
            modifierPorSetor: {
                tecnologia: { reputacao: 1.5, clientes: 1.2 },
                varejo:     { marca: 1.5, clientes: 1.2 },
                logistica:  { clientes: 1.5, sla: 1.2 },
                industria:  { clientes: 1.5, qualidade: 1.2 },
            },
            gestorEffects: { capitalPolitico: +1, reputacaoInterna: +1 },
            duracao: 1
        },
    ];

    
    function _resolverModifier(ev, sector) {
        if (ev.modifierPorSetor) {
            return ev.modifierPorSetor[sector] || ev.modifierPorSetor.default || {};
        }
        
        return ev.modifier || {};
    }

    let _usedIds = new Set();

    function sortear(currentRound, storyState = null, gestor = null, sector = null) {
        const prob = Math.min(0.15 + currentRound * 0.01, 0.40);
        if (Math.random() > prob) return null;

        const disponiveis = POOL.filter(ev => !_usedIds.has(ev.id));
        if (!disponiveis.length) {
            _usedIds.clear();
            return sortear(currentRound, storyState, gestor, sector);
        }

        
        const _emitir = (ev) => {
            const modifier = _resolverModifier(ev, sector);
            return { ...ev, modifier, expiresAt: currentRound + ev.duracao - 1 };
        };

        if (!storyState) {
            const ev = disponiveis[Math.floor(Math.random() * disponiveis.length)];
            _usedIds.add(ev.id);
            return _emitir(ev);
        }

        const flags     = storyState.flags || [];
        const reputacao = storyState.reputacaoMercado || "boa";
        const esg       = gestor?.esgotamento ?? 5;
        const capPol    = gestor?.capitalPolitico ?? 5;

        const poolPonderado = disponiveis.map(ev => {
            let peso = 1;

            
            if (flags.includes("lideranca_toxica")      && ev.id === "rotatividade")         peso = 4;
            if (flags.includes("rh_negligenciado")      && ev.id === "greve")                peso = 3;
            if (flags.includes("ignorou_seguranca")     && ev.id === "auditoria")            peso = 4;
            if (flags.includes("ignorou_seguranca")     && ev.id === "acidente_operacional") peso = 3;
            if (flags.includes("crescimento_sem_caixa") && ev.id === "investidor")           peso = 0.2;
            if (flags.includes("crescimento_saudavel")  && ev.id === "investidor")           peso = 3;
            if (flags.includes("investiu_em_inovacao")  && ev.id === "viral_positivo")       peso = 3;

            
            if (esg >= 7 && ev.id === "greve")          peso *= 1.5;
            if (capPol <= 3 && ev.id === "auditoria")   peso *= 2;

            
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
        return _emitir(evEscolhido);
    }

    function resetar() { _usedIds.clear(); }

    
    const _LABELS_IND = {
        financeiro:    `${Icone('wallet',13)} Financeiro`,
        rh:            `${Icone('users',13)} RH`,
        clientes:      `${Icone('star',13)} Clientes`,
        processos:     `${Icone('settings',13)} Processos`,
        margem:        `${Icone('chart-column',13)} Margem`,
        estoque:       `${Icone('package',13)} Estoque`,
        marca:         `${Icone('tag',13)} Marca`,
        digital:       `${Icone('monitor',13)} Digital`,
        sla:           `${Icone('timer',13)} SLA`,
        frota:         `${Icone('truck',13)} Frota`,
        seguranca:     `${Icone('shield',13)} Segurança`,
        tecnologia:    `${Icone('satellite-dish',13)} Tecnologia`,
        manutencao:    `${Icone('wrench',13)} Manutenção`,
        qualidade:     `${Icone('target',13)} Qualidade`,
        conformidade:  `${Icone('clipboard-list',13)} Conformidade`,
        produtividade: `${Icone('zap',13)} Produtividade`,
        reputacao:     `${Icone('megaphone',13)} Reputação`,
        inovacao:      `${Icone('microscope',13)} Inovação`,
    };

    
    const _IND_POR_SETOR = {
        tecnologia: ["financeiro","rh","clientes","qualidade","produtividade","reputacao","inovacao","seguranca"],
        varejo:     ["financeiro","rh","clientes","processos","margem","estoque","marca","digital"],
        logistica:  ["financeiro","rh","clientes","processos","sla","frota","seguranca","tecnologia"],
        industria:  ["financeiro","rh","clientes","processos","seguranca","manutencao","qualidade","conformidade"],
    };

    
    function descricaoIndicadores(ev, sector) {
        const modifier = _resolverModifier(ev, sector);
        if (!modifier || !Object.keys(modifier).length) return "";
        const validos = _IND_POR_SETOR[sector] || [];
        const partes  = Object.entries(modifier)
            .filter(([k]) => !sector || validos.includes(k))
            .map(([k, mult]) => {
                const label = _LABELS_IND[k] || k;
                return `${label} ×${mult}`;
            });
        return partes.join(" · ");
    }

    
    function descricaoGestor(ev) {
        if (!ev?.gestorEffects) return "";
        const labels = {
            reputacaoInterna: `${Icone('user',13)} Reputação`,
            capitalPolitico:  `${Icone('landmark',13)} Cap. Político`,
            esgotamento:      `${Icone('battery',13)} Esgotamento`,
        };
        return Object.entries(ev.gestorEffects)
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => `${labels[k] || k} ${v > 0 ? "+" : ""}${v}`)
            .join(" · ");
    }

    return { sortear, resetar, descricaoIndicadores, descricaoGestor };
})();
