/* ═══════════════════════════════════════════════════════
   BETA · ENGINE · Orquestra o fluxo completo do jogo
   v5.1 — situações por setor, gestor+imprevisto integrados,
          interdependências para todos os setores,
          melhor alternativa no feedback.
          [BUGS 1-24 CORRIGIDOS]
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

/* ── Constantes de score do gestor ───────────────────── */
// BUG 18 FIX: substituído número mágico 1.3 por constante explicada.
// Max bruto = reputacaoInterna(10)*5 + capitalPolitico(10)*5 + (10-esgotamento(0))*3 = 130
// SCORE_GESTOR_DIVISOR = 130/100 = 1.30 → normaliza para escala 0–100
const SCORE_GESTOR_DIVISOR = 1.30;

// BUG 12 FIX: limite de entradas no histórico (1 por rodada × 15 rodadas = 15 entradas,
//   mas aumentamos para 100 para suportar modos de jogo estendidos sem crescimento ilimitado)
const HISTORICO_MAX = 100;

let _ui = {};

// BUG 14 FIX: trava global contra duplo-avanço de rodada / race condition
let _processandoEscolha = false;

// BUG 16 FIX: trava global contra dupla finalização de jogo
let _jogoEncerrado = false;

/* ── Flag de manutenção ──────────────────────────────
   Setada por UIManutencao via Engine.setPausado(true/false).
   Bloqueia processarEscolha, _preparaRodada e _avancarRodada
   sem derrubar o estado — ao desativar manutenção o jogo retoma. */
const Engine = {
    pausado: false,
    setPausado(v) {
        this.pausado = !!v;
        if (v) console.info("[Engine] Jogo pausado — manutenção ativa.");
        else   console.info("[Engine] Jogo retomado — manutenção encerrada.");
    }
};

function registrarUI(callbacks) { _ui = callbacks; }

/* ═══════════════════════════════════════════════════════
   INICIAR JOGO
═══════════════════════════════════════════════════════ */
function iniciar(sectorId, groupName, companyName, modoSala) {
    // BUG 14/16 FIX: resetar travas ao iniciar nova partida
    _processandoEscolha = false;
    _jogoEncerrado      = false;

    // BUG 1 FIX: usa .length dinâmico em vez de hardcoded * 4
    const setoresDisponiveis = Object.keys(EMPRESAS);
    const setorFinal = sectorId === "aleatorio"
        ? setoresDisponiveis[Math.floor(Math.random() * setoresDisponiveis.length)]
        : sectorId;

    BetaImprevisto.resetar();

    const state = BetaState.init(setorFinal, groupName, companyName);

    // BUG 4 FIX: valida retorno do init antes de continuar qualquer operação
    if (!state) {
        console.error("[Engine] BetaState.init() retornou inválido para o setor:", setorFinal);
        return;
    }

    state.companyInfo = COMPANY_INFO[setorFinal] || null;

    // BUG 2 FIX: fallback para o pool completo se nenhuma situação bater o setor,
    //   evitando situacaoAtual = undefined que quebrava BetaIndicadores.avaliarDecisaoContextual
    let situacoesFiltradas = SITUACOES_INICIAIS.filter(s =>
        !s.setores || s.setores.includes(setorFinal)
    );
    if (situacoesFiltradas.length === 0) {
        console.warn("[Engine] Nenhuma situação para setor:", setorFinal, "— usando pool completo.");
        situacoesFiltradas = SITUACOES_INICIAIS;
    }
    state.situacaoAtual = situacoesFiltradas[
        Math.floor(Math.random() * situacoesFiltradas.length)
    ] || null;

    const empresa   = EMPRESAS[setorFinal];
    const introList = empresa.intros || (empresa.intro ? [empresa.intro] : []);

    // BUG 3: filtro i < introList.length é intencional — garante que introIndex
    // nunca referencia intro inexistente. Conjuntos de rounds sem intro correspondente
    // são ignorados por design, não silenciosamente quebrados.
    const indicesValidos = (empresa.rounds || [])
        .map((r, i) => (r && r.length > 0 ? i : -1))
        .filter(i => i !== -1 && i < introList.length);

    const introIndex = indicesValidos.length > 0
        ? indicesValidos[Math.floor(Math.random() * indicesValidos.length)]
        : 0;

    const introSorteada = introList[introIndex] || null;

    state.introIndex = introIndex;
    BetaState.aplicarIndicadoresHistoria(introIndex);

    if (empresa.rounds && empresa.rounds[introIndex]?.length > 0) {
        state.gameRounds  = empresa.rounds[introIndex];
        state.totalRounds = state.gameRounds.length;
    } else {
        state.gameRounds  = [];
        state.totalRounds = 0;
    }

    if (modoSala) {
        state.phase = "playing";
        _preparaRodada(state);
        if (typeof window !== "undefined") window._initPrevIndicators?.(state.indicators);
        return state;
    }

    if (introSorteada) {
        state.introAtual = introSorteada;
        state.phase = "intro";
        _ui.mostrarIntro?.(state, empresa);
    } else {
        state.phase = "playing";
        _preparaRodada(state);
        if (typeof window !== "undefined") window._initPrevIndicators?.(state.indicators);
        _ui.mostrarTela?.("screen-game");
        _ui.renderSidebar?.(state, empresa);
        _ui.renderRodada?.(state);
    }
}

