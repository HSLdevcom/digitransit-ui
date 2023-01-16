import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import Icon from '../../Icon';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';
import { ExtendedRouteTypes } from '../../../constants';

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

function SelectStopRow(
  { code, type, desc, gtfsId, name, patterns, terminal, colors },
  { config },
) {
  let mode = type;
  if (patterns && type === 'BUS' && config.useExtendedRouteTypes) {
    const patternArray = JSON.parse(patterns);
    if (patternArray.some(p => p.gtfsType === ExtendedRouteTypes.BusExpress)) {
      mode = 'bus-express';
    }
  }
  const iconOptions = {};
  switch (mode) {
    case 'TRAM,BUS':
      iconOptions.iconId = 'icon-icon_bustram-stop-lollipop';
      iconOptions.className = 'tram-stop';
      break;
    case 'TRAM':
      iconOptions.iconId = terminal
        ? 'icon-icon_tram'
        : 'icon-icon_tram-stop-lollipop';
      iconOptions.className = 'tram-stop';
      break;
    case 'RAIL':
      iconOptions.iconId = terminal
        ? 'icon-icon_rail'
        : 'icon-icon_rail-stop-lollipop';
      iconOptions.className = 'rail-stop';
      break;
    case 'BUS':
      iconOptions.iconId = terminal
        ? 'icon-icon_bus'
        : 'icon-icon_bus-stop-lollipop';
      iconOptions.className = 'bus-stop';
      break;
    case 'bus-express':
      iconOptions.iconId = terminal
        ? 'icon-icon_bus'
        : 'icon-icon_bus-stop-express-lollipop';
      iconOptions.className = 'bus-stop';
      break;
    case 'SUBWAY':
      iconOptions.iconId = 'icon-icon_subway';
      iconOptions.className = 'subway-stop';
      break;
    case 'FUNICULAR':
      iconOptions.iconId = 'icon-icon_funicular-stop-lollipop';
      iconOptions.className = 'funicular-stop';
      break;
    case 'FERRY':
      iconOptions.iconId = !isNull(code)
        ? 'icon-icon_ferry'
        : 'icon-icon_stop_ferry';
      iconOptions.className = 'ferry-stop';
      if (iconOptions.iconId === 'icon-icon_stop_ferry') {
        iconOptions.color = colors.iconColors['mode-ferry-pier'];
      }
      break;
    case 'AIRPLANE':
      iconOptions.iconId = 'icon-icon_airplane';
      break;
    case 'CARPOOL':
      iconOptions.iconId = 'icon-icon_carpool';
      break;
    default:
      // FIXME: type is (temporarilly) deduced from gtfsId. Should be returned by OTP
      if (gtfsId.includes(':mfdz:')) {
        iconOptions.iconId = 'icon-icon_carpool';
      } else {
        iconOptions.iconId = 'icon-icon_bus';
      }
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
  patterns: PropTypes.string,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
  colors: PropTypes.object,
};

SelectStopRow.defaultProps = {
  terminal: false,
};

SelectStopRow.contextTypes = {
  config: PropTypes.shape({
    useExtendedRouteTypes: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SelectStopRow;
