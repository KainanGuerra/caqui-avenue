import { describe, expect, it } from 'vitest'
import { montarContainer } from '../utils/container'
import { loadEnv } from '../infrastructure/env'
import { loggerMudo } from '../infrastructure/logger'
import { relogioFixo } from '../infrastructure/clock'
import { em } from '../testing/fixtures'

const DIA = '2026-11-18T14:00-03:00'
const novo = () => montarContainer({ env: loadEnv({}), logger: loggerMudo, clock: relogioFixo(em(DIA)) })
const abre = async (c: ReturnType<typeof novo>, cliente: string, fala: string, momento = DIA) => {
  const s = c.sessoes.criar(cliente, momento)
  return c.pipeline.processar(s.id, fala, momento)
}

describe('fila do suporte', () => {
  it('ordena golpe, depois idosos, depois os demais, e os mais antigos primeiro', async () => {
    const c = novo()
    const humano = await abre(c, 'C-0002', 'quero falar com uma pessoa', '2026-11-18T14:00-03:00')
    const idosa = await abre(c, 'C-0001', 'quero falar com uma pessoa', '2026-11-18T14:05-03:00')
    const golpe = await abre(c, 'C-0003', 'pediram meu código do SMS', '2026-11-18T14:10-03:00')
    expect(c.casos.fila().map((x) => x.id)).toEqual([golpe.casoId, idosa.casoId, humano.casoId])
  })

  it('o resumo é montado só com dados estruturados e traz o CPF mascarado', async () => {
    const c = novo()
    const r = await abre(c, 'C-0001', 'Quero tirar todo o dinheiro do CDB hoje porque meu sobrinho mandou')
    const caso = c.casos.obter(r.casoId!)!
    expect(caso.cpfMascarado).toBe('***.***.894-**')
    expect(caso.resumo.join(' ')).toContain('terceiro pressionando')
    expect(caso.resumo.join(' ')).toContain('60 anos ou mais')
    expect(caso.prioridade).toBe(1)
  })

  it('a espera estimada cresce com a fila e nunca passa de 35 minutos', async () => {
    const c = novo()
    let ultimo = 0
    for (let i = 0; i < 20; i++) ultimo = c.casos.esperaEstimadaMin(c.casos.obter((await abre(c, 'C-0002', 'quero falar com uma pessoa')).casoId!)!)
    expect(ultimo).toBe(35)
  })

  it('assumir, responder e resolver mudam o status; caso resolvido vai para o fim da fila', async () => {
    const c = novo()
    const a = await abre(c, 'C-0002', 'quero falar com uma pessoa')
    const b = await abre(c, 'C-0004', 'quero falar com uma pessoa')
    expect(c.casos.assumir(a.casoId!, 'Jonas', DIA)).toMatchObject({ status: 'assumido', atendente: 'Jonas' })
    c.casos.resolver(a.casoId!, DIA)
    expect(c.casos.fila().map((x) => x.id)).toEqual([b.casoId, a.casoId])
    expect(c.casos.assumir(a.casoId!, 'Jonas', DIA)).toBeNull()
  })
})
