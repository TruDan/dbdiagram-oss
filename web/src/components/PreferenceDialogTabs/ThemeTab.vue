<template>
  <div class="flex row justify-evenly">
    <ace-theme-preview-card v-for="theme of themes"
                            :key="theme"
                            :theme="theme"
                            :width="'30%'"
                            :active="editor.preferences.theme === theme.name"
                            @click="() => setTheme(theme)"
    />
  </div>
</template>

<script setup>

  import { useEditorStore } from '../../store/editor'
  import ace from 'ace-builds'
  import { ref } from 'vue'

  import AceThemePreviewCard from '../AceThemePreviewCard'

  const editor = useEditorStore()

  const themelist = ace.require('ace/ext/themelist')
  const themes = ref(themelist.themes)

  function setTheme (newTheme) {
    editor.preferences.theme = newTheme.name
  }
</script>

