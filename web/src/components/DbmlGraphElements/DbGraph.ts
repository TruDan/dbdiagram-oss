import jQuery from "jquery";
import {dia, layout, linkTools, shapes, V, Vectorizer} from "jointjs";
import Backbone from "backbone";
import Table from "@dbml/core/types/model_structure/table";
import Ref from "@dbml/core/types/model_structure/ref";
import Schema from "@dbml/core/types/model_structure/schema";
import * as dagre from '@dagrejs/dagre'
import * as graphlib from '@dagrejs/graphlib'
import {GRID_SIZE} from "components/DbmlGraphElements/constants";
import {createRefLink, createTableElement, TableElement} from "components/DbmlGraphElements/TableElement";
import {RefLink} from "components/DbmlGraphElements/RefLink";
import * as events from "events";

const shapeNamespace = {
  ...shapes,
  TableElement,
  RefLink
}

export interface DbGraphPositions {
  tablePositions: TablePosition[],
  refVertices: RefVertices[]
}

export interface TablePosition {
  id: number
  x: number
  y: number
}

export interface RefVertices {
  id: number
  vertices: dia.Point[]
}

interface DbGraphEvents {
  'update:positions': (positions: DbGraphPositions) => void,
  'editor:table:locate': (tableId: number) => void,
  'editor:field:locate': (fieldId: number) => void,
  'editor:reference:locate': (referenceId: number) => void,
}

export interface DbGraph {
  on<U extends keyof DbGraphEvents>(event: U, listener: DbGraphEvents[U]): this;

  emit<U extends keyof DbGraphEvents>(event: U, ...args: Parameters<DbGraphEvents[U]>): boolean;
}

export class DbGraph extends events.EventEmitter {
  private readonly _graph: dia.Graph;
  private readonly _paper: dia.Paper;
  private readonly _linkTools: dia.ToolsView;

  private _blankPointerDown: boolean = false;
  private _blankPointerDownPoint: dia.Point = {x: 0, y: 0};

  private _elementPointerDown: boolean = false;
  private _elementPointerDownPoint: dia.Point = {x: 0, y: 0};

  private _didChange: boolean = false;

  private _zoomSensitivity: number = 0.04;
  private _zoomMin: number = 0.25;
  private _zoomMax: number = 1.75;

  constructor(element: HTMLElement) {
    super();

    this._graph = new dia.Graph({}, {cellNamespace: shapeNamespace});
    // @ts-ignore
    this._paper = new dia.Paper({
      el: element,
      width: '100%',
      height: '100%',
      gridSize: GRID_SIZE,
      model: this._graph,
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
      perpendicularLinks: true,
      drawGrid: {
        color: '#AAAAAAAA',
        thickness: 1,
        name: 'fixedDot'
      },
      cellViewNamespace: shapeNamespace,
      validateConnection: (sourceView, _sourceMagnet, targetView, _targetMagnet) => {
        //if (sourceView === targetView) return false
        return false
      }
    });

    this._linkTools = new dia.ToolsView({
      tools: [
        new linkTools.Vertices({stopPropagation: false}),
        new linkTools.Segments({stopPropagation: false}),
      ]
    });

    this._paper.on({
      'blank:pointerdown': this.onBlankPointerDown.bind(this),
      'blank:pointerup': this.onBlankPointerUp.bind(this),
      'element:pointerdown': this.onElementPointerDown.bind(this),
      'element:pointerup': this.onElementPointerUp.bind(this),
      // "element:mouseenter": this.onElementMouseEnter.bind(this),
      // "element:mouseleave": this.onElementMouseLeave.bind(this),
      'cell:mouseenter': this.onCellMouseEnter.bind(this),
      'cell:mouseleave': this.onCellMouseLeave.bind(this),
      'link:mouseenter': this.onLinkMouseEnter.bind(this),
      'link:mouseleave': this.onLinkMouseLeave.bind(this),
      'blank:pointermove': this.onPointerMove.bind(this),
      'element:mousewheel': this.onElementMouseWheel.bind(this),
      'blank:mousewheel': this.onBlankMouseWheel.bind(this)
    });

    this._paper.$el.on('mouseenter', '.db-field', this.onTableFieldMouseEnter.bind(this))
    this._paper.$el.on('mouseleave', '.db-field', this.onTableFieldMouseLeave.bind(this))
    this._paper.$el.on('dblclick', '.db-table-header', this.onTableHeaderDoubleClick.bind(this))
    this._paper.$el.on('dblclick', '.db-field', this.onTableFieldDoubleClick.bind(this))

    this._graph.on({
      'change': this.onGraphChange.bind(this)
    })
  }

