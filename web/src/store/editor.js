import { defineStore } from "pinia";
import { Parser } from "@dbml/core";
import { throttle } from "quasar";


export const useEditorStore = defineStore("editor", {
  state: () => ({
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
    }
  },
  actions: {
    load(state) {
      this.clearDatabase();
      this.$patch(state);
      this.clearParserError();
      this.updateDatabase();
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
    updateScale(scale) {
      this.$patch({
        positions: {
          scale: scale
        }
      });
    },
    updateTranslation(translation) {
      this.$patch({
        positions: {
          translation: translation
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
