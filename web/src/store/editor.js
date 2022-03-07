import { defineStore } from "pinia";
import { Parser } from "@dbml/core";
import { throttle } from "quasar";

const encode = (value) => btoa(JSON.stringify(value));
const decode = (encoded) => JSON.parse(atob(encoded));

const save = (key, value) => {
  localStorage.setItem(`dbml-file-${key}`, encode(value));
};
const load = (key) => {
  const value = localStorage.getItem(`dbml-file-${key}`);
  if (value) {
    return decode(value);
  }
  return {};
};
const del = (key) => {
  const item = localStorage.getItem(`dbml-file-${key}`);
  if (item) {
    localStorage.removeItem(`dbml-file-${key}`);
  }
};
const list = () => {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^dbml-file-.*/.test(key)) {
      items.push(key.replace(/^dbml-file-(.*)/, "$1"));
    }
  }
  return items;
};

export const useEditorStore = defineStore("editor", {
  state: () => ({
    currentFile: "",
    files: [],
    source: {
      format: "dbml",
      text: "",
      markers: {
        selection: {
          start: {
            row: null,
            col: null
          },
          end: {
            row: null,
            col: null
          }
        }
      }
    },
    saving: false,
    lastSave: 0,
    positions: {
      tablePositions: [],
      refVertices: []
    },
    database: {
      schemas: [
        {
          tables: [],
          refs: []
        }
      ]
    },
    preferences: {
      dark: false,
      theme: "dracula",
      split: 25.0
    },
    parserError: {
      location: {
        start: { row: undefined, col: undefined },
        end: { row: undefined, col: undefined }
      },
      type: undefined,
      message: undefined
    }
  }),
  getters: {
    findField(state) {
      return ((fieldId) => {
        let field = null;
        for (const schema of state.database.schemas) {
          for (const table of schema.tables) {
            field = table.fields.find(f => f.id === fieldId);
            if (field) {
              return field;
            }
          }
        }
        return undefined;
      });
    },
    findTable(state) {
      return ((tableId) => {
        let table = null;
        for (const schema of state.database.schemas) {
          table = schema.tables.find(t => t.id === tableId);
          if (table)
            return table;
        }
        return undefined;
      });
    },
    getSourceFormat(state) {
      return state.source.format;
    },
    getSourceText(state) {
      return state.source.text;
    },
    getDatabase(state) {
      return state.database;
    },
    getPositions(state) {
      return state.positions;
    },
    getPreferences(state) {
      return state.preferences;
    },
    getDark(state) {
      return state.preferences.dark;
    },
    getTheme(state) {
      return state.preferences.theme;
    },
    getSplit(state) {
      return state.preferences.split;
    },
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
      this.files = list();
    },
    loadFile(fileName) {
      this.loadFileList();
      console.log("loading file", fileName);
      const file = load(fileName);

      if (file && file.source && file.positions) {
        const source = file.source;
        const positions = file.positions;
        this.clearDatabase();
        this.$patch({
          currentFile: fileName,
          source: source,
          positions: positions
        });
        this.clearParserError();
        this.updateDatabase();
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

      const file = {
        source: this.source,
        positions: this.positions
      };
      save(fileName, file);
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
        source: {
          format: "dbml",
          text: "",
          markers: {
            selection: {
              start: {
                row: null,
                col: null
              },
              end: {
                row: null,
                col: null
              }
            }
          }
        },
        positions: {
          tablePositions: [],
          refVertices: []
        }
      });
      this.saveFile();
    },
    deleteFile(fileName) {
      if (!fileName) return;
      del(fileName);
      this.loadFileList();

    },
    renameFile(newName) {
      const oldName = this.currentFile;
      this.saveFile(newName);
      if (oldName !== newName) {
        this.deleteFile(oldName);
      }
      this.loadFileList();
    },
    updateSourceText(sourceText) {
      if (sourceText === this.source.text) return;
      this.$patch({
        source: {
          text: sourceText
        }
      });
    },
    updatePositions(positions) {
      this.$patch({
        positions: positions
      });
    },
    clearDatabase() {
      this.database = {
        schemas: [
          {
            tableGroups: [],
            tables: [],
            refs: []
          }
        ]
      };
      this.clearParserError();
    },
    updateDatabase() {
      console.log("updating database...");
      try {
        const database = Parser.parse(this.source.text, this.source.format);
        database.normalize();
        this.database = database;
        this.clearParserError();
        console.log("updated database");
      } catch (e) {
        // do nothing
        console.error(e);
        this.updateParserError(e);
      }
    },
    updatePreferences(preferences) {
      this.$patch({
        preferences: preferences
      });
    },
    updateDark(dark) {
      this.$patch({
        preferences: {
          dark: dark
        }
      });
    },
    updateTheme(theme) {
      this.$patch({
        preferences: {
          theme
        }
      });
    },
    updateSplit(split) {
      this.$patch({
        preferences: {
          split
        }
      });
    },
    updateSelectionMarker(start, end) {
      this.$patch({
        source: {
          markers: {
            selection: {
              start: start,
              end: end
            }
          }
        }
      });
    },
    clearParserError() {
      this.updateParserError(undefined);
    },
    updateParserError(err) {
      if (err) {
        this.$patch({
          parserError: {
            location: {
              start: { row: err.location.start.line - 1, col: err.location.start.column - 1 },
              end: { row: err.location.end.line - 1, col: err.location.end.column - 1 }
            },
            type: 'error',
            message: err.message
          }
        });
      } else {
        this.$patch({
          parserError: undefined
        });
      }
    }
  }
});
