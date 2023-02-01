import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { durationToString, localizeTime } from '../util/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { PREFIX_STOPS } from '../util/path';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function WaitLeg(
  { children, leg, startTime, waitTime, focusAction, index },
  { config },
) {
  const modeClassName = 'wait';
  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="wait-amount-of-time"
          values={{
            duration: durationToString(waitTime),
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {localizeTime(startTime)}
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        modeClassName={modeClassName}
        index={index}
      />
      <div className="small-9 columns itinerary-instruction-column wait">
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg.to.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row wait">
          <div className="itinerary-leg-row">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={`/${PREFIX_STOPS}/${leg.to.stop.gtfsId}`}
            >
              {leg.to.name}
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="itinerary-arrow-icon"
                color={config.colors.primary}
              />
            </Link>
            <div className="stop-code-container">{children}</div>
          </div>
          <ItineraryMapAction
            target={leg.to.name || ''}
            focusAction={focusAction}
          />
        </div>
        <div className="itinerary-leg-action">
          <div className="itinerary-leg-action-content">
            <FormattedMessage
              id="wait-amount-of-time"
              values={{ duration: `(${durationToString(waitTime)})` }}
              defaultMessage="Wait {duration}"
            />
            <ItineraryMapAction target="" focusAction={focusAction} />
          </div>
        </div>
      </div>
    </div>
  );
}

WaitLeg.propTypes = {
  startTime: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
  waitTime: PropTypes.number.isRequired,
  leg: PropTypes.shape({
    from: PropTypes.shape({
      stop: PropTypes.shape({
        gtfsId: PropTypes.string.isRequired,
        platformCode: PropTypes.string,
      }),
    }),
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.shape({
        gtfsId: PropTypes.string.isRequired,
      }),
    }).isRequired,
  }).isRequired,
};

WaitLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default WaitLeg;
