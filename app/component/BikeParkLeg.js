import PropTypes from 'prop-types';
import cx from 'classnames';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import Icon from './Icon';

const BikeParkLeg = (
  { leg, index, focusAction, bikePark },
  { intl, config },
) => {
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(leg.duration * 1000);
  return (
    <div key={index} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(leg.startTime).format('HH:mm')}
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        bikePark
        index={index}
        modeClassName="walk"
      />
      <div className="small-9 columns itinerary-instruction-column">
        <div className={cx('itinerary-leg-first-row', 'bicycle')}>
          <div className="address-container">
            {/*  TODO linking when bikepark pages are available */}
            {/* <Link
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  to={''}
                > */}
            <div className="address">
              <FormattedMessage id="bike-park" />
              {/* TODO */}
              {/* {bikePark && (
                  <Icon
                    img="icon-icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                )} */}
            </div>
            {/* </Link> */}
            <div className="place">{bikePark.name}</div>
          </div>
          <div
            className="itinerary-map-action"
            onClick={focusAction}
            onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
            role="button"
            tabIndex="0"
            aria-label={intl.formatMessage(
              { id: 'itinerary-summary.show-on-map' },
              { target: leg.from.name || '' },
            )}
          >
            <Icon
              img="icon-icon_show-on-map"
              className="itinerary-search-icon"
            />
          </div>
        </div>
        <div className={cx('itinerary-leg-action', 'bike')}>
          <div className="itinerary-leg-action-content">
            <FormattedMessage
              id="walk-distance-duration"
              values={{ distance, duration }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <div
              className="itinerary-map-action"
              onClick={focusAction}
              onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
              role="button"
              tabIndex="0"
              aria-label={intl.formatMessage(
                { id: 'itinerary-summary.show-on-map' },
                { target: leg.from.name || '' },
              )}
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
BikeParkLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

BikeParkLeg.propTypes = {
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  bikePark: PropTypes.object,
  leg: PropTypes.shape({
    endTime: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      bikeRentalStation: PropTypes.shape({
        bikesAvailable: PropTypes.number.isRequired,
        networks: PropTypes.array.isRequired,
      }),
      stop: PropTypes.object,
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    mode: PropTypes.string.isRequired,
    rentedBike: PropTypes.bool.isRequired,
  }).isRequired,
};

export default BikeParkLeg;
