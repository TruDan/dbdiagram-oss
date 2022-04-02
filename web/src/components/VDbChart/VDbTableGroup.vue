<template>
  <svg
    ref="root"
    :id="`tablegroup-${id}`"
    :class="{
      'db-tablegroup':true,
      'db-tablegroup__highlight': highlight,
      'db-tablegroup__dragging': dragging
    }"
    :x="state.x"
    :y="state.y"
    :width="state.width"
    :height="state.height"
    @mouseenter.passive="onMouseEnter"
    @mouseleave.passive="onMouseLeave">

    <rect class="db-tablegroup__background"
          :width="state.width"
          :height="state.height"
    />
    <g class="db-tablegroup-header"
       @mousedown.passive="startDrag"
    >
      <rect
        height="30"
        :width="state.width"
      />
      <text class="db-tablegroup-header__name"
            y="16"
      >
        {{ name }}
      </text>
      <title>{{ name }}</title>
      <line x1="0" y1="30" y2="30"
            :x2="state.width"
            class="db-tablegroup-header__separator"
      />
    </g>

  </svg>
</template>

<script setup>
  import { useChartStore } from '../../store/chart'
  import { computed, ref, watch, onMounted } from 'vue'
  import { snap } from '../../utils/MathUtil'

  const props = defineProps({
    name: String,
    tables: Array,
    schema: Object,
    dbState: Object,
    id: Number,
    containerRef: Object
  })
  const store = useChartStore()

  const state = computed(() => store.getTableGroup(props.id))
  const root = ref(null)
  const affectedTables = ref([])

  const updateSize = () => {
    const tableStates = props.tables.map(t => store.getTable(t.id));
console.log(tableStates);
    const minX = tableStates.reduce((prev, curr) => !prev ? curr.x : Math.min(prev, curr.x), 0);
    const maxX = tableStates.reduce((prev, curr) => !prev ? curr.x + curr.width : Math.max(prev, curr.x + curr.width), 0);
    const minY = tableStates.reduce((prev, curr) => !prev ? curr.y : Math.min(prev, curr.y), 0);
    const maxY = tableStates.reduce((prev, curr) => !prev ? curr.y + curr.height : Math.max(prev, curr.y + curr.height), 0);

    console.log(minX, maxX, minY, maxY);
    state.value.x = minX - 20;
    state.value.y = minY - 20 - 35;
    state.value.width = Math.abs(maxX-minX) + 40;
    state.value.height = Math.abs(maxY-minY) + 40 + 35;
  }

  watch(() => props.tables, value => {
    affectedTables.value = props.tables.map(t => store.getTable(t.id))
    updateSize()
  }, {
    deep: true
  })

  onMounted(() => {
    affectedTables.value = props.tables.map(t => store.getTable(t.id))
    updateSize()
  })

  watch(affectedTables, () => {
    updateSize()
  }, {
    deep: true
  })

  const highlight = ref(false)
  const dragging = ref(false)
  const dragOffset = ref(null)
  const gridSize = store.subGridSize
  const gridSnap = store.grid.snap

  const onMouseEnter = (e) => {
    highlight.value = true
  }
  const onMouseLeave = (e) => {
    highlight.value = false
    dragging.value = false
  }
  const drag = ({
    offsetX,
    offsetY
  }) => {
    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    const newX = snap(p.x - dragOffset.x, gridSnap)
    const newY = snap(p.y - dragOffset.y, gridSnap)

    const dX = newX - state.value.x;
    const dY = newY - state.value.y;

    for(const table of affectedTables.value) {
      table.x = table.x + dX;
      table.y = table.y + dY;
    }
  }
  const drop = (e) => {
    dragging.value = false
    highlight.value = false

    dragOffset.x = null
    dragOffset.y = null
    props.containerRef.removeEventListener('mousemove', drag, { passive: true })
    props.containerRef.removeEventListener('mouseup', drop, { passive: true })
    props.containerRef.removeEventListener('mouseleave', onMouseLeave, { passive: true })
  }
  const startDrag = ({
    offsetX,
    offsetY
  }) => {
    dragging.value = true

    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    dragOffset.x = p.x - state.value.x
    dragOffset.y = p.y - state.value.y

    dragOffset.value = props.containerRef.createSVGPoint()
    props.containerRef.addEventListener('mousemove', drag, { passive: true })
    props.containerRef.addEventListener('mouseup', drop, { passive: true })
    props.containerRef.addEventListener('mouseleave', onMouseLeave, { passive: true })
  }
</script>
