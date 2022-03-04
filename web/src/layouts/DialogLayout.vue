<template>
  <q-layout view="hHh lpr lFr" container :style="`height:100%`">
    <q-header>
      <slot name="header"/>
    </q-header>
    <q-page-container>
      <slot/>
    </q-page-container>
    <q-footer class="bg-dark">
      <slot name="footer"/>
    </q-footer>
  </q-layout>
</template>

<script>
  import { useDialogPluginComponent } from 'quasar'

  export default {
    name: 'DialogLayout',
  }
</script>

<style scoped>

</style>
