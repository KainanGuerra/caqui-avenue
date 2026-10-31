import { defineEventHandler } from 'h3'
import { container } from '../utils/container'

// Login simulado: lista os clientes sintéticos para escolher quem está falando. Sem CPF.
export default defineEventHandler(() =>
  [...container().dados.clientes.values()].map((c) => ({ id: c.id, nome: c.nome, idade: c.idade, persona: c.notaPersona })),
)
