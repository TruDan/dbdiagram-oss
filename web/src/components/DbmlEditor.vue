<template>
  <div ref="root" class="dbml-editor-wrapper">
    <v-ace-editor class="dbml-editor"
                  lang="dbml"
                  :theme="theme"
                  v-model:value="sourceCode"
                  :print-margin="false"
                  :options="options"
    />
  </div>
</template>

<script>
  import { VAceEditor } from 'vue3-ace-editor'
  import { computed, ref } from 'vue'
  import { useEditorStore } from 'src/store/editor'

  export default {
    name: 'DbmlEditor',
    components: {
      VAceEditor
    },
    props: ['source'],
    setup (props, { emit }) {
      const editor = useEditorStore();

      const sourceCode = computed({
        get: () => props.source,
        set: (val) => emit('update:source', val)
      })

      const theme = computed({
        get: () => editor.getTheme,
        set: (v) => editor.updateTheme(v)
      });

      const options = ref({
        useWorker: true,

      })

      return {
        sourceCode,
        theme,
        options
      }
    }
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