  get paper(): dia.Paper {
    return this._paper;
  }

  get graph(): dia.Graph {
    return this._graph;
  }

  public syncSchema(schema: Schema | {tables: Array<any>, refs: Array<any>} | undefined, positions: DbGraphPositions | undefined): void {
    this.paper.freeze()

    if (!schema) {
      schema = {
        tables: [],
        refs: []
      };
    }

    this.syncTables(schema.tables)
    this.syncRefs(schema.refs)
    if (positions) {
      this.syncPositions(positions)
    }

    this.paper.unfreeze()
  }

  public exportPositions(): DbGraphPositions {
    const tablePositions = this.graph.getElements()
      .reduce((previousValue: TablePosition[], currentValue: dia.Element) => {
        const id = currentValue.id.toString();
        const match = id.match(/^table-(?<id>\d+)/);
        if (match?.groups) {
          const nId = parseInt(match.groups.id);
          const position = currentValue.position();
          previousValue.push({
            id: nId,
            x: position.x,
            y: position.y
          })
        }
        return previousValue;
      }, []);
    const refVertices = this.graph.getLinks()
      .reduce((previousValue: RefVertices[], currentValue: dia.Link) => {
        const id = currentValue.id.toString();
        const match = id.match(/^ref-(?<id>\d+)/);
        if (match?.groups) {
          const nId = parseInt(match.groups.id);
          previousValue.push({
            id: nId,
            vertices: currentValue.vertices().map(v => ({
              x: v.x,
              y: v.y
            }))
          })
        }
        return previousValue;
      }, []);

    return {
      tablePositions,
      refVertices
    };
  }

  public syncPositions(positions: DbGraphPositions): void {
    for (const tablePosition of positions.tablePositions) {
      const tableCell: TableElement = <TableElement>this.graph.getCell(`table-${tablePosition.id}`)
      if (!tableCell) continue
      tableCell.position(tablePosition.x, tablePosition.y)
    }
    for (const refVertexes of positions.refVertices) {
      const refCell: RefLink = <RefLink>this.graph.getCell(`ref-${refVertexes.id}`)
      if (!refCell) continue
      refCell.vertices(refVertexes.vertices)
    }
  }

  public syncTables(tables: Table[]): void {
    for (const table of tables) {
      this.addOrUpdateTable(table)
    }

    const allCells = this._graph.getCells().filter(c => /^table-.*/.test(`${c.id}`))
    for (const table of allCells) {
      if (!tables.some(t => `table-${t.id}` === table.id)) {
        this._graph.removeCells([table])
      }
    }
  }

  public syncRefs(refs) {
    for (const ref of refs) {
      this.addOrUpdateRef(ref)
    }

    const allCells = this._graph.getCells().filter(c => /^ref-.*/.test(`${c.id}`))
    for (const ref of allCells) {
      if (!refs.some(t => `ref-${t.id}` === ref.id)) {
        this._graph.removeLinks(ref)
      }
    }
  }

