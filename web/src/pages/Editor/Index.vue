<template>
  <q-page>
    <q-splitter v-model="split"
                :limits="[10,75]"
                class="editor-wrapper">
      <template #before>
        <dbml-editor ref="editorRef"
                     class="db-code-editor"
                     v-model:source="sourceText"
        />
      </template>
      <template #after>
        <dbml-graph
          class="db-graph-view"
          :schema="schema"
        />
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import DbmlEditor from 'components/DbmlEditor'
  import DbmlGraph from 'components/DbmlGraph'
  import { useEditorStore } from 'src/store/editor'
  import { debounce, throttle, useQuasar } from 'quasar'

  const editorRef = ref(null)
  const editor = useEditorStore()
  const q = useQuasar()

  const sourceText = computed({
    get: () => editor.getSourceText,
    set: (src) => editor.updateSourceText(src)
  })

  const preferences = computed({
    get: () => editor.getPreferences,
    set: (src) => editor.updatePreferences(src)
  })
  const split = computed({
    get: () => editor.getSplit,
    set: (src) => editor.updateSplit(src)
  })

  const schema = computed(() => editor.getDatabase?.schemas?.find(x => true))
</script>

<style scoped>
  .editor-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
