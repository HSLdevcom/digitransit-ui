import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'found';
import {
  vehicleRentalStationShape,
  rentalVehicleShape,
  configShape,
} from '../../../util/shapes';
import Icon from '../../Icon';
import GenericMarker from '../GenericMarker';
import {
  BIKEAVL_UNKNOWN,
  getVehicleRentalStationNetworkConfig,
  getVehicleRentalStationNetworkIcon,
  getVehicleCapacity,
} from '../../../util/vehicleRentalUtils';
import { isBrowser } from '../../../util/browser';
import {
  getVehicleAvailabilityIndicatorColor,
  getVehicleAvailabilityTextColor,
} from '../../../util/legUtils';

import { PREFIX_BIKESTATIONS, PREFIX_RENTALVEHICLES } from '../../../util/path';

let L;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
if (isBrowser) {
  L = require('leaflet');
}
/* eslint-enable global-require */

// Small icon for zoom levels <= 15
const smallIconSvg = `
  <svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>
`;

export default class VehicleMarker extends React.Component {
  static displayName = 'VehicleMarker';

  static propTypes = {
    showBikeAvailability: PropTypes.bool,
    rental: PropTypes.oneOfType([vehicleRentalStationShape, rentalVehicleShape])
      .isRequired,
    transit: PropTypes.bool,
    mode: PropTypes.string,
  };

  static contextTypes = {
    config: configShape.isRequired,
    router: routerShape.isRequired,
  };

  static defaultProps = {
    showBikeAvailability: false,
    transit: false,
  };

  handleClick = (id, prefix) => {
    this.context.router.push(`/${prefix}/${encodeURIComponent(id)}`);
  };

  getIcon = zoom => {
    const { showBikeAvailability, rental, transit } = this.props;
    const { config } = this.context;
    const vehicleCapacity = getVehicleCapacity(config, rental?.network);
    const iconName = `${getVehicleRentalStationNetworkIcon(
      getVehicleRentalStationNetworkConfig(rental.network, config),
    )}-lollipop`;

    return !transit && zoom <= config.stopsSmallMaxZoom
      ? L.divIcon({
          html: smallIconSvg,
          iconSize: [8, 8],
          className: 'citybike cursor-pointer',
        })
      : L.divIcon({
          iconAnchor: [15, 40],
          html: showBikeAvailability
            ? Icon.asString({
                img: iconName,
                className: 'city-bike-medium-size',
                badgeFill: getVehicleAvailabilityIndicatorColor(
                  rental?.availableVehicles?.total,
                  config,
                ),
                badgeTextFill: getVehicleAvailabilityTextColor(
                  rental?.availableVehicles?.total,
                  config,
                ),
                badgeText:
                  vehicleCapacity !== BIKEAVL_UNKNOWN
                    ? rental?.availableVehicles?.total
                    : null,
              })
            : Icon.asString({
                img: iconName,
                className: 'city-bike-medium-size',
              }),
          iconSize: [20, 20],
          className: 'citybike cursor-pointer',
        });
  };

  render() {
    if (!isBrowser) {
      return false;
    }
    return (
      <GenericMarker
        position={{
          lat: this.props.rental?.lat,
          lon: this.props.rental?.lon,
        }}
        onClick={() =>
          this.handleClick(
            this.props.rental.id,
            this.props.mode === 'SCOOTER'
              ? PREFIX_RENTALVEHICLES
              : PREFIX_BIKESTATIONS,
          )
        }
        getIcon={this.getIcon}
        id={this.props.rental?.id}
      />
    );
  }
}
