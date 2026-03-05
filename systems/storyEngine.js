/* ═══════════════════════════════════════════════════════
   BETA · STORY ENGINE · Motor narrativo BitLife-style
   v5.0 — estilo mais preciso, gestor_de_crise calibrado,
           traumas no epílogo, flags com contexto.
═══════════════════════════════════════════════════════ */

import BetaState from "../core/state.js";

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
            BetaState.addTrauma("Ambiente interno corrroído por decisões que ignoraram as pessoas.");
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

export default StoryEngine;
