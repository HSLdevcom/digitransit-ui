import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import PropTypes from 'prop-types';

import { isKeyboardSelectionEvent } from '../util/browser';

import Icon from './Icon';

function getDirectionIcon(relativeDirection) {
  switch (relativeDirection) {
    case 'DEPART':
      return 'icon-icon-instruction-straight';
    case 'LEFT':
      return 'icon-icon-instruction-turn-left';
    case 'SLIGHTLY_LEFT':
      return 'icon-icon-instruction-turn-slight-left';
    case 'HARD_LEFT':
      return 'icon-icon-instruction-sharp-turn-left';
    case 'RIGHT':
      return 'icon-icon-instruction-turn-right';
    case 'SLIGHTLY_RIGHT':
      return 'icon-icon-instruction-turn-slight-right';
    case 'HARD_RIGHT':
      return 'icon-icon-instruction-sharp-turn-right';
    case 'CONTINUE':
      return 'icon-icon-instruction-straight';
    case 'UTURN_LEFT':
      return 'icon-icon-instruction-u-turn-left';
    case 'UTURN_RIGHT':
      return 'icon-icon-instruction-u-turn-right';
    case 'CIRCLE_COUNTERCLOCKWISE':
      return 'icon-icon-instruction-roundabout-right';
    case 'CIRCLE_CLOCKWISE':
      return 'icon-icon-instruction-roundabout-left';
    case 'ELEVATOR':
      return 'icon-icon-instruction-elevator';
    case 'ENTER_STATION':
      return 'icon-icon-instruction-enter-station';
    case 'EXIT_STATION':
      return 'icon-icon-instruction-exit-station';
    case 'FOLLOW_SIGNS':
      return 'icon-icon-instruction-follow-signs';
    default:
      return '';
  }
}

function LegSteps({ steps, focusToStep }, { intl }) {
  return (
    <div>
      {steps.map((step, i) => (
        <div className="step-container" key={`itinerary-leg-step-${i + 1}`}>
          <div className="step-element">
            <Icon
              className="step-direction-icon"
              img={getDirectionIcon(step.relativeDirection)}
            />
            <div className="step-description">
              <FormattedMessage
                id={`itinerary-summary-row.steps.direction.${step.relativeDirection}`}
                values={{
                  street: step.streetName,
                  direction: intl.formatMessage({
                    id: `itinerary-summary-row.steps.direction.${step.absoluteDirection}`,
                  }),
                  exit: step.exit,
                }}
              />
              <span>{Math.round(step.distance)} m</span>
            </div>
          </div>
          <div
            className="itinerary-map-action"
            onClick={focusToStep({ lat: step.lat, lon: step.lon })}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) &&
              focusToStep({ lat: step.lat, lon: step.lon })
            }
            role="button"
            tabIndex="0"
            aria-label={intl.formatMessage({
              id: 'itinerary-summary-row.clickable-area-description',
            })}
          >
            <Icon
              img="icon-icon_show-on-map"
              className="itinerary-search-icon"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

LegSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      relativeDirection: PropTypes.string.isRequired,
      streetName: PropTypes.string.isRequired,
      distance: PropTypes.number.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number,
    }),
  ).isRequired,
  focusToStep: PropTypes.func.isRequired,
};

LegSteps.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default LegSteps;
