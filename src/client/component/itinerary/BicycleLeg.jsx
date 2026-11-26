import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { legShape, relayShape } from '../../utils/shapes';
import { legTimeStr, legDestination, getValidatedLegName } from '../../utils/legUtils';
import Icon from '../Icon';
import ShowOnMapButton from './ShowOnMapButton';
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
import { isKeyboardSelectionEvent } from '../../../shared/utils/browser';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';
import useNearestScooters from './useNearestScooters';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegPlaceLink from './LegPlaceLink';

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
  let stopsDescription;
  let circleLine;
  const distance = displayDistance(parseInt(leg.distance, 10), config, intl.formatNumber);
  const duration = durationToString(intl, leg.duration * 1000);
  const time = legTimeStr(leg.start); // hh:mm
  let { mode } = leg;
  let legDescription = <span>{leg.from ? leg.from.name : ''}</span>;
  const firstLegClassName = index === 0 ? 'start' : '';
  let modeClassName = 'bicycle';
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

  if (leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') {
    modeClassName = leg.mode.toLowerCase();
    stopsDescription = (
      <FormattedMessage
        id={isScooter ? 'scooterwalk-distance-duration' : 'cyclewalk-distance-duration'}
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
        id={isScooter ? 'rent-e-scooter-at' : 'rent-cycle-at'}
        values={{ station: leg.from.name }}
        defaultMessage="Fetch a bike"
      />
    );

    if (leg.mode === 'BICYCLE') {
      mode = 'CITYBIKE';
    }

    if (leg.mode === 'WALK') {
      mode = 'CITYBIKE_WALK';
    }

    if (leg.mode === 'SCOOTER') {
      mode = 'SCOOTER';
    }
  }

  if (isScooter) {
    const style = { '--scooter-amount': `${nearestScooters.length}%` };

    circleLine = (
      <LegCircleLineWithIcon
        index={index}
        modeClassName={mode.toLowerCase()}
        icon="icon_scooter_rider"
        appendClass={!scooterSettingsOn ? 'settings' : 'scooter'}
        style={style}
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
      />
    );
  } else if (bicycleWalkLeg) {
    circleLine = (
      <LegCircleLineLong
        index={index}
        modeClassName={modeClassName}
        boardingLeg={bicycleWalkLeg}
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
      />
    );
  } else if (mode === 'BICYCLE') {
    circleLine = (
      <LegCircleLineWithIcon
        index={index}
        modeClassName={modeClassName}
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
      />
    );
  } else {
    circleLine = (
      <LegCircleLine
        index={index}
        modeClassName={modeClassName}
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
      />
    );
  }
  const fromStop = leg?.from.stop || bicycleWalkLeg?.from.stop;
  const origin =
    bicycleWalkLeg?.from.stop && !bicycleWalkLeg?.from.viaLocationType
      ? bicycleWalkLeg.from.name
      : address;
  const destination = bicycleWalkLeg?.to.stop ? bicycleWalkLeg?.to.name : leg.to.name;

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        {leg.rentedBike === true && <>{legDescription}. </>}
        {(leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') && <>{stopsDescription}. </>}
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
      {circleLine}

      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{
              target:
                leg.from.name?.toLowerCase() === 'scooter'
                  ? intl.formatMessage({ id: 'e-scooter', defaultMessage: 'scooter' })
                  : leg.from.name || '',
            }}
          />
        </span>
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
          <div className={cx('itinerary-leg-action', 'bicycle', 'itinerary-leg-action-content')}>
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
                  duration: durationToString(intl, bicycleWalkLeg.duration * 1000),
                  distance: displayDistance(
                    parseInt(bicycleWalkLeg.distance, 10),
                    config,
                    intl.formatNumber,
                  ),
                }}
              />
            )}
            <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
          </div>
        )}
        {isScooter && !scooterSettingsOn && (
          <div>
            <div className={cx('itinerary-leg-action', 'scooter', 'itinerary-leg-action-content')}>
              <FormattedMessage
                id="settings-e-scooter-on"
                defaultMessage="Turn scooter settings on permanently"
              />
              <ShowOnMapButton
                target=""
                ariaLabelId="itinerary-list-row.clickable-area-description"
                focusAction={focusToLeg}
              />
            </div>
            <div
              role="button"
              tabIndex="0"
              onClick={() => openSettings(true, true)}
              onKeyPress={e => isKeyboardSelectionEvent(e) && openSettings(true, true)}
              className="itinerary-transit-leg-route-with-link"
            >
              <div className="itinerary-with-link">
                <div className="itinerary-with-link-text-container">
                  <span className={cx('settings')}>
                    <FormattedMessage id="open-settings" defaultMessage="Go to settings" />
                  </span>
                </div>
              </div>
              <div className="link-to-e-scooter-operator">
                <Icon img="icon_arrow-collapse--right" height={1} width={1} />
              </div>
            </div>
          </div>
        )}
        <div className={cx('itinerary-leg-action', 'bike', 'itinerary-leg-action-content')}>
          {stopsDescription}
          <ShowOnMapButton
            target=""
            ariaLabelId="itinerary-list-row.clickable-area-description"
            focusAction={focusToLeg}
          />
        </div>
        {bicycleWalkLeg && bicycleWalkLeg?.to.stop && (
          <div className={cx('itinerary-leg-action', 'bicycle', 'itinerary-leg-action-content')}>
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
                  duration: durationToString(intl, bicycleWalkLeg.duration * 1000),
                  distance: displayDistance(
                    parseInt(bicycleWalkLeg.distance, 10),
                    config,
                    intl.formatNumber,
                  ),
                }}
              />
            )}
            <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
          </div>
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
