<template>
  <div ref="root" class="dbml-editor-wrapper">
    <v-ace-editor class="dbml-editor"
                  lang="dbml"
                  :theme="theme"
                  v-model:value="sourceCode"
                  :print-margin="false"
                  :options="options"
                  @init="editorInit"
    />
  </div>
</template>

<script>
  import { VAceEditor } from 'vue3-ace-editor'
  import { computed, ref } from 'vue'
  import { useEditorStore } from 'src/store/editor'
  import { Range } from 'ace-builds'

  export default {
    name: 'DbmlEditor',
    components: {
      VAceEditor
    },
    props: ['source'],
    setup (props, { emit }) {
      const aceRef = ref({editor: null})
      const editor = useEditorStore()
      const currentMarkerRef = ref({
        markerId: null,
      })

      const sourceCode = computed({
        get: () => props.source,
        set: (val) => emit('update:source', val)
      })

      const theme = computed({
        get: () => editor.getTheme,
        set: (v) => editor.updateTheme(v)
      })

      const highlightTokenRange = (start, end) => {
        if (currentMarkerRef.value.markerId) {
          aceRef.value.editor.session.removeMarker(currentMarkerRef.value.markerId)
          currentMarkerRef.value.markerId = null;
        }
        aceRef.value.editor.session.addMarker(new Range(start.row, start.col, end.row, end.col))
      }

      const options = ref({
        useWorker: true,
      })

      return {
        aceRef,
        currentMarkerRef,
        sourceCode,
        theme,
        options,
        highlightTokenRange,
        editorInit(editor){
          aceRef.value.editor = editor;
        }
      }
    },
  }
</script>

<style scoped>
  .dbml-editor-wrapper {
    width: 100%;
    height: 100%;
  }

  .dbml-editor {
    height: 100%;
  }
</style>
