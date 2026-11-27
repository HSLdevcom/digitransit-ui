import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape } from '../../utils/shapes';
import Icon from '../Icon';
import ShowOnMapButton from './ShowOnMapButton';
import LegDetails from './LegDetails';
import AddressPlace from './AddressPlace';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import { legSummaryValues, legPlaceAddress } from '../../utils/legUtils';
import LegCircleLineLong from './LegCircleLineLong';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegArrowIcon from './LegArrowIcon';
import { getFromLocalizedMode, getToLocalizedMode } from '../../utils/modeUtils';

export default function CarLeg({ leg, index, focusAction, focusToLeg, children, carBoardingLeg }) {
  const intl = useIntl();
  const config = useConfigContext();
  const values = legSummaryValues(intl, config, leg);
  const { time, distance, duration } = values;
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

  const [address, place] = legPlaceAddress(intl, leg);

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage id="itinerary-details.car-leg" values={values} />
      </span>
      <LegTimeColumn time={time} />
      {circleLine}
      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${leg.mode.toLowerCase()}`}
      >
        <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
          <AddressPlace address={address} place={place}>
            {leg.isViaPoint && <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />}
            {leg.from.stop && <LegArrowIcon />}
          </AddressPlace>
          <div>{children}</div>
          <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
        </div>
        {carBoardingLeg?.from.stop && (
          <LegDetails target={leg.from.name || ''} focusAction={focusAction}>
            <FormattedMessage
              id="car-drive-from-transit-no-duration"
              values={{
                transportMode: getFromLocalizedMode(carBoardingLeg.from.stop.vehicleMode, intl),
              }}
            />
          </LegDetails>
        )}
        <LegDetails target={leg.from.name || ''} focusAction={focusToLeg}>
          <FormattedMessage
            id={
              config.hideCarSuggestionDuration
                ? 'car-distance-no-duration'
                : 'car-distance-duration'
            }
            values={{ distance, duration }}
          />
        </LegDetails>
        {carBoardingLeg?.to.stop && (
          <LegDetails target={leg.from.name || ''} focusAction={focusAction}>
            <FormattedMessage
              id="car-drive-to-transit-no-duration"
              values={{
                transportMode: getToLocalizedMode(carBoardingLeg.to.stop.vehicleMode, intl),
              }}
            />
          </LegDetails>
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
