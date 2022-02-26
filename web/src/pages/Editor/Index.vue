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
          v-model:positions="positions"
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
  import { debounce, throttle } from 'quasar'

  export default {
    name: 'Editor',
    components: { DbmlEditor, DbmlGraph },
    setup () {
      const editor = useEditorStore();
      const updateDatabaseThrottled = debounce(() => {
        editor.updateDatabase();
      }, 250);
      const saveSourceToLocalStorageThrottled = throttle((v) => {
        localStorage.setItem("dbml-source", btoa(v))
      }, 250);
      const savePositionsToLocalStorageThrottled = throttle((v) => {
        localStorage.setItem("dbml-positions", btoa(JSON.stringify(v)))
      }, 250);
      const updateSourceText = (src) => {
        editor.updateSourceText(src);
        saveSourceToLocalStorageThrottled(src);
        updateDatabaseThrottled();
      }
      const sourceText = computed({
        get: () => editor.getSourceText,
        set: updateSourceText
      });

      const updatePositions = (src) => {
        editor.updatePositions(src);
        savePositionsToLocalStorageThrottled(src);
      }

      const positions = computed({
        get: () => editor.getPositions,
        set: updatePositions
      })

      onMounted(() => {
        const src = localStorage.getItem('dbml-source');
        const positions = localStorage.getItem('dbml-positions');
        console.log("Loaded", atob(src), JSON.parse(atob(positions)))
        if(src || positions) {
          if(src)
            updateSourceText(atob(src));

          setTimeout(() => {
            editor.updateDatabase();

            if(positions)
              updatePositions(JSON.parse(atob(positions)));
          }, 250);
        }
      })


      const schema = computed(() => editor.getDatabase?.schemas?.find(x => true));
      const splitterModel = ref(25); // start at 25%


      return {
        sourceText,
        schema,
        positions,
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
