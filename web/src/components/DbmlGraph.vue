<template>
  <div class="dbml-graph-wrapper">
    <div ref="paper" class="dbml-graph">

    </div>
    <div class="dbml-toolbar-wrapper">
      <q-toolbar class="bg-dark text-white q-btn--rounded">
        <q-btn
          flat
               dense
          @click="autoLayout"
        >
          Auto-Layout
        </q-btn>
      </q-toolbar>
    </div>
  </div>
</template>

<script>
  import { dia, layout, linkTools, shapes } from 'jointjs'
  import { createRefLink, createTableElement, TableElement } from 'components/DbmlGraphElements/TableElement'
  import { GRID_SIZE } from 'components/DbmlGraphElements/constants'
  import { RefLink } from 'components/DbmlGraphElements/RefLink'
  import svgPanZoom from 'svg-pan-zoom'
  import { colors } from 'quasar'
  const { getPaletteColor } = colors
  import * as dagre from '@dagrejs/dagre';
  import * as graphlib from '@dagrejs/graphlib';

  export default {
    name: 'DbmlGraph',
    props: {
      schema: {
        type: Object,
        required: true
      }
    },
    mounted () {
      this.setupChart()
    },
    data: () => ({
      nodes: [],
      edges: [],
      paper: null,
      graph: null,
      panAndZoom: null
    }),
    watch: {
      schema (newValue) {
        this.recalculateNodes(newValue)
      }
    },
    methods: {
      autoLayout() {
        layout.DirectedGraph.layout(this.graph, {
          setLinkVertices: false,
          dagre: dagre,
          graphlib: graphlib
        })
      },
      setupChart () {
        const paper = this.$refs.paper
        const shapeNamespace = {
          ...shapes,
          TableElement,
          RefLink
        }
        this.graph = new dia.Graph({}, { cellNamespace: shapeNamespace })
        this.paper = new dia.Paper({
          el: paper,
          width: 1000,
          height: 800,
          gridSize: GRID_SIZE,
          model: this.graph,
          frozen: true,
          async: true,
          defaultLink: () => new RefLink(),
          sorting: dia.Paper.sorting.APPROX,
          magnetThreshold: 'onleave',
          linkPinning: false,
          snapLinks: true,
          defaultRouter: {
            name: 'manhattan',
            args: {
              step: GRID_SIZE,
              startDirections: ['left', 'right'],
              endDirections: ['left', 'right']
            }
          },
          defaultConnector: {
            name: 'rounded'
          },
          drawGrid: 'fixedDot',

          cellViewNamespace: shapeNamespace,
          validateConnection: (sourceView, _sourceMagnet, targetView, _targetMagnet) => {
            //if (sourceView === targetView) return false
            return true
          }
        })
        this.paper.on('link:mouseenter', function(linkView) {
          let tools = new dia.ToolsView({
            tools: [new linkTools.Vertices()]
          });
          linkView.addTools(tools);
        });

        this.paper.on('link:mouseleave', function(linkView) {
          linkView.removeTools();
        });

        const resizeWatcher = new ResizeObserver((entries) => {
          for (let entry of entries) {
            if (entry.contentBoxSize) {
              const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize

              this.paper.setDimensions(contentBoxSize.width, contentBoxSize.height)
            }
          }
        })
        resizeWatcher.observe(paper)

        this.panAndZoom = svgPanZoom(paper.querySelector('svg'), {
          viewportSelector: paper.childNodes[0].childNodes[0],
          fit: false,
          zoomScaleSensitivity: 0.4,
          panEnabled: false
        })

        this.paper.on({
          'blank:pointerdown': (evt, x, y) => this.panAndZoom.enablePan(),
          'blank:pointerup': (cellView, event) => this.panAndZoom.disablePan(),
        })

        this.graph.resetCells([]);

        if (this.schema) {
          this.recalculateNodes(this.schema)
        }
      },
      redrawChart () {
        const {
          nodes,
          edges
        } = this
        if (!nodes || !edges) return

      },
      /**
       * @param {Schema} schema
       */
      recalculateNodes (schema) {
        this.paper.freeze()

        this.syncTables(schema.tables);
        this.syncRefs(schema.refs);

        this.paper.unfreeze()
      },

      syncTables(tables) {
        for (const table of tables) {
          this.addOrUpdateTable(table)
        }

        for (const table of this.graph.getElements()) {
          if (!tables.some(t => `table-${t.id}` === table.id)) {
            this.graph.removeCells([table])
          }
        }
      },

      syncRefs(refs) {
        for (const ref of refs) {
          this.addOrUpdateRef(ref)
        }

        for (const ref of this.graph.getLinks()) {
          if (!refs.some(t => `ref-${t.id}` === ref.id)) {
            this.graph.removeLinks(ref);
          }
        }
      },

      addOrUpdateTable (table) {
        let cell = this.graph.getCell(`table-${table.id}`)
        if (!cell) {
          cell = createTableElement(table)
          cell.addTo(this.graph);
        }

        for (const field of table.fields) {
          cell.addOrUpdateField(field)
        }

        for (const port of cell.getPorts()) {
          if (!table.fields.some(t => `field-${t.id}` === port.id)) {
            cell.removePort(port)
          }
        }

        return cell
      },

      addOrUpdateRef(ref) {
        let link = this.graph.getCell(`ref-${ref.id}`);
        if(!link) {
          link = createRefLink(ref);
          this.graph.addCell(link);
        }

        const sourceTable = ref.endpoints[0];
        const sourceField = sourceTable.fields[0];

        const targetTable = ref.endpoints[1];
        const targetField = targetTable.fields[0];

        link.source({ id: `table-${sourceTable.id}`, port: `field-${sourceField.id}`});
        link.target({ id: `table-${targetTable.id}`, port: `field-${targetField.id}`});
      }
    }
  }
</script>

<style scoped>
  .dbml-graph {
    height: 100% !important;
    width: 100% !important;
  }

  .dbml-graph-wrapper {
    height: 100% !important;
    width: 100% !important;
    position: relative;
  }

  .dbml-toolbar-wrapper {
    width: 600px;
    align-self: center;
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
  }
</style>
