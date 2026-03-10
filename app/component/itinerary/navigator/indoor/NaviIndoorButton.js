import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from '../../../Icon';
import { isKeyboardSelectionEvent } from '../../../../util/browser';
import { NaviCardType } from '../../../../constants';

export default function NaviIndoorButton({ currentCard, setCurrentCard }) {
  return (
    <div
      role="button"
      tabIndex="0"
      className={cx('indoor-container-clickable', 'cursor-pointer')}
      onClick={e => {
        e.stopPropagation();
        setCurrentCard(
          currentCard === NaviCardType.Indoor
            ? NaviCardType.Default
            : NaviCardType.Indoor,
        );
      }}
      onKeyPress={e => {
        if (isKeyboardSelectionEvent(e)) {
          e.stopPropagation();
          setCurrentCard(
            currentCard === NaviCardType.Indoor
              ? NaviCardType.Default
              : NaviCardType.Indoor,
          );
        }
      }}
    >
      {currentCard === NaviCardType.Indoor ? (
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
  currentCard: PropTypes.oneOf(Object.values(NaviCardType)),
  setCurrentCard: PropTypes.func.isRequired,
};
NaviIndoorButton.defaultProps = {
  currentCard: NaviCardType.Default,
};
