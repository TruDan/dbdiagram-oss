import { defineStore } from "pinia";
import { markRaw } from "vue";

export const useChartStore = defineStore("chart", {
  state: () => ({
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    ctm: [1, 0, 0, 1, 0, 0],
    inverseCtm: [1, 0, 0, 1, 0, 0],
    tables: {},
    refs: {},
    grid: {
      size: 100,
      divisions: 10,
      snap: 5
    },
    loaded: false,
    tooltip: {
      x: 0,
      y: 0,
      show: false,
      component: null,
      binds: null,
      width: 0,
      height: 0
    }
  }),
  getters: {
    subGridSize(state) {
      return state.grid.size / state.grid.divisions;
    },
    persistenceData(state) {
      const { zoom, pan, ctm, inverseCtm, tables, refs } = state;
      return  { zoom, pan, ctm, inverseCtm, tables, refs };
    },
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
        if (!(tableId in state.tables))
          state.tables[tableId] = {
            x: 0,
            y: 0,
            width: 200,
            height: 32
          };
        return state.tables[tableId];
      };
    },
    getRef(state) {
      return (refId) => {
        if (!(refId in state.refs))
          state.refs[refId] = {
            endpoints: [],
            vertices: [],
            auto: true
          };
        return state.refs[refId];
      };
    },
    save(state) {
      return {
        zoom: state.zoom,
        pan: state.pan,
        ctm: state.ctm,
        inverseCtm: state.inverseCtm,
        tables: state.tables,
        refs: state.refs,
        grid: state.grid
      };
    }
  },
  actions: {
    showTooltip({x, y}, component, binds) {
      this.tooltip = {
        x,
        y,
        component: markRaw(component),
        binds,
        show: true
      };
    },
    hideTooltip() {
      this.tooltip = {
        x:0,
        y:0,
        width:0,
        height:0,
        component: null,
        binds: null,
        show: false
      };
    },
    loadDatabase(database) {
      for(const table of database.schemas[0].tables)
      {
        this.getTable(table.id);
      }
      for(const ref of database.schemas[0].refs)
      {
        this.getRef(ref.id);
      }

      this.loaded = true;
    },
    load(state) {
      this.$reset();
      this.$patch({
        ...state,
        ctm: DOMMatrix.fromMatrix(state.ctm),
        inverseCtm: DOMMatrix.fromMatrix(state.inverseCtm).inverse()
      });
    },
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
      });
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
});
