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
