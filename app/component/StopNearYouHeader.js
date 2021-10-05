import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import AddressRow from './AddressRow';
import ZoneIcon from './ZoneIcon';
import PlatformNumber from './PlatformNumber';
// import FavouriteStopContainer from './FavouriteStopContainer';
import { getZoneLabel } from '../util/legUtils';

const StopNearYouHeader = (
  { stop, desc, isStation, linkAddress },
  { config },
) => {
  return (
    <div className="stop-near-you-header-container">
      <div className="stop-header-content">
        <Link
          onClick={e => {
            e.stopPropagation();
          }}
          to={linkAddress}
        >
          <h2 className="stop-near-you-name">
            {stop.name}
            <span className="sr-only">
              <PlatformNumber number={stop.platformCode} short={false} />
            </span>
          </h2>
        </Link>
        <div className="stop-near-you-info">
          <AddressRow desc={desc} code={stop.code} isTerminal={isStation} />
          <PlatformNumber number={stop.platformCode} short />
          {config.zones.stops &&
            config.feedIds.includes(stop.gtfsId.split(':')[0]) && (
              <ZoneIcon
                zoneId={getZoneLabel(stop.zoneId, config)}
                showUnknown={false}
              />
            )}
        </div>
      </div>
      {
        // TODO: Fix places geocoder api request to reimplement favorite button.
        // https://github.com/stadtnavi/digitransit-ui/issues/481
        /* <FavouriteStopContainer
        className="stop-favourite-container"
        stop={stop}
        isTerminal={isStation}
      /> */
      }
    </div>
  );
};

StopNearYouHeader.propTypes = {
  stop: PropTypes.object.isRequired,
  linkAddress: PropTypes.string.isRequired,
  desc: PropTypes.string,
  isStation: PropTypes.bool,
};
StopNearYouHeader.defaultProps = {
  isStation: false,
};
StopNearYouHeader.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default StopNearYouHeader;
