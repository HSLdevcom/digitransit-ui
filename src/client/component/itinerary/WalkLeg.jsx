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
  legPlaceAddress,
  isBikeOrScooterRentalLeg,
  rentalNetworkId,
} from '../../utils/legUtils';
import ShowOnMapButton from './ShowOnMapButton';
import LegCircleLine from './LegCircleLine';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import PlatformNumber from '../PlatformNumber';
import WalkLegDetails from './WalkLegDetails';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../../utils/alertUtils';
import { PREFIX_STOPS } from '../../../shared/utils/path';
import {
  RentalNetworkType,
  getRentalNetworkConfig,
} from '../../../shared/utils/vehicleRentalUtils';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import VehicleRentalLeg from './VehicleRentalLeg';
import IndoorInfo from './IndoorInfo';
import {
  subwayTransferUsesSameStation,
  getIndoorLegType,
  getIndoorStepsWithVerticalTransportation,
  getEntranceWheelchairAccessibility,
  getEntranceName,
} from '../../utils/indoorUtils';
import IndoorSteps from './IndoorSteps';
import WalkLegOrigin from './WalkLegOrigin';
import AddressPlace from './AddressPlace';
import { IndoorLegType } from '../../../shared/utils/constants';
import LegPlaceLink from './LegPlaceLink';

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
  // If there is only one indoor routing step, always show it.
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(
    getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg).length === 1,
  );

  const isWalk = leg.mode === 'WALK';
  const meters = isWalk ? leg.distance : 0;
  const distance = displayDistance(meters, config, intl.formatNumber);
  const duration = durationToString(intl, isWalk ? leg.duration * 1000 : 0);
  const startMs = legTime(leg.start);
  // If mode is not WALK, WalkLeg should get information from "to"
  const walkPlace = isWalk ? leg.from : leg.to;
  const isFlexArrival = isCallAgencyLeg(leg) || (previousLeg && isCallAgencyLeg(previousLeg));
  const fromMode = walkPlace.stop?.vehicleMode || '';
  const previousPlace = isWalk ? previousLeg?.from : previousLeg?.to;
  const network = rentalNetworkId(previousPlace);
  const validatedLegName = getValidatedLegName(walkPlace.name, intl, !isWalk);
  const [address, place] = legPlaceAddress(intl, leg, walkPlace, !isWalk);
  const networkType = getRentalNetworkConfig(
    isBikeOrScooterRentalLeg(previousLeg) && network,
    config,
  ).type;
  const isScooter = networkType === RentalNetworkType.Scooter;
  // Taxi leg is the current leg when the walk leg is added after a taxi leg without a walk leg from data
  const alightNotice = isTaxiLeg(previousLeg) || isTaxiLeg(leg);
  const returnNotice = isBikeOrScooterRentalLeg(previousLeg) ? (
    <FormattedMessage
      id={isScooter ? 'return-e-scooter-to' : 'return-cycle-to'}
      values={{ station: validatedLegName }}
    />
  ) : null;

  const appendClass = returnNotice && !isScooter ? 'return-citybike' : undefined;

  const destinationLabel =
    leg.to.name?.toLowerCase() === 'scooter'
      ? intl.formatMessage({ id: 'e-scooter' })
      : leg.to.name;

  const indoorSteps = getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg);
  const indoorLegType = getIndoorLegType(previousLeg, leg, nextLeg);
  const entranceName = getEntranceName(previousLeg, leg);
  const entranceAccessible = getEntranceWheelchairAccessibility(previousLeg, leg);
  // do not render subway exit/entrance if transfer happens within a station
  const hideSubwayEntrances = subwayTransferUsesSameStation(previousLeg, nextLeg);
  const showSubwayExit = previousLeg?.mode === 'SUBWAY' && !hideSubwayEntrances;
  const showSubwayEntrance = nextLeg?.mode === 'SUBWAY' && !hideSubwayEntrances;
  // A leg without distance, e.g. an arrival at a stop that is the destination, has no walk to show.
  // Under 5 m the distance would be rounded to 0 m.
  const showWalkInfo = meters >= 5;
  // Without a walk only a dotted connector links the stop or notice row to the next leg
  const noWalk = !showWalkInfo && !showSubwayExit && !showSubwayEntrance;
  // The return notice box is tall, so its row keeps the normal height
  const compactRow = noWalk && !returnNotice;

  // The place is a link to the stop, unless it is a flex or taxi arrival, which show the address
  const showStopLink = walkPlace.stop && !alightNotice && !isFlexArrival;
  const showPlainName = !returnNotice && !alightNotice && !isFlexArrival;

  const alertIcon = (
    <ServiceAlertIcon
      className="inline-icon"
      severityLevel={getActiveAlertSeverityLevel(walkPlace.stop?.alerts, startMs / 1000)}
    />
  );

  return (
    <>
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
          time={isWalk ? legTimeStr(leg.start) : legTimeStr(leg.end)}
          estimate={!!previousLeg && isCallAgencyLeg(previousLeg)}
          realTime={!!previousLeg?.realTime}
        />
        {noWalk ? (
          <LegCircleLine
            index={index}
            modeClassName="walk"
            appendClass="taxi"
            className={cx('no-walk', { 'to-bottom': returnNotice })}
            viaType={leg.isViaPoint ? leg.from.viaLocationType : null}
          />
        ) : (
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
        )}
        <div
          className={cx('small-9 columns itinerary-instruction-column', leg.mode.toLowerCase(), {
            'no-walk': compactRow,
          })}
        >
          {index === 0 ? (
            <WalkLegOrigin
              address={address}
              place={place}
              showArrow={!!walkPlace.stop && !isFlexArrival}
              target={validatedLegName || ''}
              focusAction={focusAction}
            />
          ) : (
            <div
              className={cx(
                returnNotice ? 'itinerary-leg-first-row-return-bike' : 'itinerary-leg-first-row',
                isScooter && 'scooter',
                alightNotice && 'alight',
                compactRow && 'no-walk',
              )}
            >
              <div className="itinerary-leg-row">
                {showStopLink ? (
                  <LegPlaceLink
                    to={`/${PREFIX_STOPS}/${walkPlace.stop.gtfsId}`}
                    isViaPoint={leg.isViaPoint}
                    trailing={alertIcon}
                  >
                    {returnNotice || validatedLegName}
                  </LegPlaceLink>
                ) : (
                  <div>
                    {isFlexArrival && <AddressPlace address={address} place={place} />}
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
                        <FormattedMessage id="get-off-the-ride" />
                      </div>
                    )}
                    {showPlainName && (leg.viaAddress || validatedLegName)}
                    {alertIcon}
                  </div>
                )}
                {!isScooter && (
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
          {!noWalk && (
            <WalkLegDetails
              distance={distance}
              duration={duration}
              showWalkInfo={showWalkInfo}
              showSubwayExit={showSubwayExit}
              showSubwayEntrance={showSubwayEntrance}
              entranceName={entranceName}
              entranceAccessible={entranceAccessible}
              focusToLeg={focusToLeg}
            />
          )}
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
      {showIntermediateSteps && (
        <IndoorSteps
          steps={indoorSteps}
          indoorLegType={indoorLegType}
          focusToPoint={focusToPoint}
        />
      )}
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
