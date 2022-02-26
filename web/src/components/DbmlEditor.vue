<template>
  <div ref="root" class="dbml-editor-wrapper">
    <v-ace-editor class="dbml-editor"
                  lang="text"
                  theme="chrome"
                  v-model:value="sourceCode"
                  :print-margin="false"
                  :options="{
                    useWorker: true
                  }"
    />
  </div>
</template>

<script>
  import { VAceEditor } from 'vue3-ace-editor'
  import { computed, ref } from 'vue'

  export default {
    name: 'DbmlEditor',
    components: {
      VAceEditor
    },
    props: ['source'],
    setup (props, { emit }) {

      const sourceCode = computed({
        get: () => props.source,
        set: (val) => emit('update:source', val)
      })

      return {
        sourceCode
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
