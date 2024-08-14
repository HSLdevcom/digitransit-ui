import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getRentalNetworkId,
} from '../../util/vehicleRentalUtils';

function VehicleRentalDurationInfo(props) {
  const { networks, lang, config } = props;
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
            <a href={vehicleRentalStationNetworkDurationInfoLink}>
              <FormattedMessage id="read-more" defaultMessage="Read more" /> ›
            </a>
          </p>
        </div>
      </div>
    );
  }
  const citybikeicon = getRentalNetworkIcon(
    getRentalNetworkConfig(networks[0], config),
  );
  const durationInfoLinks = {};
  for (let i = 0; i < networks.length; i++) {
    durationInfoLinks[networks[i]] =
      config.vehicleRental.networks[networks[i]].durationInstructions[lang];
  }

  return (
    <div className="citybike-duration-infobox">
      <div className="left-column">
        <Icon img={citybikeicon} width={2.2} height={2.2} />
      </div>
      <div className="right-column">
        <span>
          <FormattedMessage
            id="citybike-duration-general-header"
            defaultMessage=""
          />
        </span>
        <p>
          {networks.map(value => {
            return (
              <>
                <a
                  href={
                    config.vehicleRental.networks[value].durationInstructions[
                      lang
                    ]
                  }
                  key={value}
                >
                  {config.vehicleRental.networks[value].name[lang]}
                  {' - '}
                  <FormattedMessage id="read-more" defaultMessage="Read more" />
                  ›
                </a>
                <br />
              </>
            );
          })}
        </p>
      </div>
    </div>
  );
}

VehicleRentalDurationInfo.propTypes = {
  networks: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  ).isRequired,
  lang: PropTypes.string.isRequired,
  config: configShape.isRequired,
};

const connectedComponent = connectToStores(
  VehicleRentalDurationInfo,
  ['UserStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export default connectedComponent;
