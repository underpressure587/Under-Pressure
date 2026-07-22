import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import '../services/glossario_service.dart';

// ═══════════════════════════════════════════════════════
//  GLOSSÁRIO · visual espelhado no do site (glossary-term,
//  glossary-tab-btn, glossary-section-title), só que como tela
//  normal de navegação em vez de overlay/modal.
// ═══════════════════════════════════════════════════════

class _Secao {
  final String categoria;
  final List<TermoGlossario> termos;
  _Secao(this.categoria, this.termos);
}

class GlossarioScreen extends StatefulWidget {
  const GlossarioScreen({super.key});

  @override
  State<GlossarioScreen> createState() => _GlossarioScreenState();
}

class _GlossarioScreenState extends State<GlossarioScreen> {
  final _search = TextEditingController();
  String _query = '';
  String _abaAtiva = 'todos';

  @override
  void initState() {
    super.initState();
    // Toda vez que a tela abre, busca de novo no Firestore. Se vier algo
    // diferente do que já está na tela, o ValueListenableBuilder abaixo
    // redesenha sozinho.
    GlossarioService.sincronizar();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<_Secao> _agrupar(List<TermoGlossario> lista) {
    final mapa = <String, List<TermoGlossario>>{};
    for (final t in lista) {
      mapa.putIfAbsent(t.cat, () => []).add(t);
    }
    return mapa.entries.map((e) => _Secao(e.key, e.value)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<TermoGlossario>>(
      valueListenable: GlossarioService.termos,
      builder: (context, todos, _) {
        final secoes = _agrupar(todos);

        // Se a aba selecionada não existe mais no conjunto atual (ex:
        // seção renomeada no painel), usa "todos" só pra filtrar — sem
        // mexer no estado durante o build.
        final abaValida = _abaAtiva == 'todos' ||
            secoes.any((s) => s.categoria == _abaAtiva);
        final abaEfetiva = abaValida ? _abaAtiva : 'todos';

        final q = _query.trim().toLowerCase();
        final secoesFiltradas = secoes
            .where((s) => abaEfetiva == 'todos' || s.categoria == abaEfetiva)
            .map((s) => _Secao(
                  s.categoria,
                  q.isEmpty
                      ? s.termos
                      : s.termos
                          .where((t) =>
                              t.termo.toLowerCase().contains(q) ||
                              t.def.toLowerCase().contains(q))
                          .toList(),
                ))
            .where((s) => s.termos.isNotEmpty)
            .toList();

        // Na aba "Todos" mostra o título de cada seção; numa aba
        // específica omite (já está selecionada acima).
        final mostrarTitulo = abaEfetiva == 'todos';

        return Scaffold(
          backgroundColor: AppTheme.bg,
          body: SafeArea(
            child: Column(children: [
              // ── Header ── (título serifado, sem contador — igual ao site)
              Container(
                padding: const EdgeInsets.fromLTRB(24, 14, 24, 12),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppTheme.line)),
                ),
                child: Row(children: [
                  const BackBtn(),
                  const SizedBox(width: 12),
                  Text('Glossário',
                      style: AppTheme.syne(
                          size: 16,
                          weight: FontWeight.w700,
                          color: AppTheme.t1)),
                ]),
              ),

              // ── Busca ──
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                child: TextField(
                  controller: _search,
                  onChanged: (v) => setState(() => _query = v),
                  style: AppTheme.inter(size: 13.6, color: AppTheme.t1),
                  decoration: InputDecoration(
                    hintText: 'Buscar termo...',
                    hintStyle: AppTheme.inter(size: 13.6, color: AppTheme.t3),
                    prefixIcon: const Icon(Icons.search_rounded,
                        size: 16, color: AppTheme.t3),
                    filled: true,
                    fillColor: AppTheme.bg2,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppTheme.line2)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppTheme.line2)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                            color: AppTheme.primary, width: 1.5)),
                  ),
                ),
              ),

              // ── Abas (sublinhado animado, igual ao site) ──
              Container(
                height: 40,
                margin: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppTheme.line)),
                ),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _TabButton(
                      label: 'Todos',
                      active: abaEfetiva == 'todos',
                      onTap: () => setState(() => _abaAtiva = 'todos'),
                    ),
                    for (final s in secoes)
                      _TabButton(
                        label: s.categoria,
                        active: abaEfetiva == s.categoria,
                        onTap: () => setState(() => _abaAtiva = s.categoria),
                      ),
                  ],
                ),
              ),

              // ── Lista ──
              Expanded(
                child: secoesFiltradas.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            _query.isEmpty
                                ? 'Nenhum termo encontrado.'
                                : 'Nenhum termo encontrado para "$_query".',
                            textAlign: TextAlign.center,
                            style:
                                AppTheme.inter(size: 13.6, color: AppTheme.t3),
                          ),
                        ),
                      )
                    : ListView(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                        children: [
                          for (final s in secoesFiltradas) ...[
                            if (mostrarTitulo)
                              Container(
                                margin: const EdgeInsets.only(
                                    top: 14, bottom: 8),
                                padding: const EdgeInsets.only(bottom: 4),
                                decoration: BoxDecoration(
                                  border: Border(
                                    bottom: BorderSide(
                                        color: AppTheme.primary
                                            .withOpacity(.28)),
                                  ),
                                ),
                                child: Text(
                                  s.categoria.toUpperCase(),
                                  style: AppTheme.inter(
                                    size: 11,
                                    weight: FontWeight.w700,
                                    color: AppTheme.primary,
                                    letterSpacing: 1.1,
                                  ),
                                ),
                              ),
                            for (final t in s.termos)
                              _TermoRow(termo: t, query: _query),
                          ],
                        ],
                      ),
              ),
            ]),
          ),
        );
      },
    );
  }
}

