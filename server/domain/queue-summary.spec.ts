import { describe, expect, it } from 'vitest'
import type { Caso } from './case-summary'
import { resumirFila } from './queue-summary'

const caso = (id: string, prioridade: 0 | 1 | 2, status: Caso['status']): Caso => ({
  id, protocolo: `P-${id}`, sessaoId: 's', clienteId: 'C-0001', clienteNome: 'X', idade: 30, cpfMascarado: '***', acao: 'encaminhar_humano', motivos: [],
  prioridade, risco: 'baixo', status, atendente: null, criadoEm: '2026-11-18T10:00:00-03:00', atualizadoEm: '2026-11-18T10:00:00-03:00', resumo: [], fontes: [],
})

describe('resumo da fila', () => {
  it('conta por status e por prioridade, ignorando casos resolvidos em golpe e prioridade', () => {
    const r = resumirFila([caso('1', 0, 'aberto'), caso('2', 0, 'resolvido'), caso('3', 1, 'assumido'), caso('4', 2, 'aberto'), caso('5', 1, 'resolvido')])
    expect(r).toEqual({ emAberto: 2, golpe: 1, prioridade: 1, assumidos: 1, resolvidos: 2 })
  })

  it('fila vazia zera tudo', () => {
    expect(resumirFila([])).toEqual({ emAberto: 0, golpe: 0, prioridade: 0, assumidos: 0, resolvidos: 0 })
  })
})
