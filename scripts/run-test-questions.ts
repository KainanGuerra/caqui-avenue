// Roda as 40 perguntas de teste no motor e grava respostas.jsonl para ferramentas/checar_respostas.py.
// Uso: pnpm perguntas [saida.jsonl]   (cada pergunta abre uma sessão; PT-27 é uma conversa de três mensagens)
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { montarContainer } from '../server/utils/container'
import { loadEnv } from '../server/infrastructure/env'
import { loggerMudo } from '../server/infrastructure/logger'
import { relogioFixo } from '../server/infrastructure/clock'
import { parseMomento } from '../server/domain/momento'

const MOMENTO_PADRAO = '2026-11-18T10:00-03:00'
const CLIENTE_PADRAO = 'C-0002'
const saida = process.argv[2] ?? 'respostas.jsonl'

const env = loadEnv()
const c = montarContainer({ env, logger: loggerMudo, clock: relogioFixo(parseMomento(MOMENTO_PADRAO)) })
const perguntas = readFileSync(resolve(env.dadosDir, 'perguntas_teste.jsonl'), 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l))

const linhas: string[] = []
for (const p of perguntas) {
  const momento: string = p.contexto?.momento ?? MOMENTO_PADRAO
  const sessao = c.sessoes.criar(p.contexto?.id_cliente ?? CLIENTE_PADRAO, momento)
  const falas: string[] = String(p.pergunta).split(' | ')
  let ultima = null
  for (const fala of falas) ultima = await c.pipeline.processar(sessao.id, fala, momento)
  linhas.push(JSON.stringify({ id: p.id, resposta: ultima!.texto, acao: ultima!.acao }))
}
writeFileSync(saida, linhas.join('\n') + '\n')
console.log(`${linhas.length} respostas gravadas em ${saida}`)
