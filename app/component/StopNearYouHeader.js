import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import { FormattedMessage } from 'react-intl';
import StopCode from './StopCode';
import ZoneIcon from './ZoneIcon';
import PlatformNumber from './PlatformNumber';
import { isKeyboardSelectionEvent } from '../util/browser';
import FavouriteStopContainer from './FavouriteStopContainer';
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
          onKeyPress={e => {
            if (isKeyboardSelectionEvent(e)) {
              e.stopPropagation();
            }
          }}
          to={linkAddress}
        >
          <h3 className="stop-near-you-name">
            {stop.name}
            <span className="sr-only">
              <PlatformNumber number={stop.platformCode} short={false} />
            </span>
          </h3>
        </Link>
        <div className="stop-near-you-info">
          {desc && <span className="stop-near-you-desc">{desc}</span>}
          {isStation ? (
            <span className="itinerary-stop-code">
              <FormattedMessage id="station" />
            </span>
          ) : (
            <StopCode code={stop.code} />
          )}
          <PlatformNumber number={stop.platformCode} short />
          {config.stopCard.header.showZone &&
            config.feedIds.includes(stop.gtfsId.split(':')[0]) && (
              <ZoneIcon
                zoneId={getZoneLabel(stop.zoneId, config)}
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
