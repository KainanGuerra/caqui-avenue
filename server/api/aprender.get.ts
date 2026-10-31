import { defineEventHandler } from 'h3'
import { montarAprender } from '../domain/learning-view'
import { container } from '../utils/container'

// Conteúdo da base, igual para todos os clientes: não depende da sessão.
export default defineEventHandler(() => montarAprender(container().dados.kb))
