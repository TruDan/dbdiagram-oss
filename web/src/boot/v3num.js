import { boot } from 'quasar/wrappers'
import VNumber from "src/components/VNumber"

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component('VNumber', VNumber)
})
