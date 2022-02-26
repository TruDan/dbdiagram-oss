import { boot } from 'quasar/wrappers'
import { createPinia } from "pinia";

export default boot(({ app }) => {
  const pinia = createPinia();
  app.use(pinia);
});
