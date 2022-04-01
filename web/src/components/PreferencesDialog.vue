<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" :seamless="tab === 'theme'">
    <q-card class="q-dialog-plugin ace-preferences-dialog">
      <dialog-layout>
        <template #header>
          <q-toolbar>
            <q-tabs v-model="tab">
              <q-tab v-for="tab of tabs" :name="tab.name">{{ tab.label }}</q-tab>
            </q-tabs>
          </q-toolbar>
        </template>

        <q-tab-panels v-model="tab">
          <q-tab-panel v-for="tab of tabs" :name="tab.name">
            <component :is="tab.component" />
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
  import GeneralTab from './PreferenceDialogTabs/GeneralTab'
  import ThemeTab from './PreferenceDialogTabs/ThemeTab'

  export default {
    name: 'PreferencesDialog',
    components: {
      DialogLayout
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

      const tabs = ref([
        {
          name: 'general',
          label: 'General',
          component: GeneralTab
        },
        {
          name: 'thene',
          label: 'Theme',
          component: ThemeTab
        }
      ])

      return {
        tabs,
        dialogRef,
        onDialogHide,
        onOKClick () {
          onDialogOK()
        },
        onCancelClick: onDialogCancel,
        tab: ref('general')
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
