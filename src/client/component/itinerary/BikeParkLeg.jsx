import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { legDestination, legTimeStr } from '../../utils/legUtils';
import { PREFIX_BIKEPARK } from '../../../shared/utils/path';
import { legShape, parkShape } from '../../utils/shapes';
import { durationToString } from '../../utils/timeUtils';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import LegTimeColumn from './LegTimeColumn';
import ShowOnMapButton from './ShowOnMapButton';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegPlaceLink from './LegPlaceLink';

export default function BikeParkLeg({ leg, index, focusAction, bikePark }) {
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
            origin: leg.from ? leg.from.name : '',
            destination: leg.to ? leg.to.name : '',
            duration,
          }}
        />
      </span>
      <LegTimeColumn time={time} />
      <LegCircleLineWithIcon
        bikePark
        index={index}
        modeClassName="walk"
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
      />
      <div className="small-9 columns itinerary-instruction-column">
        <div className={cx('itinerary-leg-first-row', 'bicycle')}>
          <div className="address-container">
            <LegPlaceLink
              to={`/${PREFIX_BIKEPARK}/${bikePark.vehicleParkingId}`}
              isViaPoint={leg.isViaPoint}
              asAddress
            >
              <FormattedMessage id="bike-park" />
            </LegPlaceLink>
            <div className="place">{bikePark.name}</div>
          </div>
          <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
        </div>
        <div className={cx('itinerary-leg-action', 'bike', 'itinerary-leg-action-content')}>
          <FormattedMessage
            id="walk-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Walk {distance} ({duration})"
          />
          <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
        </div>
      </div>
    </div>
  );
}

BikeParkLeg.propTypes = {
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  bikePark: parkShape.isRequired,
  leg: legShape.isRequired,
};
