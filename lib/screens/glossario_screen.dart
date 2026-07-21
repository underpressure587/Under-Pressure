import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_widgets.dart';
import '../services/glossario_service.dart';

// ═══════════════════════════════════════════════════════
//  GLOSSÁRIO · sincronizado com o Firestore (Painel de Controle),
//  com fallback offline pro conjunto padrão embarcado no app.
// ═══════════════════════════════════════════════════════

class GlossarioScreen extends StatefulWidget {
  const GlossarioScreen({super.key});

  @override
  State<GlossarioScreen> createState() => _GlossarioScreenState();
}

class _GlossarioScreenState extends State<GlossarioScreen> {
  final _search = TextEditingController();
  String _query = '';
  String _categoria = 'Todos';

  @override
  void initState() {
    super.initState();
    // Toda vez que a tela abre, busca de novo no Firestore. Se vier algo
    // diferente do que já está na tela, o ValueListenableBuilder abaixo
    // redesenha sozinho; se não vier nada de diferente (ou falhar), a
    // tela continua exatamente como abriu.
    GlossarioService.sincronizar();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<TermoGlossario> _filtrar(
      List<TermoGlossario> todos, String categoriaEfetiva) {
    var lista = todos;
    if (categoriaEfetiva != 'Todos') {
      lista = lista.where((t) => t.cat == categoriaEfetiva).toList();
    }
    if (_query.isNotEmpty) {
      final q = _query.toLowerCase();
      lista = lista
          .where((t) =>
              t.termo.toLowerCase().contains(q) ||
              t.def.toLowerCase().contains(q))
          .toList();
    }
    return lista;
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<TermoGlossario>>(
      valueListenable: GlossarioService.termos,
      builder: (context, todos, _) {
        final categorias = [
          'Todos',
          ...{for (final t in todos) t.cat},
        ];
        // Se a categoria selecionada não existe mais no conjunto atual
        // (ex: seção renomeada no painel), usa "Todos" só pra filtrar —
        // sem mexer no estado durante o build.
        final categoriaEfetiva =
            categorias.contains(_categoria) ? _categoria : 'Todos';
        final lista = _filtrar(todos, categoriaEfetiva);

        return Scaffold(
          backgroundColor: AppTheme.bg,
          body: SafeArea(
            child: Column(children: [
              // ── Header ──────────────────────────────────
              Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppTheme.line)),
                ),
                child: Row(children: [
                  const BackBtn(),
                  const SizedBox(width: 10),
                  const Text('📚', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 6),
                  Text('Glossário',
                      style: AppTheme.syne(
                          size: 16,
                          weight: FontWeight.w700,
                          color: AppTheme.t1)),
                  const Spacer(),
                  Text('${lista.length} termos',
                      style: AppTheme.inter(size: 11, color: AppTheme.t3)),
                ]),
              ),

              // ── Search ──────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: TextField(
                  controller: _search,
                  onChanged: (v) => setState(() => _query = v),
                  style: AppTheme.inter(size: 14, color: AppTheme.t1),
                  decoration: InputDecoration(
                    hintText: 'Buscar termo...',
                    hintStyle: AppTheme.inter(size: 14, color: AppTheme.t3),
                    prefixIcon: const Icon(Icons.search_rounded,
                        size: 18, color: AppTheme.t3),
                    suffixIcon: _query.isNotEmpty
                        ? GestureDetector(
                            onTap: () {
                              _search.clear();
                              setState(() => _query = '');
                            },
                            child: const Icon(Icons.close_rounded,
                                size: 16, color: AppTheme.t3),
                          )
                        : null,
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

              // ── Categorias ───────────────────────────────
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  itemCount: categorias.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 6),
                  itemBuilder: (_, i) {
                    final cat = categorias[i];
                    final active = categoriaEfetiva == cat;
                    return GestureDetector(
                      onTap: () => setState(() => _categoria = cat),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 2),
                        decoration: BoxDecoration(
                          color: active ? AppTheme.primary : AppTheme.bg3,
                          borderRadius: BorderRadius.circular(99),
                          border: Border.all(
                              color:
                                  active ? AppTheme.primary : AppTheme.line2),
                        ),
                        child: Text(cat,
                            style: AppTheme.inter(
                              size: 11,
                              weight: FontWeight.w600,
                              color: active ? Colors.black : AppTheme.t2,
                            )),
                      ),
                    );
                  },
                ),
              ),

              const Divider(color: AppTheme.line, height: 1),

              // ── Lista ────────────────────────────────────
              Expanded(
                child: lista.isEmpty
                    ? Center(
                        child: Text('Nenhum termo encontrado.',
                            style: AppTheme.inter(color: AppTheme.t3)))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: lista.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) =>
                            _TermoCard(termo: lista[i], query: _query),
                      ),
              ),
            ]),
          ),
        );
      },
    );
  }
}

// ── Termo card ────────────────────────────────────────
class _TermoCard extends StatefulWidget {
  final TermoGlossario termo;
  final String query;

  const _TermoCard({required this.termo, required this.query});

  @override
  State<_TermoCard> createState() => _TermoCardState();
}

class _TermoCardState extends State<_TermoCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _expanded ? AppTheme.primaryBg : AppTheme.bg2,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: _expanded ? AppTheme.primaryBd : AppTheme.line2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              // Categoria badge
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: _catColor(widget.termo.cat).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(widget.termo.cat,
                    style: AppTheme.inter(
                        size: 9,
                        weight: FontWeight.w600,
                        color: _catColor(widget.termo.cat))),
              ),
              const Spacer(),
              Icon(
                _expanded
                    ? Icons.keyboard_arrow_up_rounded
                    : Icons.keyboard_arrow_down_rounded,
                size: 18,
                color: AppTheme.t3,
              ),
            ]),
            const SizedBox(height: 6),
            _HighlightText(
              text: widget.termo.termo,
              query: widget.query,
              style: AppTheme.syne(
                  size: 14, weight: FontWeight.w700, color: AppTheme.t1),
            ),
            if (_expanded) ...[
              const SizedBox(height: 8),
              const Divider(color: AppTheme.line2, height: 1),
              const SizedBox(height: 8),
              _HighlightText(
                text: widget.termo.def,
                query: widget.query,
                style: AppTheme.inter(
                    size: 13, color: AppTheme.t2, height: 1.6),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // Cores fixas pras categorias padrão embarcadas; qualquer categoria
  // vinda da nuvem (nome customizado, criado no Painel de Controle) recebe
  // uma cor consistente derivada do próprio nome, em vez de cair tudo cinza.
  static const _coresCiclo = [
    AppTheme.primary,
    AppTheme.ok,
    Color(0xFF5B8DEF),
    Color(0xFF1FB885),
    AppTheme.pur,
    AppTheme.warn,
    Color(0xFFE8711A),
  ];

  Color _catColor(String cat) {
    switch (cat) {
      case 'Jogo':
        return AppTheme.primary;
      case 'Finanças':
        return AppTheme.ok;
      case 'Tecnologia':
        return const Color(0xFF5B8DEF);
      case 'Operações':
        return const Color(0xFF1FB885);
      case 'RH':
        return AppTheme.pur;
      case 'Regulatório':
        return AppTheme.warn;
      case 'Estratégia':
        return const Color(0xFFE8711A);
      default:
        return _coresCiclo[cat.hashCode.abs() % _coresCiclo.length];
    }
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
