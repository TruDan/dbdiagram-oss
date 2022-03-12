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
  import { computed, ref, watch } from 'vue'
  import { useEditorStore } from 'src/store/editor'
  import { Range } from 'ace-builds'
  import { InlineAnnotation } from './ace/inline_annotation';

  export default {
    name: 'DbmlEditor',
    components: {
      VAceEditor
    },
    props: ['source'],
    setup (props, { emit }) {
      /** @type Ace.Editor */
      let ace = null
      const editor = useEditorStore()
      const currentMarkerRef = ref({
        markerId: null,
        errorMarkerId: null
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
          ace.session.removeMarker(currentMarkerRef.value.markerId)
          currentMarkerRef.value.markerId = null
        }
        const range = new Range(start.row - 1, start.col - 1, end.row - 1, end.col - 1)
        ace.focus()
        ace.clearSelection()
        ace.moveCursorTo(start.row - 1, start.col - 1)
        currentMarkerRef.value.markerId = ace.session.addMarker(range, 'ace_active-line', 'text')
        console.log('highlightTokenRange', currentMarkerRef.value.markerId, start, end)
      }

      const editorInit = (editor) => {
        ace = editor
      }

      const options = ref({
        useWorker: false,
        tabSize: 2,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false
      })

      const subscription = editor.$subscribe((mutation, state) => {
        if (mutation.storeId === 'editor' && mutation.payload) {
          if (
            mutation.payload.source &&
            mutation.payload.source.markers &&
            mutation.payload.source.markers.selection
          ) {
            const range = editor.source.markers.selection
            const startToken = range.start
            const endToken = range.end

            highlightTokenRange({
              row: startToken.line,
              col: startToken.column
            }, {
              row: endToken.line,
              col: endToken.column
            })
          }

          if ('parserError' in mutation.payload) {
            ace.session.clearAnnotations()
            if(currentMarkerRef.value.errorMarkerId) {
              ace.session.removeMarker(currentMarkerRef.value.errorMarkerId);
              currentMarkerRef.value.errorMarkerId = null;
            }

            if (mutation.payload.parserError) {
              const e = state.parserError
              ace.session.setAnnotations([
                new InlineAnnotation(ace.session, {
                  text: e.message,
                  type: e.type,
                  row: e.location.start.row,
                  column: e.location.start.col,
                  endRow: e.location.end.row,
                  endColumn: e.location.end.col
                })
              ])
            }
          }
        }
      })

      return {
        currentMarkerRef,
        sourceCode,
        theme,
        options,
        highlightTokenRange,
        editorInit,
        subscription
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
