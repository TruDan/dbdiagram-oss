import {dia, g} from "jointjs";
import {ACTION_COLOR, DARK_COLOR, FONT_FAMILY, HEADER_HEIGHT, LIGHT_COLOR, LINE_WIDTH, LIST_ADD_BUTTON_SIZE, LIST_GROUP_NAME, LIST_ITEM_GAP, LIST_ITEM_HEIGHT, LIST_ITEM_LABEL, LIST_ITEM_WIDTH, LIST_MAX_PORT_COUNT, PADDING_L, PADDING_M, PADDING_S, SECONDARY_DARK_COLOR} from "components/DbmlGraphElements/constants";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import Ref from "@dbml/core/types/model_structure/ref";
import {RefLink} from "components/DbmlGraphElements/RefLink";

export const itemPosition = (portsArgs: dia.Element.Port[], elBBox: dia.BBox): g.Point[] => {
  return portsArgs.map((_port: dia.Element.Port, index: number, {length}) => {
    const bottom = elBBox.height - (LIST_ITEM_HEIGHT / 2);
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
          textVerticalAnchor: 'top'
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
                height: 'calc(h)',
                y: 'calc(-0.5*h)'
              },
              fieldName: {
                'class': 'db-field__name',
                x: PADDING_M,
                textVerticalAnchor: 'middle'
              },
              fieldType: {
                'class': 'db-field__type',
                x: `calc(w-${PADDING_M})`,
                textVerticalAnchor: 'middle'
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
    let port = this.getPort(`field-${field.id}`);
    if (!port) {
      port = createFieldPort(field);
      this.addPort(port);
    }

    if (port.attrs && port.attrs.fieldName && port.attrs.fieldType) {
      port.attrs.fieldName.text = field.name;
      port.attrs.fieldType.text = field.type.type_name;
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

export const createRefLink = (ref: Ref) => new RefLink({
  id: `ref-${ref.id}`
})
