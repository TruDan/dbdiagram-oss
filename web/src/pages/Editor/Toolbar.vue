<template>
  <div class="q-py-sm flex">
    <q-btn-dropdown split dense
                    no-caps
                    class="dbml-fileselector bg-secondary"
                    align="left"
                    @click="() => renameFile()"
                    anchor="bottom right" self="top right">

      <template #label>
        <span class="block q-mx-sm">
          {{ currentFile }}
        </span>
      </template>

      <q-list dense>
        <q-item v-for="file of fileItems" :key="file"
                clickable
                @click="() => loadFile(file)"
        >
          <q-item-section class="q-py-xs">
            <q-item-label>{{ file }}</q-item-label>
          </q-item-section>
          <q-item-section thumbnail>
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

      <q-list dense>
        <q-item v-for="exportOption of exportOptions"
                :key="exportOption.id"
                clickable
                dense
        >
          <q-item-section>
            <q-item-label>{{ exportOption.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
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
  <q-btn
    padding="sm"
    size="md"
    class="bg-secondary q-mx-xs"
    @click="showPreferencesDialog"
  >
    <q-icon
      size="xs"
      name="settings"
    />
  </q-btn>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useEditorStore } from 'src/store/editor'
  import { useQuasar } from 'quasar'
  import PreferencesDialog from '../../components/PreferencesDialog'
  import { useFilesStore } from '../../store/files'

  const editor = useEditorStore()
  const files = useFilesStore()
  const $q = useQuasar()

  const exportOptions = ref([
    {
      id: 'json',
      label: 'Json'
    },
    {
      id: 'mysql',
      label: 'MySQL'
    },
    {
      id: 'postgres',
      label: 'PostgreSQL'
    },
    {
      id: 'mssql',
      label: 'SQL Server'
    },
    {
      id: 'svg',
      label: 'SVG'
    },
    {
      id: 'png',
      label: 'PNG'
    },
    {
      id: 'pdf',
      label: 'PDF'
    }
  ])

  const dark = computed({
    get: () => editor.getDark,
    set: (src) => editor.updateDark(src)
  })

  const currentFile = computed({
    get: () => files.getCurrentFile,
    set: (file) => files.loadFile(file)
  })

  const fileItems = computed(() => files.getFiles)

  const deleteFile = (file) => files.deleteFile(file)
  const newFile = () => files.newFile()
  const saveFile = () => files.saveFile()
  const loadFile = (file) => files.loadFile(file)

  const confirmDeleteFile = (file) => {
    $q.dialog({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the file '${file}'?`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      console.log('delete confirmed', file)
      deleteFile(file)
    })
  }

  const renameFile = (file) => {
    if (file === undefined) {
      file = files.currentFile
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
      files.renameFile(newFile)
    })
  }

  const showPreferencesDialog = () => {
    $q.dialog({
      component: PreferencesDialog
    })
  }

</script>

<style scoped>
  .dbml-fileselector {
    min-width: 15rem;
  }
</style>
