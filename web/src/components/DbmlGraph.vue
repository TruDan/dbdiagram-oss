<template>
  <div class="dbml-graph-wrapper">
    <div ref="paper" class="dbml-graph">

    </div>
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

<script>
  import { DbGraph } from 'components/DbmlGraphElements/DbGraph'
  import { useEditorStore } from '../store/editor'
  import { onMounted, ref, watch } from 'vue'

  export default {
    name: 'DbmlGraph',
    props: {
      schema: {
        type: Object,
        required: true
      },
      positions: {
        type: Object,
        required: true
      }
    },
    emits: [
      'update:positions',
      'locate:table',
      'locate:field',
    ],
    setup (props, { emit }) {
      const paper = ref(null)
      const graphRef = ref(null)
      const editor = useEditorStore()

      const locateTable = (tableId) => {
        const table = editor.findTable(tableId);
        if(table) {
          emit('locate:table', table);
        }
      }
      const locateField = (fieldId) => {
        const field = editor.findField(fieldId);
        if(field) {
          emit('locate:field', field);
        }
      }

      const mounted = onMounted(() => {
        graphRef.value = new DbGraph(paper.value);
        graphRef.value.on('update:positions', (newPositions) => emit('update:positions', newPositions))
        graphRef.value.on('editor:table:locate', (tableId) => locateTable(tableId))
        graphRef.value.on('editor:field:locate', (fieldId) => locateField(fieldId))

        if (props.schema) {
          graphRef.value.syncSchema(props.schema, props.positions)
        }
      });

      const watchSchema = watch(() => props.schema, (newValue) =>  graphRef.value.syncSchema(newValue, props.positions))
      const watchPositions = watch(() => props.positions, (newValue) =>  graphRef.value.syncPositions(newValue))

      return {
        paper,
        graphRef,
        editor,
        mounted,
        applyAutoLayout () {
          graphRef.value.applyAutoLayout()
        },
        applyScaleToFit () {
          graphRef.value.applyScaleToFit()
        },

        watchSchema,
        watchPositions
      }
    }
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
