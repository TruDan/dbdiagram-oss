import { debounce, throttle, useQuasar, Dark } from "quasar";
import { decode, encode, save, load } from "src/utils/storageUtils";
import { useFilesStore } from "src/store/files";


const throttledSave = debounce(save, 150);
const autoSave = debounce(() => {
  console.log("autosave");
  const files = useFilesStore();
  files.saveFile()
}, 200);

export default ({ store }) => {
  if (store.$id === "editor") {

    const throttledDatabaseUpdate = debounce(() => store.updateDatabase(), 100);
    const handlePreferencesUpdate = (payload) => {
      if(!payload) {
        return;
      }
      if (payload.dark !== undefined) {
        Dark.set(payload.dark);
      }
    };

    (() => {
      const preferences = load("preferences") || {};

      store.$patch({
        preferences: preferences
      });
      handlePreferencesUpdate(preferences);
    })();

    store.$subscribe((mutation, state) => {
      if (mutation.storeId === "editor" && mutation.payload) {
        if ("source" in mutation.payload) {
          throttledDatabaseUpdate();
          autoSave();
        }
        if ("preferences" in mutation.payload) {
          throttledSave("preferences", state.preferences);
          handlePreferencesUpdate(mutation.payload.preferences);
        }
      }
    });
  } else if (store.$id === "chart") {
    store.$subscribe((mutation, state) => {
      autoSave();
    });
  }
  else if(store.$id === "files") {

    (() => {
      const currentFile = load("currentFile") || 'Untitled';
      store.$patch({
        currentFile: currentFile
      });
      store.loadFileList();
      store.loadFile(currentFile);
    })();

    store.$subscribe((mutation, state) => {
      if (mutation.storeId === "files" && mutation.payload) {
        if ("currentFile" in mutation.payload) {
          throttledSave("currentFile", state.currentFile);
        }
      }
    });
  }
}
