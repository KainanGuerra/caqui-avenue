import { resolve } from 'node:path'
import { carregarDados } from '../infrastructure/data/dados'
import { criarCalendario } from '../domain/calendar'
import { parseMomento } from '../domain/momento'

// Pacote de dados real (somente leitura): os testes usam os mesmos arquivos do case.
export const dados = carregarDados(resolve('data'))
export const cal = criarCalendario(dados.calendario)
export const produto = (codigo: string) => {
  const p = dados.taxas.produtos.find((x) => x.codigo === codigo)
  if (!p) throw new Error(`produto desconhecido: ${codigo}`)
  return p
}
export const em = (iso: string) => parseMomento(iso)
