import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { legShape, relayShape } from '../../utils/shapes';
import { legTimeStr, legDestination, getValidatedLegName } from '../../utils/legUtils';
import ShowOnMapButton from './ShowOnMapButton';
import LegAction from './LegAction';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import LegCircleLine from './LegCircleLine';
import LegTimeColumn from './LegTimeColumn';
import LegCircleLineLong from './LegCircleLineLong';
import { stopPagePath } from '../../../shared/utils/path';
import {
  getRentalNetworkConfig,
  RentalNetworkType,
} from '../../../shared/utils/vehicleRentalUtils';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import VehicleRentalLeg from './VehicleRentalLeg';
import { getSettings } from '../../utils/planParamUtil';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';
import useNearestScooters from './useNearestScooters';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegPlaceLink from './LegPlaceLink';
import BicycleWalkNote from './BicycleWalkNote';
import ScooterSettingsPrompt from './ScooterSettingsPrompt';

const rentedModes = { BICYCLE: 'CITYBIKE', WALK: 'CITYBIKE_WALK' };

function getStopsMessageId(isWalking, isScooter) {
  if (isWalking) {
    return isScooter ? 'scooterwalk-distance-duration' : 'cyclewalk-distance-duration';
  }
  return isScooter ? 'scooter-distance-duration' : 'cycle-distance-duration';
}

export default function BicycleLeg({
  focusAction,
  index,
  leg,
  focusToLeg,
  bicycleWalkLeg,
  openSettings,
  nextLegMode,
  relayEnvironment,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(parseInt(leg.distance, 10), config, intl.formatNumber);
  const duration = durationToString(intl, leg.duration * 1000);
  const time = legTimeStr(leg.start); // hh:mm
  const isWalking = leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK';
  const mode = (leg.rentedBike && rentedModes[leg.mode]) || leg.mode;
  const walkingClassName = isWalking ? leg.mode.toLowerCase() : 'bicycle';
  const modeClassName = leg.rentedBike ? 'citybike' : walkingClassName;
  const firstLegClassName = index === 0 ? 'start' : '';
  const [name, place] = splitStringToAddressAndPlace(
    getValidatedLegName(leg.from.name, intl, true),
  );
  const address = (leg.from.viaLocationType && leg.viaAddress) || name;
  const rentalVehicleNetwork =
    leg.from.vehicleRentalStation?.rentalNetwork.networkId ||
    leg.from.rentalVehicle?.rentalNetwork.networkId;
  const networkConfig =
    leg.rentedBike && rentalVehicleNetwork && getRentalNetworkConfig(rentalVehicleNetwork, config);
  const isScooter = networkConfig && networkConfig.type === RentalNetworkType.Scooter;
  const settings = getSettings(config);
  const scooterSettingsOn = settings.scooterNetworks?.length > 0;
  const nearestScooters = useNearestScooters(
    relayEnvironment,
    leg.from,
    rentalVehicleNetwork,
    !!isScooter,
  );

  const stopsDescription = (
    <FormattedMessage
      id={getStopsMessageId(isWalking, isScooter)}
      values={{ distance, duration }}
    />
  );

  const circleLineProps = { index, viaType: leg.from.viaLocationType, isStop: !!leg.from.stop };

  const getCircleLine = () => {
    if (isScooter) {
      return (
        <LegCircleLineWithIcon
          {...circleLineProps}
          modeClassName={mode.toLowerCase()}
          icon="icon_scooter_rider"
          appendClass={scooterSettingsOn ? 'scooter' : 'settings'}
          style={{ '--scooter-amount': `${nearestScooters.length}%` }}
        />
      );
    }
    if (bicycleWalkLeg) {
      return (
        <LegCircleLineLong
          {...circleLineProps}
          modeClassName={modeClassName}
          boardingLeg={bicycleWalkLeg}
        />
      );
    }
    if (mode === 'BICYCLE') {
      return <LegCircleLineWithIcon {...circleLineProps} modeClassName={modeClassName} />;
    }
    return <LegCircleLine {...circleLineProps} modeClassName={modeClassName} />;
  };

  const fromStop = leg.from.stop || bicycleWalkLeg?.from.stop;
  const origin =
    bicycleWalkLeg?.from.stop && !bicycleWalkLeg?.from.viaLocationType
      ? bicycleWalkLeg.from.name
      : address;
  const destination = bicycleWalkLeg?.to.stop ? bicycleWalkLeg?.to.name : leg.to.name;

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        {leg.rentedBike && (
          <>
            <FormattedMessage
              id={isScooter ? 'rent-e-scooter-at' : 'rent-cycle-at'}
              values={{ station: leg.from.name }}
            />
            .{' '}
          </>
        )}
        {isWalking && <>{stopsDescription}. </>}
        <FormattedMessage
          id={isScooter ? 'itinerary-details.scooter-leg' : 'itinerary-details.biking-leg'}
          values={{
            time,
            to: legDestination(intl, leg, bicycleWalkLeg?.to),
            distance,
            origin: isScooter ? intl.formatMessage({ id: 'from-scooter-location' }) : origin,
            destination,
            duration,
          }}
        />
      </span>
      <LegTimeColumn time={time} />
      {getCircleLine()}

      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${mode.toLowerCase()}`}
      >
        {index === 0 || bicycleWalkLeg?.from.stop || leg.from.viaLocationType ? (
          <>
            {leg.from.viaLocationType ? <div className="divider" /> : null}
            <div className={cx('itinerary-leg-first-row', 'bicycle', 'first')}>
              <div className="address-container">
                <div className="address">
                  {fromStop ? (
                    <LegPlaceLink
                      to={stopPagePath(false, fromStop.gtfsId)}
                      isViaPoint={leg.isViaPoint}
                    >
                      {origin}
                    </LegPlaceLink>
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
                      mode={bicycleWalkLeg.from.stop.vehicleMode}
                    />
                  </>
                )}
                <div className="place">{place}</div>
              </div>
              <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
            </div>
          </>
        ) : (
          <div>
            <div className="divider" />
            <VehicleRentalLeg
              stationName={leg.from.name}
              isScooter={isScooter}
              vehicleRentalStation={leg.from.vehicleRentalStation}
              rentalVehicle={leg.from.rentalVehicle}
              nearestScooters={nearestScooters}
            />
          </div>
        )}
        {bicycleWalkLeg?.from.stop && (
          <BicycleWalkNote
            walkLeg={bicycleWalkLeg}
            direction="from"
            target={leg.from.name || ''}
            focusAction={focusAction}
          />
        )}
        {isScooter && !scooterSettingsOn && (
          <ScooterSettingsPrompt focusToLeg={focusToLeg} openSettings={openSettings} />
        )}
        <LegAction
          ariaLabelId="itinerary-list-row.clickable-area-description"
          focusAction={focusToLeg}
        >
          {stopsDescription}
        </LegAction>
        {bicycleWalkLeg?.to.stop && (
          <BicycleWalkNote
            walkLeg={bicycleWalkLeg}
            direction="to"
            target={leg.from.name || ''}
            focusAction={focusAction}
          />
        )}
        {isScooter && (
          <VehicleRentalLeg
            stationName={leg.from.name}
            isScooter={isScooter}
            vehicleRentalStation={leg.from.vehicleRentalStation}
            returnBike
            rentalVehicle={leg.from.rentalVehicle}
            nextLegMode={nextLegMode}
          />
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
  openSettings: PropTypes.func.isRequired,
  nextLegMode: PropTypes.string,
  relayEnvironment: relayShape,
};