function iniciarRodadas() {
    const state = BetaState.get();
    // BUG 4 FIX: guard contra state nulo
    if (!state) {
        console.error("[Engine] iniciarRodadas: state é null.");
        return;
    }
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
    // MANUTENÇÃO: bloqueia sem crashar — estado preservado para retomada
    if (Engine.pausado) {
        console.warn("[Engine] processarEscolha bloqueado: manutenção ativa.");
        return;
    }
    // BUG 14 FIX: previne duplo-disparo (double-tap, multiplayer race condition)
    if (_processandoEscolha) {
        console.warn("[Engine] processarEscolha ignorado: já em processamento.");
        return;
    }
    _processandoEscolha = true;

    const state = BetaState.get();

    // BUG 4 FIX: guard state nulo
    if (!state) {
        console.error("[Engine] processarEscolha: state é null.");
        _processandoEscolha = false;
        return;
    }

    // BUG 5/6 FIX: valida existência do round ANTES de qualquer acesso a .choices
    const round = state.gameRounds[state.currentRound];
    if (!round) {
        console.error("[Engine] processarEscolha: round", state.currentRound,
                      "não existe. gameRounds.length =", state.gameRounds.length);
        _processandoEscolha = false;
        return;
    }

    const choicesAtivas = state.choicesAtivas || round.choices;

    // BUG 7 FIX: loga índice inválido em vez de falhar silenciosamente
    const choice = choicesAtivas[choiceIndex];
    if (!choice) {
        console.warn("[Engine] processarEscolha: choiceIndex", choiceIndex,
                     "inválido. choicesAtivas.length =", choicesAtivas.length);
        _processandoEscolha = false;
        return;
    }

    // BUG 8 FIX: _eventoAtivo já guarda activeEvents undefined (ver implementação)
    const eventoAtivo   = _eventoAtivo(state);
    const efeitosFinais = BetaImpacto.calcular(
        { ...(choice.effects || {}) },
        eventoAtivo ? [eventoAtivo] : []
    );

    // BUG 9: avaliarDecisaoContextual recebe indicadores válidos pois state.indicators
    //   é inicializado em BetaState.init e sempre clampado — não pode ser undefined aqui
    const avaliacao = BetaIndicadores.avaliarDecisaoContextual(
        efeitosFinais, state.indicators, state.situacaoAtual
    );

    // BUG 10 FIX: snapshot completo antes dos efeitos para delta preciso
    const indicadoresAntes = { ...state.indicators };
    BetaState.applyEffects(efeitosFinais);
    _aplicarInterdependencias(state.sector, state.indicators);

    // BUG 24 FIX: clamp após interdependências (que escrevem diretamente sem clamp)
    _clampIndicadores(state.indicators);

    // BUG 10 FIX: usa a UNIÃO das chaves — captura indicadores que surgiram
    //   apenas pós-interdependências sem comparar erroneamente com 0
    const efeitosLiquidos = {};
    const todasChaves = new Set([
        ...Object.keys(state.indicators),
        ...Object.keys(indicadoresAntes)
    ]);
    todasChaves.forEach(k => {
        // Chave nova (só em indicators): delta = newValue - newValue = 0 → não entra
        const antes  = indicadoresAntes[k] ?? (state.indicators[k] ?? 0);
        const depois = state.indicators[k] ?? 0;
        const delta  = depois - antes;
        if (delta !== 0) efeitosLiquidos[k] = delta;
    });

    const storyStateAntes = {
        flags:      [...state.storyState.flags],
        conquistas: [...state.storyState.conquistas]
    };

    // BUG 11 FIX: erros do StoryEngine logados com contexto, não engolidos silenciosamente
    try { StoryEngine.avaliarFase(state);                      } catch(e) { console.warn("[Engine] avaliarFase:", e); }
    try { StoryEngine.registrarFlags(choice, state, avaliacao);} catch(e) { console.warn("[Engine] registrarFlags:", e); }
    try { _atualizarSituacaoStatus(state);                     } catch(e) { console.warn("[Engine] situacaoStatus:", e); }

    // BUG 12 FIX: addHistory aceita limite máximo para evitar crescimento ilimitado
    BetaState.addHistory({
        rodada:      state.currentRound + 1,
        titulo:      round.title,
        escolha:     choice.text,
        avaliacao,
        efeitos:     efeitosFinais,
        ensinamento: choice.ensinamento || ""
    }, HISTORICO_MAX);

    const _temEfeitoReal = obj => obj && Object.values(obj).some(v => v !== 0);
    const efeitosGestor  = _temEfeitoReal(choice.gestorEffects)
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
        efeitosFinais:       efeitosLiquidos,
        eventoAtivo,
        history:             state.history,
        storyState:          state.storyState,
        storyStateAnterior:  storyStateAntes,
        efeitosGestor,
        stakeholderReacao,
        melhorAlternativa,
    });

    const isGameOver    = BetaIndicadores.isGameOver(state.indicators);
    const motivoMandato = _verificarMandatoEncerrado(state.gestor);

    // BUG 14 FIX: libera trava ANTES do callback — o callback chama _avancarRodada
    //   ou _encerrar, que são funções separadas e não precisam da trava desta função
    _processandoEscolha = false;

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
    // MANUTENÇÃO: não prepara nova rodada enquanto pausado
    if (Engine.pausado) return;
    // BUG 5/6 FIX: round pode ser undefined se gameRounds estiver vazio
    const round = state.gameRounds[state.currentRound];
    if (!round) {
        console.warn("[Engine] _preparaRodada: round inexistente em currentRound =",
                     state.currentRound, "/ total =", state.gameRounds.length);
        return;
    }

    let filtradas = [];
    try {
        filtradas = StoryEngine.choicesDisponiveis(round, state.storyState, state.indicators);
    } catch(e) {
        console.warn("[Engine] choicesDisponiveis erro, usando round.choices como fallback:", e);
    }

    // BUG 13 FIX: fallback explícito — se StoryEngine retornar < 2 opções,
    //   usa round.choices bruto como último recurso (melhor ter opções do que travar)
    state.choicesAtivas = (Array.isArray(filtradas) && filtradas.length >= 2)
        ? filtradas
        : (round.choices || []);
}

