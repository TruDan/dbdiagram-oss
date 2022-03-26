<template>
  <slot :number="number">{{ number }}</slot>
</template>

<script>
  import { defineComponent } from 'vue'

  export default defineComponent({ name: 'VNumber' })
</script>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    value: Number,
    round: Boolean,
    decimals: Number,
  })

  const number = ref()

  watch(() => props,
    () => {
      let value = props.value

      if (props.round) {
        value = Math.round(value)
      }

      if (props.decimals) {
        value = value.toFixed(props.decimals)
      }

      number.value = value
    },
    {
      deep: true,
      immediate: true
    })
</script>
