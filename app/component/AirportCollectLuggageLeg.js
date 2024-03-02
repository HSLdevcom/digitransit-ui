import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Link } from 'found';
import Icon from './Icon';
import ItineraryCircleLine from './ItineraryCircleLine';
import ItineraryMapAction from './ItineraryMapAction';
import { PREFIX_STOPS } from '../util/path';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function AirportCollectLuggageLeg(props, { config }) {
  const modeClassName = 'airport-wait';
  const { name } = props.leg.to;
  const { focusAction } = props;
  return (
    <div className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.endTime).format('HH:mm')}
        </div>
      </div>
      <ItineraryCircleLine index={props.index} modeClassName={modeClassName} />
      <div
        onClick={props.focusAction}
        className="small-9 columns itinerary-instruction-column airport-wait"
      >
        <div className="itinerary-leg-first-row">
          <div className="itinerary-leg-row">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={`/${PREFIX_STOPS}/${props.leg.to.stop.gtfsId}`}
            >
              {name}
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="itinerary-arrow-icon"
                color={config.colors.primary}
              />
            </Link>
            <div className="stop-code-container">{props.children}</div>
          </div>
          <ItineraryMapAction target={name || ''} focusAction={focusAction} />
        </div>

        <div className="info-message">
          <Icon img="icon-icon_info" />
          <FormattedMessage
            id="airport-collect-luggage"
            defaultMessage="Collect your luggage"
          />
        </div>
      </div>
    </div>
  );
}

AirportCollectLuggageLeg.propTypes = {
  index: PropTypes.number.isRequired,
  leg: PropTypes.shape({
    endTime: PropTypes.number.isRequired,
    to: PropTypes.shape({
      name: PropTypes.string,
      stop: PropTypes.shape({
        gtfsId: PropTypes.string,
      }),
    }),
  }).isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
};

AirportCollectLuggageLeg.defaultProps = {
  children: undefined,
};

AirportCollectLuggageLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default AirportCollectLuggageLeg;
