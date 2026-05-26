import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import { legShape } from '../../util/shapes';
import { useConfigContext } from '../../configurations/ConfigContext';
import {
  legTime,
  legTimeStr,
  legDestination,
  isCallAgencyLeg,
  getValidatedLegName,
} from '../../util/legUtils';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import PlatformNumber from '../PlatformNumber';
import SubwayEntranceInfo from './SubwayEntranceInfo';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../../util/alertUtils';
import { PREFIX_STOPS } from '../../util/path';
import {
  RentalNetworkType,
  getRentalNetworkConfig,
} from '../../util/vehicleRentalUtils';
import { displayDistance } from '../../util/geo-utils';
import { durationToString } from '../../util/timeUtils';
import { splitStringToAddressAndPlace } from '../../util/otpStrings';
import VehicleRentalLeg from './VehicleRentalLeg';
import IndoorInfo from './IndoorInfo';
import {
  subwayTransferUsesSameStation,
  getIndoorLegType,
  getIndoorStepsWithVerticalTransportation,
  getStepFocusAction,
  getEntranceWheelchairAccessibility,
  getEntranceName,
} from '../../util/indoorUtils';
import IndoorStep from './IndoorStep';
import { IndoorLegType } from '../../constants';

function WalkLeg({
  children,
  focusAction,
  focusToLeg,
  focusToPoint,
  index,
  leg,
  previousLeg,
  nextLeg,
  useOriginAddress,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { colors, emphasizeDistance } = config;
  // If there is only one indoor routing step, always show it.
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(
    getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg)
      .length === 1,
  );

  const distance = displayDistance(
    parseInt(leg.mode !== 'WALK' ? 0 : leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(
    intl,
    leg.mode !== 'WALK' ? 0 : leg.duration * 1000,
  );
  const startMs = legTime(leg.start);
  // If mode is not WALK, WalkLeg should get information from "to". If useOriginAddress is true, force WalkLeg to get information from "from".
  const toOrFrom = leg.mode !== 'WALK' && !useOriginAddress ? 'to' : 'from';
  const modeClassName = 'walk';
  const fromMode = (leg[toOrFrom].stop && leg[toOrFrom].stop.vehicleMode) || '';
  const isFirstLeg = i => i === 0;
  const [name, place] = splitStringToAddressAndPlace(leg[toOrFrom].name);
  const address =
    leg[toOrFrom].viaLocationType && leg.viaAddress ? leg.viaAddress : name;
  const network =
    previousLeg?.[toOrFrom]?.vehicleRentalStation?.rentalNetwork.networkId ||
    previousLeg?.[toOrFrom]?.rentalVehicle?.rentalNetwork.networkId;
  const validatedLegName = getValidatedLegName(
    leg[toOrFrom].name,
    intl,
    toOrFrom === 'to',
  );
  const networkType = getRentalNetworkConfig(
    previousLeg?.rentedBike && network,
    config,
  ).type;
  const isScooter = networkType === RentalNetworkType.Scooter;
  // Taxi leg is the current leg when the walk leg is added after a taxi leg without a walk leg from data
  const alightNotice = previousLeg?.mode === 'TAXI' || leg?.mode === 'TAXI';
  const returnNotice = previousLeg?.rentedBike ? (
    <FormattedMessage
      id={
        networkType === RentalNetworkType.Scooter
          ? 'return-e-scooter-to'
          : 'return-cycle-to'
      }
      values={{ station: leg[toOrFrom] ? validatedLegName : '' }}
      defaultMessage="Return the bike to {station} station"
    />
  ) : null;

  let appendClass;
  if (returnNotice) {
    appendClass = !isScooter ? 'return-citybike' : '';
  }

  const destinationLabel =
    leg.to.name?.toLowerCase() === 'scooter'
      ? intl.formatMessage({
          id: 'e-scooter',
          defaultMessage: 'scooter',
        })
      : leg.to.name;

  const indoorSteps = getIndoorStepsWithVerticalTransportation(
    previousLeg,
    leg,
    nextLeg,
  );
  const indoorLegType = getIndoorLegType(previousLeg, leg, nextLeg);
  const entranceName = getEntranceName(previousLeg, leg);
  const entranceAccessible = getEntranceWheelchairAccessibility(
    previousLeg,
    leg,
  );
  // do not render subway exit/entrance if transfer happens within a station
  const hideSubwayEntrances = subwayTransferUsesSameStation(
    previousLeg,
    nextLeg,
  );
  const showSubwayEntranceInfo =
    (nextLeg?.mode === 'SUBWAY' || previousLeg?.mode === 'SUBWAY') &&
    !hideSubwayEntrances;

  const getMainRow = () => (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        {returnNotice}
        <FormattedMessage
          id="itinerary-details.walk-leg"
          values={{
            time: legTimeStr(leg.start),
            to: legDestination(intl, leg),
            distance,
            duration,
            origin: leg[toOrFrom] ? validatedLegName : '',
            destination: leg.to ? destinationLabel : '',
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        {previousLeg && isCallAgencyLeg(previousLeg) && (
          <FormattedMessage id="estimate" />
        )}
        <div className="itinerary-time-column-time">
          <span className={cx({ realtime: previousLeg?.realTime })}>
            {leg.mode === 'WALK' ? legTimeStr(leg.start) : legTimeStr(leg.end)}
          </span>
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        appendClass={appendClass}
        index={index}
        modeClassName={modeClassName}
        viaType={leg.isViaPoint ? leg.from.viaLocationType : null}
        isStop={!!leg.from.stop}
        indoorLegType={indoorLegType}
        showIntermediateSteps={showIntermediateSteps}
        indoorStepsLength={indoorSteps.length}
      />
      <div
        className={`small-9 columns itinerary-instruction-column ${leg.mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: validatedLegName || '' }}
          />
        </span>
        {isFirstLeg(index) ? (
          <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
            <div className="address-container">
              <div className="address">
                {address}
                {leg[toOrFrom].stop && (
                  <Icon
                    img="icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={colors.primary}
                  />
                )}
              </div>
              <div className="place">{place}</div>
            </div>
            <ItineraryMapAction
              target={validatedLegName || ''}
              focusAction={focusAction}
            />
          </div>
        ) : (
          <div
            className={cx(
              returnNotice
                ? 'itinerary-leg-first-row-return-bike'
                : 'itinerary-leg-first-row',
              isScooter && 'scooter',
              alightNotice && 'alight',
            )}
          >
            <div className="itinerary-leg-row">
              {leg[toOrFrom].stop && !alightNotice ? (
                <Link
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  to={`/${PREFIX_STOPS}/${leg[toOrFrom].stop.gtfsId}`}
                >
                  {returnNotice || validatedLegName}
                  {leg.isViaPoint && (
                    <>
                      <Icon
                        img="icon_mapMarker"
                        className="itinerary-mapmarker-icon"
                      />
                      <span className="sr-only">
                        {intl.formatMessage({ id: 'via-point' })}
                      </span>
                    </>
                  )}
                  {leg[toOrFrom].stop && (
                    <Icon
                      img="icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg[toOrFrom].stop && leg[toOrFrom].stop.alerts,
                      startMs / 1000,
                    )}
                  />
                </Link>
              ) : (
                <div>
                  {returnNotice && (
                    <>
                      <div className="divider" />
                      <VehicleRentalLeg
                        isScooter={isScooter}
                        stationName={validatedLegName}
                        vehicleRentalStation={
                          leg[toOrFrom].vehicleRentalStation
                        }
                        returnBike
                        rentalVehicle={leg.from.rentalVehicle}
                      />
                    </>
                  )}
                  {alightNotice && (
                    <div className="itinerary-leg-action-content">
                      <FormattedMessage
                        id="get-off-the-ride"
                        defaultMessage="Get off the ride"
                      />
                    </div>
                  )}
                  {!returnNotice &&
                    !alightNotice &&
                    (leg.viaAddress || validatedLegName)}
                  {leg[toOrFrom].stop && !alightNotice && (
                    <Icon
                      img="icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg[toOrFrom].stop && leg[toOrFrom].stop.alerts,
                      startMs / 1000,
                    )}
                  />
                </div>
              )}
              {networkType !== RentalNetworkType.Scooter && (
                <div className="stop-code-container">
                  {children}
                  {leg[toOrFrom].stop && (
                    <PlatformNumber
                      number={leg[toOrFrom].stop.platformCode}
                      short
                      mode={fromMode}
                    />
                  )}
                </div>
              )}
            </div>
            {!returnNotice && (
              <ItineraryMapAction
                target={validatedLegName || ''}
                focusAction={focusAction}
              />
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
              values={{
                distance: emphasizeDistance ? <b>{distance}</b> : distance,
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
          {nextLeg?.mode === 'SUBWAY' && !hideSubwayEntrances && (
            <SubwayEntranceInfo
              type="entrance"
              entranceName={entranceName}
              entranceAccessible={entranceAccessible}
            />
          )}
        </div>
        {indoorLegType !== IndoorLegType.NoStepsInside &&
        indoorSteps.length > 1 ? (
          <div className="itinerary-leg-indoor-button-container">
            <IndoorInfo
              intermediateStepCount={indoorSteps.length}
              showIntermediateSteps={showIntermediateSteps}
              toggleFunction={() =>
                setShowIntermediateSteps(!showIntermediateSteps)
              }
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
  useOriginAddress: PropTypes.bool,
};

WalkLeg.defaultProps = {
  previousLeg: undefined,
  nextLeg: undefined,
  children: undefined,
  useOriginAddress: false,
};

export default WalkLeg;
