import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment-timezone';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import Link from 'found/Link';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import ItineraryCircleLineLong from './ItineraryCircleLineLong';
import { PREFIX_STOPS } from '../util/path';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkId,
} from '../util/citybikes';
import { isKeyboardSelectionEvent } from '../util/browser';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { AlertSeverityLevelType } from '../constants';
import ServiceAlertIcon from './ServiceAlertIcon';
import { splitStringToAddressAndPlace } from '../util/otpStrings';
import CityBikeLeg from './CityBikeLeg';
import StopCode from './StopCode';
import PlatformNumber from './PlatformNumber';
import DelayedTime from './DelayedTime';

function BicycleLeg(
  {
    focusAction,
    index,
    leg,
    focusToLeg,
    bicycleWalkLeg,
    arrivedAtDestinationWithRentedBicycle,
    startTime,
    previousLeg,
  },
  { config, intl },
) {
  let stopsDescription;
  let circleLine;
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(leg.endTime - leg.startTime);
  let { mode } = leg;
  let legDescription = <span>{leg.from ? leg.from.name : ''}</span>;
  const firstLegClassName = index === 0 ? 'start' : '';
  let modeClassName = 'bicycle';
  const [address, place] = splitStringToAddressAndPlace(leg.from.name);
  const networkConfig =
    leg.rentedBike &&
    leg.from.bikeRentalStation &&
    getCityBikeNetworkConfig(
      getCityBikeNetworkId(leg.from.bikeRentalStation.networks),
      config,
    );
  const isFirstLeg = i => i === 0;
  // TODO should better be deduced from leg, as network may rent different formFactors
  const rentalFormFactor =
    networkConfig?.type && networkConfig?.type !== 'citybike'
      ? networkConfig?.type
      : 'bicycle';
  let rentalUri;
  if (leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') {
    modeClassName = leg.mode.toLowerCase();
    stopsDescription = (
      <FormattedMessage
        id={`${rentalFormFactor}walk-distance-duration`}
        values={{ distance, duration }}
        defaultMessage="Walk your vehicle {distance} ({duration})"
      />
    );
  } else {
    stopsDescription = (
      <FormattedMessage
        id={`${rentalFormFactor}-distance-duration`}
        values={{ distance, duration }}
        defaultMessage="Continue {distance} ({duration})"
      />
    );
  }

  if (leg.rentedBike === true) {
    modeClassName = 'citybike';
    legDescription = (
      <FormattedMessage
        id={`rent-${rentalFormFactor}-at`}
        defaultMessage="Fetch a bike"
      />
    );
    rentalUri = leg.from.bikeRentalStation.rentalUriWeb;

    if (leg.mode === 'BICYCLE') {
      mode = 'CITYBIKE';
    }

    if (leg.mode === 'WALK') {
      mode = 'CITYBIKE_WALK';
    }
  }
  if (bicycleWalkLeg) {
    const modeClassNames = bicycleWalkLeg.to?.stop
      ? [modeClassName, bicycleWalkLeg.mode.toLowerCase()]
      : [bicycleWalkLeg.mode.toLowerCase(), modeClassName];
    circleLine = (
      <ItineraryCircleLineLong index={index} modeClassNames={modeClassNames} />
    );
  } else if (mode === 'BICYCLE') {
    circleLine = (
      <ItineraryCircleLineWithIcon
        index={index}
        modeClassName={modeClassName}
      />
    );
  } else {
    circleLine = (
      <ItineraryCircleLine index={index} modeClassName={modeClassName} />
    );
  }
  const fromStop = () => leg?.from.stop || bicycleWalkLeg?.from.stop;
  const getToMode = () => {
    if (leg.to.bikePark) {
      return 'bike-park';
    }
    if (leg.to.stop?.vehicleMode) {
      return leg.to.stop?.vehicleMode.toLowerCase();
    }
    if (bicycleWalkLeg?.to.stop?.vehicleMode) {
      return bicycleWalkLeg.to.stop?.vehicleMode.toLowerCase();
    }
    return 'place';
  };
  const origin = bicycleWalkLeg?.from.stop ? bicycleWalkLeg.from.name : address;
  const destination = bicycleWalkLeg?.to.stop
    ? bicycleWalkLeg?.to.name
    : leg.to.name;
  return (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        {leg.rentedBike === true && legDescription}
        {(leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') &&
          stopsDescription}
        <FormattedMessage
          id="itinerary-details.biking-leg"
          values={{
            time: moment(leg.startTime).format('HH:mm'),
            to: intl.formatMessage({ id: `modes.to-${getToMode()}` }),
            distance,
            origin,
            destination,
            duration,
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
      {circleLine}

      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg.from.name || '' }}
          />
          {!!arrivedAtDestinationWithRentedBicycle && (
            <FormattedMessage id="itinerary-details.route-has-info-alert" />
          )}
        </span>
        {isFirstLeg(index) || bicycleWalkLeg?.from.stop ? (
          <div className={cx('itinerary-leg-first-row', 'bicycle', 'first')}>
            <div className="address-container">
              <div className="address">
                {fromStop() ? (
                  <Link
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    to={`/${PREFIX_STOPS}/${bicycleWalkLeg.from.stop.gtfsId}`}
                  >
                    {bicycleWalkLeg.from.name}
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  </Link>
                ) : (
                  address
                )}
              </div>
              {bicycleWalkLeg?.from.stop?.code && (
                <>
                  <StopCode code={bicycleWalkLeg.from.stop.code} />
                  <PlatformNumber
                    number={bicycleWalkLeg.from.stop.platformCode}
                    short
                    isRailOrSubway
                  />
                </>
              )}
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
          <CityBikeLeg
            stationName={leg.from.name}
            bikeRentalStation={leg.from.bikeRentalStation}
          />
        )}
        {bicycleWalkLeg?.from.stop && (
          <div className={cx('itinerary-leg-action', 'bicycle')}>
            <div className="itinerary-leg-action-content">
              {bicycleWalkLeg.distance === -1 ? (
                <FormattedMessage
                  id="bicycle-walk-from-transit-no-duration"
                  values={{
                    transportMode: (
                      <FormattedMessage
                        id={`from-${bicycleWalkLeg.from.stop.vehicleMode.toLowerCase()}`}
                      />
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  id="bicycle-walk-from-transit"
                  values={{
                    transportMode: (
                      <FormattedMessage
                        id={`from-${bicycleWalkLeg.from.stop.vehicleMode.toLowerCase()}`}
                      />
                    ),
                    duration: durationToString(
                      bicycleWalkLeg.endTime - bicycleWalkLeg.startTime,
                    ),
                    distance: displayDistance(
                      parseInt(bicycleWalkLeg.distance, 10),
                      config,
                      intl.formatNumber,
                    ),
                  }}
                />
              )}
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
          </div>
        )}
        {leg.rentedBike && arrivedAtDestinationWithRentedBicycle && (
          <div className={`itinerary-alert-info ${mode.toLowerCase()}`}>
            <ServiceAlertIcon
              className="inline-icon"
              severityLevel={AlertSeverityLevelType.Info}
            />
            <div>
              <FormattedMessage id="alert:bikerental:free-floating-drop-off" />
            </div>
          </div>
        )}
        {rentalUri && (
          <a
            href={rentalUri}
            rel="noopener noreferrer"
            className="citybike-website-btn"
            target="_blank"
          >
            <button className="standalone-btn cursor-pointer">
              <FormattedMessage id="use-citybike" />
            </button>
          </a>
        )}
        <div className={cx('itinerary-leg-action', 'bike')}>
          <div className="itinerary-leg-action-content">
            {stopsDescription}
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
        {bicycleWalkLeg && bicycleWalkLeg?.to.stop && (
          <div className={cx('itinerary-leg-action', 'bicycle')}>
            <div className="itinerary-leg-action-content">
              {bicycleWalkLeg.distance === -1 ? (
                <FormattedMessage
                  id="bicycle-walk-to-transit-no-duration"
                  values={{
                    transportMode: (
                      <FormattedMessage
                        id={`to-${bicycleWalkLeg.to.stop?.vehicleMode.toLowerCase()}`}
                      />
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  id="bicycle-walk-to-transit"
                  values={{
                    transportMode: (
                      <FormattedMessage
                        id={`to-${bicycleWalkLeg.to.stop.vehicleMode.toLowerCase()}`}
                      />
                    ),
                    duration: durationToString(
                      bicycleWalkLeg.endTime - bicycleWalkLeg.startTime,
                    ),
                    distance: displayDistance(
                      parseInt(bicycleWalkLeg.distance, 10),
                      config,
                      intl.formatNumber,
                    ),
                  }}
                />
              )}
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
          </div>
        )}
      </div>
    </div>
  );
}

BicycleLeg.propTypes = {
  leg: PropTypes.shape({
    endTime: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      bikeRentalStation: PropTypes.shape({
        bikesAvailable: PropTypes.number.isRequired,
        networks: PropTypes.array.isRequired,
        rentalUriWeb: PropTypes.string,
      }),
      stop: PropTypes.object,
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.object,
      bikePark: PropTypes.object,
    }).isRequired,
    mode: PropTypes.string.isRequired,
    rentedBike: PropTypes.bool.isRequired,
    alerts: PropTypes.array,
  }).isRequired,
  bicycleWalkLeg: PropTypes.shape({
    endTime: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      bikeRentalStation: PropTypes.shape({
        bikesAvailable: PropTypes.number.isRequired,
        networks: PropTypes.array.isRequired,
      }),
      stop: PropTypes.object,
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.object,
    }).isRequired,
    mode: PropTypes.string.isRequired,
    rentedBike: PropTypes.bool.isRequired,
  }),
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  arrivedAtDestinationWithRentedBicycle: PropTypes.bool,
  startTime: PropTypes.number.isRequired,
  previousLeg: PropTypes.shape({
    arrivalDelay: PropTypes.number,
  }),
};

BicycleLeg.defaultProps = {
  arrivedAtDestinationWithRentedBicycle: false,
};

BicycleLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default BicycleLeg;
