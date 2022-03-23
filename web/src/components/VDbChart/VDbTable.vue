<template>
  <svg
    ref="root"
    :id="`table-${id}`"
    :class="{
      'db-table':true,
      'db-table__highlight': highlight,
      'db-table__dragging': dragging
    }"
    :x="state.x"
    :y="state.y"
    :width="state.width"
    :height="state.height"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <rect class="db-table__background"
          x="0"
          y="0"
          :width="state.width"
          :height="state.height"
    />
    <g class="db-table-header"
       @mousedown="startDrag"
       @mouseenter="showTooltip"
       @mouseleave="hideTooltip"
    >
      <rect
        height="32"
        :width="state.width"
        :fill="headerColor"
      />
      <text class="db-table-header__name"
            y="16"
      >
        {{ name }}
      </text>
      <title>{{ name }}</title>
    </g>
    <g class="db-table-fields">
      <v-db-field v-for="field of fields"
                  v-bind="field"
                  :key="field.id"
                  :width="state.width"
      />
    </g>
    <svg class="db-table-tooltip" v-if="tooltip" :x="state.width + 20">
      <rect :width="tooltipSize.width" :height="tooltipSize.height"/>
    </svg>
  </svg>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import VDbField from './VDbField'
  import { useChartStore } from '../../store/chart'

  const props = defineProps({
    id: Number,
    selection: String,
    token: Object,
    group: Object,
    name: String,
    alias: String,
    note: String,
    indexes: Array,
    schema: Object,
    headerColor: {
      type: String,
      default: () => ('')
    },
    dbState: Object,
    fields: {
      type: Array,
      default: () => ([])
    },
    containerRef: Object,
    panZoom: Object
  })

  const store = useChartStore()

  const state = computed(() => store.getTable(props.id))

  const updateHeight = () => {
    state.value.height = 32 + (29 * props.fields.length);
  }

  watch(() => props.fields, value => {
    updateHeight();
  });

  onMounted(() => {
    updateHeight();
  })

  const emit = defineEmits([
    'update:position'
  ])

  const root = ref(null)

  const tooltipSize = computed(() => ({
    width: 200,
    height: 32 + (29 * props.fields.length)
  }))

  const highlight = ref(false)
  const tooltip = ref(false)
  const dragging = ref(false)
  const dragOffsetX = ref(null)
  const dragOffsetY = ref(null)
  const dragOffset = ref(null)

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
    state.value.x = p.x - dragOffsetX.value
    state.value.y = p.y - dragOffsetY.value
    emit('update:position', state.value)
  }
  const drop = (e) => {
    dragging.value = false
    highlight.value = false

    dragOffsetX.value = null
    dragOffsetY.value = null
    props.containerRef.removeEventListener('mousemove', drag)
    props.containerRef.removeEventListener('mouseup', drop)
    props.containerRef.removeEventListener('mouseleave', onMouseLeave)
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
    dragOffsetX.value = p.x - state.value.x
    dragOffsetY.value = p.y - state.value.y

    dragOffset.value = props.containerRef.createSVGPoint()
    props.containerRef.addEventListener('mousemove', drag, { passive: true })
    props.containerRef.addEventListener('mouseup', drop, { passive: true })
    props.containerRef.addEventListener('mouseleave', onMouseLeave, { passive: true })
  }

  const showTooltip = () => {
    tooltip.value = true
  }

  const hideTooltip = () => {
    tooltip.value = false
  }
</script>

<style scoped>

</style>
