import moment from 'moment';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';

import ComponentUsageExample from './ComponentUsageExample';
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

function WalkLeg(
  { children, focusAction, focusToLeg, index, leg, previousLeg },
  { config, intl },
) {
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(leg.duration * 1000);
  const modeClassName = 'walk';
  const fromMode = leg.from.stop ? leg.from.stop.vehicleMode : '';
  const isFirstLeg = i => i === 0;
  const [address, place] = splitStringToAddressAndPlace(leg.from.name);

  const networkType = getCityBikeNetworkConfig(
    getCityBikeNetworkId(
      previousLeg &&
        previousLeg.rentedBike &&
        previousLeg.from.bikeRentalStation &&
        previousLeg.from.bikeRentalStation.networks,
    ),
    config,
  ).type;

  const returnNotice =
    previousLeg && previousLeg.rentedBike ? (
      <FormattedMessage
        id={
          networkType === CityBikeNetworkType.Scooter
            ? 'return-scooter-to'
            : 'return-cycle-to'
        }
        values={{ station: leg.from ? leg.from.name : '' }}
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
            origin: leg.from ? leg.from.name : '',
            destination: leg.to ? leg.to.name : '',
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(leg.startTime).format('HH:mm')}
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
            values={{ target: leg.from.name || '' }}
          />
        </span>
        {isFirstLeg(index) ? (
          <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
            <div className="address-container">
              <div className="address">
                {address}
                {leg.from.stop && (
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
                { target: leg.from.name || '' },
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
          >
            <div className="itinerary-leg-row">
              {leg.from.stop ? (
                <Link
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  to={`/${PREFIX_STOPS}/${leg.from.stop.gtfsId}`}
                >
                  {returnNotice || leg.from.name}
                  {leg.from.stop && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg.from.stop && leg.from.stop.alerts,
                      leg.startTime / 1000,
                    )}
                  />
                </Link>
              ) : (
                <div>
                  {returnNotice ? (
                    <CityBikeLeg
                      isScooter={isScooter}
                      stationName={leg.from.name}
                      bikeRentalStation={leg.from.bikeRentalStation}
                      returnBike
                    />
                  ) : (
                    leg.from.name
                  )}
                  {leg.from.stop && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg.from.stop && leg.from.stop.alerts,
                      leg.startTime / 1000,
                    )}
                  />
                </div>
              )}
              <div className="stop-code-container">
                {children}
                {leg.from.stop && (
                  <PlatformNumber
                    number={leg.from.stop.platformCode}
                    short
                    isRailOrSubway={
                      fromMode === 'RAIL' || fromMode === 'SUBWAY'
                    }
                  />
                )}
              </div>
            </div>
            {/*           <div
              className="itinerary-map-action"
              onClick={focusAction}
              onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
              role="button"
              tabIndex="0"
              aria-label={intl.formatMessage(
                { id: 'itinerary-summary.show-on-map' },
                { target: leg.from.name || '' },
              )}
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div> */}
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

const exampleLeg = t1 => ({
  duration: 438,
  startTime: t1 + 10000,
  distance: 483.84600000000006,
  mode: 'WALK',
  from: { name: 'Messukeskus', stop: { code: '0613' } },
});

WalkLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0).valueOf();
  return (
    <div>
      <p>Displays an itinerary walk leg.</p>
      <ComponentUsageExample description="walk-start">
        <WalkLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="walk-middle">
        <WalkLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

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
  mode: PropTypes.string.isRequired,
  rentedBike: PropTypes.bool,
  startTime: PropTypes.number.isRequired,
  to: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
});

WalkLeg.propTypes = {
  children: PropTypes.node,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  leg: walkLegShape.isRequired,
  previousLeg: walkLegShape,
  focusToLeg: PropTypes.func.isRequired,
};

WalkLeg.defaultProps = {
  previousLeg: undefined,
};

WalkLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default WalkLeg;
