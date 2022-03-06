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
      <v-db-table v-for="(table,i) of tables"
                  v-bind="table"
                  @update:position="v => updatePosition(i,v)"
                  :key="table.id"
                  :container-ref="$refs.root"
      />
    </g>
  </svg>
</template>

<script setup>
  import { ref } from 'vue'
  import VDbTable from './VDbTable'

  const props = defineProps({
    tables: {
      type: Array,
      default: () => ([])
    }
  })
  const emit  = defineEmits(['update:tables'])
  const root = ref(null)

  const updatePosition = (index, position) => {
    const tables = props.tables
    tables[index].position = position
    emit('update:tables', tables)
  }

</script>

<style scoped>

</style>
