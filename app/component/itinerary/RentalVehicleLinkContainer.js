import { FormattedMessage, intlShape } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { configShape, rentalVehicleShape } from '../../util/shapes';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getRentalVehicleLink,
  getRentalNetworkIdByRental,
} from '../../util/vehicleRentalUtils';

import withBreakpoint from '../../util/withBreakpoint';
import Icon from '../Icon';
import ExternalLink from '../ExternalLink';

function RentalVehicleLinkContainer(
  { isScooter, rentalVehicle, language, mobileReturn },
  { config },
) {
  if (!rentalVehicle && !isScooter) {
    return null;
  }

  const network = getRentalNetworkIdByRental(rentalVehicle, config);
  const networkConfig = getRentalNetworkConfig(network, config);
  const vehicleIcon = getRentalNetworkIcon(networkConfig);
  const scooterHeadsign = (
    <FormattedMessage
      id="open-operator-app"
      values={{
        operator: networkConfig.name[language] || network,
      }}
      defaultMessage="Open the app to use a scooter"
    />
  );
  const rentalVehicleLink = getRentalVehicleLink(
    rentalVehicle,
    network,
    networkConfig,
  );
  return (
    <div>
      {isScooter && (
        <div className="itinerary-transit-leg-route-bike">
          <div className="citybike-itinerary">
            <div className={cx('citybike-icon', { small: mobileReturn })}>
              <Icon img={vehicleIcon} width={1.655} height={1.655} />
            </div>
            <div className="citybike-itinerary-text-container">
              <span className={cx('headsign', isScooter && 'scooter-headsign')}>
                <ExternalLink
                  className="rental-vehicle-link"
                  href={rentalVehicleLink}
                >
                  {scooterHeadsign}
                </ExternalLink>
              </span>
            </div>
          </div>
          <div className="link-to-e-scooter-operator">
            <ExternalLink
              className="rental-vehicle-link"
              href={rentalVehicleLink}
            >
              <Icon
                img="icon-icon_square_right_corner_arrow"
                color="#007ac9"
                height={1}
                width={1}
              />
            </ExternalLink>
          </div>
        </div>
      )}
    </div>
  );
}

RentalVehicleLinkContainer.propTypes = {
  isScooter: PropTypes.bool,
  rentalVehicle: rentalVehicleShape,
  language: PropTypes.string.isRequired,
  mobileReturn: PropTypes.bool,
};

RentalVehicleLinkContainer.defaultProps = {
  isScooter: false,
  rentalVehicle: undefined,
  mobileReturn: false,
};

RentalVehicleLinkContainer.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
const ScooterLinkWithBreakpoint = withBreakpoint(RentalVehicleLinkContainer);

const connectedComponent = connectToStores(
  ScooterLinkWithBreakpoint,
  ['PreferencesStore'],
  ({ getStore }) => {
    const language = getStore('PreferencesStore').getLanguage();
    return { language };
  },
);

export {
  connectedComponent as default,
  RentalVehicleLinkContainer as Component,
};
