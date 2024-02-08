import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import {
  getVehicleRentalStationNetworkConfig,
  getVehicleRentalStationNetworkIcon,
  getVehicleRentalStationNetworkId,
} from '../util/vehicleRentalUtils';

function VehicleRentalDurationInfo(props) {
  const { networks, lang, config } = props;
  if (networks.length === 1) {
    const vehicleRentalStationNetwork =
      getVehicleRentalStationNetworkId(networks);
    const vehicleIcon = getVehicleRentalStationNetworkIcon(
      getVehicleRentalStationNetworkConfig(vehicleRentalStationNetwork, config),
    );
    const vehicleRentalStationNetworkDurationInfoLink =
      config.cityBike.networks[vehicleRentalStationNetwork]
        .durationInstructions[lang];
    const duration =
      config.cityBike.networks[vehicleRentalStationNetwork]
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
  const citybikeicon = getVehicleRentalStationNetworkIcon(
    getVehicleRentalStationNetworkConfig(networks[0], config),
  );
  const durationInfoLinks = {};
  for (let i = 0; i < networks.length; i++) {
    durationInfoLinks[networks[i]] =
      config.cityBike.networks[networks[i]].durationInstructions[lang];
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
                    config.cityBike.networks[value].durationInstructions[lang]
                  }
                  key={value}
                >
                  {config.cityBike.networks[value].name[lang]}
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
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  VehicleRentalDurationInfo,
  ['UserStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export default connectedComponent;
