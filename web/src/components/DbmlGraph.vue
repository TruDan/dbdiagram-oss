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
        <q-btn
          flat
          dense
          @click="scaleToFit">
          Fit
        </q-btn>
      </q-toolbar>
    </div>
  </div>
</template>

<script>
  import { dia, layout, linkTools, shapes, V } from 'jointjs'
  import { createRefLink, createTableElement, TableElement } from 'components/DbmlGraphElements/TableElement'
  import { GRID_SIZE } from 'components/DbmlGraphElements/constants'
  import { RefLink } from 'components/DbmlGraphElements/RefLink'
  import svgPanZoom from 'svg-pan-zoom'
  import { colors } from 'quasar'

  const { getPaletteColor } = colors
  import * as dagre from '@dagrejs/dagre'
  import * as graphlib from '@dagrejs/graphlib'

  export default {
    name: 'DbmlGraph',
    props: {
      schema: {
        type: Object,
        required: true
      },
      positions: {
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
      },
      positions (newValue) {
        this.repositionNodes(newValue)
      }
    },
    methods: {
      autoLayout () {
        layout.DirectedGraph.layout(this.graph, {
          setLinkVertices: false,
          dagre: dagre,
          graphlib: graphlib
        })
      },
      scaleToFit () {
        this.paper.scaleContentToFit({ padding: 50 })
      },
      exportToJSON () {
        /*
        {
          "tablePositions": [
            ...{ id: 1, x: 50, y: 60 }
          ],
          "refVertices": [
          ...{
               id: 2,
               vertices: [
                 ...{ x: 60, y: 40 }
               ]
             }]
        }
         */
        const allTableCells = this.graph.getCells().filter(c => /^table-.*/.test(c.id))
        const allRefCells = this.graph.getCells().filter(c => /^ref-.*/.test(c.id))

        return {
          tablePositions: allTableCells.map(tableCell => {
            const pos = tableCell.position()
            return {
              id: tableCell.id.match(/^table-(?<id>.*)/).groups.id,
              x: pos.x,
              y: pos.y
            }
          }),
          refVertices: allRefCells.map(refCell => ({
            id: refCell.id.match(/^ref-(?<id>.*)/).groups.id,
            vertices: refCell.vertices().map(v => ({
              x: v.x,
              y: v.y
            }))
          }))
        }
      },
      importFromJSON (json) {
        for (const tablePosition of json.tablePositions) {
          const tableCell = this.graph.getCell(`table-${tablePosition.id}`)
          if (!tableCell) continue
          tableCell.translate(tablePosition.x, tablePosition.y)
        }
        for (const refVertexes of json.refVertices) {
          const refCell = this.graph.getCell(`ref-${refVertexes.id}`)
          if (!refCell) continue
          refCell.vertices(refVertexes.vertices)
        }
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
          width: '100%',
          height: '100%',
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
          defaultConnectionPoint: {
            name: 'boundary',
            args: {
              extrapolate: true,
              sticky: true
            }
          },
          defaultConnector: {
            name: 'rounded'
          },
          drawGrid: {
            color: '#AAAAAA',
            thickness: 1,
            markup: 'rect',
            update: function (el, opt) {
              V(el).attr({
                width: opt.thickness * opt.sx,
                height: opt.thickness * opt.sy,
                fill: opt.color,
                opacity: 0.5
              })
            }
          },

          cellViewNamespace: shapeNamespace,
          validateConnection: (sourceView, _sourceMagnet, targetView, _targetMagnet) => {
            //if (sourceView === targetView) return false
            return false
          }
        })
        this.paper.on('link:mouseenter', function (linkView) {
          let tools = new dia.ToolsView({
            tools: [
              new linkTools.Vertices({ stopPropagation: false }),
              new linkTools.Segments({ stopPropagation: false })
            ]
          })
          linkView.addTools(tools)
        })
        const that = this
        this.graph.on('change', function () {
          that.emitPositions()
        })

        this.paper.on('link:mouseleave', function (linkView) {
          linkView.removeTools()
        })

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

        this.graph.resetCells([])

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

        this.syncTables(schema.tables)
        this.syncRefs(schema.refs)
        if (this.positions) {
          this.repositionNodes(this.positions)
        }
        this.paper.unfreeze()
      },
      repositionNodes (positions) {
        this.importFromJSON(positions)
      },
      emitPositions () {
        const positions = this.exportToJSON()
        this.$emit('update:positions', positions)
      },

      syncTables (tables) {
        for (const table of tables) {
          this.addOrUpdateTable(table)
        }

        const allCells = this.graph.getCells().filter(c => /^table-.*/.test(c.id))
        for (const table of allCells) {
          if (!tables.some(t => `table-${t.id}` === table.id)) {
            this.graph.removeCells([table])
          }
        }
      },

      syncRefs (refs) {
        for (const ref of refs) {
          this.addOrUpdateRef(ref)
        }

        const allCells = this.graph.getCells().filter(c => /^ref-.*/.test(c.id))
        for (const ref of allCells) {
          if (!refs.some(t => `ref-${t.id}` === ref.id)) {
            this.graph.removeLinks(ref)
          }
        }
      },

      addOrUpdateTable (table) {
        let cell = this.graph.getCell(`table-${table.id}`)
        if (!cell) {
          cell = createTableElement(table)
          cell.addTo(this.graph)
        }
        cell.updateTable(table)

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

      addOrUpdateRef (ref) {
        let link = this.graph.getCell(`ref-${ref.id}`)
        if (!link) {
          link = createRefLink(ref)
          link.addTo(this.graph)
        }

        const sourceField = ref.endpoints[0].fields[0]
        const sourceTable = sourceField.table

        const targetField = ref.endpoints[1].fields[0]
        const targetTable = targetField.table

        link.source({
          id: `table-${sourceTable.id}`,
          port: `field-${sourceField.id}`
        })
        link.target({
          id: `table-${targetTable.id}`,
          port: `field-${targetField.id}`
        })
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
