<template>
  <svg
    ref="root"
    :id="`field-${id}`"
    :class="{
      'db-field':true,
      'db-field__highlight': highlight,
      'db-field__dragging': dragging,
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
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
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

<script setup>
  import { computed, onMounted, ref } from 'vue'

  const props = defineProps({
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
  })
  const root = ref(null)

  const size = computed(() => ({
    width: props.width,
    height: 29
  }))

  const position = computed(() => ({
    x: 0,
    y: 32 + (props.table.fields.findIndex(f => f.id === props.id) * 29)
  }))

  const mounted = onMounted(() => {
    // nothing so far
  })

  const highlight = ref(false)
  const dragging = ref(false)
  const onMouseEnter = (e) => {
    highlight.value = true
  }
  const onMouseLeave = (e) => {
    highlight.value = false
    dragging.value = false
  }
  const onMouseUp = (e) => {
    dragging.value = false
  }
  const onMouseDown = (e) => {
    dragging.value = true
  }

</script>
