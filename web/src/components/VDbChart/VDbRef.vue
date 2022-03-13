<template>
  <polyline
    ref="root"
    class="db-ref"
    :points="points"
  >

  </polyline>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

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

  const points = ref('')

  const getPositionAnchors = (field) => {
    const fieldEl = props.containerRef.getElementById(`field-${field.id}`)
    const fieldX = parseFloat(fieldEl.getAttribute('x'))
    const fieldY = parseFloat(fieldEl.getAttribute('y'))

    const tableEl = props.containerRef.getElementById(`table-${field.table.id}`)
    const tableX = parseFloat(tableEl.getAttribute('x'))
    const tableY = parseFloat(tableEl.getAttribute('y'))

    const fieldH = parseFloat(fieldEl.getAttribute('height'))
    const fieldW = parseFloat(fieldEl.getAttribute('width'))

    return [
      {
        x: (fieldX + tableX),
        y: (fieldY + tableY) + (fieldH / 2.0)
      },
      {
        x: (fieldX + tableX) + fieldW,
        y: (fieldY + tableY) + (fieldH / 2.0)
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
    ));
    let smallest = withDistances[0];
    for(const withDistance of withDistances) {
      if(withDistance.distance < smallest.distance)  {
        smallest = withDistance;
      }
    }

    return [smallest.a, smallest.b];
  }

  const computePoints = () => {
    const startElAnchors = getPositionAnchors(props.endpoints[0].fields[0])
    const endElAnchors = getPositionAnchors(props.endpoints[1].fields[0])

    const [start, end] = getClosest(startElAnchors, endElAnchors);

    const positions = []
    positions.push(`${start.x},${start.y}`)
    positions.push(...props.vertices.map(v => `${v.x},${v.y}`))
    positions.push(`${end.x},${end.y}`)

    points.value = positions.join(' ')
  }

  onUpdated(() => {
    computePoints()
  })

  onMounted(() => {
    props.containerRef.addEventListener('DOMSubtreeModified', computePoints)
  })
  onBeforeUnmount(() => {
    props.containerRef.removeEventListener(computePoints)
  })
</script>
