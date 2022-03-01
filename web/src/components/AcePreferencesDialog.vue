<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin ace-preferences-dialog">

      <q-tabs v-model="tab">
        <q-tab name="general">General</q-tab>
        <q-tab name="theme">Theme</q-tab>
      </q-tabs>

      <q-tab-panels v-model="tab">
        <q-tab-panel name="general"></q-tab-panel>
        <q-tab-panel name="theme">
          <div class="flex row justify-evenly">
            <ace-theme-preview-card v-for="theme of themes"
                                    :key="theme"
                                    :theme="theme"
                                    :width="'30%'"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick"/>
        <q-btn color="primary" label="Cancel" @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
  import { useDialogPluginComponent } from 'quasar'
  import { ref } from 'vue'
  import ace from 'ace-builds'
  import AceThemePreviewCard from './AceThemePreviewCard'

  export default {
    name: 'AcePreferencesDialog',
    components: { AceThemePreviewCard },
    props: {},
    emits: [
      ...useDialogPluginComponent.emits
    ],

    setup () {
      const {
        dialogRef,
        onDialogHide,
        onDialogOK,
        onDialogCancel
      } = useDialogPluginComponent()
      const themelist = ace.require('ace/ext/themelist')

      console.log(ace)
      const themes = ref(themelist.themes)
      return {
        dialogRef,
        onDialogHide,
        onOKClick () {
          onDialogOK()
        },
        onCancelClick: onDialogCancel,

        tab: ref('general'),
        themes
      }
    }
  }
</script>

<style scoped>
  .ace-preferences-dialog {
    width: 80vw;
    max-width: 800px;
    max-height: 65vh;
  }
</style>
