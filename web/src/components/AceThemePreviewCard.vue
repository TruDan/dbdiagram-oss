<template>
  <q-card
    class="ace-theme-preview-card q-ma-sm"
    :style="`width:${width};height:${height};`"
    bordered
  >
    <div :class="classes">
      <div class="ace_scroller">
        <div class="ace_content">
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
        default: () => ('6rem')
      }
    },
    setup (props) {
      const classes = computed(() => (['ace_editor', `ace-${props.theme.name}`].join(' ')))

      return {
        classes
      }
    }
  }
</script>

<style scoped lang="scss">
  .ace-theme-preview-card {
    display: inline-block;
    overflow: hidden;
    user-select: none !important;

    > .ace_editor {
      width: 100%;
      height: 100%;

      > .ace_scroller {
        width: 100%;
        height: 100%;
        cursor: revert !important;

        > .ace_content {
          width: 100%;
          height: 100%;
          padding: 0.25rem 0.5rem;
        }
      }
    }
  }
</style>
