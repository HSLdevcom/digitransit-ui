import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { legShape, parkShape } from '../../utils/shapes';
import ShowOnMapButton from './ShowOnMapButton';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import { PREFIX_CARPARK } from '../../../shared/utils/path';
import LegCircleLine from './LegCircleLine';
import { legTimeStr, legDestination } from '../../utils/legUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegPlaceLink from './LegPlaceLink';

export default function CarParkLeg({ leg, index, focusAction, children, carPark, noWalk = false }) {
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(parseInt(leg.distance, 10), config, intl.formatNumber);
  const duration = durationToString(intl, leg.duration * 1000);
  const firstLegClassName = index === 0 ? 'first' : '';

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        {!noWalk && (
          <FormattedMessage
            id="itinerary-details.walk-leg"
            values={{
              time: legTimeStr(leg.start),
              distance,
              to: legDestination(intl, leg),
              origin: leg.from ? leg.from.name : '',
              destination: leg.to ? leg.to.name : '',
              duration,
            }}
          />
        )}
      </span>
      <LegTimeColumn time={legTimeStr(leg.start)} />
      {noWalk ? (
        <LegCircleLine
          index={index}
          modeClassName="car-park-walk"
          carPark
          viaType={leg.from.viaLocationType}
        />
      ) : (
        <LegCircleLineWithIcon
          index={index}
          modeClassName="walk"
          carPark
          viaType={leg.from.viaLocationType}
        />
      )}

      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${leg.mode.toLowerCase()}`}
      >
        <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
          <div className="address-container">
            <LegPlaceLink
              to={`/${PREFIX_CARPARK}/${carPark.vehicleParkingId}`}
              isViaPoint={leg.isViaPoint}
              asAddress
            >
              <FormattedMessage id="car-park" defaultMessage="Park & Ride" />
            </LegPlaceLink>
            <div className="place">{carPark.name}</div>
          </div>
          <div>{children}</div>
          <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
        </div>
        {!noWalk && (
          <div className={cx('itinerary-leg-action', 'car', 'itinerary-leg-action-content')}>
            <FormattedMessage
              id="walk-distance-duration"
              values={{ distance, duration }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
          </div>
        )}
      </div>
    </div>
  );
}

CarParkLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
  carPark: parkShape.isRequired,
  noWalk: PropTypes.bool,
};
