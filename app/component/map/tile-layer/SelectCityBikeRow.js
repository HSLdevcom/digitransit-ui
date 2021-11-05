import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import Icon from '../../Icon';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
} from '../../../util/citybikes';
import { PREFIX_BIKESTATIONS } from '../../../util/path';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectCityBikeRow({ name, networks, id, desc }, { config }) {
  const networkConfig = getCityBikeNetworkConfig(
    getCityBikeNetworkId(networks),
    config,
  );
  const img = getCityBikeNetworkIcon(networkConfig);
  const formFactor = networkConfig.type || 'citybike';
  const address = desc || (
    <FormattedMessage id={`${formFactor}-station-no-id`} />
  );
  const displayName = name || (
    <FormattedMessage id={`${formFactor}-station-no-id`} />
  );
  const showCode = id && id !== 'null' && !networkConfig.hideCode;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${PREFIX_BIKESTATIONS}/${encodeURIComponent(id)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon img={img} />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{displayName}</h5>
        <span className="choose-row-text">
          {address && <span className="choose-row-address">{address}</span>}
          {showCode && <span className="choose-row-number">{id}</span>}
        </span>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectCityBikeRow.displayName = 'SelectCityBikeRow';

SelectCityBikeRow.propTypes = {
  name: PropTypes.string.isRequired,
  networks: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  id: PropTypes.string.isRequired,
  desc: PropTypes.string,
};

SelectCityBikeRow.defaultProps = {
  desc: undefined,
};

SelectCityBikeRow.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default SelectCityBikeRow;
