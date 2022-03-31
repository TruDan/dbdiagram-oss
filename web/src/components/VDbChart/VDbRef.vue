<template>
  <g
    ref="root"
    :id="`ref-${id}`"
    :class="{
      'db-ref':true,
      'db-ref__highlight': highlight
    }"
    @mouseenter.passive="onMouseEnter"
    @mouseleave.passive="onMouseLeave"
  >
    <path
      class="db-ref__hitbox"
      :d="path"
    />
    <path
      class="db-ref__path"
      :d="path"
    />

    <g class="db-ref__control-points">
      <circle v-for="(v,i) of s.vertices"
              :key="i"
              :cx="v.x"
              :cy="v.y"
              :class="{
                'db-ref__control-point': true,
                'db-ref__control-point__highlight': i === controlPoint_highlighted,
                'db-ref__control-point__dragging': i === controlPoint_dragging,
              }"
              r="5"
              fill="red"
              :data-id="i"
              @mousedown.passive="controlPoint_startDrag"
              @mouseenter.passive="controlPoint_onMouseEnter"
              @mouseleave.passive="controlPoint_onMouseLeave"
      />
    </g>

  </g>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, onUpdated, reactive, ref, watch, watchEffect } from 'vue'
  import { useChartStore } from '../../store/chart'

  const props = defineProps({
    id: Number,
    name: String,
    endpoints: Array,
    onUpdate: [String, Object, undefined],
    onDelete: [String, Object, undefined],
    schema: Object,
    dbState: Object,
    database: Object,
    token: Object,
    containerRef: Object
  })

  const store = useChartStore()
  const s = store.getRef(props.id)

  const highlight = ref(false)
  const affectedTables = ref([])
  const d = ref('')

  const getPositionAnchors = (endpoint) => {
    const s = store.getTable(endpoint.fields[0].table.id)
    const fieldIndex = endpoint.fields[0].table.fields.findIndex(f => f.id === endpoint.fields[0].id)

    return [
      {
        x: s.x,
        y: s.y + 32 + (29 * fieldIndex) + (29 / 2.0)
      },
      {
        x: s.x + s.width,
        y: s.y + 32 + (29 * fieldIndex) + (29 / 2.0)
      }
    ]
  }

  const getClosestAnchor = (point, anchors) => {
    const withDistances = anchors.map(a => ({
        distanceXY: {
          x: (a.x - point.x),
          y: (a.y - point.y)
        },
        distance: Math.sqrt(
          ((a.x - point.x) * (a.x - point.x))
          + ((a.y - point.y) * (a.y - point.y))
        ),
        anchor: a
      })
    )

    let smallest = withDistances[0]
    for (const withDistance of withDistances) {
      if (withDistance.distance < smallest.distance) {
        smallest = withDistance
      }
    }

    return smallest.anchor
  }

  const getClosest = (anchorsA, anchorsB) => {
    const withDistances = anchorsA.flatMap(a => anchorsB.map(b => ({
        distanceXY: {
          x: (a.x - b.x),
          y: (a.y - b.y)
        },
        distance: Math.sqrt(
          ((a.x - b.x) * (a.x - b.x))
          + ((a.y - b.y) * (a.y - b.y))
        ),
        a: a,
        b: b
      })
    ))
    let smallest = withDistances[0]
    for (const withDistance of withDistances) {
      if (withDistance.distance < smallest.distance) {
        smallest = withDistance
      }
    }

    return [smallest.a, smallest.b]
  }

  const gridSize = store.subGridSize

  const startAnchors = computed(() => {
    return getPositionAnchors(props.endpoints[0])
  })
  const endAnchors = computed(() => {
    return getPositionAnchors(props.endpoints[1])
  })

  const updateControlPoints = () => {
    const startElAnchors = startAnchors.value
    const endElAnchors = endAnchors.value

    if (!s.auto) {
      if (!s.vertices.length) {
        s.auto = true
      } else {
        return
      }
    }

    const [start, end] = getClosest(startElAnchors, endElAnchors)

    const minX = Math.min(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxX = Math.max(start.x, end.x)
    const maxY = Math.max(start.y, end.y)
    const midX = Math.round((minX + ((maxX - minX) / 2)) / gridSize) * gridSize
    const midY = Math.round((minY + ((maxY - minY) / 2)) / gridSize) * gridSize
    const mid = {
      x: midX,
      y: midY
    }

    s.vertices = [
      {
        x: mid.x,
        y: start.y
      },
      {
        x: mid.x,
        y: end.y
      }
    ]
  }

  const path = computed(() => {
    const startElAnchors = startAnchors.value
    const endElAnchors = endAnchors.value

    const points = s.vertices
    const start = getClosestAnchor(points[0], startElAnchors)
    const end = getClosestAnchor(points[points.length - 1], endElAnchors)

    return `M ${start.x},${start.y} L ${points.map(p => (`${p.x},${p.y}`)).join(' ')} L ${end.x} ${end.y}`
  })

  const onMouseEnter = (e) => {
    highlight.value = true
  }
  const onMouseLeave = (e) => {
    highlight.value = false
  }

  const controlPoint_highlighted = ref(null)
  const controlPoint_dragging = ref(null)
  const controlPoint_dragOffset = reactive({
    x: 0,
    y: 0
  })

  const controlPoint_onMouseEnter = ({ target }) => {
    const controlPointId = Number(target.getAttribute('data-id'))
    controlPoint_highlighted.value = controlPointId
  }
  const controlPoint_onMouseLeave = ({ target }) => {
      controlPoint_highlighted.value = null
      controlPoint_highlighted.value = null
  }
  const controlPoint_startDrag = ({
    target,
    offsetX,
    offsetY
  }) => {
    const controlPointId = Number(target.getAttribute('data-id'))
    const v = s.vertices[controlPointId]

    controlPoint_dragging.value = controlPointId

    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })

    controlPoint_dragOffset.x = p.x - v.x
    controlPoint_dragOffset.y = p.y - v.y
    props.containerRef.addEventListener('mousemove', controlPoint_drag, { passive: true })
    props.containerRef.addEventListener('mouseup', controlPoint_drop, { passive: true })
    props.containerRef.addEventListener('mouseleave', controlPoint_onMouseLeave, { passive: true })
  }
  const controlPoint_drag = ({
    target,
    offsetX,
    offsetY
  }) => {
    const p = store.inverseCtm.transformPoint({
      x: offsetX,
      y: offsetY
    })
    const controlPointId = controlPoint_dragging.value
    if(s.auto)
      s.auto = false;

    const v = s.vertices[controlPointId]
    v.x = Math.round((p.x - controlPoint_dragOffset.x) / gridSize) * gridSize
    v.y = Math.round((p.y - controlPoint_dragOffset.y) / gridSize) * gridSize

  }
  const controlPoint_drop = (e) => {
    controlPoint_dragOffset.x = 0
    controlPoint_dragOffset.y = 0
    controlPoint_dragging.value = null
    controlPoint_highlighted.value = null

    props.containerRef.removeEventListener('mousemove', controlPoint_drag, { passive: true })
    props.containerRef.removeEventListener('mouseup', controlPoint_drop, { passive: true })
    props.containerRef.removeEventListener('mouseleave', controlPoint_onMouseLeave, { passive: true })
  }

  updateControlPoints();
  onMounted(() => {
    affectedTables.value = props.endpoints.map(e => store.getTable(e.fields[0].table.id))
    updateControlPoints();
  })

  watch(props.endpoints, () => {
    affectedTables.value = props.endpoints.map(e => store.getTable(e.fields[0].table.id))
  })

  watch([props.endpoints, affectedTables], () => {
    updateControlPoints();
  }, {
    deep: true
  })
</script>
