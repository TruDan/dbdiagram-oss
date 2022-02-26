<template>
  <q-page>
    <q-splitter v-model="splitterModel"

                class="editor-wrapper">
      <template #before>
        <dbml-editor class="db-code-editor"
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

<script>
  import { computed, nextTick, onMounted, ref } from 'vue'
  import DbmlEditor from 'components/DbmlEditor'
  import DbmlGraph from 'components/DbmlGraph'
  import { useEditorStore } from 'src/store/editor'
  import { throttle } from 'quasar';

  export default {
    name: 'Editor',
    components: { DbmlEditor, DbmlGraph },
    setup () {
      const editor = useEditorStore();
      const updateDatabaseThrottled = throttle(() => {
        editor.updateDatabase();
      }, 250);
      const saveToLocalStorageThrottled = throttle((v) => {
        localStorage.setItem("dbml-source", btoa(v))
      }, 250);
      const updateSourceText = (src) => {
        editor.updateSourceText(src);
        saveToLocalStorageThrottled(src);
        updateDatabaseThrottled();
      }
      const sourceText = computed({
        get: () => editor.getSourceText,
        set: updateSourceText
      });

      onMounted(() => {
        const src = localStorage.getItem('dbml-source');
        console.log("Loaded", atob(src))
        if(src != null) {
          updateSourceText(atob(src));
          setTimeout(() => {
            editor.updateDatabase();
          }, 250);
        }
      })


      const schema = computed(() => editor.getDatabase?.schemas?.find(x => true));
      const splitterModel = ref(25); // start at 25%


      return {
        sourceText,
        schema,
        updateSourceText,
        splitterModel
      }
    }
  }
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
