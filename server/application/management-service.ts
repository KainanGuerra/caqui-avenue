import { resumirAoVivo, type FiltroCasos, type Precos, type ResumoAoVivo } from '../domain/management-metrics'
import type { MetricsStore } from '../infrastructure/stores/metrics-store'
import type { CaseService } from './case-service'

export type PainelGerente = ResumoAoVivo & {
  /** Modo de redação em uso: template (sem IA) explica custo zero na tela. */
  redacao: 'template' | 'anthropic' | 'openai'
}

// Monta o painel do gerente a partir do que o pipeline e o adaptador de IA registraram. Só lê: não muda caso nem sessão.
export class ManagementService {
  constructor(
    private readonly metricas: MetricsStore,
    private readonly casos: CaseService,
    private readonly precos: Precos,
    private readonly redacao: PainelGerente['redacao'],
  ) {}

  painel(filtro: FiltroCasos = { pagina: 1, status: null }): PainelGerente {
    return { ...resumirAoVivo(this.metricas.respostas(), this.metricas.chamadasLlm(), this.casos.fila(), this.precos, filtro), redacao: this.redacao }
  }
}
