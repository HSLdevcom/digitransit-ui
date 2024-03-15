import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';

function CarLeg(props, { config, intl }) {
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(props.leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'first' : '';
  const modeClassName = 'car';

  const [address, place] = props.leg.from.name.split(/, (.+)/); // Splits the name-string to two parts from the first occurance of ', '

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.car-leg"
          values={{
            time: moment(props.leg.startTime).format('HH:mm'),
            distance,
            to: intl.formatMessage({
              id: `modes.to-${props.leg.to.carPark ? 'car-park' : 'place'}`,
            }),
            origin: props.leg.from ? props.leg.from.name : '',
            destination: props.leg.to ? props.leg.to.name : '',
            duration,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        index={props.index}
        modeClassName={modeClassName}
        icon="icon-icon_car-withoutBox"
      />
      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${props.leg.mode.toLowerCase()}`}
      >
        <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
          <div className="address-container">
            <div className="address">
              {address}
              {props.leg.from.stop && (
                <Icon
                  img="icon-icon_arrow-collapse--right"
                  className="itinerary-arrow-icon"
                  color="#333"
                />
              )}
            </div>
            <div className="place">{place}</div>
          </div>
          <div>{props.children}</div>
          <ItineraryMapAction
            target={props.leg.from.name || ''}
            focusAction={props.focusAction}
          />
        </div>
        <div className="itinerary-leg-action">
          <div className="itinerary-leg-action-content">
            <FormattedMessage
              id={
                config.hideCarSuggestionDuration
                  ? 'car-distance-no-duration'
                  : 'car-distance-duration'
              }
              values={{ distance, duration }}
              defaultMessage="Drive {distance} ({duration})}"
            />
            <ItineraryMapAction
              target={props.leg.from.name || ''}
              focusAction={props.focusToLeg}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

CarLeg.propTypes = {
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
      carPark: PropTypes.object,
    }),
    mode: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
};

CarLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  children: undefined,
};

export default CarLeg;