  public addOrUpdateTable(table) {
    let cell: TableElement = <TableElement>this._graph.getCell(`table-${table.id}`)
    if (!cell) {
      cell = createTableElement(table)
      cell.addTo(this._graph)
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
  }

  public addOrUpdateRef(ref: Ref): void {
    let link: RefLink = <RefLink>this._graph.getCell(`ref-${ref.id}`)
    if (!link) {
      link = createRefLink(ref)
      link.addTo(this._graph)
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

  public applyAutoLayout(): void {
    layout.DirectedGraph.layout(this._graph, {
      setLinkVertices: true,
      dagre: dagre,
      graphlib: graphlib
    })
  }

  public applyScaleToFit(): void {
    this._paper.scaleContentToFit({padding: 50})
  }

  private zoom(x: number, y: number, delta: number): void {
    const s = this._paper.scale();
    // const s = V(this._paper.viewport).scale();
    const o = {x, y};

    const newScale = {
      sx: s.sx * Math.pow(2, delta * this._zoomSensitivity),
      sy: s.sy * Math.pow(2, delta * this._zoomSensitivity)
    };

    // constrain to min/max
    newScale.sx = Math.max(this._zoomMin, Math.min(this._zoomMax, newScale.sx));
    newScale.sy = Math.max(this._zoomMin, Math.min(this._zoomMax, newScale.sy));

    this._paper.scale(newScale.sx, newScale.sy);
  }

  private onGraphChange(cell): void {
    if (this._elementPointerDown) {
      this._didChange = true;
      const positions = this.exportPositions();
      this.emit('update:positions', positions);
    }
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (this._blankPointerDown) {
      const p = this._blankPointerDownPoint;
      const np = {x: evt.offsetX || 0, y: evt.offsetY || 0};
      const d = {
        dx: np.x - p.x,
        dy: np.y - p.y
      };
      this._paper.translate(d.dx, d.dy);
    }
  }

  private onBlankPointerDown(evt: dia.Event, x: number, y: number): void {
    const s = this._paper.scale();
    this._blankPointerDown = true;
    this._blankPointerDownPoint = {x: x * s.sx, y: y * s.sy};
  }

  private onBlankPointerUp(evt: dia.Event, x: number, y: number): void {
    this._blankPointerDown = false;
  }

  private onElementPointerDown(cellView: dia.ElementView, evt: dia.Event, x: number, y: number): void {
    this._elementPointerDown = true;
    this._elementPointerDownPoint = this._paper.clientToLocalPoint({x, y});
  }

  private onElementPointerUp(cellView: dia.ElementView, evt: dia.Event, x: number, y: number): void {
    this._elementPointerDown = false;
  }

  private onTableHeaderDoubleClick(evt: JQuery.DoubleClickEvent): void {
    const el = jQuery(evt.currentTarget);
    evt.stopPropagation();
    const closestTable = el.closest('.db-table')
    const tableId = closestTable.attr('table-id');
    if (tableId)
      this.emit('editor:table:locate', Number(tableId));
  }

  private onTableFieldMouseEnter(evt: JQuery.MouseEnterEvent): void {
    const el = jQuery(evt.currentTarget);
    evt.stopPropagation();

    el.toggleClass('db-field--highlight', true);
  }

  private onTableFieldMouseLeave(evt: JQuery.MouseLeaveEvent): void {
    const el = jQuery(evt.currentTarget);
    evt.stopPropagation();

    el.toggleClass('db-field--highlight', false);
  }

  private onTableFieldDoubleClick(evt: JQuery.DoubleClickEvent): void {
    const el = jQuery(evt.currentTarget);
    evt.stopPropagation();
    const fieldId = el.attr('field-id');

    if (fieldId)
      this.emit('editor:field:locate', Number(fieldId));
  }

  private onCellMouseEnter(cellView: dia.CellView, evt: dia.Event): void {
    cellView.$el.toggleClass('db-table--highlight', true);
  }

  private onCellMouseLeave(cellView: dia.CellView, evt: dia.Event): void {
    cellView.$el.toggleClass('db-table--highlight', false);
  }

  private onLinkMouseEnter(cellView: dia.LinkView, evt: dia.Event): void {
    cellView.$el.toggleClass('db-relation--highlight', true);
    cellView.addTools(this._linkTools);
  }

  private onLinkMouseLeave(cellView: dia.LinkView, evt: dia.Event): void {
    cellView.$el.toggleClass('db-relation--highlight', false);
    cellView.removeTools();
  }

  private onElementMouseWheel(cellView: dia.ElementView, evt: dia.Event, x: number, y: number, delta: number): void {
    this.zoom(x, y, delta);
  }

  private onBlankMouseWheel(evt: dia.Event, x: number, y: number, delta: number): void {
    this.zoom(x, y, delta);
  }

}
