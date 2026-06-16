import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import Icon from '../../Icon';
import { getFormattedTimeDate } from '../../../util/timeUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';

const DATE_FORMAT = 'd.L.yyyy';

export default function DisruptionStatus({
  effectiveStartDate,
  effectiveEndDate,
  showDates = true,
  active,
  className,
}) {
  const intl = useIntl();
  const {
    colors: { primary: primaryColor },
  } = useConfigContext();
  const now = Date.now();
  const isValid =
    active !== undefined
      ? active
      : now > effectiveStartDate * 1000 && now < effectiveEndDate * 1000;

  // We want to hide start year when both dates are the current year
  const hideStartYear =
    effectiveStartDate &&
    effectiveEndDate &&
    DateTime.now().year === DateTime.fromSeconds(effectiveStartDate).year &&
    DateTime.now().year === DateTime.fromSeconds(effectiveEndDate).year;

  const startDate =
    effectiveStartDate &&
    getFormattedTimeDate(
      effectiveStartDate * 1000,
      hideStartYear ? 'd.L.' : DATE_FORMAT,
    );
  const endDate =
    effectiveEndDate &&
    getFormattedTimeDate(effectiveEndDate * 1000, DATE_FORMAT);

  const dates = showDates && startDate;

  return (
    <span className={`disruption-status ${className || ''}`}>
      <Icon
        img={isValid ? 'icon_status' : 'icon_calendar'}
        color={primaryColor}
      />
      <span>
        {`${intl.formatMessage({
          id: isValid ? 'valid' : 'upcoming',
          defaultMessage: isValid ? 'Active' : 'Upcoming',
        })}${dates ? ':' : ''}`}
      </span>
      {dates && (
        <span className="routes-s">
          {`${startDate}${
            endDate && startDate !== endDate ? ` - ${endDate}` : ''
          }`}
        </span>
      )}
    </span>
  );
}

DisruptionStatus.propTypes = {
  effectiveStartDate: PropTypes.number,
  effectiveEndDate: PropTypes.number,
  showDates: PropTypes.bool,
  active: PropTypes.bool,
  className: PropTypes.string,
};
