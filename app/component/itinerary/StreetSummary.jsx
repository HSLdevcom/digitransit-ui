import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../Icon';
import { durationToString } from '../../../utils/client/timeUtils';
import { displayDistance } from '../../../utils/shared/geo-utils';
import { useConfigContext } from '../../client/ConfigContext';

export default function StreetSummary({
  distance: legDistance,
  icon,
  className = '',
  duration: legDuration,
  mode,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(legDistance, config, intl.formatNumber);
  const resolvedIcon = icon || 'icon_walk';
  const duration = durationToString(intl, legDuration * 1000);
  return (
    <span className={cx(className)} style={{ whiteSpace: 'nowrap' }}>
      <span className="sr-only">
        <FormattedMessage
          id={`aria-itinerary-summary-${mode}-distance`}
          values={{ distance, duration }}
        />
      </span>
      <Icon img={resolvedIcon} className={cx(mode)} />
      {!(config.hideCarSuggestionDuration && mode === 'car') ? (
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
