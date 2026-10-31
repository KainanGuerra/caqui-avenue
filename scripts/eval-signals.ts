// Mede recall e precisão da detecção de sinais nas 300 conversas rotuladas (dados que o léxico nunca viu).
// Uso: pnpm avaliar-sinais [--detalhe]
import { resolve } from 'node:path'
import { carregarDados } from '../server/infrastructure/data/dados'
import { normalizar } from '../server/domain/normalize'
import { detectarSinais, tem, type Sinal } from '../server/domain/signals'

const dados = carregarDados(resolve(process.env.DADOS_DIR ?? 'caqui-invest/dados'))
const detalhe = process.argv.includes('--detalhe')
const outros = [...dados.clientes.values()].map((c) => ({ id: c.id, nome: normalizar(c.nome) }))

// O texto "(cliente idoso, confuso)" no começo de algumas falas é anotação do pacote de dados, não fala do cliente:
// é removido antes de medir, senão o recall seria inflado por vazamento do rótulo.
// Rótulo da conversa (coluna "sinais") -> sinal do motor.
const MAPA: Record<string, Sinal> = { golpe: 'golpe', recomendacao: 'recomendacao', vulneravel: 'vulneravel', injecao: 'injecao' }

const stats = Object.fromEntries(Object.keys(MAPA).map((k) => [k, { tp: 0, fp: 0, fn: 0, falhas: [] as string[] }]))

for (const conv of dados.conversasHistoricas()) {
  const cliente = dados.clientes.get(conv.clienteId)!
  const falasCliente = conv.transcricao.split(' | ').filter((l) => l.startsWith('CLIENTE:')).map((l) => l.slice(8).replace(/\(cliente idoso, confuso\)/g, '').trim())
  const ctx = { clienteId: cliente.id, nome: normalizar(cliente.nome), idade: cliente.idade, outros: outros.filter((o) => o.id !== cliente.id) }
  const achados = new Set<Sinal>()
  for (const fala of falasCliente) {
    const s = detectarSinais(fala, ctx)
    for (const k of Object.values(MAPA)) if (tem(s, k)) achados.add(k)
  }
  for (const [rotulo, sinal] of Object.entries(MAPA)) {
    const real = conv.sinais.includes(rotulo)
    const previsto = achados.has(sinal)
    const e = stats[rotulo]!
    if (real && previsto) e.tp++
    else if (!real && previsto) { e.fp++; e.falhas.push(`FP ${conv.id}: ${falasCliente.join(' / ').slice(0, 160)}`) }
    else if (real && !previsto) { e.fn++; e.falhas.push(`FN ${conv.id}: ${falasCliente.join(' / ').slice(0, 160)}`) }
  }
}

console.log('sinal           rotuladas  recall  precisão   (tp / fn / fp)')
for (const [k, e] of Object.entries(stats)) {
  const rot = e.tp + e.fn
  const recall = rot ? e.tp / rot : NaN
  const prec = e.tp + e.fp ? e.tp / (e.tp + e.fp) : NaN
  console.log(`${k.padEnd(15)} ${String(rot).padStart(9)}  ${(recall * 100).toFixed(0).padStart(5)}%  ${(prec * 100).toFixed(0).padStart(7)}%   (${e.tp} / ${e.fn} / ${e.fp})`)
  if (detalhe) for (const f of e.falhas) console.log('   ', f)
}
