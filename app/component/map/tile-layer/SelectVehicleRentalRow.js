import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../../util/shapes';
import Icon from '../../Icon';
import {
  getVehicleRentalStationNetworkConfig,
  getVehicleRentalStationNetworkIcon,
  hasStationCode,
} from '../../../util/vehicleRentalUtils';
import { getIdWithoutFeed } from '../../../util/feedScopedIdUtils';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectVehicleRentalRow(
  { name, network, id, desc, prefix, cluster, networks: networksInCluster },
  { config },
) {
  const img = cluster
    ? 'icon-icon_scooter-lollipop'
    : `${getVehicleRentalStationNetworkIcon(
        getVehicleRentalStationNetworkConfig(network, config),
      )}-stop-lollipop`;

  const linkAddress = cluster
    ? `/${prefix}/${encodeURIComponent(id)}/${[...networksInCluster]}`
    : `/${prefix}/${encodeURIComponent(id)}`;

  const address = desc || <FormattedMessage id="citybike-station-no-id" />;
  return (
    <Link className="stop-popup-choose-row" to={linkAddress}>
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon img={img} />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        <span className="choose-row-text">
          <span className="choose-row-address">{address}</span>
          {hasStationCode(id) && (
            <span className="choose-row-number">{getIdWithoutFeed(id)}</span>
          )}
        </span>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectVehicleRentalRow.displayName = 'SelectVehicleRentalRow';

SelectVehicleRentalRow.propTypes = {
  name: PropTypes.string,
  network: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  desc: PropTypes.string,
  prefix: PropTypes.string.isRequired,
  cluster: PropTypes.bool,
  networks: PropTypes.arrayOf(PropTypes.string),
};

SelectVehicleRentalRow.defaultProps = {
  desc: undefined,
  name: undefined,
  cluster: false,
  networks: [],
};

SelectVehicleRentalRow.contextTypes = {
  config: configShape.isRequired,
};

export default SelectVehicleRentalRow;
