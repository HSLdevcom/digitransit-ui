import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../../util/shapes';
import Icon from '../../Icon';
import { hasVehicleRentalCode } from '../../../util/vehicleRentalUtils';
import { getIdWithoutFeed } from '../../../util/feedScopedIdUtils';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectVehicleRentalClusterRow({
  name,
  id,
  desc,
  prefix,
  networks: networksInCluster,
  isScooter,
}) {
  const img = isScooter
    ? 'icon-icon_scooter-lollipop'
    : 'icon-icon_citybike-stop-lollipop';

  const linkAddress = `/${prefix}/${encodeURIComponent(id)}/${[
    ...networksInCluster,
  ]}`;

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
          {hasVehicleRentalCode(id) && (
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

SelectVehicleRentalClusterRow.displayName = 'SelectVehicleRentalRow';

SelectVehicleRentalClusterRow.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string.isRequired,
  desc: PropTypes.string,
  prefix: PropTypes.string.isRequired,
  networks: PropTypes.arrayOf(PropTypes.string).isRequired,
  isScooter: PropTypes.bool,
};

SelectVehicleRentalClusterRow.defaultProps = {
  desc: undefined,
  name: undefined,
  isScooter: false,
};

SelectVehicleRentalClusterRow.contextTypes = {
  config: configShape.isRequired,
};

export default SelectVehicleRentalClusterRow;
