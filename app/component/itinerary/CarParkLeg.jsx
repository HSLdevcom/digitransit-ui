import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { Link } from 'found';
import { legShape, parkShape } from '../../../utils/client/shapes';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../../../utils/shared/geo-utils';
import { durationToString } from '../../../utils/client/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { PREFIX_CARPARK } from '../../../utils/shared/path';
import ItineraryCircleLine from './ItineraryCircleLine';
import { legTimeStr, legDestination } from '../../../utils/client/legUtils';
import { useConfigContext } from '../../client/ConfigContext';

function CarParkLeg({
  leg,
  index,
  focusAction,
  children,
  carPark,
  noWalk = false,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(intl, leg.duration * 1000);
  const firstLegClassName = index === 0 ? 'first' : '';

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={index} className="row itinerary-row">
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
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {legTimeStr(leg.start)}
        </div>
      </div>
      {noWalk ? (
        <ItineraryCircleLine
          index={index}
          modeClassName="car-park-walk"
          carPark
          viaType={leg.from.viaLocationType}
        />
      ) : (
        <ItineraryCircleLineWithIcon
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
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={`/${PREFIX_CARPARK}/${carPark.vehicleParkingId}`}
            >
              <div className="address">
                <FormattedMessage id="car-park" defaultMessage="Park & Ride" />
                {leg.isViaPoint && (
                  <Icon
                    img="icon_mapMarker"
                    className="itinerary-mapmarker-icon"
                  />
                )}
                {carPark && (
                  <Icon
                    img="icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                )}
              </div>
            </Link>
            <div className="place">{carPark.name}</div>
          </div>
          <div>{children}</div>
          <ItineraryMapAction
            target={leg.from.name || ''}
            focusAction={focusAction}
          />
        </div>
        {!noWalk && (
          <div
            className={cx(
              'itinerary-leg-action',
              'car',
              'itinerary-leg-action-content',
            )}
          >
            <FormattedMessage
              id="walk-distance-duration"
              values={{ distance, duration }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <ItineraryMapAction
              target={leg.from.name || ''}
              focusAction={focusAction}
            />
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

export default CarParkLeg;
