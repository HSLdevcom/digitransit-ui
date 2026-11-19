import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { FormattedMessage, useIntl } from 'react-intl';
import { DsSelect, SelectGroup, SelectOption } from '../DsSelect';
import {
  processDates,
  groupDatesByWeek,
} from '../../../utils/client/dateSelectUtils';

function DateSelectGrouped({ selectedDay, dateFormat, dates, onDateChange }) {
  const intl = useIntl();
  const { locale, formatMessage } = intl;

  // Group the provided dates (assumed sorted, no past dates) by week.
  const { grouped, processedDates, today } = useMemo(() => {
    const now = DateTime.local().startOf('day');
    const options = processDates(
      dates.map(d => d.setLocale(locale)),
      now,
      dateFormat,
      intl,
    );

    return {
      grouped: groupDatesByWeek(options, now, intl),
      processedDates: options,
      today: now,
    };
  }, [dateFormat, dates, locale]);

  const selectedOption = useMemo(() => {
    const selectedValue = selectedDay?.isValid
      ? selectedDay.toFormat(dateFormat)
      : undefined;
    const found = processedDates.find(o => o.value === selectedValue);
    if (found) {
      return found;
    }
    // Synthesise an option for the selected day when it is not in the
    // available-dates list (e.g. today when service only starts in the future).
    if (selectedDay?.isValid) {
      return processDates([selectedDay], today, dateFormat, intl)[0];
    }
    return processedDates[0];
  }, [processedDates, today, selectedDay, dateFormat, intl]);

  const id = 'route-schedule-grouped-datepicker';

  return (
    <div className="date-select-wrapper">
      <h3 className="route-schedule-grouped-date-select-heading">
        <FormattedMessage
          id="route-page.select-time"
          defaultMessage="Select time"
        />
      </h3>
      <DsSelect
        id={`aria-input-${id}`}
        triggerAriaLabel={`${formatMessage({
          id: 'select-date',
          defaultMessage: 'Select date',
        })}. ${selectedOption?.ariaLabel ?? ''}`}
        value={selectedOption?.value ?? ''}
        valueLabel={selectedOption?.textLabel ?? ''}
        onChange={onDateChange}
      >
        {grouped.map(group => (
          <SelectGroup key={group.label} label={group.label}>
            {group.options.map(option => (
              <SelectOption
                key={option.value}
                value={option.value}
                label={option.textLabel}
              />
            ))}
          </SelectGroup>
        ))}
      </DsSelect>
    </div>
  );
}

DateSelectGrouped.propTypes = {
  selectedDay: PropTypes.instanceOf(DateTime),
  dateFormat: PropTypes.string.isRequired,
  dates: PropTypes.arrayOf(PropTypes.instanceOf(DateTime)).isRequired,
  onDateChange: PropTypes.func.isRequired,
};

DateSelectGrouped.displayName = 'DateSelectGrouped';

export default DateSelectGrouped;
