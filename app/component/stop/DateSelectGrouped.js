import PropTypes from 'prop-types';
import React, { useState, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';

import Select, { components as RSComponents } from 'react-select';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import {
  extractSelectedValue,
  formatDateLabel,
  prepareDates,
  processDates,
  groupDatesByWeek,
  generateDateRange,
} from '../../util/dateSelectUtils';

function DateSelectGrouped({
  startDate,
  selectedDay,
  dateFormat,
  dates,
  onDateChange,
}) {
  const intl = useTranslationsContext();
  const { locale, formatMessage } = intl;

  const GENERATED_DAYS = 60; // Fallback range when no dates provided

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const onMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Generate grouped date options from provided dates or fallback range
  const { grouped, processedDates } = useMemo(() => {
    const today = DateTime.local().startOf('day');
    const tomorrow = today.plus({ days: 1 });

    let sourceDates;
    if (dates && Array.isArray(dates)) {
      sourceDates = prepareDates(dates, today, locale);
    } else {
      const validStartDate = startDate?.isValid ? startDate : today;
      sourceDates = generateDateRange(validStartDate, GENERATED_DAYS, locale);
    }

    const options = processDates(
      sourceDates,
      today,
      tomorrow,
      dateFormat,
      intl,
    );

    const groupedOptions = groupDatesByWeek(options, today.weekNumber, intl);

    return { grouped: groupedOptions, processedDates: options };
  }, [dateFormat, dates, startDate?.toISODate(), locale]);

  const selectedOption = useMemo(() => {
    const selectedValue = extractSelectedValue(selectedDay, dateFormat);
    const found = processedDates.find(o => o.value === selectedValue);
    if (found) {
      return found;
    }
    // Synthesise an option for the selected day when it is not in the
    // available-dates list (e.g. today when service only starts in the future).
    if (selectedDay?.isValid) {
      const refToday = DateTime.local().startOf('day');
      const refTomorrow = refToday.plus({ days: 1 });
      return {
        dateObj: selectedDay,
        value: selectedDay.toFormat(dateFormat),
        textLabel: formatDateLabel(selectedDay, refToday, refTomorrow, intl),
        ariaLabel: selectedDay.toFormat('EEEE d.L.'),
        weekNumber: selectedDay.weekNumber,
      };
    }
    return processedDates[0];
  }, [processedDates, selectedDay, dateFormat, intl]);

  const handleChange = useCallback(
    option => {
      onDateChange(option.value);
      onMenuClose();
    },
    [onDateChange, onMenuClose],
  );

  // Custom Option component with proper label rendering
  const Option = useCallback(propsOption => {
    const { innerProps, data, isSelected } = propsOption;
    return (
      <RSComponents.Option
        {...propsOption}
        innerProps={{ ...innerProps, 'aria-label': data.ariaLabel }}
      >
        <div className="date-select-option">
          <span className="date-select-check">
            {isSelected ? (
              <Icon img="icon_check" height={1.1525} width={0.904375} />
            ) : (
              <span className="check-placeholder" />
            )}
          </span>
          <span className="date-select-label">{data.textLabel}</span>
        </div>
      </RSComponents.Option>
    );
  }, []);

  // Custom SingleValue component to render the selected value without the check
  const SingleValue = useCallback(singleProps => {
    const { data } = singleProps;
    return (
      <RSComponents.SingleValue {...singleProps}>
        <div className="date-select-option">
          <span className="date-select-label">{data.textLabel}</span>
        </div>
      </RSComponents.SingleValue>
    );
  }, []);

  const DropdownIndicator = useCallback(indicatorProps => {
    const { selectProps } = indicatorProps;
    return (
      <RSComponents.DropdownIndicator {...indicatorProps}>
        <div className="date-select-arrow">
          <Icon
            img="icon_arrow-dropdown"
            className={selectProps.menuIsOpen ? 'inverted' : ''}
          />
        </div>
      </RSComponents.DropdownIndicator>
    );
  }, []);

  const id = 'route-schedule-grouped-datepicker';
  const classNamePrefix = 'route-schedule-grouped';

  const selectAriaLabel = formatMessage({
    id: 'select-date',
    defaultMessage: 'Select date',
  });

  return (
    <div
      className={`date-select-wrapper${
        isMenuOpen ? ' date-select-wrapper--menu-open' : ''
      }`}
    >
      <h3 className="route-schedule-grouped-date-select-heading">
        <FormattedMessage
          id="route-page.select-time"
          defaultMessage="Select time"
        />
      </h3>
      <Select
        aria-labelledby={`aria-label-${id}`}
        aria-label={selectAriaLabel}
        ariaLiveMessages={{
          guidance: () => '.',
          onChange: ({ label, dateObj }) => {
            const msg = formatMessage({ id: 'route-page.pattern-chosen' });
            const dateLabel = dateObj?.textLabel || label;
            return `${msg} ${dateLabel}`;
          },
          onFilter: () => '',
          onFocus: ({ context: itemContext, focused }) => {
            if (itemContext === 'menu') {
              return focused.ariaLabel || '';
            }
            return '';
          },
        }}
        className="date-select"
        classNamePrefix={classNamePrefix}
        components={{
          DropdownIndicator,
          IndicatorSeparator: () => null,
          Option,
          SingleValue,
        }}
        inputId={`aria-input-${id}`}
        isSearchable={false}
        name={id}
        menuIsOpen={isMenuOpen}
        onChange={handleChange}
        closeMenuOnSelect
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        options={grouped}
        placeholder={
          <>
            <span className="left-column">
              <span className="combobox-label">
                {formatMessage({ id: 'day', defaultMessage: 'day' })}
              </span>
              <span className="selected-value">
                {selectedOption ? selectedOption.textLabel : ''}
              </span>
            </span>
            <div>
              <Icon id="route-schedule-grouped-date-icon" img="icon_calendar" />
            </div>
          </>
        }
        value={selectedOption}
        menuPlacement="auto"
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : null
        }
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
  );
}

DateSelectGrouped.propTypes = {
  startDate: PropTypes.instanceOf(DateTime),
  selectedDay: PropTypes.instanceOf(DateTime),
  dateFormat: PropTypes.string.isRequired,
  dates: PropTypes.arrayOf(PropTypes.instanceOf(DateTime)),
  onDateChange: PropTypes.func.isRequired,
};

DateSelectGrouped.defaultProps = {
  startDate: undefined,
  selectedDay: undefined,
  dates: undefined,
};

DateSelectGrouped.displayName = 'DateSelectGrouped';

export default DateSelectGrouped;
