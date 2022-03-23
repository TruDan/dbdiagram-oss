import { debounce, throttle, useQuasar } from "quasar";

// const encode = (value) => btoa(JSON.stringify(value));
// const decode = (encoded) => JSON.parse(atob(encoded));
const encode = (value) => JSON.stringify(value);
const decode = (encoded) => JSON.parse(encoded);

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
  if (store.$id === "editor") {

    const q = useQuasar();

    const throttledDatabaseUpdate = debounce(() => store.updateDatabase(), 250);
    const handlePreferencesUpdate = (payload) => {
      if (payload.dark !== undefined) {
        q.dark.set(payload.dark);
      }
    };

    (() => {
      const source = load("source");
      const preferences = load("preferences");

      store.$patch({
        source,
        preferences
      });
      handlePreferencesUpdate(preferences);

      setTimeout(() => {
        store.updateDatabase();
      }, 250);
    })();

    store.$subscribe((mutation, state) => {
      if (mutation.storeId === "editor" && mutation.payload) {
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
  } else if (store.$id === "chart") {

    (() => {
      const chart = load("chart");
      store.$patch(chart);
    })();

    store.$subscribe((mutation, state) => {
      console.log(mutation, state);
      if (mutation.storeId === "chart") {
        throttledSave("chart", state);
      }
    });
  }
}
