import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from '../../../Icon';
import { isKeyboardSelectionEvent } from '../../../../util/browser';

export default function NaviIndoorButton({ showIndoor, toggleShowIndoor }) {
  return (
    <div
      role="button"
      tabIndex="0"
      className={cx('indoor-container-clickable', 'cursor-pointer')}
      onClick={e => {
        e.stopPropagation();
        toggleShowIndoor();
      }}
      onKeyPress={e => {
        if (isKeyboardSelectionEvent(e)) {
          e.stopPropagation();
          toggleShowIndoor();
        }
      }}
    >
      {showIndoor ? (
        <>
          <div className="indoor-arrow-icon">
            <Icon img="icon_arrow-collapse--right" className="open" />
          </div>
          <div className="indoor-text">
            <FormattedMessage
              id="itinerary-hide-indoor-route"
              defaultMessage="Hide indoor route"
            />
          </div>
        </>
      ) : (
        <>
          <div className="indoor-text">
            <FormattedMessage
              id="itinerary-indoor-route"
              defaultMessage="Indoor route"
            />
          </div>
          <div className="indoor-arrow-icon">
            <Icon img="icon_arrow-collapse--right" />
          </div>
        </>
      )}
    </div>
  );
}

NaviIndoorButton.propTypes = {
  showIndoor: PropTypes.bool,
  toggleShowIndoor: PropTypes.func.isRequired,
};
NaviIndoorButton.defaultProps = {
  showIndoor: false,
};
