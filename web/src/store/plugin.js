import { debounce, throttle, useQuasar, Dark } from "quasar";

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
  return undefined;
};

const throttledSave = debounce(save, 250);

export default ({ store }) => {
  if (store.$id === "editor") {

    const q = useQuasar();

    const throttledDatabaseUpdate = debounce(() => store.updateDatabase(), 250);
    const autoSave = debounce(() => {
      console.log("autosave");
      store.saveFile()
    }, 500);
    const handlePreferencesUpdate = (payload) => {
      if(!payload) {
        return;
      }
      if (payload.dark !== undefined) {
        Dark.set(payload.dark);
      }
    };

    (() => {
      const currentFile = load("currentFile") || 'Untitled';
      const preferences = load("preferences") || {};

      store.$patch({
        currentFile: currentFile,
        preferences: preferences
      });
      store.loadFileList();
      store.loadFile(currentFile);
      handlePreferencesUpdate(preferences);
    })();

    store.$subscribe((mutation, state) => {
      if (mutation.storeId === "editor" && mutation.payload) {
        if ("source" in mutation.payload) {
          throttledDatabaseUpdate();
          autoSave();
        }
        if ("currentFile" in mutation.payload) {
          throttledSave("currentFile", state.currentFile);
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
