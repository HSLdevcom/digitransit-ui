import { FormattedMessage } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getRentalVehicleLink,
  openDeepLink,
} from '../../util/vehicleRentalUtils';
import { rentalVehicleShape } from '../../util/shapes';
import { useConfigContext } from '../../configurations/ConfigContext';
import withBreakpoint from '../../util/withBreakpoint';
import Icon from '../Icon';
import ExternalLink from '../ExternalLink';

function ScooterLinkContainer({ rentalVehicle, mobileReturn = false }) {
  const config = useConfigContext();
  const { language } = config;

  const network = rentalVehicle.rentalNetwork.networkId;
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

  const rentalVehicleLink = getRentalVehicleLink(rentalVehicle, networkConfig);

  const onClick = rentalVehicleLink.startsWith('http')
    ? undefined
    : () => openDeepLink(rentalVehicleLink, rentalVehicle.rentalNetwork.url);

  return (
    <div>
      <div className="itinerary-transit-leg-route-with-link">
        <div className="itinerary-with-link">
          <div
            className={cx(
              'citybike-icon',
              { small: mobileReturn },
              'scooter-icon',
            )}
          >
            <Icon img={vehicleIcon} width={1.655} height={1.655} />
          </div>

          <div className="itinerary-with-link-text-container">
            <span className={cx('headsign', 'scooter-headsign')}>
              <ExternalLink
                className="rental-vehicle-link"
                href={rentalVehicleLink}
                onClick={onClick}
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
            onClick={onClick}
          >
            <Icon
              img="icon_external-link-box"
              className="scooter-link-icon"
              omitViewBox
            />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
}

ScooterLinkContainer.propTypes = {
  rentalVehicle: rentalVehicleShape.isRequired,
  mobileReturn: PropTypes.bool,
};

export default withBreakpoint(ScooterLinkContainer);
