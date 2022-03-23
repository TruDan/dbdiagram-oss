import {dia, g} from "jointjs";
import TableGroup from "@dbml/core/types/model_structure/tableGroup";
import Table from "@dbml/core/types/model_structure/table";
import {TableElement} from "components/DbmlGraphElements/TableElement";
import {min,max} from 'underscore';
import {HEADER_HEIGHT} from "components/DbmlGraphElements/constants";

export class TableGroupElement extends dia.Element {

  defaults() {
    return {
      ...super.defaults,
      type: 'db.TableGroup',
      size: {width: 128, height: 128},
      z: -1,
      attrs: {
        root: {
          magnet: false,
          'class': 'db-tablegroup',
          z: '-1'
        },
        body: {
          'class': 'db-tablegroup__bg',
          width: 'calc(w)',
          height: 'calc(h)',
          rx: 2,
          ry: 2
        },
        header: {
          'class': 'db-tablegroup-header',
          x:0,
          y:0,
          width: 'calc(w)',
          height: HEADER_HEIGHT,
          rx: 2,
          ry: 2
        },
        headerText: {
          'class': 'db-tablegroup-header__text',
          text: 'Label',
          y: (HEADER_HEIGHT/2)
        },
        headerSeparator: {
          'class': 'db-tablegroup-header__separator',
          x1: 0,
          y1: HEADER_HEIGHT,
          x2: 'calc(w)',
          y2: HEADER_HEIGHT
        }
      },
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'rect',
          selector: 'header'
        },
        {
          tagName: 'text',
          selector: 'headerText'
        },
        {
          tagName: 'line',
          selector: 'headerSeparator'
        }
      ]
    };
  }

  initialize(attributes?: dia.Element.Attributes, options?: Backbone.CombinedModelConstructorOptions<any, this>) {
    this.on('change:embeds', this.resizeToFit.bind(this));
    super.initialize(attributes, options);
  }

  public resizeToFit(): void {
    const embeds = this.getEmbeddedCells().map(e => e.getBBox());
    const minX: number = min(embeds.map(e => e.x));
    const minY: number = min(embeds.map(e => e.y));
    const maxX: number = max(embeds.map(e => e.x + e.width));
    const maxY: number = max(embeds.map(e => e.y + e.height));

    const padding = 25;
    const headerHeight = 32;

    const bbox = new g.Rect(minX - padding,
      minY - padding - headerHeight,
      ((maxX - minX) + (padding*2)),
      ((maxY - minY) + (padding*2)) + headerHeight
    );
    this.position(bbox.x, bbox.y);
    this.resize(bbox.width, bbox.height);
  }

  updateTableGroup(tableGroup: TableGroup): void {
    this.setHeaderText(tableGroup.name);
  }

  private setHeaderText(name: string) {
    this.attr('headerText.text', name)
  }
}
