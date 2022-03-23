<template>
  <svg
    ref="root"
    class="db-chart"
    @mousemove.passive="updateCursorPosition"
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
                  :pan-zoom="panZoom"/>
      </g>
      <g id="tables-layer">
        <v-db-table v-for="table of tables"
                    v-bind="table"
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
        <text x="0" y="16">x: {{ store.pan.x }}</text>
        <text x="75" y="16">y: {{ store.pan.y }}</text>
      </svg>

      <svg x="340" y="10" width="150" height="32" class="db-tools">
        <rect class="db-tools__bg" x="0" y="0" width="200" height="32"/>
        <text x="0" y="16">scale: {{ store.zoom }}</text>
      </svg>
    </g>
  </svg>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
  import VDbTable from './VDbTable'
  import VDbRef from './VDbRef'
  import svgPanZoom from 'svg-pan-zoom'
  import { useChartStore } from '../../store/chart'

  const store = useChartStore()

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
  const root = ref(null)
  const panZoom = ref({})
  const position = ref({
    x: 0,
    y: 0
  })
  let initialized = false

  const updateCursorPosition = ({
    offsetX,
    offsetY
  }) => {
    const p = store.ctm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    position.value.x = p.x
    position.value.y = p.y
  }

  const saveSizes = () => {
    const s = panZoom.value.getSizes()
    const p = panZoom.value.getPan()
    const z = panZoom.value.getZoom()
    const pan = {
      x: p.x - (s.width / 2),
      y: p.y - (s.height / 2)
    }
    store.$patch({
      pan: pan,
      zoom: z
    })
  }

  const loadSizes = () => {
    const s = panZoom.value.getSizes()
    const p = store.pan;
    const z = store.zoom;
    const pan = {
      x: p.x,
      y: p.y
    }
    panZoom.value.resize()
    panZoom.value.center()
    panZoom.value.zoom(z);
    panZoom.value.panBy(pan);
  }

  onMounted(() => {
    panZoom.value = svgPanZoom(root.value, {
      viewportSelector: '#viewport-layer',
      panEnabled: false,
      fit: false,
      center: false,
      dblClickZoomEnabled: false,
      zoomScaleSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 2.0,
      // onPan: (newPan) => {
      //   saveSizes()
      // },
      // onZoom: (newZoom) => {
      //   saveSizes()
      // },
      // onUpdatedCTM: (newCTM) => {
      //   store.updateCTM(newCTM)
      // }
    })
    nextTick(() => {
      loadSizes()
      panZoom.value.disablePan()
      panZoom.value.setOnPan(() => saveSizes());
      panZoom.value.setOnZoom(() => saveSizes());
      panZoom.value.setOnUpdatedCTM((newCTM) => store.updateCTM(newCTM));
    })
    position.value = root.value.createSVGPoint()
    initialized = true
  })


  watch(() => props.tables, () => {
    panZoom.value.updateBBox();
  })

  watch(() => props.refs, () => {
    panZoom.value.updateBBox();
  })
</script>
