<template>
  <div class="dbml-graph-wrapper">
    <div ref="paper" class="dbml-graph">

    </div>
    <div class="dbml-toolbar-wrapper">
      <q-toolbar class="bg-dark text-white rounded-borders shadow-6">
        <q-btn
          class="q-mr-xs q-px-md"
          color="secondary"
          dense
          @click="applyAutoLayout"
        >
          Auto-Layout
        </q-btn>
        <q-btn
          class="q-mx-xs q-px-md"
          color="secondary"
          dense
          @click="applyScaleToFit">
          Fit
        </q-btn>
        <q-space />

        <q-slider
          class="q-mx-sm"
          style="width: 25%; min-width: 100px; max-width: 200px;"
          v-model="scale"
          :min="minScale"
          :max="maxScale"
        />
          <div
            class="q-mx-sm non-selectable"
            style="width: 2.5rem; flex: 0 0 auto;">{{Math.round(scale)}} %</div>

      </q-toolbar>
    </div>
  </div>
</template>

<script setup>
  import { DbGraph } from 'components/DbmlGraphElements/DbGraph'
  import { useEditorStore } from '../store/editor'
  import { computed, onMounted, ref, watch } from 'vue'

  const props = defineProps({
    schema: {
      type: Object,
      required: true
    },
    positions: {
      type: Object,
      required: true
    }
  })
  const emit = defineEmits([
    'update:positions',
  ])
  const paper = ref(null)
  const graphRef = ref(null)
  const editor = useEditorStore()

  const locateTable = (tableId) => {
    const table = editor.findTable(tableId)
    if (table) {
      const token = table.token
      editor.updateSelectionMarker(token.start, token.end)
    }
  }
  const locateField = (fieldId) => {
    const field = editor.findField(fieldId)
    if (field) {
      const token = field.token
      editor.updateSelectionMarker(token.start, token.end)
    }
  }

  const mounted = onMounted(() => {
    graphRef.value = new DbGraph(paper.value)
    graphRef.value.on('update:positions', (newPositions) => emit('update:positions', newPositions))
    graphRef.value.on('editor:table:locate', (tableId) => locateTable(tableId))
    graphRef.value.on('editor:field:locate', (fieldId) => locateField(fieldId))

    if (props.schema) {
      graphRef.value.syncSchema(props.schema, props.positions)
    }
  })

  const scale = computed({
    get() {
      return (graphRef.value && graphRef.value.scale || 1) * 100.0;
    },
    set(value) {
      graphRef.value.scale = (value / 100.0)
    }
  })

  const minScale = computed(() => (graphRef.value && graphRef.value.scaleMin || 1) * 100.0);
  const maxScale = computed(() => (graphRef.value && graphRef.value.scaleMax || 1) * 100.0);

  const watchSchema = watch(() => props.schema, (newValue) => graphRef.value.syncSchema(newValue, props.positions))
  const watchPositions = watch(() => props.positions, (newValue) => graphRef.value.syncPositions(newValue))

  const applyAutoLayout = () => {
    graphRef.value.applyAutoLayout()
  }

  const applyScaleToFit = () => {
    graphRef.value.applyScaleToFit()
  }
</script>

<style scoped>
  .dbml-graph {
    height: 100% !important;
    width: 100% !important;
  }

  .dbml-graph-wrapper {
    height: 100% !important;
    width: 100% !important;
    position: relative;
  }

  .dbml-toolbar-wrapper {
    width: 600px;
    align-self: center;
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
  }
</style>
