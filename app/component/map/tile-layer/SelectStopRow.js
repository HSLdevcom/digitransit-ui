import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import Icon from '../../Icon';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';

function SelectStopRow({ gtfsId, type, name, code, terminal, desc }) {
  const iconOptions = {};
  switch (type) {
    case 'TRAM':
      iconOptions.iconId = 'icon-icon_bus-stop';
      iconOptions.className = 'tram-stop';
      break;
    case 'RAIL':
      iconOptions.iconId = 'icon-icon_station';
      iconOptions.className = 'rail-stop';
      break;
    case 'BUS':
      iconOptions.iconId = 'icon-icon_bus-stop';
      iconOptions.className = 'bus-stop';
      break;
    case 'SUBWAY':
      iconOptions.iconId = 'icon-icon_station';
      iconOptions.className = 'subway-stop';
      break;
    case 'FERRY':
      iconOptions.iconId =
        code !== 'null' ? 'icon-icon_ferry' : 'icon-icon_stop_ferry';
      iconOptions.className = 'ferry-stop';
      break;
    case 'AIRPLANE':
      iconOptions.iconId = 'icon-icon_airplane';
      break;
    case 'CARPOOL':
      iconOptions.iconId = 'icon-icon_carpool';
      break;
    default:
      iconOptions.iconId = 'icon-icon_bus';
      break;
  }

  const showDesc = desc && desc !== 'null';
  const showCode = code && code !== 'null';

  const prefix = terminal ? PREFIX_TERMINALS : PREFIX_STOPS;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${prefix}/${encodeURIComponent(gtfsId)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          className={iconOptions.className}
          img={iconOptions.iconId}
          color={iconOptions.color || null}
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        {(showDesc || showCode) && (
          <span className="choose-row-text">
            {showDesc && <span className="choose-row-address">{desc}</span>}
            {showCode && <span className="choose-row-number">{code}</span>}
          </span>
        )}
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.propTypes = {
  gtfsId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
};

SelectStopRow.defaultProps = {
  terminal: false,
  code: null,
  desc: null,
};

export default SelectStopRow;
