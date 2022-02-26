import {dia, shapes, util} from "jointjs";
import {LIGHT_COLOR, SECONDARY_DARK_COLOR} from "components/DbmlGraphElements/constants";

export class RefLink extends dia.Link {
  defaults() {
    return util.defaultsDeep({
        type: 'db.Ref',
        z: -1,
        attrs: {
          line: {
            'class': 'ref',
            connection: true,
            targetMarker: false
          },
          wrapper: {
            connection: true,
            strokeWidth: 10,
            strokeLinejoin: 'round'
          }
        }
      }, {
        markup: [{
          tagName: 'path',
          selector: 'wrapper',
          attributes: {
            'fill': 'none',
            'cursor': 'pointer',
            'stroke': 'transparent',
            'stroke-linecap': 'round'
          }
        }, {
          tagName: 'path',
          selector: 'line',
          attributes: {
            'fill': 'none',
            'pointer-events': 'none'
          }
        }]
      },
      super.defaults);
  }
}
