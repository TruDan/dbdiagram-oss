import { Ace, Range } from 'ace-builds'

export class InlineAnnotation {

  constructor(session, info) {
    this.session = session;
    this.info = info;
    this.type = info.type;
    this.row = info.row;
    this.text = info.text || info.message || undefined;
    this.startAnchor = session.getDocument().createAnchor(info.row, info.column);
    this.endAnchor = session.getDocument().createAnchor(info.endRow || info.row, info.endColumn);
    this.startAnchor.on("change", this.update.bind(this));
    this.endAnchor.on("change", this.update.bind(this));
    this.marker = null;
    this.update();
  }

  update() {
    console.log("update", this);
    const range = Range.fromPoints(this.startAnchor.getPosition(), this.endAnchor.getPosition());
    if (this.marker) {
      this.session.removeMarker(this.marker);
    }
    this.marker = this.session.addMarker(range, `marker-highlight-${this.info.type}`, 'text');
  }

  remove() {
    this.startAnchor.detach();
    this.endAnchor.detach();
    if (this.marker) {
      this.session.removeMarker(this.marker);
    }
  }
}

