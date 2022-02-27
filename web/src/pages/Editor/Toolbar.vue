<template>
<q-btn-group>
  <q-btn icon="save" />
  <q-toggle
        v-model:model-value="dark"
        :dark="dark"
        color="secondary"
  />
</q-btn-group>
</template>

<script>
  import { computed } from 'vue'
  import { useEditorStore } from 'src/store/editor'

  export default {
    name: 'Toolbar',
    setup() {
      const editor = useEditorStore();

      const dark = computed({
        get: () => editor.getDark,
        set: (src) => editor.updateDark(src)
      })

      return {
        dark
      };
    }
  }
</script>

<style scoped>

</style>
