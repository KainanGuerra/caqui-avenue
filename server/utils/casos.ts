import { rotuloMotivo, type Caso } from '../domain/case-summary'

/** Caso com os motivos em português, para o painel (os códigos ficam em `motivos`). */
export const apresentarCaso = (c: Caso) => ({ ...c, motivosTexto: [...new Set(c.motivos)].map(rotuloMotivo) })
