import { boot } from 'quasar/wrappers'
import { createPinia } from "pinia";
import plugin from "src/store/plugin"

export default boot(({ app }) => {
  const pinia = createPinia();
  app.use(pinia);
  pinia.use(plugin)
});
