import { defineStore } from "pinia";
import { Parser } from "@dbml/core";
import { throttle } from "quasar";

export const useEditorStore = defineStore("editor", {
  state: () => ({
    source: {
      format: "dbml",
      text: ""
    },
    database: {
      schemas: [
        {
          tables: [],
          refs: []
        }
      ]
    }
  }),
  getters: {
    getSourceFormat(state) {
      return state.source.format;
    },
    getSourceText(state) {
      return state.source.text;
    },
    getDatabase(state) {
      return state.database;
    }
  },
  actions: {
    updateSourceText(sourceText) {
      if (sourceText === this.source.text) return;
      this.$patch({
        source: {
          text: sourceText
        }
      })
    },
    updateDatabase() {
      try {
        const database = Parser.parse(this.source.text, this.source.format);
        this.database = database;
      } catch (e) {
        // do nothing
      }
    }
  }
});
