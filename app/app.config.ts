// Identidade Caqui (Design System v0.4): primária Deep Moss sobre neutros esverdeados.
// As escalas estão em assets/css/main.css. Laranja ("caqui") é acento e "em andamento", nunca ação primária.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'moss',
      secondary: 'marfim',
      success: 'folha',
      error: 'tijolo',
      warning: 'caqui',
      info: 'moss',
      neutral: 'salvia',
    },
    // Botões e campos: 40px no desktop (md), 48px nos fluxos móveis e críticos (lg). Alvo de toque mínimo 44x44.
    button: { defaultVariants: { size: 'md' } },
    input: { defaultVariants: { size: 'md' } },
  },
})
