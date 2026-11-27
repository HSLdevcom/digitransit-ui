import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isBikeRentalLeg } from '../../utils/legUtils';
import { configShape, legShape } from '../../utils/shapes';
import Icon from '../Icon';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getRentalNetworkId,
} from '../../../shared/utils/vehicleRentalUtils';

export default function VehicleRentalDurationInfo({ legs, config }) {
  const { locale } = useIntl();
  const rentalBikeNetworks = new Set();
  legs.filter(isBikeRentalLeg).forEach(leg => {
    const network = leg.from.vehicleRentalStation?.rentalNetwork.networkId;
    const networkConfig = config.vehicleRental.networks[network];
    if (
      networkConfig?.timeBeforeSurcharge &&
      networkConfig.durationInstructions &&
      leg.duration > networkConfig.timeBeforeSurcharge
    ) {
      rentalBikeNetworks.add(network);
    }
  });
  const networks = Array.from(rentalBikeNetworks);

  if (networks.length === 0) {
    return null;
  }

  if (networks.length === 1) {
    const vehicleRentalStationNetwork = getRentalNetworkId(networks);
    const vehicleIcon = getRentalNetworkIcon(
      getRentalNetworkConfig(vehicleRentalStationNetwork, config),
    );
    const vehicleRentalStationNetworkDurationInfoLink =
      config.vehicleRental.networks[vehicleRentalStationNetwork].durationInstructions[locale];
    const duration =
      config.vehicleRental.networks[vehicleRentalStationNetwork].timeBeforeSurcharge / 60;

    return (
      <div className="citybike-duration-infobox">
        <div className="left-column">
          <Icon img={vehicleIcon} width={2.2} height={2.2} />
        </div>
        <div className="right-column">
          <span>
            <FormattedMessage
              id="citybike-duration-info-header"
              values={{ duration }}
              defaultMessage=""
            />
          </span>
          <p>
            <FormattedMessage id="citybike-duration-info" values={{ duration }} defaultMessage="" />
            &nbsp;
            <a href={vehicleRentalStationNetworkDurationInfoLink} target="_blank" rel="noreferrer">
              <FormattedMessage id="read-more" defaultMessage="Read more" /> ›
            </a>
          </p>
        </div>
      </div>
    );
  }

  const citybikeIcon = getRentalNetworkIcon(getRentalNetworkConfig(networks[0], config));

  return (
    <div className="citybike-duration-infobox">
      <div className="left-column">
        <Icon img={citybikeIcon} width={2.2} height={2.2} />
      </div>
      <div className="right-column">
        <span>
          <FormattedMessage id="citybike-duration-general-header" defaultMessage="" />
        </span>
        <p>
          {networks.map(value => (
            <Fragment key={value}>
              <a
                href={config.vehicleRental.networks[value].durationInstructions[locale]}
                target="_blank"
                rel="noreferrer"
              >
                {config.vehicleRental.networks[value].name[locale]}
                {' - '}
                <FormattedMessage id="read-more" defaultMessage="Read more" />›
              </a>
              <br />
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

VehicleRentalDurationInfo.propTypes = {
  legs: PropTypes.arrayOf(legShape).isRequired,
  config: configShape.isRequired,
};
