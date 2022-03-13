<template>
  <div class="dbml-graph-wrapper">
    <v-db-chart v-if="schema"
                v-model:tables="tables"
                v-model:refs="refs"
    >

    </v-db-chart>
    <div class="dbml-toolbar-wrapper">
      <q-toolbar class="bg-dark text-white q-btn--rounded">
        <q-btn
          flat
          dense
          @click="applyAutoLayout"
        >
          Auto-Layout
        </q-btn>
        <q-btn
          flat
          dense
          @click="applyScaleToFit">
          Fit
        </q-btn>
      </q-toolbar>
    </div>
  </div>
</template>

<script setup>
  import { DbGraph } from 'components/DbmlGraphElements/DbGraph'
  import { useEditorStore } from '../store/editor'
  import { computed, onMounted, ref, watch } from 'vue'
  import VDbChart from './VDbChart/VDbChart'

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

  const tables = computed({
    get () {
      if (!props.schema) return []
      return props.schema.tables.map(table => ({
        ...table,
        position: props.positions && props.positions.tablePositions.find(p => p.id === table.id) || {
          x: 0,
          y: 0
        }
      }))
    },
    set (value) {
      emit('update:positions', {
        ...props.positions,
        tablePositions: value.map(table => table.position)
      })
    }
  })

  const refs = computed({
    get () {
      if (!props.schema) return []
      return props.schema.refs

    },
    set (value) {
      // cunt
    }
  })

  const applyAutoLayout = () => {
    // do nothing
  }

  const applyScaleToFit = () => {
    // do nothing
  }


</script>

<style scoped>
  .dbml-graph, .db-chart {
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
