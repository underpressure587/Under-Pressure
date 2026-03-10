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
