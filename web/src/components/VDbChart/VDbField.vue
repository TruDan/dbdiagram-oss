<template>
  <svg
    ref="root"
    :class="{
      'db-field':true,
      'db-field__pk': pk,
      'db-field__unique': unique,
      'db-field__not_null': not_null,
      'db-field__increment': increment,
      'db-field__ref': endpoints.length > 0
    }"
    :x="position.x"
    :y="position.y"
    :width="size.width"
    :height="size.height"
  >
    <rect
      :height="size.height"
      :width="size.width"
    />
    <text class="db-field__name"
          :y="size.height/2">
      {{ name }}
    </text>
    <text class="db-field__type"
          :x="size.width"
          :y="size.height/2">
      {{ type.type_name }}
    </text>
    <title>{{name}} ({{type.type_name}})</title>
  </svg>
</template>

<script>
  import { computed, ref } from 'vue'

  export default {
    name: 'VDbField',
    props: {
      id: Number,
      selection: String,
      token: Object,
      name: String,
      type: Object,
      unique: Boolean,
      pk: Boolean,
      dbState: Object,
      not_null: Boolean,
      note: String,
      dbdefault: Object,
      increment: Boolean,
      width: Number,
      table: Object,
      endpoints: Array,
      _enum: Object
    },
    setup (props) {
      const root = ref(null)

      const size = computed(() => ({
        width: props.width,
        height: 29
      }))

      const position = computed(() => ({
        x: 0,
        y: 32 + (props.table.fields.findIndex(f => f.id === props.id) * 29)
      }))

      return {
        root,
        size,
        position
      }
    }
  }
</script>

<style scoped>

</style>
