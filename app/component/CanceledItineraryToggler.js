import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

const CanceledItineraryToggler = props => (
  <React.Fragment>
    {!props.showItineraries ? (
      <button
        type="button"
        className="additional-canceled-itineraries"
        onClick={() => props.toggleShowCanceled(true)}
      >
        <div className="canceled-itineraries-container">
          <div className="canceled-itineraries-icon">
            <Icon img="icon-icon_caution" />
          </div>
          <div className="canceled-itineraries-text">
            <FormattedMessage
              id="canceled-itineraries-amount"
              defaultMessage={`Additional ${
                props.canceledItinerariesAmount
              } canceled itineraries`}
              values={{
                itineraryAmount: props.canceledItinerariesAmount,
              }}
            />
          </div>
          <div className="canceled-itineraries-button">
            <button
              type="button"
              className="canceled-itineraries-show"
              onClick={() => props.toggleShowCanceled(true)}
            >
              <FormattedMessage id="show" defaultMessage="Show" />
            </button>
          </div>
        </div>
      </button>
    ) : (
      <button
        type="button"
        className="additional-canceled-itineraries hide-cancelled-itineraries"
        onClick={() => props.toggleShowCanceled(false)}
      >
        <div className="canceled-itineraries-container">
          <div className="canceled-itineraries-button">
            <button
              type="button"
              className="canceled-itineraries-show"
              onClick={() => props.toggleShowCanceled(false)}
            >
              —
            </button>
          </div>
          <div className="canceled-itineraries-text">
            <FormattedMessage
              id="canceled-itineraries-amount-hide"
              defaultMessage={`Hide canceled itineraries (${
                props.canceledItinerariesAmount
              })`}
              values={{
                itineraryAmount: props.canceledItinerariesAmount,
              }}
            />
          </div>
        </div>
      </button>
    )}
  </React.Fragment>
);

CanceledItineraryToggler.propTypes = {
  showItineraries: PropTypes.bool,
  toggleShowCanceled: PropTypes.func,
  canceledItinerariesAmount: PropTypes.number,
};

export default CanceledItineraryToggler;
