import { destinoPermitido } from '~/utils/navegacao'

// Cada papel só abre as próprias telas; o servidor reaplica a regra em cada chamada.
export default defineNuxtRouteMiddleware((to) => {
  const destino = destinoPermitido(useAcesso().papel.value, to.path)
  if (destino) return navigateTo(destino)
})
