<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" :seamless="tab === 'theme'">
    <q-card class="q-dialog-plugin ace-preferences-dialog">
      <dialog-layout>
        <template #header>
          <q-toolbar>
            <q-tabs v-model="tab">
              <q-tab name="general">General</q-tab>
              <q-tab name="theme">Theme</q-tab>
            </q-tabs>
          </q-toolbar>
        </template>

        <q-tab-panels v-model="tab">
          <q-tab-panel name="general"></q-tab-panel>
          <q-tab-panel name="theme">
            <div class="flex row justify-evenly">

              <ace-theme-preview-card v-for="theme of themes"
                                      :key="theme"
                                      :theme="theme"
                                      :width="'30%'"
                                      :active="preferences.theme === theme.name"
                                      @click="() => setTheme(theme)"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <template #footer>
          <q-toolbar>
            <q-space/>
            <q-btn flat color="primary" label="OK" @click="onOKClick"/>
            <q-btn flat color="primary" label="Cancel" @click="onCancelClick"/>
          </q-toolbar>
        </template>
      </dialog-layout>
    </q-card>
  </q-dialog>
</template>

<script>
  import { useDialogPluginComponent } from 'quasar'
  import { ref } from 'vue'
  import ace from 'ace-builds'
  import AceThemePreviewCard from './AceThemePreviewCard'
  import { useEditorStore } from '../store/editor'
  import DialogLayout from '../layouts/DialogLayout'

  export default {
    name: 'AcePreferencesDialog',
    components: {
      DialogLayout,
      AceThemePreviewCard
    },
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

      const editor = useEditorStore()
      const themelist = ace.require('ace/ext/themelist')
      const themes = ref(themelist.themes)

      return {
        setTheme (newTheme) {
          editor.preferences.theme = newTheme.name
          //console.log(themelist, themelist.themesByName[editor.preferences.theme])
        },
        dialogRef,
        onDialogHide,
        onOKClick () {
          onDialogOK()
        },
        onCancelClick: onDialogCancel,

        tab: ref('general'),
        themes,
        preferences: editor.preferences
      }
    }
  }
</script>

<style scoped>
  .ace-preferences-dialog {
    width: 80vw;
    max-width: 800px;
    height: 50vh;
  }
</style>
