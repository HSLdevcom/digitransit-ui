import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawIcon, getStopRadius } from '../../../util/mapIconUtils';
import { isFeatureLayerEnabled } from '../../../util/mapLayerUtils';

export default class TicketSales {
  constructor(tile, config, mapLayers) {
    this.tile = tile;
    this.config = config;
    this.mapLayers = mapLayers;

    this.scaleratio =
      (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.promise = this.getPromise();
  }

  static getName = () => 'ticketSales';

  static getIcon = type => {
    switch (type) {
      case 'Palvelupiste':
        return 'icon-icon_service-point';
      case 'Kertalippuautomaatti':
      case 'Monilippuautomaatti':
        return 'icon-icon_ticket-machine';
      case 'Myyntipiste':
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
              if (
                !isFeatureLayerEnabled(
                  feature,
                  TicketSales.getName(),
                  this.mapLayers,
                  this.config,
                )
              ) {
                continue; // eslint-disable-line
              }
              [[feature.geom]] = feature.loadGeometry();
              // Do not show VR ticket machines and ticket offices
              const icon = TicketSales.getIcon(feature.properties.Tyyppi);
              if (icon) {
                this.features.push(pick(feature, ['geom', 'properties']));
                drawIcon(icon, this.tile, feature.geom, size);
              }
            }
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}
