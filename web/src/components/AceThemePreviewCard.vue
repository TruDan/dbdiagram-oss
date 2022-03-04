<template>
  <q-card
    :class="[
    'ace-theme-preview-card',
    'q-ma-sm',
    {
      'ace-theme-preview-card__active': active
    }]"
    :style="`width:${width};height:${height};`"
    bordered
    class="flex column"
  >
    <q-card-section class="col col-grow">
      <div :class="['ace_editor', `ace-${theme.name}`,`ace-${theme.name.replace('_','-')}`, { 'ace_dark': !!theme.isDark }]">
        <div class="ace_gutter" aria-hidden="true" style="left:0px;width:2rem;">
          <div class="ace_layer ace_gutter-layer ace_folding-enabled" style="height: 1e+06px; top: 0px; left: 0px; width: 2rem;">
            <div class="ace_gutter-cell " style="height: 1rem; top: 0rem;">1<span style="display: none;"></span></div>
            <div class="ace_gutter-cell " style="height: 1rem; top: 1rem;">2<span style="display: none;"></span></div>
            <div class="ace_gutter-cell " style="height: 1rem; top: 2rem;">3<span style="display: none;"></span></div>
            <div class="ace_gutter-cell " style="height: 1rem; top: 3rem;">4<span style="display: none;"></span></div>
            <div class="ace_gutter-cell " style="height: 1rem; top: 4rem;">5<span style="display: none;"></span></div>
            <div class="ace_gutter-cell " style="height: 1rem; top: 5rem;">6<span style="display: none;"></span></div>
          </div>
        </div>
        <div class="ace_scroller" style="line-height:1rem;left:2rem;">
          <div class="ace_content">
            <div class="ace_layer ace_marker-layer">
              <div class="ace_active-line" style="height: 1rem; top: 1rem; left: 0px; right: 0px;"></div>
            </div>
            <div class="ace_layer ace_text-layer">
              <div class="ace_line" style="height:1rem;top:0rem;"><span class="ace_keyword">Table</span> <span class="ace_identifier">products</span> <span class="ace_paren ace_lparen">{</span></div>
              <div class="ace_line" style="height:1rem;top:1rem;"> id <span class="ace_support ace_function">int</span> [<span class="ace_identifier">pk</span>]</div>
              <div class="ace_line" style="height:1rem;top:2rem;"> name <span class="ace_support ace_function">varchar</span></div>
              <div class="ace_line" style="height:1rem;top:3rem;"> merchant_id <span class="ace_support ace_function">int</span> [<span class="ace_identifier">not</span> <span class="ace_identifier">null</span>]</div>
              <div class="ace_line" style="height:1rem;top:4rem;"> price <span class="ace_support ace_function">int</span></div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="col-auto text-center">
        <div class="q-my-xs q-mx-sm text-caption">{{ theme.caption }}</div>
    </q-card-section>
  </q-card>
</template>

<script>
  import { computed } from 'vue'

  export default {
    name: 'AceThemePreviewCard',
    props: {
      theme: {
        type: Object,
        required: true
      },
      width: {
        type: [String, Number],
        default: () => ('10rem')
      },
      height: {
        type: [String, Number],
        default: () => ('8rem')
      },
      active: {
        type: Boolean,
        default: () => false
      }
    }
  }
</script>

<style scoped lang="scss">
  .ace-theme-preview-card {
    //display: inline-block;
    overflow: hidden;
    user-select: none !important;

    > div {
      //width: 100%;
      //height: 100%;
      padding: 0;
    }

    .ace_editor {
      width: 100%;
      height: 100%;

      > .ace_scroller {
        width: 100%;
        height: 100%;
        cursor: revert !important;

        > .ace_content {
          width: 100%;
          height: 100%;
        }
      }
    }

    &__active {
      border-color: var(--q-primary);
      box-shadow: 0 1px 0.2rem rgba($primary, 25%),
      0 2px 2px rgba($primary, 28%),
      0 3px 1px -2px rgb(0 0 0 / 12%) !important;
    }
  }
</style>
