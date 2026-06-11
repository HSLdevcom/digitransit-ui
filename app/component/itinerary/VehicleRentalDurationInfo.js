import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getRentalNetworkId,
} from '../../util/vehicleRentalUtils';

export default function VehicleRentalDurationInfo({ networks, config }) {
  const lang = config.language;

  if (networks.length === 1) {
    const vehicleRentalStationNetwork = getRentalNetworkId(networks);
    const vehicleIcon = getRentalNetworkIcon(
      getRentalNetworkConfig(vehicleRentalStationNetwork, config),
    );
    const vehicleRentalStationNetworkDurationInfoLink =
      config.vehicleRental.networks[vehicleRentalStationNetwork]
        .durationInstructions[lang];
    const duration =
      config.vehicleRental.networks[vehicleRentalStationNetwork]
        .timeBeforeSurcharge / 60;

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
            <FormattedMessage
              id="citybike-duration-info"
              values={{ duration }}
              defaultMessage=""
            />
            &nbsp;
            <a
              href={vehicleRentalStationNetworkDurationInfoLink}
              target="_blank"
              rel="noreferrer"
            >
              <FormattedMessage id="read-more" defaultMessage="Read more" /> ›
            </a>
          </p>
        </div>
      </div>
    );
  }

  const citybikeIcon = getRentalNetworkIcon(
    getRentalNetworkConfig(networks[0], config),
  );

  return (
    <div className="citybike-duration-infobox">
      <div className="left-column">
        <Icon img={citybikeIcon} width={2.2} height={2.2} />
      </div>
      <div className="right-column">
        <span>
          <FormattedMessage
            id="citybike-duration-general-header"
            defaultMessage=""
          />
        </span>
        <p>
          {networks.map(value => (
            <React.Fragment key={value}>
              <a
                href={
                  config.vehicleRental.networks[value].durationInstructions[
                    lang
                  ]
                }
                target="_blank"
                rel="noreferrer"
              >
                {config.vehicleRental.networks[value].name[lang]}
                {' - '}
                <FormattedMessage id="read-more" defaultMessage="Read more" />›
              </a>
              <br />
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

VehicleRentalDurationInfo.propTypes = {
  networks: PropTypes.arrayOf(
    // eslint-disable-next-line
    PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  ).isRequired,
  config: configShape.isRequired,
};
