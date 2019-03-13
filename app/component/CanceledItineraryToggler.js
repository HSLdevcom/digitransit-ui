import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

const CanceledItineraryToggler = ({
  canceledItinerariesAmount: itineraryAmount,
  showItineraries,
  toggleShowCanceled,
}) => (
  <div
    className="additional-canceled-itineraries"
    onClick={() => toggleShowCanceled()}
    onKeyDown={e => isKeyboardSelectionEvent(e) && toggleShowCanceled()}
    role="button"
    tabIndex={0}
  >
    <div
      className={cx('canceled-itineraries-container', {
        centered: showItineraries,
      })}
    >
      <div className="canceled-itineraries-icon-container">
        {showItineraries ? (
          '—'
        ) : (
          <Icon className="caution inline-icon" img="icon-icon_caution" />
        )}
      </div>
      <div className="canceled-itineraries-text">
        {showItineraries ? (
          <FormattedMessage
            id="canceled-itineraries-amount-hide"
            defaultMessage={`Hide canceled itineraries (${itineraryAmount})`}
            values={{ itineraryAmount }}
          />
        ) : (
          <FormattedMessage
            id="canceled-itineraries-amount"
            defaultMessage={`Additional ${itineraryAmount} canceled itineraries`}
            values={{ itineraryAmount }}
          />
        )}
      </div>
      {!showItineraries && (
        <div className="canceled-itineraries-button">
          <FormattedMessage id="show" defaultMessage="Show" />
        </div>
      )}
    </div>
  </div>
);

CanceledItineraryToggler.propTypes = {
  showItineraries: PropTypes.bool,
  toggleShowCanceled: PropTypes.func,
  canceledItinerariesAmount: PropTypes.number,
};

export default CanceledItineraryToggler;
