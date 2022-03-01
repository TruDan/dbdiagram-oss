<template>
  <div class="q-py-sm flex">
    <q-btn
      padding="sm"
      size="md"
      class="bg-secondary q-mx-xs"
    >
      <q-icon
        size="xs"
        name="save"/>
    </q-btn>
    <q-btn
      padding="sm"
      size="md"
      class="bg-secondary q-mx-xs"
    >
      <q-icon
        size="xs"
        name="settings"
        @click="showAcePreferencesDialog"
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

      const showAcePreferencesDialog = () => {
        $q.dialog({
          component: AcePreferencesDialog
        });
      }

      return {
        dark,
        showAcePreferencesDialog
      }
    }
  }
</script>

<style scoped>

</style>
