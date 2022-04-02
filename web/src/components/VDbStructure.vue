<template>
  <q-tree node-key="id" :nodes="nodes"
  dense>

  </q-tree>
</template>

<script setup>
  import { computed } from 'vue'
  import { Database } from '@dbml/core'

  const props = defineProps({
    database: Object
  })

  const nodes = computed(() => {

    /** @type {Database} */
    const database = props.database
    return database.schemas.map(schema => ({
      id: `schema-${schema.id}`,
      icon: 'schema',
      label: schema.name,
      children: [
        {
          id: `schema-${schema.id}-tables`,
          icon: 'source',
          label: 'Tables',
          children: schema.tables.map(table => ({
            id: `table-${table.id}`,
            icon: 'table-view',
            label: table.name,
            children: [
              {
                id: `table-${table.id}-fields`,
                icon: '',
                label: 'Columns',
                children: table.fields.map(field => ({
                  id: `field-${field.id}`,
                  icon: '',
                  label: field.name
                }))
              }
            ]
          }))
        }
      ]
    }))
  })
</script>
