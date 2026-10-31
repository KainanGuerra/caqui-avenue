# Geração do PDF da jornada

`gerar_jornada.py` monta `documentation/JORNADA_DO_USUARIO.pdf` a partir dos diagramas Mermaid de `documentation/diagrams/` (fonte única) e das etiquetas dos arquivos de `documentation/bdd/` (tabela de rastreabilidade).

## Dependências

- Python 3 com `reportlab` (`python3 -m venv .venv && .venv/bin/pip install reportlab`).
- `@mermaid-js/mermaid-cli` (`npx` baixa na primeira execução) e um Chrome ou Chromium instalado.

## Uso

```bash
CHROME_PATH=/usr/bin/google-chrome .venv/bin/python scripts/pdf/gerar_jornada.py
```

Variáveis: `CHROME_PATH` (padrão `/usr/bin/google-chrome`), `MMDC` (comando do mermaid-cli, padrão `npx --yes @mermaid-js/mermaid-cli`). A configuração visual dos diagramas está em `mermaid-config.json`. Os PNG intermediários vão para uma pasta temporária.
