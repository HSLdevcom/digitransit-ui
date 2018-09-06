import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawIcon, getStopRadius } from '../../../util/mapIconUtils';

const TicketSalesFeatureType = {
  ServicePoint: 'Palvelupiste',
  TicketMachine1: 'HSL Automaatti MNL',
  TicketMachine2: 'HSL Automaatti KL',
  SalesPointGeneric: 'Myyntipiste',
  SalesPointRKioski: 'R-kioski',
};

export default class TicketSales {
  constructor(tile, config, settings) {
    this.tile = tile;
    this.config = config;
    this.settings = settings;

    this.scaleratio =
      (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.promise = this.getPromise();
  }

  isEnabled = type => {
    switch (type) {
      case TicketSalesFeatureType.ServicePoint:
        return Boolean(this.settings.ticketSales.servicePoint);
      case TicketSalesFeatureType.TicketMachine1:
      case TicketSalesFeatureType.TicketMachine2:
        return Boolean(this.settings.ticketSales.ticketMachine);
      case TicketSalesFeatureType.SalesPointGeneric:
      case TicketSalesFeatureType.SalesPointRKioski:
        return Boolean(this.settings.ticketSales.salesPoint);
      default:
        return false;
    }
  };

  static getName = () => 'ticketSales';

  static getIcon = type => {
    switch (type) {
      case TicketSalesFeatureType.ServicePoint:
        return 'icon-icon_service-point';
      case TicketSalesFeatureType.TicketMachine1:
      case TicketSalesFeatureType.TicketMachine2:
        return 'icon-icon_ticket-machine';
      case TicketSalesFeatureType.SalesPointGeneric:
      case TicketSalesFeatureType.SalesPointRKioski:
        return 'icon-icon_ticket-sales-point';
      default:
        return undefined;
    }
  };

  getPromise() {
    return fetch(
      `${this.config.URL.TICKET_SALES_MAP}${this.tile.coords.z +
        (this.tile.props.zoomOffset || 0)}` +
        `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          const size =
            getStopRadius(this.tile.coords.z) * 2.5 * this.scaleratio;

          if (vt.layers['ticket-sales'] != null) {
            for (
              let i = 0, ref = vt.layers['ticket-sales'].length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers['ticket-sales'].feature(i);
              if (!this.isEnabled(feature.properties.TYYPPI)) {
                continue; // eslint-disable-line
              }
              [[feature.geom]] = feature.loadGeometry();
              // Do not show VR ticket machines and ticket offices
              const icon = TicketSales.getIcon(feature.properties.TYYPPI);
              if (icon) {
                this.features.push(pick(feature, ['geom', 'properties']));
                drawIcon(icon, this.tile, feature.geom, size);
              }
            }
          }
        },
        err => console.log(err),
      );
    });
  }
}
