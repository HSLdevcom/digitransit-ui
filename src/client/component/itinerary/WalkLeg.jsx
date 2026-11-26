import cx from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape } from '../../utils/shapes';
import { useConfigContext } from '../../hooks/ConfigContext';
import {
  legTime,
  legTimeStr,
  legDestination,
  isCallAgencyLeg,
  isTaxiLeg,
  getValidatedLegName,
  isBikeOrScooterRentalLeg,
} from '../../utils/legUtils';
import ShowOnMapButton from './ShowOnMapButton';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import PlatformNumber from '../PlatformNumber';
import SubwayEntranceInfo from './SubwayEntranceInfo';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../../utils/alertUtils';
import { PREFIX_STOPS } from '../../../shared/utils/path';
import {
  RentalNetworkType,
  getRentalNetworkConfig,
} from '../../../shared/utils/vehicleRentalUtils';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import VehicleRentalLeg from './VehicleRentalLeg';
import IndoorInfo from './IndoorInfo';
import {
  subwayTransferUsesSameStation,
  getIndoorLegType,
  getIndoorStepsWithVerticalTransportation,
  getStepFocusAction,
  getEntranceWheelchairAccessibility,
  getEntranceName,
} from '../../utils/indoorUtils';
import IndoorStep from './IndoorStep';
import { IndoorLegType } from '../../../shared/utils/constants';
import LegPlaceLink from './LegPlaceLink';
import LegArrowIcon from './LegArrowIcon';

