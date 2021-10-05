import moment from 'moment';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';

import Icon from './Icon';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import PlatformNumber from './PlatformNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { PREFIX_STOPS } from '../util/path';
import {
  CityBikeNetworkType,
  getCityBikeNetworkId,
  getCityBikeNetworkConfig,
} from '../util/citybikes';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import { splitStringToAddressAndPlace } from '../util/otpStrings';
import CityBikeLeg from './CityBikeLeg';
import DelayedTime from './DelayedTime';

function WalkLeg(
  { children, focusAction, focusToLeg, index, leg, previousLeg, startTime },
  { config, intl },
) {
  const distance = displayDistance(
    parseInt(leg.mode !== 'WALK' ? 0 : leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(
    leg.mode !== 'WALK' ? 0 : leg.duration * 1000,
  );
  // If mode is not WALK, WalkLeg should get information from "to".
  const toOrFrom = leg.mode !== 'WALK' ? 'to' : 'from';
  const modeClassName = 'walk';
  const fromMode = leg[toOrFrom].stop ? leg[toOrFrom].stop.vehicleMode : '';
  const isFirstLeg = i => i === 0;
  const [address, place] = splitStringToAddressAndPlace(leg[toOrFrom].name);

  const networkType = getCityBikeNetworkConfig(
    getCityBikeNetworkId(
      previousLeg &&
        previousLeg.rentedBike &&
        previousLeg[toOrFrom].bikeRentalStation &&
        previousLeg[toOrFrom].bikeRentalStation.networks,
    ),
    config,
  ).type;

  const isBikeBox = previousLeg?.to?.bikePark?.bikeParkId?.startsWith(
    'open-bike-box',
  );
  let extraHeightForButton = {};
  if (isBikeBox) {
    extraHeightForButton = { height: '82px' };
  }

  const returnNotice =
    previousLeg && previousLeg.rentedBike ? (
      <FormattedMessage
        id={
          networkType === CityBikeNetworkType.Scooter
            ? 'return-scooter-to'
            : 'return-cycle-to'
        }
        values={{ station: leg[toOrFrom] ? leg[toOrFrom].name : '' }}
        defaultMessage="Return the bike to {station} station"
      />
    ) : null;
  let appendClass;
  const isScooter = networkType === CityBikeNetworkType.Scooter;
  if (returnNotice) {
    appendClass = 'return-citybike';
  }
  return (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        {returnNotice}
        <FormattedMessage
          id="itinerary-details.walk-leg"
          values={{
            time: moment(leg.startTime).format('HH:mm'),
            distance,
            duration,
            origin: leg[toOrFrom] ? leg[toOrFrom].name : '',
            destination: leg.to ? leg.to.name : '',
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          <DelayedTime
            leg={previousLeg}
            delay={previousLeg && previousLeg.arrivalDelay}
            startTime={startTime}
          />
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        appendClass={appendClass}
        index={index}
        modeClassName={modeClassName}
      />
      <div
        className={`small-9 columns itinerary-instruction-column ${leg.mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg[toOrFrom].name || '' }}
          />
        </span>
        {isFirstLeg(index) ? (
          <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
            <div className="address-container">
              <div className="address">
                {address}
                {leg[toOrFrom].stop && (
                  <Icon
                    img="icon-icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                )}
              </div>
              <div className="place">{place}</div>
            </div>
            <div
              className="itinerary-map-action"
              onClick={focusAction}
              onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
              role="button"
              tabIndex="0"
              aria-label={intl.formatMessage(
                { id: 'itinerary-summary.show-on-map' },
                { target: leg[toOrFrom].name || '' },
              )}
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div>
          </div>
        ) : (
          <div
            className={
              returnNotice
                ? 'itinerary-leg-first-row-return-bike'
                : 'itinerary-leg-first-row'
            }
            style={extraHeightForButton}
          >
            <div className="itinerary-leg-row">
              {leg[toOrFrom].stop ? (
                <Link
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  to={`/${PREFIX_STOPS}/${leg[toOrFrom].stop.gtfsId}`}
                >
                  {returnNotice || leg[toOrFrom].name}
                  {leg[toOrFrom].stop && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg[toOrFrom].stop && leg[toOrFrom].stop.alerts,
                      leg.startTime / 1000,
                    )}
                  />
                </Link>
              ) : (
                <div>
                  {returnNotice ? (
                    <CityBikeLeg
                      isScooter={isScooter}
                      stationName={leg[toOrFrom].name}
                      bikeRentalStation={leg[toOrFrom].bikeRentalStation}
                      returnBike
                    />
                  ) : (
                    leg[toOrFrom].name
                  )}
                  {leg[toOrFrom].stop && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg[toOrFrom].stop && leg[toOrFrom].stop.alerts,
                      leg.startTime / 1000,
                    )}
                  />
                </div>
              )}
              <div className="stop-code-container">
                {children}
                {leg[toOrFrom].stop && (
                  <PlatformNumber
                    number={leg[toOrFrom].stop.platformCode}
                    short
                    isRailOrSubway={
                      fromMode === 'RAIL' || fromMode === 'SUBWAY'
                    }
                  />
                )}
              </div>
              {isBikeBox && (
                <div style={{ padding: '15px 0px' }}>
                  <a
                    style={{ textDecoration: 'none', color: 'white' }}
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target="_blank"
                    className="standalone-btn"
                    href="https://openbikebox.next-site.de/location/bahnhof-herrenberg/"
                  >
                    <FormattedMessage
                      id="book-locker"
                      defaultMessage="Book locker"
                    />
                  </a>
                </div>
              )}
            </div>
            <div
              className="itinerary-map-action"
              onClick={focusAction}
              onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
              role="button"
              tabIndex="0"
              aria-label={intl.formatMessage(
                { id: 'itinerary-summary.show-on-map' },
                { target: leg[toOrFrom].name || '' },
              )}
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div>
          </div>
        )}

        <div className="itinerary-leg-action">
          <div className="itinerary-leg-action-content">
            <FormattedMessage
              id="walk-distance-duration"
              values={{ distance, duration }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <div
              className="itinerary-map-action"
              onClick={focusToLeg}
              onKeyPress={e => isKeyboardSelectionEvent(e) && focusToLeg(e)}
              role="button"
              tabIndex="0"
              aria-label={intl.formatMessage({
                id: 'itinerary-summary-row.clickable-area-description',
              })}
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const walkLegShape = PropTypes.shape({
  distance: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  from: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stop: PropTypes.shape({
      alerts: PropTypes.array,
      code: PropTypes.string,
      gtfsId: PropTypes.string.isRequired,
      platformCode: PropTypes.string,
      vehicleMode: PropTypes.string,
    }),
    bikeRentalStation: PropTypes.shape({
      networks: PropTypes.array,
    }),
  }).isRequired,
  to: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stop: PropTypes.shape({
      alerts: PropTypes.array,
      code: PropTypes.string,
      gtfsId: PropTypes.string.isRequired,
      platformCode: PropTypes.string,
      vehicleMode: PropTypes.string,
    }),
    bikeRentalStation: PropTypes.shape({
      networks: PropTypes.array,
    }),
    bikePark: PropTypes.shape({
      bikeParkId: PropTypes.string,
    }),
  }).isRequired,
  mode: PropTypes.string.isRequired,
  rentedBike: PropTypes.bool,
  startTime: PropTypes.number.isRequired,
  arrivalDelay: PropTypes.number,
  endTime: PropTypes.number.isRequired,
});

WalkLeg.propTypes = {
  children: PropTypes.node,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  leg: walkLegShape.isRequired,
  previousLeg: walkLegShape,
  focusToLeg: PropTypes.func.isRequired,
  startTime: PropTypes.number.isRequired,
};

WalkLeg.defaultProps = {
  previousLeg: undefined,
};

WalkLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default WalkLeg;
