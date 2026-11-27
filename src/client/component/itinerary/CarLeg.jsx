import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape } from '../../utils/shapes';
import Icon from '../Icon';
import ShowOnMapButton from './ShowOnMapButton';
import LegAction from './LegAction';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import { legTimeStr, legDestination, getValidatedLegName } from '../../utils/legUtils';
import LegCircleLineLong from './LegCircleLineLong';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegArrowIcon from './LegArrowIcon';
import { getFromLocalizedMode, getToLocalizedMode } from '../../utils/modeUtils';

export default function CarLeg({ leg, index, focusAction, focusToLeg, children, carBoardingLeg }) {
  const intl = useIntl();
  const config = useConfigContext();
  const distance = displayDistance(parseInt(leg.distance, 10), config, intl.formatNumber);
  const duration = durationToString(intl, leg.duration * 1000);
  const firstLegClassName = index === 0 ? 'first' : '';
  const modeClassName = 'car';

  const circleLine = carBoardingLeg ? (
    <LegCircleLineLong
      index={index}
      modeClassName={modeClassName}
      boardingLeg={carBoardingLeg}
      viaType={leg.from.viaLocationType}
    />
  ) : (
    <LegCircleLineWithIcon
      index={index}
      modeClassName={modeClassName}
      icon="icon_car"
      viaType={leg.from.viaLocationType}
    />
  );

  const [name, place] = splitStringToAddressAndPlace(
    getValidatedLegName(leg.from.name, intl, true),
  );
  const address = leg.from.viaLocationType && leg.viaAddress ? leg.viaAddress : name;

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.car-leg"
          values={{
            time: legTimeStr(leg.start),
            distance,
            to: legDestination(intl, leg),
            origin: leg.from ? leg.from.name : '',
            destination: leg.to ? leg.to.name : '',
            duration,
          }}
        />
      </span>
      <LegTimeColumn time={legTimeStr(leg.start)} />
      {circleLine}
      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${leg.mode.toLowerCase()}`}
      >
        <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
          <div className="address-container">
            <div className="address">
              {address}
              {leg.isViaPoint && <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />}
              {leg.from.stop && <LegArrowIcon />}
            </div>
            <div className="place">{place}</div>
          </div>
          <div>{children}</div>
          <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
        </div>
        {carBoardingLeg?.from.stop && (
          <LegAction target={leg.from.name || ''} focusAction={focusAction}>
            <FormattedMessage
              id="car-drive-from-transit-no-duration"
              values={{
                transportMode: getFromLocalizedMode(carBoardingLeg.from.stop.vehicleMode, intl),
              }}
            />
          </LegAction>
        )}
        <LegAction target={leg.from.name || ''} focusAction={focusToLeg}>
          <FormattedMessage
            id={
              config.hideCarSuggestionDuration
                ? 'car-distance-no-duration'
                : 'car-distance-duration'
            }
            values={{ distance, duration }}
          />
        </LegAction>
        {carBoardingLeg?.to.stop && (
          <LegAction target={leg.from.name || ''} focusAction={focusAction}>
            <FormattedMessage
              id="car-drive-to-transit-no-duration"
              values={{
                transportMode: getToLocalizedMode(carBoardingLeg.to.stop.vehicleMode, intl),
              }}
            />
          </LegAction>
        )}
      </div>
    </div>
  );
}

CarLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
  carBoardingLeg: legShape,
};
