import moment from 'moment';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import Icon from './Icon';
import ItineraryMapAction from './ItineraryMapAction';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import PlatformNumber from './PlatformNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { PREFIX_STOPS } from '../util/path';
import { AlertShape } from '../util/shapes';
import {
  CityBikeNetworkType,
  getVehicleRentalStationNetworkConfig,
} from '../util/vehicleRentalUtils';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { splitStringToAddressAndPlace } from '../util/otpStrings';
import VehicleRentalLeg from './VehicleRentalLeg';

function WalkLeg(
  { children, focusAction, focusToLeg, index, leg, previousLeg },
  { config, intl },
) {
  const distance = displayDistance(
    parseInt(leg.mode !== 'WALK' ? 0 : leg.distance, 10),
    config,
    intl.formatNumber,
  );
  //
  const duration = durationToString(
    leg.mode !== 'WALK' ? 0 : leg.duration * 1000,
  );
  // If mode is not WALK, WalkLeg should get information from "to".
  const toOrFrom = leg.mode !== 'WALK' ? 'to' : 'from';
  const modeClassName = 'walk';
  const fromMode = (leg[toOrFrom].stop && leg[toOrFrom].stop.vehicleMode) || '';
  const isFirstLeg = i => i === 0;
  const [address, place] = splitStringToAddressAndPlace(leg[toOrFrom].name);

  const networkType = getVehicleRentalStationNetworkConfig(
    previousLeg &&
      previousLeg.rentedBike &&
      previousLeg[toOrFrom].vehicleRentalStation &&
      previousLeg[toOrFrom].vehicleRentalStation.network,
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
            to: intl.formatMessage({
              id: `modes.to-${
                leg.to.stop?.vehicleMode?.toLowerCase() || 'place'
              }`,
              defaultMessage: 'modes.to-stop',
            }),
            distance,
            duration,
            origin: leg[toOrFrom] ? leg[toOrFrom].name : '',
            destination: leg.to ? leg.to.name : '',
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          <span className={cx({ realtime: previousLeg?.realTime })}>
            {moment(leg.mode === 'WALK' ? leg.startTime : leg.endTime).format(
              'HH:mm',
            )}
          </span>
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
            <ItineraryMapAction
              target={leg[toOrFrom].name || ''}
              focusAction={focusAction}
            />
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
                    <VehicleRentalLeg
                      isScooter={isScooter}
                      stationName={leg[toOrFrom].name}
                      vehicleRentalStation={leg[toOrFrom].vehicleRentalStation}
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
            </div>
            {!returnNotice && (
              <ItineraryMapAction
                target={leg[toOrFrom].name || ''}
                focusAction={focusAction}
              />
            )}
          </div>
        )}

        <div className="itinerary-leg-action">
          <div className="itinerary-leg-action-content">
            <FormattedMessage
              id="walk-distance-duration"
              values={{
                distance: config.emphasizeDistance ? (
                  <b>{distance}</b>
                ) : (
                  distance
                ),
                duration,
              }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <ItineraryMapAction
              target=""
              ariaLabelId="itinerary-summary-row.clickable-area-description"
              focusAction={focusToLeg}
            />
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
      alerts: PropTypes.arrayOf(AlertShape),
      code: PropTypes.string,
      gtfsId: PropTypes.string.isRequired,
      platformCode: PropTypes.string,
      vehicleMode: PropTypes.string,
    }),
    vehicleRentalStation: PropTypes.shape({
      network: PropTypes.string,
    }),
  }).isRequired,
  to: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stop: PropTypes.shape({
      alerts: PropTypes.arrayOf(AlertShape),
      code: PropTypes.string,
      gtfsId: PropTypes.string.isRequired,
      platformCode: PropTypes.string,
      vehicleMode: PropTypes.string,
    }),
    vehicleRentalStation: PropTypes.shape({
      network: PropTypes.string,
    }),
  }).isRequired,
  mode: PropTypes.string.isRequired,
  rentedBike: PropTypes.bool,
  realTime: PropTypes.bool,
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
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
  children: undefined,
};

WalkLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default WalkLeg;
