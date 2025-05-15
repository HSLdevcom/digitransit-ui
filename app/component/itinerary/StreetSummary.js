import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage, intlShape } from 'react-intl';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';
import { durationToString } from '../../util/timeUtils';
import { displayDistance } from '../../util/geo-utils';

export default function StreetSummary(props, { config, intl }) {
  const distance = displayDistance(props.distance, config, intl.formatNumber);
  const icon = `icon-${props.icon || 'icon_walk'}`;
  const duration = durationToString(props.duration * 1000);

  return (
    <span className={cx(props.className)} style={{ whiteSpace: 'nowrap' }}>
      <span className="sr-only">
        <FormattedMessage
          id={`aria-itinerary-summary-${props.mode}-distance`}
          values={{ distance, duration }}
        />
      </span>
      <Icon img={icon} className={cx(props.mode)} />
      {!(config.hideCarSuggestionDuration && props.mode === 'car') ? (
        <span aria-hidden className="walk-distance">
          {duration}
          <span data-text={distance} />
        </span>
      ) : (
        <span aria-hidden className={cx('walk-distance', 'no-duration')}>
          {distance}
        </span>
      )}
    </span>
  );
}

StreetSummary.propTypes = {
  distance: PropTypes.number.isRequired,
  icon: PropTypes.string,
  className: PropTypes.string,
  duration: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
};

StreetSummary.defaultProps = { className: '', icon: undefined };

StreetSummary.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