/* ═══════════════════════════════════════════════════════
   AVANÇAR RODADA
═══════════════════════════════════════════════════════ */
function _avancarRodada() {
    // MANUTENÇÃO: não avança rodada enquanto pausado
    if (Engine.pausado) return;
    BetaState.nextRound();
    const state = BetaState.get();

    // BUG 15: BetaImprevisto.sortear já controla repetição internamente via _usedIds
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
    // BUG 16 FIX: impede dupla finalização (ex.: isGameOver + totalRounds no mesmo tick)
    if (_jogoEncerrado) {
        console.warn("[Engine] _encerrar chamado mais de uma vez. Motivo ignorado:", motivo);
        return;
    }
    _jogoEncerrado = true;

    const state = BetaState.get();
    BetaState.setPhase("result");

    // BUG 17: tratamento especial de tecnologia é por design (módulo de score próprio)
    const score = state.sector === "tecnologia"
        ? IndicadoresTecnologia.scoreTotal(state.indicators)
        : BetaIndicadores.scoreTotal(state.indicators, state.sector);

    const scoreFinal = Math.round(score * 5); // 0–100

    const g = state.gestor;
    // BUG 18 FIX: divisor nomeado (SCORE_GESTOR_DIVISOR = 1.30)
    //   Max bruto: 10*5 + 10*5 + 10*3 = 130  →  130 / 1.30 = 100 (escala 0–100)
    const scoreGestor = Math.round(
        (g.reputacaoInterna * 5 + g.capitalPolitico * 5 + (10 - g.esgotamento) * 3)
        / SCORE_GESTOR_DIVISOR
    );

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

/* BUG 19 FIX: default adicionado — setor inválido loga aviso em vez de
   silenciar e deixar indicadores sem atualização */
function _aplicarInterdependencias(sector, indicators) {
    switch (sector) {
        case "tecnologia": IndicadoresTecnologia.aplicarInterdependencias(indicators); break;
        case "varejo":     IndicadoresVarejo.aplicarInterdependencias(indicators);     break;
        case "logistica":  IndicadoresLogistica.aplicarInterdependencias(indicators);  break;
        case "industria":  IndicadoresIndustria.aplicarInterdependencias(indicators);  break;
        default:
            console.warn("[Engine] _aplicarInterdependencias: setor desconhecido:", sector,
                         "— indicadores não atualizados.");
    }
}

/* BUG 24 FIX: força todos os indicadores a ficarem em [0, 20]
   após _aplicarInterdependencias, que pode escrever diretamente nos
   indicadores sem clampar — gerando valores negativos ou > 20 */
function _clampIndicadores(indicators) {
    Object.keys(indicators).forEach(k => {
        indicators[k] = Math.max(0, Math.min(20, indicators[k]));
    });
}

/* BUG 20 FIX: CRÍTICO — condições trocadas de ordem.
   ANTES (bugado):
     if (impactoRH <= -3) → capturava TODOS os negativos ≤ -3, inclusive ≤ -5
     else if (impactoRH <= -5) → NUNCA EXECUTAVA (já caiu no if anterior)
   DEPOIS (correto):
     Condição mais restritiva primeiro → ≤ -5 aplica penalidade severa (-2)
     Condição menos restritiva depois → ≤ -3 aplica penalidade moderada (-1) */
function _calcularEfeitosGestorAutomatico(efeitosEmpresa, avaliacao, state) {
    const efeitos = { reputacaoInterna: 0, capitalPolitico: 0, esgotamento: 0 };

    const impactoRH = (efeitosEmpresa.rh       ?? 0)
                    + (efeitosEmpresa.clima     ?? 0)
                    + (efeitosEmpresa.seguranca ?? 0) * 0.5
                    + (efeitosEmpresa.frota     ?? 0) * 0.3;

    if      (impactoRH <= -5) efeitos.reputacaoInterna -= 2; // severo — DEVE VIR PRIMEIRO
    else if (impactoRH <= -3) efeitos.reputacaoInterna -= 1; // moderado
    else if (impactoRH >=  3) efeitos.reputacaoInterna += 1; // positivo

    const impactoFin = efeitosEmpresa.financeiro ?? 0;
    if      (impactoFin >=  3) efeitos.capitalPolitico += 1;
    else if (impactoFin <= -3) efeitos.capitalPolitico -= 1;

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

/* BUG 21: indicators[k] ?? 10 é intencional — 10 é o ponto médio da escala
   [0,20], logo um indicador desconhecido assume urgência neutra em vez de
   urgência máxima (via ?? 0) ou nenhuma urgência (via ?? 20) */
function _scoreSimples(effects, indicators) {
    return Object.entries(effects).reduce((acc, [k, v]) => {
        const atual    = indicators[k] ?? 10;
        const urgencia = atual <= 4 ? 2.5 : atual <= 7 ? 1.5 : 1.0;
        return acc + (v > 0 ? v * urgencia : v * (atual <= 6 ? urgencia : 1.0));
    }, 0);
}

/* BUG 22 FIX: histerese nos thresholds — evita oscillação rápida de status.
   Zonas separadas com gap entre elas:
     ≥ 12 + 0 críticos  → "resolvida"
     9–12 + ≤1 críticos → "melhorando"
     ≤ 6 ou ≥2 críticos → "piorando"
     Zona 6–9           → mantém status anterior (sem mudança) */
function _atualizarSituacaoStatus(state) {
    if (state.currentRound < 3) return;

    const vals     = Object.values(state.indicators);
    const media    = vals.reduce((a, b) => a + b, 0) / vals.length;
    const criticos = vals.filter(v => v <= 4).length;
    const atual    = state.situacaoStatus;

    if (criticos === 0 && media >= 12) {
        if (atual !== "resolvida")   BetaState.setSituacaoStatus("resolvida");
        return;
    }
    if (criticos <= 1 && media >= 9 && media < 12) {
        if (atual !== "melhorando")  BetaState.setSituacaoStatus("melhorando");
        return;
    }
    if (criticos >= 2 || media <= 6) {
        if (atual !== "piorando")    BetaState.setSituacaoStatus("piorando");
        return;
    }
    // Zona intermediária (6 < media < 9, 0–1 críticos): sem mudança de status
    // — isso é intencional para evitar a oscilação do BUG 22
}

function _verificarMandatoEncerrado(gestor) {
    if (gestor.capitalPolitico <= 0) return "conselho";
    if (gestor.esgotamento >= 10)    return "burnout";
    return null;
}

/* BUG 8 FIX: guarda explícito contra activeEvents undefined ou não-array
   BUG 23: remoção de eventos expirados é responsabilidade de BetaState.nextRound()
           via removeExpiredEvents() — esta função apenas consulta o ativo corrente */
function _eventoAtivo(state) {
    if (!Array.isArray(state?.activeEvents)) return null;
    return state.activeEvents.find(e => e.expiresAt >= state.currentRound) || null;
}
