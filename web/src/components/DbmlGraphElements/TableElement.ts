import {dia, g} from "jointjs";
import {ACTION_COLOR, DARK_COLOR, FONT_FAMILY, HEADER_HEIGHT, LIGHT_COLOR, LINE_WIDTH, LIST_ADD_BUTTON_SIZE, LIST_GROUP_NAME, LIST_ITEM_GAP, LIST_ITEM_HEIGHT, LIST_ITEM_LABEL, LIST_ITEM_WIDTH, LIST_MAX_PORT_COUNT, PADDING_L, PADDING_M, PADDING_S, SECONDARY_DARK_COLOR} from "components/DbmlGraphElements/constants";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import Ref from "@dbml/core/types/model_structure/ref";
import {RefLink} from "components/DbmlGraphElements/RefLink";
import TableGroup from "@dbml/core/types/model_structure/tableGroup";
import {TableGroupElement} from "components/DbmlGraphElements/TableGroupElement";

export const itemPosition = (portsArgs: dia.Element.Port[], elBBox: dia.BBox): g.Point[] => {
  return portsArgs.map((_port: dia.Element.Port, index: number, {length}) => {
    const bottom = elBBox.height - (LIST_ITEM_HEIGHT );
    const y = (length - 1 - index) * (LIST_ITEM_HEIGHT);
    return new g.Point(0, bottom - y);
  });
};

export class TableElement extends dia.Element {

  defaults() {
    return {
      ...super.defaults,
      type: 'db.Table',
      size: {width: LIST_ITEM_WIDTH, height: 0},
      attrs: {
        root: {
          magnet: false,
          'class': 'db-table'
        },
        body: {
          'class': 'db-table__bg',
          width: 'calc(w)',
          height: 'calc(h)'
        },
        header: {
          'class': 'db-table-header',
          width: 'calc(w)',
          height: 'calc(h)',
        },
        headerBody: {
          height: HEADER_HEIGHT,
          width: 'calc(w)',
        },
        headerText: {
          text: 'Label',
          y: (HEADER_HEIGHT/2)
        }
      },
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'g',
          selector: 'header',
          children: [
            {
              tagName: 'rect',
              selector: 'headerBody'
            },
            {
              tagName: 'text',
              selector: 'headerText',
            }
          ]
        }
      ],
      ports: {
        groups: {
          ["fields"]: {
            position: itemPosition,
            attrs: {
              root: {
                'class': 'db-field',
              },
              fieldBody: {
                magnet: 'active',
                width: 'calc(w)',
                height: 'calc(h)'
              },
              fieldName: {
                'class': 'db-field__name',
                y: 'calc(0.5*h)'
              },
              fieldType: {
                'class': 'db-field__type',
                x: `calc(w)`,
                y: 'calc(0.5*h)'
              },
            },
            size: {
              width: LIST_ITEM_WIDTH,
              height: LIST_ITEM_HEIGHT
            },
            markup: [
              {
                tagName: 'rect',
                selector: 'fieldBody'
              },
              {
                tagName: 'text',
                selector: 'fieldName',
              },
              {
                tagName: 'text',
                selector: 'fieldType'
              }
            ]
          }
        },
        items: []
      }
    }
  }

  initialize(...args: any[]) {
    this.on('change:ports', () => this.resizeToFitPorts());
    this.resizeToFitPorts();
    super.initialize.call(this, ...args);
  }

  resizeToFitPorts() {
    const {length} = this.getPorts();
    this.prop(['size', 'height'], HEADER_HEIGHT + (LIST_ITEM_HEIGHT * length));
  }

  addOrUpdateField(field: Field) {
    const portId = `field-${field.id}`;
    let port = this.getPort(`field-${field.id}`);
    if (!port) {
      port = createFieldPort(field);
      this.addPort(port);
    }

    if (port.attrs && port.attrs.fieldName && port.attrs.fieldType) {
      this.portProp(portId, 'attrs.fieldName.text'.split('.'), field.name);
      this.portProp(portId, 'attrs.fieldType.text'.split('.'), field.type.type_name);
      if (port.attrs.root) {
        const classes: Array<string> = ['db-field'];
        if(field.pk) classes.push('db-field__pk');
        if(field.endpoints.length > 0) classes.push('db-field__ref');
        if(field.unique) classes.push('db-field__unique');
        if(field.not_null) classes.push('db-field__not_null');
        if(field.increment) classes.push('db-field__increment');

        this.portProp(portId, 'attrs.root.class'.split('.'), classes.join(' '));
      }
    }
  }

  updateTable(table: Table) {
    this.setHeaderText(table.name);
    this.setHeaderColor(table.headerColor);
  }

  setHeaderText(headerText) {
    this.attr('headerText.text', headerText);
  }

  setHeaderColor(headerColor) {
    this.attr('headerBody.fill', headerColor);
  }

}

export const createFieldPort = (field: Field) => ({
  id: `field-${field.id}`,
  group: "fields",
  attrs: {
    root: {
      fieldId: field.id,
    },
    fieldName: {
      text: field.name
    },
    fieldType: {
      text: field.type.type_name
    }
  }
})

export const createTableElement = (table: Table) => new TableElement({
  id: `table-${table.id}`,
  attrs: {
    root: {
      tableId: table.id,
    },
    headerBody: {
      fill: table.headerColor
    },
    headerText: {
      text: table.name
    }
  }
})

export const createTableGroupElement = (tableGroup: TableGroup) => new TableGroupElement({
  id: `tablegroup-${tableGroup.id}`,
  attrs: {
    root: {
      tableGroupId: tableGroup.id
    },
    headerText: {
      text: tableGroup.name
    }
  }
})

export const createRefLink = (ref: Ref) => new RefLink({
  id: `ref-${ref.id}`
})
