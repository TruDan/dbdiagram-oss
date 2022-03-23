<template>
  <path
    ref="root"
    class="db-ref"
    :d="points"
  >

  </path>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch, watchEffect } from 'vue'
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
    containerRef: Object,
    panZoom: Object,
    vertices: {
      type: Array,
      default: () => ([])
    }
  })

  const store = useChartStore()

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

  const points = computed(() => {
    const startElAnchors = getPositionAnchors(props.endpoints[0])
    const endElAnchors = getPositionAnchors(props.endpoints[1])

    const [start, end] = getClosest(startElAnchors, endElAnchors)

    return `M ${start.x},${start.y} C ${end.x},${start.y} ${start.x},${end.y} ${end.x},${end.y}`
  })

  onMounted(() => {
    affectedTables.value = props.endpoints.map(e => store.getTable(e.fields[0].table.id));
  })
</script>
