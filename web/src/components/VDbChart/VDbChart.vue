<template>
  <svg
    ref="root"
    class="db-chart"
    @mousemove.passive.capture="updateCursorPosition"
  >
    <defs>
      <pattern id="db-chart__bg-grid-base"
               :width="bgGrid.pattern.width"
               :height="bgGrid.pattern.height"
               patternUnits="userSpaceOnUse"
               :viewBox="`0 0 ${bgGrid.pattern.width} ${bgGrid.pattern.height}`"
               class="db-chart__bg-grid"
               ref="bgGridRect">
        <g class="db-chart__bg-grid-small">
          <path :d="bgGrid.pattern.path" fill="none"/>
        </g>
        <path :d="`M ${bgGrid.pattern.width} 0 L 0 0 0 ${bgGrid.pattern.height}`" fill="none"/>
      </pattern>

      <pattern id="db-chart__bg-grid"
               x="0" y="0"
               :width="bgGrid.pattern.width"
               :height="bgGrid.pattern.height"
               patternUnits="userSpaceOnUse"
               :viewBox="`${bgGrid.pattern.x} ${bgGrid.pattern.y} ${bgGrid.pattern.width} ${bgGrid.pattern.height}`">
        <rect
          :x="`-${bgGrid.pattern.width}`"
          :y="`-${bgGrid.pattern.height}`"
          :width="`${bgGrid.pattern.width*3}`"
          :height="`${bgGrid.pattern.height*3}`"
          fill="url(#db-chart__bg-grid-base)"/>
      </pattern>
    </defs>

    <g id="background-layer">
      <rect ref="bgRef" class="db-chart__bg"
            @mousedown="panZoom.enablePan()"
            @mouseup="panZoom.disablePan()"
      />
      <rect class="db-chart__bg-grid"
            x="0" y="0"
            width="100%" height="100%"
            fill="url(#db-chart__bg-grid)"/>
    </g>
    <g id="viewport-layer">
      <g id="tablegroups-layer">

      </g>
      <g id="refs-layer">
        <v-db-ref v-for="ref of refs"
                  :key="ref.id"
                  v-bind="ref"
                  :container-ref="root"
                  @mouseenter.passive="onRefMouseEnter"
                  @mouseleave.passive="onRefMouseLeave"
        />
      </g>
      <g id="tables-layer">
        <v-db-table v-for="table of tables"
                    v-bind="table"
                    :key="table.id"
                    :container-ref="root"
                    @mouseenter.passive="onTableMouseEnter"
                    @mouseleave.passive="onTableMouseLeave"
        />
      </g>
    </g>
    <g id="tools-layer">
      <svg x="10" y="10" width="150" height="36" class="db-tools">
        <rect class="db-tools__bg"/>
        <text x="0" class="db-tools__header">position</text>
        <text x="0">x:
          <v-number :value="position.x" decimals="1"/>
        </text>
        <text x="75">y:
          <v-number :value="position.y" decimals="1"/>
        </text>
      </svg>

      <svg x="170" y="10" width="150" height="36" class="db-tools">
        <rect class="db-tools__bg"/>
        <text x="0" class="db-tools__header">pan</text>
        <text x="0">x:
          <v-number :value="store.pan.x" decimals="1"/>
        </text>
        <text x="75">y:
          <v-number :value="store.pan.y" decimals="1"/>
        </text>
      </svg>

      <svg x="330" y="10" width="100" height="36" class="db-tools">
        <rect class="db-tools__bg"/>
        <text x="0" class="db-tools__header">zoom</text>
        <text x="0">
          <v-number :value="store.zoom" decimals="3"/>
        </text>
      </svg>
    </g>
  </svg>
</template>

<script setup>
  import { computed, nextTick, onMounted, reactive, ref, watch, watchEffect } from 'vue'
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
  const bgGrid2 = ref(null)
  const bgGridRect = ref(null)

  const bgGrid = reactive({
    pattern: {
      viewport: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      rect: {
        x: -100,
        y: -100,
        width: 300,
        height: 300
      },
      path: '',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    offset: {
      x: 0,
      y: 0
    }

  })
  const panZoom = ref({})
  const position = reactive({
    x: 0,
    y: 0
  },)
  let initialized = false

  const updateCursorPosition = (e) => {
    const p = store.ctm.transformPoint({
      x: e.offsetX,
      y: e.offsetY
    })
    position.x = p.x
    position.y = p.y
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
    const p = store.pan
    const z = store.zoom
    const pan = {
      x: p.x,
      y: p.y
    }
    panZoom.value.resize()
    panZoom.value.center()
    panZoom.value.zoom(z)
    panZoom.value.panBy(pan)
  }

  function updateGrid (matrix) {
    const decomposed = {
      translateX: matrix.e,
      translateY: matrix.f,
      scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
      scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
    }

    /*
     * M 10 0 L 10 100 M 0 10 L 100 10
     * M 20 0 L 20 100 M 0 20 L 100 20
     * M 30 0 L 30 100 M 0 30 L 100 30
     * M 40 0 L 40 100 M 0 40 L 100 40
     * M 50 0 L 50 100 M 0 50 L 100 50
     * M 60 0 L 60 100 M 0 60 L 100 60
     * M 70 0 L 70 100 M 0 70 L 100 70
     * M 80 0 L 80 100 M 0 80 L 100 80
     * M 90 0 L 90 100 M 0 90 L 100 90
     */

    let p = ''
    const {
      size: c,
      divisions: d
    } = store.grid
    const e = c / d

    const restrainedMatrix = DOMMatrix.fromMatrix(matrix);
    const minPos = restrainedMatrix.transformPoint({x: 0, y: 0})
    const maxPos = restrainedMatrix.transformPoint({x: c, y: c})

    const cx = Math.abs(maxPos.x-minPos.x);
    const cy = Math.abs(maxPos.y-minPos.y);
    const dx = cx / d;
    const dy = cy / d;

    const tx = minPos.x;
    const ty = minPos.y;
    const mx = ((tx % cx) + cx) % cx;
    const my = ((ty % cy) + cy) % cy;


    p += 'M 0 0'
    for (let i = 1; i < d; i++) {
      p += ` m ${dx*i} 0 l 0 ${cy} m -${dx*i} -${cy}`
    }
    p += 'M 0 0'
    for (let i = 1; i < d; i++) {
      p += ` m 0 ${dy*i} l ${cx} 0 m -${cx} -${dy*i}`
    }

    bgGrid.pattern.x = -mx;
    bgGrid.pattern.y = -my;
    bgGrid.pattern.width = cx
    bgGrid.pattern.height = cy
    bgGrid.pattern.path = p
  }

  const updateCTM = (newCTM) => {
    store.updateCTM(newCTM)
    updateGrid(newCTM)
  }

  const updateZoom = () => {
    saveSizes()

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
      panZoom.value.setOnPan(() => saveSizes())
      panZoom.value.setOnZoom(() => updateZoom())
      panZoom.value.setOnUpdatedCTM((newCTM) => updateCTM(newCTM))
    })
    initialized = true
  })

  watch(() => props.tables, () => {
    panZoom.value.updateBBox()
  })

  watch(() => props.refs, () => {
    panZoom.value.updateBBox()
  })

  watch(() => store.zoom, (newZoom) => {
    panZoom.value.zoom(newZoom)
  })

  function onRefMouseEnter (e) {
    e.target.parentElement.appendChild(e.target)
  }

  function onRefMouseLeave (e) {
  }

  function onTableMouseEnter (e) {
    e.target.parentElement.appendChild(e.target)
  }

  function onTableMouseLeave (e) {
  }

</script>
