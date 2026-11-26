import cx from 'classnames';
import { Link } from 'found';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { legDestination, legTimeStr } from '../../utils/legUtils';
import { PREFIX_BIKEPARK } from '../../../shared/utils/path';
import { legShape, parkShape } from '../../utils/shapes';
import { durationToString } from '../../utils/timeUtils';
import Icon from '../Icon';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import ShowOnMapButton from './ShowOnMapButton';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function BikeParkLeg({ leg, index, focusAction, bikePark }) {
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(parseInt(leg.distance, 10), config, intl.formatNumber);
  const duration = durationToString(intl, leg.duration * 1000);
  const time = legTimeStr(leg.start);
  return (
    <div key={index} className="row itinerary-row">
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
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">{time}</div>
      </div>
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
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={`/${PREFIX_BIKEPARK}/${bikePark.vehicleParkingId}`}
            >
              <div className="address">
                <FormattedMessage id="bike-park" />
                {leg.isViaPoint && (
                  <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />
                )}
                {bikePark && (
                  <Icon
                    img="icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                )}
              </div>
            </Link>
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
