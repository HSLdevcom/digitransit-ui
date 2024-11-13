import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import PropTypes from 'prop-types';

import { isKeyboardSelectionEvent } from '../util/browser';

import Icon from './Icon';

function getDirectionIcon(relativeDirection) {
  switch (relativeDirection) {
    case 'DEPART':
      return 'icon-icon_arrow-up';
    case 'LEFT':
    case 'SLIGHTLY_LEFT':
    case 'HARD_LEFT':
      return 'icon-icon_arrow-left';
    case 'RIGHT':
    case 'SLIGHTLY_RIGHT':
    case 'HARD_RIGHT':
      return 'icon-icon_arrow-right';
    case 'CONTINUE':
      return 'icon-icon_arrow-up';
    case 'UTURN_LEFT':
    case 'UTURN_RIGHT':
      return 'icon-icon_arrow-down';
    default:
      return '';
  }
}

function WalkSteps({ steps, focusToPoint }, { intl }) {
  return (
    <div>
      {steps.map((step, i) => (
        <div className="step-container" key={`itinerary-leg-step-${i + 1}`}>
          <div className="step-element">
            <Icon img={getDirectionIcon(step.relativeDirection)} />{' '}
            <div className="step-description">
              <FormattedMessage
                id={`itinerary-summary-row.steps.direction.${step.relativeDirection}`}
                values={{ street: step.streetName }}
              />
              <span>{Math.round(step.distance)} m</span>
            </div>
          </div>
          <div
            className="itinerary-map-action"
            onClick={focusToPoint({ lat: step.lat, lon: step.lon })}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) &&
              focusToPoint({ lat: step.lat, lon: step.lon })
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

WalkSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      relativeDirection: PropTypes.string.isRequired,
      streetName: PropTypes.string.isRequired,
      distance: PropTypes.number.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number,
    }),
  ).isRequired,
  focusToPoint: PropTypes.func.isRequired,
};

WalkSteps.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default WalkSteps;
