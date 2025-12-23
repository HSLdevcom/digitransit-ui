import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../util/shapes';
import { isKeyboardSelectionEvent } from '../../util/browser';
import Icon from '../Icon';

export default function IndoorInfo(
  { intermediateStepCount, showIntermediateSteps, toggleFunction },
  { config },
) {
  const message = (showIntermediateSteps && (
    <FormattedMessage
      id="itinerary-hide-indoor-route"
      defaultMessage="Hide indoor route"
    />
  )) || (
    <FormattedMessage
      id="itinerary-indoor-route"
      defaultMessage="Indoor route"
    />
  );
  return (
    <div
      role="button"
      tabIndex="0"
      className={cx('intermediate-steps-clickable', {
        'cursor-pointer': intermediateStepCount > 0,
      })}
      onClick={e => {
        e.stopPropagation();
        if (intermediateStepCount > 0) {
          toggleFunction();
        }
      }}
      onKeyPress={e => {
        if (isKeyboardSelectionEvent(e)) {
          e.stopPropagation();
          toggleFunction();
        }
      }}
    >
      <div
        className={cx('intermediate-step-info-container', {
          open: showIntermediateSteps,
        })}
      >
        {intermediateStepCount === 0 ? (
          <span className="intermediate-steps-message-no-steps">{message}</span>
        ) : (
          <span className="intermediate-steps-message">{message}</span>
        )}{' '}
        {intermediateStepCount !== 0 && (
          <Icon
            img="icon_arrow-collapse--right"
            className="itinerary-search-icon"
            color={config.colors.primary}
          />
        )}
      </div>
    </div>
  );
}

IndoorInfo.contextTypes = {
  config: configShape.isRequired,
};

IndoorInfo.propTypes = {
  intermediateStepCount: PropTypes.number.isRequired,
  toggleFunction: PropTypes.func.isRequired,
  showIntermediateSteps: PropTypes.bool,
};

IndoorInfo.defaultProps = {
  showIntermediateSteps: false,
};
