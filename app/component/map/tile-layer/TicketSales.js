import { VectorTile } from 'vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawIcon, getStopRadius } from '../../../util/mapIconUtils';

export default class TicketSales {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.promise = this.getPromise();
  }

  static getName = () => 'ticketSales';

  static getIcon = (type) => {
    switch (type) {
      case 'Palvelupiste':
        return 'icon-icon_service-point';
      case 'HSL Automaatti MNL':
        return 'icon-icon_ticket-machine';
      case 'HSL Automaatti KL':
        return 'icon-icon_ticket-machine';
      case 'Myyntipiste':
        return 'icon-icon_ticket-sales-point';
      case 'R-kioski':
        return 'icon-icon_ticket-sales-point';
      default:
        console.log(`Unknown ticket sales type: ${type}`);
        return 'icon-icon_ticket-sales-point';
    }
  }

  getPromise() {
    return fetch(
      `${this.config.URL.TICKET_SALES_MAP}${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}` +
      `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    )
    .then((res) => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then((buf) => {
        const vt = new VectorTile(new Protobuf(buf));

        this.features = [];

        if (vt.layers['ticket-sales'] != null) {
          for (let i = 0, ref = vt.layers['ticket-sales'].length - 1; i <= ref; i++) {
            const feature = vt.layers['ticket-sales'].feature(i);
            feature.geom = feature.loadGeometry()[0][0];
            // Do not show VR ticket machines and ticket offices
            if (!feature.properties.TYYPPI.startsWith('VR')) {
              this.features.push(pick(feature, ['geom', 'properties']));
              drawIcon(
                TicketSales.getIcon(feature.properties.TYYPPI),
                this.tile,
                feature.geom,
                getStopRadius({ $zoom: this.tile.coords.z }) * 2.5 * this.scaleratio,
              );
            }
          }
        }
      }, err => console.log(err));
    });
  }
}
