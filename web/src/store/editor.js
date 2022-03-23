import { defineStore } from 'pinia'
import { Parser } from '@dbml/core'
import { throttle } from 'quasar'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    source: {
      format: 'dbml',
      text: '',
      markers: {
        selection: {
          start: {
            row: null,
            col: null
          },
          end: {
            row: null,
            col: null
          },
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
      dark: true,
      theme: 'dracula',
      split: 25.0,
    }
  }),
  getters: {
    findField (state) {
      return ((fieldId) => {
        let field = null
        for (const schema of state.database.schemas) {
          for (const table of schema.tables) {
            field = table.fields.find(f => f.id === fieldId)
            if (field) {
              return field
            }
          }
        }
        return undefined
      })
    },
    findTable (state) {
      return ((tableId) => {
        let table = null;
        for (const schema of state.database.schemas) {
          table = schema.tables.find(t => t.id === tableId)
          if(table)
            return table;
        }
        return undefined;
      })
    },
    getSourceFormat (state) {
      return state.source.format
    },
    getSourceText (state) {
      return state.source.text
    },
    getDatabase (state) {
      return state.database
    },
    getPositions (state) {
      return state.positions
    },
    getPreferences (state) {
      return state.preferences
    },
    getDark (state) {
      return state.preferences.dark
    },
    getTheme (state) {
      return state.preferences.theme
    },
    getSplit (state) {
      return state.preferences.split
    }
  },
  actions: {
    updateSourceText (sourceText) {
      if (sourceText === this.source.text) return
      this.$patch({
        source: {
          text: sourceText
        }
      })
    },
    updatePositions (positions) {
      this.$patch({
        positions: positions
      })
    },
    updateDatabase () {
      try {
        const database = Parser.parse(this.source.text, this.source.format)
        this.database = database
      } catch (e) {
        // do nothing
      }
    },
    updatePreferences (preferences) {
      this.$patch({
        preferences: preferences
      })
    },
    updateDark (dark) {
      this.$patch({
        preferences: {
          dark: dark
        }
      })
    },
    updateTheme (theme) {
      this.$patch({
        preferences: {
          theme
        }
      })
    },
    updateSplit (split) {
      this.$patch({
        preferences: {
          split
        }
      })
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
      })
    }
  }
})
