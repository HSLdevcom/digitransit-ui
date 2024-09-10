import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { legShape, configShape } from '../../util/shapes';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../../util/geo-utils';
import { durationToString } from '../../util/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { legTimeStr, legDestination } from '../../util/legUtils';

export default function CarLeg(props, { config, intl }) {
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
            time: legTimeStr(props.leg.start),
            distance,
            to: legDestination(intl, props.leg),
            origin: props.leg.from ? props.leg.from.name : '',
            destination: props.leg.to ? props.leg.to.name : '',
            duration,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {legTimeStr(props.leg.start)}
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
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
};

CarLeg.defaultProps = { children: undefined };

CarLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
