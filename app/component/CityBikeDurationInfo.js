import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
} from '../util/citybikes';

function CityBikeDurationInfo(props) {
  const { networks, lang, config } = props;
  const cityBikeNetwork = getCityBikeNetworkId(networks);
  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(cityBikeNetwork, config),
  );
  const cityBikeNetworkDurationInfoLink =
    config.cityBike.networks[cityBikeNetwork].durationInstructions[lang];
  const duration =
    config.cityBike.networks[cityBikeNetwork].timeBeforeSurcharge / 60;

  return (
    <div className="citybike-duration-infobox">
      <div className="left-column">
        <Icon img={citybikeicon} width={2.2} height={2.2} />
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
          <a href={cityBikeNetworkDurationInfoLink}>
            <FormattedMessage id="read-more" defaultMessage="Read more" /> ›
          </a>
        </p>
      </div>
    </div>
  );
}

CityBikeDurationInfo.propTypes = {
  networks: PropTypes.array.isRequired,
  lang: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  CityBikeDurationInfo,
  ['UserStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(), // DT-3376
  }),
);

export default connectedComponent;
