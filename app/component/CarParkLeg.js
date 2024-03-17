import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';

import { Link } from 'found';
import { configShape } from '../util/shapes';
import Icon from './Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { PREFIX_CARPARK } from '../util/path';
import ItineraryCircleLine from './ItineraryCircleLine';

function CarParkLeg(props, { config, intl }) {
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(props.leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'first' : '';

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <span className="sr-only">
        {!props.noWalk && (
          <FormattedMessage
            id="itinerary-details.walk-leg"
            values={{
              time: moment(props.leg.startTime).format('HH:mm'),
              distance,
              to: intl.formatMessage({
                id: `modes.to-${
                  props.leg.to.stop?.vehicleMode?.toLowerCase() || 'place'
                }`,
                defaultMessage: 'modes.to-stop',
              }),
              origin: props.leg.from ? props.leg.from.name : '',
              destination: props.leg.to ? props.leg.to.name : '',
              duration,
            }}
          />
        )}
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
      </div>
      {props.noWalk ? (
        <ItineraryCircleLine
          index={props.index}
          modeClassName="car-park-walk"
          carPark
        />
      ) : (
        <ItineraryCircleLineWithIcon
          index={props.index}
          modeClassName="walk"
          carPark
        />
      )}

      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${props.leg.mode.toLowerCase()}`}
      >
        <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
          <div className="address-container">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={`/${PREFIX_CARPARK}/${props.carPark.carParkId}`}
            >
              <div className="address">
                <FormattedMessage id="car_park" defaultMessage="Park & Ride" />
                {props.carPark && (
                  <Icon
                    img="icon-icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                )}
              </div>
            </Link>
            <div className="place">{props.carPark.name}</div>
          </div>
          <div>{props.children}</div>
          <ItineraryMapAction
            target={props.leg.from.name || ''}
            focusAction={props.focusAction}
          />
        </div>
        {!props.noWalk && (
          <div className={cx('itinerary-leg-action', 'car')}>
            <div className="itinerary-leg-action-content">
              <FormattedMessage
                id="walk-distance-duration"
                values={{ distance, duration }}
                defaultMessage="Walk {distance} ({duration})"
              />
              <ItineraryMapAction
                target={props.leg.from.name || ''}
                focusAction={props.focusAction}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

CarParkLeg.propTypes = {
  leg: PropTypes.shape({
    duration: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.shape({
        code: PropTypes.string,
      }),
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.object,
    }),
    mode: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
  carPark: PropTypes.object.isRequired,
  noWalk: PropTypes.bool,
};

CarParkLeg.defaultProps = {
  children: undefined,
  noWalk: false,
};

CarParkLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default CarParkLeg;
