import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape, parkShape } from '../../utils/shapes';
import ShowOnMapButton from './ShowOnMapButton';
import LegAction from './LegAction';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../../shared/utils/path';
import { legTimeStr, legDestination } from '../../utils/legUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegPlaceLink from './LegPlaceLink';

const PARK_TYPES = {
  bike: { prefix: PREFIX_BIKEPARK, labelId: 'bike-park' },
  car: { prefix: PREFIX_CARPARK, labelId: 'car-park' },
};

/** Walk between a parked vehicle and the park & ride facility. */
export default function ParkLeg({ leg, index, focusAction, park, type }) {
  const { prefix, labelId } = PARK_TYPES[type];
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(parseInt(leg.distance, 10), config, intl.formatNumber);
  const duration = durationToString(intl, leg.duration * 1000);
  const time = legTimeStr(leg.start);

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.walk-leg"
          values={{
            time,
            distance,
            to: legDestination(intl, leg),
            origin: leg.from.name,
            destination: leg.to.name,
            duration,
          }}
        />
      </span>
      <LegTimeColumn time={time} />
      <LegCircleLineWithIcon
        index={index}
        modeClassName="walk"
        bikePark={type === 'bike'}
        carPark={type === 'car'}
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
      />
      <div className="small-9 columns itinerary-instruction-column">
        <div className={cx('itinerary-leg-first-row', { first: index === 0 })}>
          <div className="address-container">
            <LegPlaceLink
              to={`/${prefix}/${park.vehicleParkingId}`}
              isViaPoint={leg.isViaPoint}
              asAddress
            >
              <FormattedMessage id={labelId} />
            </LegPlaceLink>
            <div className="place">{park.name}</div>
          </div>
          <ShowOnMapButton target={leg.from.name} focusAction={focusAction} />
        </div>
        <LegAction target={leg.from.name} focusAction={focusAction}>
          <FormattedMessage id="walk-distance-duration" values={{ distance, duration }} />
        </LegAction>
      </div>
    </div>
  );
}

ParkLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  park: parkShape.isRequired,
  type: PropTypes.oneOf(Object.keys(PARK_TYPES)).isRequired,
};
