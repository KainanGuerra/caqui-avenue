import { defineEventHandler } from 'h3'
import { montarInvestir } from '../domain/invest-view'
import { container } from '../utils/container'

// Produtos da tabela de taxas e os artigos que os explicam; igual para todos os clientes.
export default defineEventHandler(() => {
  const { dados } = container()
  return montarInvestir(dados.taxas.produtos, dados.kb)
})
