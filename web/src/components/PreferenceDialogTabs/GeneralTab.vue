<template>
  <div class="q-gutter-y-lg">
    <div class="q-gutter-y-md">
      <div class="text-subtitle1">Grid</div>
      <div class="row q-col-gutter-x-sm">
        <q-input class="col-md-4 col-lg-3"
                 v-model.number="store.grid.size"
                 type="number"
                 stack-label
                 :label="`Grid Size`"
        />
        <q-input class="col-md-3 col-lg-2 col-xl-2"
                 v-model.number="store.grid.divisions"
                 type="number"
                 stack-label
                 :label="`Divisions`"
        />
      </div>
      <div class="row q-col-gutter-x-sm">
        <q-input class="col-md-3 col-lg-2 col-xl-2"
                 v-model.number="store.grid.snap"
                 type="number"
                 stack-label
                 :label="`Snap`"
        />
      </div>
    </div>

    <q-separator/>

    <div>
      <div class="text-subtitle1"></div>
      <div class="row q-col-gutter-x-sm">
      </div>
    </div>

    <q-space/>
  </div>
</template>

<script setup>

  import { useChartStore } from '../../store/chart'

  const store = useChartStore()

</script>
