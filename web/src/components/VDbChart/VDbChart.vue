<template>
  <svg
    ref="root"
    class="db-chart"
  >
    <g id="background-layer">

    </g>
    <g id="tablegroups-layer">

    </g>
    <g id="refs-layer">

    </g>
    <g id="tables-layer">
      <v-db-table v-for="table of tables"
                  v-bind="table"
                  :key="table.id"
      />
    </g>
  </svg>
</template>

<script>
  import { ref } from 'vue'
  import VDbTable from './VDbTable'

  export default {
    name: 'VDbChart',
    components: { VDbTable },
    props: {
      tables: {
        type: Array,
        default: () => ([])
      }
    },
    setup (props) {
      const root = ref(null)

      return {
        root
      }
    }
  }
</script>

<style scoped>

</style>
