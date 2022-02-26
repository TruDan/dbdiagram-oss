<template>
<q-btn-group>
  <q-btn icon="save" />
  <q-toggle :model-value="$q.dark.isActive" @update:model-value="$q.dark.toggle" />
</q-btn-group>
</template>

<script>
  export default {
    name: 'Toolbar'
  }
</script>

<style scoped>

</style>
