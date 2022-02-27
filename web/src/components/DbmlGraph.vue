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
  import { DbGraph } from 'components/DbmlGraphElements/DbGraph';

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
    mounted () {
      this.setupChart()
    },
    data: () => ({
      graph: null
    }),
    watch: {
      schema (newValue) {
        this.graph.syncSchema(newValue, this.positions);
      },
      positions (newValue) {
        this.graph.syncPositions(newValue);
      }
    },
    methods: {
      applyAutoLayout(){
        this.graph.applyAutoLayout();
      },
      applyScaleToFit(){
        this.graph.applyScaleToFit();
      },
      setupChart () {
        const paper = this.$refs.paper;

        this.graph = new DbGraph(paper);

        this.graph.on('update:positions', (newPositions) => {
          this.$emit('update:positions', newPositions);
        })

        if (this.schema) {
          this.graph.syncSchema(this.schema, this.positions)
        }
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
