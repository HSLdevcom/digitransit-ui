import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import cx from 'classnames';
import { matchShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { parseLocation } from '../util/path';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function EndLeg(props, context) {
  const parsedAddress = parseLocation(context.match.params.to).address;
  const [address, place] = props.to.name.split(/, (.+)/);
  // Below check is needed for unit tests
  const [addressFromUrl, placeFromUrl] = !parsedAddress
    ? [address, place]
    : parsedAddress.split(/, (.+)/);
  const { stop } = props.to;
  const modeClassName = 'end';
  return (
    <div key={props.index} className={cx('row', 'itinerary-row')}>
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.end-leg"
          values={{
            time: moment(props.endTime).format('HH:mm'),
            destination: props.to.name,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(props.endTime).format('HH:mm')}
        </div>
      </div>
      <div className={`leg-before ${modeClassName}`} aria-hidden="true">
        <div className={`leg-before-circle circle ${modeClassName}`} />
        <div className="itinerary-icon-container">
          <Icon
            img="icon-icon_mapMarker-to"
            className="itinerary-icon to to-it"
          />
        </div>
      </div>
      <div className="small-9 columns itinerary-instruction-column to end">
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: props.to.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row">
          <div className="address-container">
            <div className="address">{!stop ? address : addressFromUrl}</div>
            <div className="place">{place || placeFromUrl}</div>
          </div>
          <ItineraryMapAction
            target={props.to.name}
            focusAction={props.focusAction}
          />
        </div>
      </div>
    </div>
  );
}

EndLeg.propTypes = {
  endTime: PropTypes.number.isRequired,
  to: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

EndLeg.contextTypes = {
  intl: intlShape.isRequired,
  match: matchShape.isRequired,
};

export default EndLeg;
