<template>
  <svg
    ref="root"
    class="db-chart"
    @mousemove="updateCursorPosition"
  >
    <g id="background-layer">
      <rect ref="bgRef" class="db-chart__bg"
            @mousedown="panZoom.enablePan()"
            @mouseup="panZoom.disablePan()"
      />
    </g>
    <g id="viewport-layer">
      <g id="tablegroups-layer">

      </g>
      <g id="refs-layer">
        <v-db-ref v-for="ref of refs"
                  :key="ref.id"
                  v-bind="ref"
                  :container-ref="root"
                  :pan-zoom="panZoom" />
      </g>
      <g id="tables-layer">
        <v-db-table v-for="(table,i) of tables"
                    v-bind="table"
                    @update:position="v => updatePosition(i,v)"
                    :key="table.id"
                    :container-ref="root"
                    :pan-zoom="panZoom"
        />
      </g>
    </g>
    <g id="tools-layer">
      <svg x="10" y="10" width="150" height="32" class="db-tools">
        <rect class="db-tools__bg" x="0" y="0" width="200" height="32"/>
        <text x="0" y="16">x: {{ position.x }}</text>
        <text x="75" y="16">y: {{ position.y }}</text>
      </svg>

      <svg x="170" y="10" width="150" height="32" class="db-tools">
        <rect class="db-tools__bg" x="0" y="0" width="200" height="32"/>
        <text x="0" y="16">x: {{ pan.x }}</text>
        <text x="75" y="16">y: {{ pan.y }}</text>
      </svg>

      <svg x="340" y="10" width="150" height="32" class="db-tools">
        <rect class="db-tools__bg" x="0" y="0" width="200" height="32"/>
        <text x="0" y="16">scale: {{ zoom }}</text>
      </svg>
    </g>
  </svg>
</template>

<script setup>
  import { computed, onMounted, ref, watchEffect } from 'vue'
  import VDbTable from './VDbTable'
  import VDbRef from './VDbRef'
  import svgPanZoom from 'svg-pan-zoom'

  const props = defineProps({
    tables: {
      type: Array,
      default: () => ([])
    },
    refs: {
      type: Array,
      default: () => ([])
    }
  })
  const emit = defineEmits(['update:tables'])
  const root = ref(null)
  const panZoom = ref({})
  const position = ref({
    x: 0,
    y: 0
  })
  const pan = ref({
    x: 0,
    y: 0
  })
  const zoom = ref(1.0)
  let initialized = false

  const updatePosition = (index, position) => {
    const tables = props.tables
    tables[index].position = position
    emit('update:tables', tables)
  }

  const updateCursorPosition = ({
    offsetX,
    offsetY
  }) => {
    position.value = {
      x: offsetX,
      y: offsetY
    }
  }

  onMounted(() => {
    panZoom.value = svgPanZoom(root.value, {
      viewportSelector: '#viewport-layer',
      panEnabled: false,
      fit: false,
      onPan: (newPan) => pan.value = newPan,
      onZoom: (newZoom) => zoom.value = newZoom
    })
    initialized = true
  })

</script>