// ── Aba com sublinhado animado ─────────────────────────
class _TabButton extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _TabButton(
      {required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.only(right: 4),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Text(
                label,
                style: AppTheme.inter(
                  size: 11,
                  weight: FontWeight.w700,
                  color: active ? AppTheme.primary : AppTheme.t3,
                ),
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 2,
              width: active ? 28 : 0,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(2),
                boxShadow: active
                    ? [
                        BoxShadow(
                            color: AppTheme.primary.withOpacity(.5),
                            blurRadius: 6)
                      ]
                    : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Linha de termo — igual ao site: sem card, sem expandir,
//    palavra em serifada dourada, definição sempre visível abaixo. ──
class _TermoRow extends StatelessWidget {
  final TermoGlossario termo;
  final String query;

  const _TermoRow({required this.termo, required this.query});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.line)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _HighlightText(
            text: termo.termo,
            query: query,
            style: AppTheme.syne(
                size: 16, weight: FontWeight.w700, color: AppTheme.primary),
          ),
          const SizedBox(height: 5),
          _HighlightText(
            text: termo.def,
            query: query,
            style:
                AppTheme.inter(size: 13.6, color: AppTheme.t2, height: 1.7),
          ),
        ],
      ),
    );
  }
}

// ── Highlight text ─────────────────────────────────────
class _HighlightText extends StatelessWidget {
  final String text;
  final String query;
  final TextStyle style;

  const _HighlightText(
      {required this.text, required this.query, required this.style});

  @override
  Widget build(BuildContext context) {
    if (query.isEmpty) {
      return Text(text, style: style);
    }

    final lower = text.toLowerCase();
    final q = query.toLowerCase();
    final spans = <TextSpan>[];
    int start = 0;

    while (true) {
      final idx = lower.indexOf(q, start);
      if (idx == -1) {
        spans.add(TextSpan(text: text.substring(start)));
        break;
      }
      if (idx > start) {
        spans.add(TextSpan(text: text.substring(start, idx)));
      }
      spans.add(TextSpan(
        text: text.substring(idx, idx + q.length),
        style: style.copyWith(
          backgroundColor: AppTheme.primary.withOpacity(0.3),
          color: AppTheme.t1,
        ),
      ));
      start = idx + q.length;
    }

    return RichText(text: TextSpan(style: style, children: spans));
  }
}
