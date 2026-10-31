<script setup lang="ts">
// Avisa quando o servidor não responde, para a pessoa não achar que a conversa se perdeu.
const online = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

async function checar() {
  try { await $fetch('/api/saude'); online.value = true } catch { online.value = false }
}
onMounted(() => { void checar(); timer = setInterval(checar, 10000) })
onBeforeUnmount(() => clearInterval(timer))
defineExpose({ online })
</script>

<template>
  <UAlert v-if="!online" role="status" color="warning" variant="subtle" icon="i-lucide-wifi-off" title="Sem conexão com a Caqui" description="O que você já escreveu continua na tela. Tentamos de novo a cada poucos segundos." />
</template>
