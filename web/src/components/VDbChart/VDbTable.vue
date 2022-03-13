<template>
  <svg
    ref="root"
    :id="`table-${id}`"
    :class="{
      'db-table':true,
      'db-table__highlight': highlight,
      'db-table__dragging': dragging
    }"
    :x="x"
    :y="y"
    :width="size.width"
    :height="size.height"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <rect class="db-table__background"
          x="0"
          y="0"
          :width="size.width"
          :height="size.height"
    />
    <g class="db-table-header"
       @mousedown="startDrag">
      <rect
        height="32"
        :width="size.width"
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
                  :width="size.width"
      />
    </g>
  </svg>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import VDbField from './VDbField'

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
    position: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0
      })
    },
    containerRef: Object,
    panZoom: Object
  })

  const localPosition = ref({
    x: props.position.x,
    y: props.position.y
  })

  const emit = defineEmits([
    'update:position'
  ])

  const positionModel = computed({
    get () {
      return localPosition
    },
    set (value) {
      localPosition.value.x = value.x
      localPosition.value.y = value.y
      emit('update:position', value)
    }
  })
  const root = ref(null)

  const size = computed(() => ({
    width: 200,
    height: 32 + (29 * props.fields.length)
  }))

  const highlight = ref(false)
  const dragging = ref(false)
  const dragOffsetX = ref(null)
  const dragOffsetY = ref(null)
  const x = ref(0)
  const y = ref(0)
  const dragOffset = ref(null);

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
    const scale = 1.0 / props.panZoom.getZoom();
    x.value = (offsetX)*scale - dragOffsetX.value
    y.value = (offsetY)*scale - dragOffsetY.value
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

    const scale = 1.0 / props.panZoom.getZoom();
    const pan1 = props.panZoom.getPan();
    const pan = {x: pan1.x / scale, y: pan1.y / scale};
    dragOffsetX.value = offsetX - (x.value*scale)
    dragOffsetY.value = offsetY - (y.value*scale)

    dragOffset.value = props.containerRef.createSVGPoint();
    props.containerRef.addEventListener('mousemove', drag)
    props.containerRef.addEventListener('mouseup', drop)
    props.containerRef.addEventListener('mouseleave', onMouseLeave)
  }
</script>

<style scoped>

</style>
