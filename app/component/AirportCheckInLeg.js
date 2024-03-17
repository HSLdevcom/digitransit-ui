import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { configShape } from '../util/shapes';
import ItineraryCircleLine from './ItineraryCircleLine';
import Icon from './Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { PREFIX_STOPS } from '../util/path';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
export default function AirportCheckInLeg(props, { config }) {
  const modeClassName = 'airport-wait';
  const { name } = props.leg.from;
  const { focusAction } = props;
  return (
    <div className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.startTime).format('HH:mm')}
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
              to={`/${PREFIX_STOPS}/${props.leg.from.stop.gtfsId}`}
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
            id="airport-check-in"
            values={{ agency: props.leg.agency && props.leg.agency.name }}
            defaultMessage="Check-in at the {agency} desk"
          />
        </div>
        <div className="info-message">
          <Icon img="icon-icon_info" />
          <FormattedMessage
            id="airport-security-check-go-to-gate"
            defaultMessage="Proceed to your gate through security check"
          />
        </div>
      </div>
    </div>
  );
}

AirportCheckInLeg.propTypes = {
  leg: PropTypes.shape({
    agency: PropTypes.shape({
      name: PropTypes.string,
    }),
    from: PropTypes.shape({
      name: PropTypes.string,
      stop: PropTypes.shape({
        gtfsId: PropTypes.string,
      }),
    }),
  }).isRequired,
  startTime: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
};

AirportCheckInLeg.defaultProps = {
  children: undefined,
};

AirportCheckInLeg.contextTypes = {
  config: configShape.isRequired,
};
