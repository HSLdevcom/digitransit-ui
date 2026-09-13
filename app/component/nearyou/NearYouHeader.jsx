import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import { stopShape } from '../../util/shapes';
import AddressRow from '../AddressRow';
import ZoneIcon from '../ZoneIcon';
import PlatformNumber from '../PlatformNumber';
import FavouriteStopContainer from '../FavouriteStopContainer';
import { getZoneLabel } from '../../util/legUtils';
import { useConfigContext } from '../../configurations/ConfigContext';
import { splitGtfsId } from '../../util/gtfs';

const NearYouHeader = ({ stop, desc, isStation, linkAddress, mode }) => {
  const config = useConfigContext();
  const zoneId =
    isStation && stop.stops.length ? stop.stops[0].zoneId : stop.zoneId;
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
              <PlatformNumber
                number={stop.platformCode}
                short={false}
                mode={mode}
              />
            </span>
          </h2>
        </Link>
        <div className="stop-near-you-info">
          <AddressRow desc={desc} code={stop.code} isTerminal={isStation} />
          <PlatformNumber number={stop.platformCode} short mode={mode} />
          {zoneId &&
            config.zones.stops &&
            config.feedIds.includes(splitGtfsId(stop.gtfsId).feedId) && (
              <ZoneIcon
                zoneId={getZoneLabel(zoneId, config)}
                showUnknown={false}
              />
            )}
        </div>
      </div>
      <FavouriteStopContainer
        className="stop-favourite-container"
        stop={stop}
        isTerminal={isStation}
      />
    </div>
  );
};

NearYouHeader.propTypes = {
  stop: stopShape.isRequired,
  linkAddress: PropTypes.string.isRequired,
  desc: PropTypes.string,
  isStation: PropTypes.bool,
  mode: PropTypes.string.isRequired,
};

NearYouHeader.defaultProps = {
  isStation: false,
  desc: undefined,
};

export default NearYouHeader;
