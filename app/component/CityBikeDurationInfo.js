import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { Link } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
} from '../util/citybikes';

function CityBikeDurationInfo(props) {
  const { networks, lang, config } = props;
  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(getCityBikeNetworkId(networks), config),
  );
  const firstNetwork = networks[0];
  const cityBikeNetworkDurationInfoLink =
    config.cityBike.networks[firstNetwork].durationInstructions[lang];
  const duration =
    config.cityBike.networks[firstNetwork].timeBeforeSurcharge / 60;

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
          <Link to={cityBikeNetworkDurationInfoLink}>
            <FormattedMessage id="read-more" defaultMessage="Read more" /> ›
          </Link>
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

CityBikeDurationInfo.contexTypes = {
  // config: PropTypes.object.isRequired,
  // getStore: PropTypes.func.isRequired,
};

const connectedComponent = connectToStores(
  CityBikeDurationInfo,
  ['UserStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(), // DT-3376
  }),
);

export default connectedComponent;