export default function WalkLeg({
  children,
  focusAction,
  focusToLeg,
  focusToPoint,
  index,
  leg,
  previousLeg,
  nextLeg,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { emphasizeDistance } = config;
  // If there is only one indoor routing step, always show it.
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(
    getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg).length === 1,
  );

  const isWalk = leg.mode === 'WALK';
  const distance = displayDistance(
    parseInt(isWalk ? leg.distance : 0, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(intl, isWalk ? leg.duration * 1000 : 0);
  const startMs = legTime(leg.start);
  // If mode is not WALK, WalkLeg should get information from "to"
  const walkPlace = isWalk ? leg.from : leg.to;
  const isFlexArrival = isCallAgencyLeg(leg) || (previousLeg && isCallAgencyLeg(previousLeg));
  const fromMode = walkPlace.stop?.vehicleMode || '';
  const previousPlace = isWalk ? previousLeg?.from : previousLeg?.to;
  const network =
    previousPlace?.vehicleRentalStation?.rentalNetwork.networkId ||
    previousPlace?.rentalVehicle?.rentalNetwork.networkId;
  const validatedLegName = getValidatedLegName(walkPlace.name, intl, !isWalk);
  const [name, place] = splitStringToAddressAndPlace(validatedLegName);
  const address = walkPlace.viaLocationType && leg.viaAddress ? leg.viaAddress : name;
  const networkType = getRentalNetworkConfig(
    isBikeOrScooterRentalLeg(previousLeg) && network,
    config,
  ).type;
  const isScooter = networkType === RentalNetworkType.Scooter;
  // Taxi leg is the current leg when the walk leg is added after a taxi leg without a walk leg from data
  const alightNotice = isTaxiLeg(previousLeg) || isTaxiLeg(leg);
  const returnNotice = isBikeOrScooterRentalLeg(previousLeg) ? (
    <FormattedMessage
      id={networkType === RentalNetworkType.Scooter ? 'return-e-scooter-to' : 'return-cycle-to'}
      values={{ station: validatedLegName }}
      defaultMessage="Return the bike to {station} station"
    />
  ) : null;

  const appendClass = returnNotice && !isScooter ? 'return-citybike' : undefined;

  const destinationLabel =
    leg.to.name?.toLowerCase() === 'scooter'
      ? intl.formatMessage({ id: 'e-scooter', defaultMessage: 'scooter' })
      : leg.to.name;

  const indoorSteps = getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg);
  const indoorLegType = getIndoorLegType(previousLeg, leg, nextLeg);
  const entranceName = getEntranceName(previousLeg, leg);
  const entranceAccessible = getEntranceWheelchairAccessibility(previousLeg, leg);
  // do not render subway exit/entrance if transfer happens within a station
  const hideSubwayEntrances = subwayTransferUsesSameStation(previousLeg, nextLeg);
  const showSubwayEntranceInfo =
    (nextLeg?.mode === 'SUBWAY' || previousLeg?.mode === 'SUBWAY') && !hideSubwayEntrances;

  const getMainRow = () => (
    <div className="row itinerary-row">
      <span className="sr-only">
        {returnNotice}{' '}
        <FormattedMessage
          id="itinerary-details.walk-leg"
          values={{
            time: legTimeStr(leg.start),
            to: legDestination(intl, leg),
            distance,
            duration,
            origin: validatedLegName,
            destination: destinationLabel,
          }}
        />
      </span>
      <LegTimeColumn
        time={leg.mode === 'WALK' ? legTimeStr(leg.start) : legTimeStr(leg.end)}
        estimate={!!previousLeg && isCallAgencyLeg(previousLeg)}
        realTime={!!previousLeg?.realTime}
      />
      <LegCircleLineWithIcon
        appendClass={appendClass}
        index={index}
        modeClassName="walk"
        viaType={leg.isViaPoint ? leg.from.viaLocationType : null}
        isStop={!!leg.from.stop}
        indoorLegType={indoorLegType}
        showIntermediateSteps={showIntermediateSteps}
        indoorStepsLength={indoorSteps.length}
      />
      <div className={`small-9 columns itinerary-instruction-column ${leg.mode.toLowerCase()}`}>
        {index === 0 ? (
          <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
            <div className="address-container">
              <div className="address">
                {address}
                {walkPlace.stop && !isFlexArrival && <LegArrowIcon />}
              </div>
              <div className="place">{place}</div>
            </div>
            <ShowOnMapButton target={validatedLegName || ''} focusAction={focusAction} />
          </div>
        ) : (
          <div
            className={cx(
              returnNotice ? 'itinerary-leg-first-row-return-bike' : 'itinerary-leg-first-row',
              isScooter && 'scooter',
              alightNotice && 'alight',
            )}
          >
            <div className="itinerary-leg-row">
              {walkPlace.stop && !alightNotice && !isFlexArrival ? (
                <LegPlaceLink
                  to={`/${PREFIX_STOPS}/${walkPlace.stop.gtfsId}`}
                  isViaPoint={leg.isViaPoint}
                  trailing={
                    <ServiceAlertIcon
                      className="inline-icon"
                      severityLevel={getActiveAlertSeverityLevel(
                        walkPlace.stop.alerts,
                        startMs / 1000,
                      )}
                    />
                  }
                >
                  {returnNotice || validatedLegName}
                </LegPlaceLink>
              ) : (
                <div>
                  {isFlexArrival && (
                    <div className="address-container">
                      <div className="address">{address}</div>
                      <div className="place">{place}</div>
                    </div>
                  )}
                  {returnNotice && (
                    <>
                      <div className="divider" />
                      <VehicleRentalLeg
                        isScooter={isScooter}
                        stationName={validatedLegName}
                        vehicleRentalStation={walkPlace.vehicleRentalStation}
                        returnBike
                        rentalVehicle={walkPlace.rentalVehicle}
                      />
                    </>
                  )}
                  {alightNotice && (
                    <div className="itinerary-leg-action-content">
                      <FormattedMessage id="get-off-the-ride" defaultMessage="Get off the ride" />
                    </div>
                  )}
                  {!returnNotice &&
                    !alightNotice &&
                    !isFlexArrival &&
                    (leg.viaAddress || validatedLegName)}
                  {walkPlace.stop && !alightNotice && !isFlexArrival && <LegArrowIcon />}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      walkPlace.stop?.alerts,
                      startMs / 1000,
                    )}
                  />
                </div>
              )}
              {networkType !== RentalNetworkType.Scooter && (
                <div className="stop-code-container">
                  {children}
                  {walkPlace.stop && (
                    <PlatformNumber number={walkPlace.stop.platformCode} short mode={fromMode} />
                  )}
                </div>
              )}
            </div>
            {!returnNotice && (
              <ShowOnMapButton target={validatedLegName || ''} focusAction={focusAction} />
            )}
          </div>
        )}
        <div className="itinerary-leg-action">
          {previousLeg?.mode === 'SUBWAY' && !hideSubwayEntrances && (
            <SubwayEntranceInfo
              type="exit"
              entranceName={entranceName}
              entranceAccessible={entranceAccessible}
            />
          )}
          <div
            className={cx('itinerary-leg-action-content', {
              'subway-entrance-info': showSubwayEntranceInfo,
            })}
          >
            <FormattedMessage
              id="walk-distance-duration"
              values={{ distance: emphasizeDistance ? <b>{distance}</b> : distance, duration }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <ShowOnMapButton
              target=""
              ariaLabelId="itinerary-list-row.clickable-area-description"
              focusAction={focusToLeg}
            />
          </div>
          {nextLeg?.mode === 'SUBWAY' && !hideSubwayEntrances && (
            <SubwayEntranceInfo
              type="entrance"
              entranceName={entranceName}
              entranceAccessible={entranceAccessible}
            />
          )}
        </div>
        {indoorLegType !== IndoorLegType.NoStepsInside && indoorSteps.length > 1 ? (
          <div className="itinerary-leg-indoor-button-container">
            <IndoorInfo
              intermediateStepCount={indoorSteps.length}
              showIntermediateSteps={showIntermediateSteps}
              toggleFunction={() => setShowIntermediateSteps(!showIntermediateSteps)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  const getIntermediateRows = () =>
    showIntermediateSteps ? (
      <div className="itinerary-leg-container">
        {indoorSteps.map((step, i) => (
          <IndoorStep
            // eslint-disable-next-line react/no-array-index-key
            key={`indoorstep_lat_${step.lat}_lon_${step.lon}_index_${index}_i_${i}`}
            // eslint-disable-next-line no-underscore-dangle
            type={step.feature?.__typename}
            verticalDirection={step.feature?.verticalDirection}
            toLevelName={step.feature?.to?.name}
            focusAction={getStepFocusAction(step.lat, step.lon, focusToPoint)}
            isLastPlace={i === indoorSteps.length - 1}
            onlyOneStep={indoorSteps.length === 1}
            indoorLegType={indoorLegType}
          />
        ))}
      </div>
    ) : null;

  return (
    <>
      {getMainRow()}
      {getIntermediateRows()}
    </>
  );
}

WalkLeg.propTypes = {
  children: PropTypes.node,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  leg: legShape.isRequired,
  previousLeg: legShape,
  nextLeg: legShape,
  focusToLeg: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
};
