import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from '../../departure/RouteNumber';
import Icon from '../../icon/Icon';
import { displayDistance } from '../../../util/geo-utils';
import { durationToString } from '../../../util/timeUtils';

function CarLeg(props) {
  const distance = displayDistance(parseInt(props.leg.distance, 10));
  const duration = durationToString(props.leg.duration * 1000);

  return (
    <div key={props.index} style={{ width: '100%' }} className="row itinerary-row" >
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={props.leg.mode.toLowerCase()} vertical />
      </div>
      <div
        onClick={props.focusAction}
        className={`small-10 columns itinerary-instruction-column ${props.leg.mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          {(props.index === 0) && (
            <div><Icon img="icon-icon_mapMarker-point" className="itinerary-icon from" /></div>
          )}
          <div>
            {props.leg.from.name}
            {props.children}
            {props.leg.from.stop && props.leg.from.stop.code && (
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="itinerary-leg-first-row__arrow"
              />
            )}
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id="car-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Drive {distance} ({duration})}"
          />
        </div>
      </div>
    </div>
  );
}

CarLeg.propTypes = {
  leg: React.PropTypes.shape({
    duration: React.PropTypes.number.isRequired,
    startTime: React.PropTypes.number.isRequired,
    distance: React.PropTypes.number.isRequired,
    from: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      stop: React.PropTypes.shape({
        code: React.PropTypes.string,
      }),
    }).isRequired,
    mode: React.PropTypes.string.isRequired,
  }).isRequired,
  index: React.PropTypes.number.isRequired,
  focusAction: React.PropTypes.func.isRequired,
  children: React.PropTypes.node.isRequired,
};

export default CarLeg;
