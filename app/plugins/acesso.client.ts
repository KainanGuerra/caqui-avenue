// Antes da primeira navegação, recupera quem estava dentro nesta aba (o middleware decide com isso).
export default defineNuxtPlugin(() => {
  useAcesso().restaurar()
})
