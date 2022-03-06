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
  return undefined;
};

const throttledSave = debounce(save, 250);

export default ({ store }) => {
  if (store.$id !== "editor") return;

  const q = useQuasar();

  const autoSave = debounce(() => store.saveFile(), 500);
  const handlePreferencesUpdate = (payload) => {
    if(payload.dark !== undefined) {
      q.dark.set(payload.dark);
    }
  }

  (() => {
    const currentFile = load("currentFile");
    const preferences = load("preferences");

    store.$patch({
      currentFile: currentFile,
      preferences
    });
    store.loadFileList();
    store.loadFile(currentFile);
    handlePreferencesUpdate(preferences);

  })();


  store.$subscribe((mutation, state) => {
    if (mutation.storeId === "editor" && mutation.payload) {
      console.log(mutation.payload);
      if ("positions" in mutation.payload || "source" in mutation.payload) {
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

}
