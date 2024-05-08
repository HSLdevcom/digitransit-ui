import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import Link from 'found/Link';
import { legShape, configShape } from '../../util/shapes';
import { legTime } from '../../util/legUtils';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../../util/geo-utils';
import { durationToString, timeStr } from '../../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import ItineraryCircleLineLong from './ItineraryCircleLineLong';
import { PREFIX_STOPS } from '../../util/path';
import {
  getVehicleRentalStationNetworkConfig,
  CityBikeNetworkType,
} from '../../util/vehicleRentalUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { splitStringToAddressAndPlace } from '../../util/otpStrings';
import VehicleRentalLeg from './VehicleRentalLeg';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';

export default function BicycleLeg(
  { focusAction, index, leg, focusToLeg, bicycleWalkLeg },
  { config, intl },
) {
  let stopsDescription;
  let circleLine;
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(leg.duration * 1000);
  const startMs = legTime(leg.start);
  let { mode } = leg;
  let legDescription = <span>{leg.from ? leg.from.name : ''}</span>;
  const firstLegClassName = index === 0 ? 'start' : '';
  let modeClassName = 'bicycle';
  const [address, place] = splitStringToAddressAndPlace(leg.from.name);
  const networkConfig =
    leg.rentedBike &&
    leg.from.vehicleRentalStation &&
    getVehicleRentalStationNetworkConfig(
      leg.from.vehicleRentalStation.network,
      config,
    );
  const isFirstLeg = i => i === 0;
  const isScooter =
    networkConfig && networkConfig.type === CityBikeNetworkType.Scooter;

  if (leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') {
    modeClassName = leg.mode.toLowerCase();
    stopsDescription = (
      <FormattedMessage
        id={
          isScooter
            ? 'scooterwalk-distance-duration'
            : 'cyclewalk-distance-duration'
        }
        values={{ distance, duration }}
        defaultMessage="Walk your bike {distance} ({duration})"
      />
    );
  } else {
    stopsDescription = (
      <FormattedMessage
        id={isScooter ? 'scooter-distance-duration' : 'cycle-distance-duration'}
        values={{ distance, duration }}
        defaultMessage="Cycle {distance} ({duration})"
      />
    );
  }

  if (leg.rentedBike === true) {
    modeClassName = 'citybike';
    legDescription = (
      <FormattedMessage
        id={isScooter ? 'rent-scooter-at' : 'rent-cycle-at'}
        defaultMessage="Fetch a bike"
      />
    );

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
  const fromStop = leg?.from.stop || bicycleWalkLeg?.from.stop;
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
            time: timeStr(startMs),
            to: intl.formatMessage({ id: `modes.to-${getToMode()}` }),
            distance,
            origin,
            destination,
            duration,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">{timeStr(startMs)}</div>
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
        </span>
        {isFirstLeg(index) || bicycleWalkLeg?.from.stop ? (
          <div className={cx('itinerary-leg-first-row', 'bicycle', 'first')}>
            <div className="address-container">
              <div className="address">
                {fromStop ? (
                  <Link
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    to={`/${PREFIX_STOPS}/${fromStop.gtfsId}`}
                  >
                    {origin}
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
            <ItineraryMapAction
              target={leg.from.name || ''}
              focusAction={focusAction}
            />
          </div>
        ) : (
          <VehicleRentalLeg
            stationName={leg.from.name}
            isScooter={isScooter}
            vehicleRentalStation={leg.from.vehicleRentalStation}
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
                    duration: durationToString(bicycleWalkLeg.duration * 1000),
                    distance: displayDistance(
                      parseInt(bicycleWalkLeg.distance, 10),
                      config,
                      intl.formatNumber,
                    ),
                  }}
                />
              )}
              <ItineraryMapAction
                target={leg.from.name || ''}
                focusAction={focusAction}
              />
            </div>
          </div>
        )}
        <div className={cx('itinerary-leg-action', 'bike')}>
          <div className="itinerary-leg-action-content">
            {stopsDescription}
            <ItineraryMapAction
              target=""
              ariaLabelId="itinerary-summary-row.clickable-area-description"
              focusAction={focusToLeg}
            />
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
                    duration: durationToString(bicycleWalkLeg.duration * 1000),
                    distance: displayDistance(
                      parseInt(bicycleWalkLeg.distance, 10),
                      config,
                      intl.formatNumber,
                    ),
                  }}
                />
              )}
              <ItineraryMapAction
                target={leg.from.name || ''}
                focusAction={focusAction}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

BicycleLeg.propTypes = {
  leg: legShape.isRequired,
  bicycleWalkLeg: legShape,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
};

BicycleLeg.defaultProps = {
  bicycleWalkLeg: undefined,
};

BicycleLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
