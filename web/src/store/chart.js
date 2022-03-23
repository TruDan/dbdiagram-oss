import { defineStore } from 'pinia'

export const useChartStore = defineStore('chart', {
  state: () => ({
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    ctm: [ 1, 0, 0, 1, 0, 0 ],
    inverseCtm: [ 1, 0, 0, 1, 0, 0 ],
    tables: {},
    refs: {}
  }),
  getters: {
    getPan(state) {
      return state.pan;
    },
    getZoom(state) {
      return state.zoom;
    },
    getCTM(state) {
      return state.ctm;
    },
    getTable(state) {
      return (tableId) => {
        if(!(tableId in state.tables))
          state.tables[tableId] = {
            x: 0,
            y: 0,
            width: 200,
            height: 32
          };
        return state.tables[tableId];
      }
    },
    getRef(state) {
      return (refId) => {
        if(!(refId in state.refs))
          state.refs[refId] = {
            endpoints: []
          };
        return state.refs[refId];
      }
    }
  },
  actions: {
    updatePan(newPan) {
      this.$patch({
        pan: {
          x: newPan.x,
          y: newPan.y
        }
      });
    },

    updateZoom(newZoom) {
      this.$patch({
        zoom: newZoom
      });
    },

    updateCTM(newCTM) {
      this.$patch({
        ctm: DOMMatrix.fromMatrix(newCTM),
        inverseCtm: DOMMatrix.fromMatrix(newCTM).inverse()
      })
    },

    updateTable(tableId, newTable) {
      this.tables.$patch({
        [tableId]: newTable
      });
    },
    updateRef(refId, newRef) {
      this.refs.$patch({
        [refId]: newRef
      });
    }
  }
})
