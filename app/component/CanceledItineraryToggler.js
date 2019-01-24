import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

const CanceledItineraryToggler = props => (
  <React.Fragment>
    {!props.showItineraries ? (
      <div className="additional-canceled-itineraries">
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
              className="canceled-itineraries-show"
              onClick={() => props.toggleShowCanceled(true)}
            >
              <FormattedMessage id="show" defaultMessage="Show" />
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="additional-canceled-itineraries hide-cancelled-itineraries">
        <div className="canceled-itineraries-container">
          <div className="canceled-itineraries-button">
            <button
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
      </div>
    )}
  </React.Fragment>
);

CanceledItineraryToggler.propTypes = {
  showItineraries: PropTypes.bool,
  toggleShowCanceled: PropTypes.func,
  canceledItinerariesAmount: PropTypes.number,
};

export default CanceledItineraryToggler;
