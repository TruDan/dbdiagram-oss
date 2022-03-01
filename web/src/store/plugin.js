import { debounce, throttle, useQuasar } from "quasar";

const encode = (value) => btoa(JSON.stringify(value));
const decode = (encoded) => JSON.parse(atob(encoded));

const save = (key, value) => {
  localStorage.setItem(`dbml-${key}`, encode(value));
};
const load = (key) => {
  const value = localStorage.getItem(`dbml-${key}`);
  if (value) {
    return decode(value);
  }
  return {};
};

const throttledSave = debounce(save, 250);

export default ({ store }) => {
  if (store.$id !== "editor") return;

  const q = useQuasar();

  const throttledDatabaseUpdate = debounce(() => store.updateDatabase(), 250);
  const handlePreferencesUpdate = (payload) => {
    if(payload.dark !== undefined) {
      q.dark.set(payload.dark);
    }
  }

  (() => {
    const positions = load("positions");
    const source = load("source");
    const preferences = load("preferences");

    store.$patch({
      positions,
      source,
      preferences
    });
    handlePreferencesUpdate(preferences);

    setTimeout(() => {
      store.updateDatabase();
      store.updatePositions(positions);
    }, 250);

  })();


  store.$subscribe((mutation, state) => {
    if (mutation.storeId === "editor" && mutation.payload) {
      if ("positions" in mutation.payload) {
        throttledSave("positions", state.positions);
      }
      if ("source" in mutation.payload) {
        throttledSave("source", state.source);
        throttledDatabaseUpdate();
      }
      if ("preferences" in mutation.payload) {
        throttledSave("preferences", state.preferences);
        handlePreferencesUpdate(mutation.payload.preferences);
      }
    }
  });

}
