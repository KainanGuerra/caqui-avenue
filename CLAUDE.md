# CLAUDE.md

## What this is

> **`caqui-invest/` é só de consulta** (case, dados, templates, checador): não se altera. Todo o trabalho vive na raiz de `avenue/`.

Repositório do grupo para o Hands On com IA (31/10/2026), case **Caqui Invest**: atendimento que escala com confiança. O problema e as regras estão em `caqui-invest/CASE.md`; os dados sintéticos em `data/` (cópia de `caqui-invest/dados/`, D18; agora é 18/11/2026, 10h BRT); o checador em `caqui-invest/ferramentas/checar_respostas.py`. A solução é a **Kaki**: agente de atendimento em que o código decide e o LLM só redige, com duas visões (cliente e suporte). Está construída; a spec está em `SPEC.md`. Stack: Nuxt 4, TypeScript, Vitest, Zod; sem banco; só local (D6).

**O objetivo é código que eu consiga explicar e defender.** Prefira a opção simples e legível e diga o porquê em `DECISIONS.md`. Eu decido a arquitetura e dirijo por prompts; a IA desenvolve, testa e verifica as regras. Explique o que mudar.

## Como eu trabalho

Leia `documentation/WORKING_STYLE.md` (mapa do meu estilo, com fontes) e siga o `documentation/style-guide/` (em inglês), salvo se `DECISIONS.md` disser outra coisa. Antes de propor mudança de desenho, leia `DECISIONS.md`.

## Regras duras

- Camadas são pastas: Domain → Application → Infrastructure → Endpoints. Controllers chamam serviços, serviços chamam repositórios, repositórios não têm regra.
- Regras de negócio são funções puras (dado entra, dado sai, sem I/O), com testes.
- Composition root explícito, injeção por construtor.
- Dinheiro em centavos inteiros. A tela nunca calcula regra; só exibe e envia intenção.
- Seguro por padrão: segredo só por ambiente (`.env` fica fora do git), nada de dado real, só dados sintéticos.
- Todo teste precisa falhar quando o código quebra. Cada regra do case que a solução trata vira teste (`caqui-invest/ferramentas/checar_respostas.py` ajuda, mas as pistas não são o critério).
- Comentários dizem o porquê. Sem TODO.
- Mudou o comportamento: muda o BDD, os diagramas e o documento no mesmo commit; o PDF da jornada é regerado com `scripts/pdf/gerar_jornada.py`.

## Documentos

| Arquivo | Idioma | Para quê |
|---|---|---|
| `caqui-invest/CASE.md`, `caqui-invest/README.md` | pt-BR | O case e as regras do dia (pasta só de consulta, não alterar) |
| `SPEC.md` | pt-BR | As seis perguntas da spec, com a conta de horas e as premissas |
| `README.md` | pt-BR | Como rodar, conferir e o que ficou de fora |
| `COMO-USAMOS-IA.md`, `AI_LOG.md` | pt-BR | Como a IA foi usada, onde errou e o mapa de autoria |
| `DECISIONS.md` | pt-BR | Decisões: contexto, alternativas, escolha, por quê, o que reabriria |
| `documentation/WORKING_STYLE.md` | pt-BR | Meu estilo de trabalho, com fontes |
| `documentation/bdd/` | pt-BR | Comportamento esperado em Gherkin (`@regra-N`, `@PT-xx`); escrito antes do código |
| `documentation/diagrams/` | pt-BR | Diagramas Mermaid, um por arquivo; fonte única dos fluxos do PDF |
| `documentation/APRESENTACAO.pdf` | pt-BR | Escopo, arquitetura e solução, para a sala |
| `documentation/JORNADA_DO_USUARIO.pdf` | pt-BR | Jornada do usuário e relação com o sistema, gerado por `scripts/pdf/` |
| `documentation/style-guide/` | en | Como estruturo serviços |

Documentação em português, nomes de arquivo `UPPER_SNAKE.md`, links relativos, diagramas em Mermaid (um por arquivo). Nunca escreva o total de decisões como número; cite D*n*. `CLAUDE.md` fica na raiz.

## Commits

Conventional Commits em inglês e minúsculos, com escopo (`feat(chat): ...`). Última linha: `IA: nenhuma|parcial|majoritária`. Só commite quando eu pedir.
