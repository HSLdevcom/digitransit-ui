import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { itineraryShape } from '../util/shapes';
import getCo2Value from '../util/emissions';

export default function EmissionsInfo({ itinerary, isMobile }) {
  const co2value = getCo2Value(itinerary);
  return (
    co2value !== null &&
    co2value >= 0 && (
      <div
        className={cx('itinerary-co2-information', {
          mobile: isMobile,
        })}
      >
        <div className="itinerary-co2-line">
          <div className={cx('co2-container', { mobile: isMobile })}>
            <div className="co2-title-container">
              <Icon img="icon-icon_co2_leaf" className="co2-leaf" />
              <span aria-hidden="true" className="itinerary-co2-title">
                <FormattedMessage
                  id="itinerary-co2.title"
                  defaultMessage="CO2 emissions for this route"
                />
              </span>
              <span className="sr-only">
                <FormattedMessage
                  id="itinerary-co2.title-sr"
                  defaultMessage="CO2 emissions for this route"
                />
              </span>
            </div>
            <div className="itinerary-co2-value-container">
              <div className="itinerary-co2-value">{co2value} g</div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

EmissionsInfo.propTypes = {
  itinerary: itineraryShape.isRequired,
  isMobile: PropTypes.bool.isRequired,
};
