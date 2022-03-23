<template>
  <div class="q-py-sm flex">
    <q-btn-dropdown split dense :label="currentFile"
                    @click="() => renameFile()">
      <q-list dense style="width: 300px;">
        <q-item v-for="file of files" :key="file"
                clickable
                @click="() => loadFile(file)"
        >
          <q-item-section>
            <q-item-label>{{ file }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="delete"
              size="sm"
              flat
              dense
              round
              @click="() => confirmDeleteFile(file)"
            />
          </q-item-section>
        </q-item>
        <q-separator/>
        <q-item clickable
                dense
                @click="newFile"
        >
          <q-item-section>
            <q-item-label class="text-italic">Create New File</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn
      padding="sm"
      size="md"
      class="bg-secondary q-mx-xs"
      @click="saveFile"
    >
      <q-icon
        size="xs"
        name="save"/>
    </q-btn>
    <q-btn
      padding="sm"
      size="md"
      class="bg-secondary q-mx-xs"
      @click="showAcePreferencesDialog"
    >
      <q-icon
        size="xs"
        name="settings"
      />
    </q-btn>

    <q-btn-dropdown
      padding="xs sm"
      size="md"
      color="secondary"
      class="q-mx-xs"
    >
      <template #label>
        <q-icon
          class="q-mr-sm"
          size="xs"
          name="file_download"/>
        Export
      </template>
    </q-btn-dropdown>
    <q-btn-dropdown
      padding="xs sm"
      size="md"
      color="secondary"
      class="q-mx-xs"
    >
      <template #label>
        <q-icon
          class="q-mr-sm"
          size="xs"
          name="file_upload"/>
        Import
      </template>
    </q-btn-dropdown>
  </div>
  <q-space/>
  <q-btn
    padding="sm"
    size="md"
    class="bg-secondary"
    @click.capture="dark = !dark">
    <q-icon
      class="q-mr-xs"
      size="xs"
      name="dark_mode"/>
    <q-toggle
      ref="dark_toggle"
      class="q-ml-sm no-pointer-events"
      size="sm"
      dense
      color="primary"
      :model-value="dark"
      :dark="dark">
    </q-toggle>
  </q-btn>
</template>

<script>
  import { computed } from 'vue'
  import { useEditorStore } from 'src/store/editor'
  import { useQuasar } from 'quasar'
  import AcePreferencesDialog from '../../components/AcePreferencesDialog'

  export default {
    name: 'Toolbar',
    setup () {
      const editor = useEditorStore()
      const $q = useQuasar()

      const dark = computed({
        get: () => editor.getDark,
        set: (src) => editor.updateDark(src)
      })

      const currentFile = computed({
        get: () => editor.getCurrentFile,
        set: (file) => editor.loadFile(file)
      })

      const files = computed(() => editor.getFiles)

      const deleteFile = (file) => editor.deleteFile(file)
      const newFile = () => editor.newFile()
      const saveFile = () => editor.saveFile()
      const loadFile = (file) => editor.loadFile(file)

      const confirmDeleteFile = (file) => {
        $q.dialog({
          title: 'Confirm Deletion',
          message: `Are you sure you want to delete the file '${file}'?`,
          cancel: true,
          persistent: true
        }).onOk(() => {
          console.log('delete confirmed', file)
          editor.deleteFile(file);
        })
      }

      const renameFile = (file) => {
        if(file === undefined) {
          file = editor.currentFile;
        }
        $q.dialog({
          title: 'Rename file',
          message: 'Enter a new file name below.',
          prompt: {
            model: file,
            type: 'text'
          },
          cancel: true,
          persistent: false
        }).onOk(newFile => {
          console.log('rename to ', newFile)
          editor.renameFile(newFile);
        })
      }

      const showAcePreferencesDialog = () => {
        $q.dialog({
          component: AcePreferencesDialog
        })
      }

      return {
        dark,
        currentFile,
        files,
        saveFile,
        loadFile,
        newFile,
        renameFile,
        confirmDeleteFile,
        showAcePreferencesDialog
      }
    }
  }
</script>

<style scoped>

</style>
