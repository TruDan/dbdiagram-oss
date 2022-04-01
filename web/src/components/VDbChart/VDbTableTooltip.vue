<template>
  <q-card-section>
    <div class="text-subtitle2">{{ table.name }}</div>
  </q-card-section>
  <q-separator />
  <q-card-section>
    <div class="text-caption">Indexes</div>
    <q-list>
      <q-item v-for="index of table.indexes">
        <q-item-label>{{index.name}}</q-item-label>
      </q-item>
    </q-list>
  </q-card-section>
</template>

<script setup>

  const props = defineProps({
    table: Object
  })

</script>

