<template>
  <svg
    ref="root"
    class="db-table"
    :x="position.x"
    :y="position.y"
    :width="size.width"
    :height="size.height"
  >
    <g class="db-table-header">
      <rect
        height="32"
        :width="size.width"
        :fill="headerColor"
      />
      <text class="db-table-header__name"
            y="16"
      >
        {{ name }}
      </text>
      <title>{{ name }}</title>
    </g>
    <g class="db-table-fields">
      <v-db-field v-for="field of fields"
                  v-bind="field"
                  :key="field.id"
                  :width="size.width"
      />
    </g>
  </svg>
</template>

<script>
  import { computed, ref } from 'vue'
  import VDbField from './VDbField'

  export default {
    name: 'VDbTable',
    components: { VDbField },
    props: {
      id: Number,
      selection: String,
      token: Object,
      group: Object,
      name: String,
      alias: String,
      note: String,
      indexes: Array,
      schema: Object,
      headerColor: {
        type: String,
        default: () => ('')
      },
      dbState: Object,
      fields: {
        type: Array,
        default: () => ([])
      },
      position: {
        type: Object,
        default: () => ({
          x: 0,
          y: 0
        })
      }
    },
    setup (props) {
      const root = ref(null)

      const size = computed(() => ({
        width: 200,
        height: 32 + (29 * props.fields.length)
      }))

      return {
        root,
        size
      }
    }
  }
</script>

<style scoped>

</style>
