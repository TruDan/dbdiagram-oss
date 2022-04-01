<template>
  <svg v-if="tooltip.show"
       :x="tooltip.x"
       :y="tooltip.y"
       class="db-tooltip"
  >
    <foreignObject x="0" y="0" width="100%" height="100%" class="db-tooltip__content">
      <q-card  class="db-tooltip__content-card">
        <component :is="tooltip.component" v-bind="tooltip.binds"/>
      </q-card>
    </foreignObject>
  </svg>
</template>

<script setup>
  import { useChartStore } from '../../store/chart'
  import { computed } from 'vue'

  const store = useChartStore()

  const tooltip = computed(() => store.tooltip)
</script>
