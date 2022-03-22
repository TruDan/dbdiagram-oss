import { defineStore } from 'pinia'

export const useChartStore = defineStore('chart', {
  state: () => ({
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    ctm: [ 1, 0, 0, 1, 0, 0 ],
    inverseCtm: [ 1, 0, 0, 1, 0, 0 ],
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
    }
  }
})
