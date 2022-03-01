<template>
  <q-layout view="hHh lpr lfr">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title shrink>
          <q-avatar rounded>
            <q-img src="~assets/logo.png" />
          </q-avatar>
        </q-toolbar-title>
        <router-view name="toolbar"/>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>

  import { defineComponent, ref } from 'vue'

  export default defineComponent({
    name: 'MainLayout',

    components: {},

    setup () {
      const leftDrawerOpen = ref(false)

      return {
        leftDrawerOpen,
        toggleLeftDrawer () {
          leftDrawerOpen.value = !leftDrawerOpen.value
        }
      }
    }
  })
</script>
