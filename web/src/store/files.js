import { defineStore } from 'pinia'
import { del, list, load, save } from "src/utils/storageUtils";
import { useEditorStore } from "src/store/editor";
import { useChartStore } from "src/store/chart";


export const useFilesStore = defineStore('files', {
  state: () => ({
    saving: false,
    lastSave: 0,
    currentFile: "",
    files: [],
  }),
  getters: {
    getFiles(state) {
      return state.files;
    },
    getCurrentFile(state) {
      return state.currentFile;
    }
  },
  actions: {
    loadFileList() {
      console.log("loading file list");
      this.files = list().filter(i => /^file-.*/.test(i)).map(i => i.replace(/^file-(.*)/, "$1"));
    },
    loadFile(fileName) {
      this.loadFileList();
      console.log("loading file", fileName);
      const file = load(`file-${fileName}`);

      if (file && file.source) {
        const fSource = file.source;
        const fChart = file.chart || {};

        const editor = useEditorStore();
        const chart = useChartStore();

        editor.clearDatabase();

        editor.$patch({
          source: fSource
        });
        chart.$patch(fChart);

        this.$patch({
          currentFile: fileName,
        });

        editor.clearParserError();
        editor.updateDatabase();
      }
    },
    saveFile(fileName) {
      this.saving = true;
      if (!fileName) {
        fileName = this.currentFile;
      }
      if (!fileName) {
        const list = this.files;
        let i = 1;
        fileName = `Untitled (${i})`;

        while (list.indexOf(fileName) >= 0) {
          fileName = `Untitled (${i++})`;
        }
      }
      console.log("saving file", fileName);

      const editor = useEditorStore();
      const chart = useChartStore();

      const file = {
        source: editor.source,
        chart: chart
      };
      save(`file-${fileName}`, file);
      this.loadFileList();
      this.saving = false;
      this.lastSave = new Date();
      if (this.currentFile !== fileName) {
        this.$patch({
          currentFile: fileName
        });
      }
    },
    newFile() {
      this.$patch({
        currentFile: undefined,
      });

      const editor = useEditorStore();
      const chart = useChartStore();

      editor.$reset();
      chart.$reset();
      this.saveFile();
    },
    deleteFile(fileName) {
      if (!fileName) return;
      del(`file-${fileName}`);
      this.loadFileList();

    },
    renameFile(newName) {
      const oldName = this.currentFile;
      this.saveFile(newName);
      if (oldName !== newName) {
        this.deleteFile(oldName);
        this.currentFile = newName;
      }
      this.loadFileList();
    },
  }
})
