import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import Select from 'react-select';
import Icon from '../Icon';

export const getDateOptions = (
  startDate,
  dateFormat,
  selectedDate,
  formatMessage,
) => {
  const date = DateTime.fromFormat(startDate, dateFormat);
  const dates = [
    {
      label: formatMessage({ id: 'today', defaultMessage: 'Today' }),
      value: date.toFormat(dateFormat),
    },
    {
      label: formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' }),
      value: date.plus({ days: 1 }).toFormat(dateFormat),
    },
  ];

  for (let i = 2; i < 60; i++) {
    const dateValue = date.plus({ days: i });
    dates.push({
      value: dateValue.toFormat(dateFormat),
      label: dateValue.toFormat('ccc d.L.'),
    });
  }

  return dates.map(option => ({
    value: option.value,
    textLabel: option.label,
    label: (
      <>
        <span>{option.label}</span>
        {option.value === selectedDate && (
          <Icon img="icon_check" height={1.1525} width={0.904375} />
        )}
      </>
    ),
  }));
};

function DateSelect(props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const intl = useIntl();

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const dateList = getDateOptions(
    props.startDate,
    props.dateFormat,
    props.selectedDate,
    intl.formatMessage,
  );
  const selectedDate = dateList.find(d => d.value === props.selectedDate);
  const id = 'route-schedule-datepicker';
  const classNamePrefix = 'route-schedule';

  return (
    <Select
      aria-labelledby={`aria-label-${id}`}
      ariaLiveMessages={{
        guidance: () => '.', // this can't be empty for some reason
        onChange: ({ value }) =>
          `${intl.formatMessage({
            id: 'route-page.pattern-chosen',
          })} ${value.textLabel}`,
        onFilter: () => '',
        onFocus: ({ context: itemContext, focused }) => {
          if (itemContext === 'menu') {
            return focused.textLabel;
          }
          return '';
        },
      }}
      className="date-select"
      classNamePrefix={classNamePrefix}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      inputId={`aria-input-${id}`}
      aria-label={`
            ${intl.formatMessage({
              id: 'select-date',
              defaultMessage: 'Select date',
            })}.
            ${intl.formatMessage({
              id: 'route-page.pattern-chosen',
            })} ${selectedDate.textLabel}`}
      isSearchable={false}
      name={id}
      menuIsOpen={isMenuOpen}
      onChange={e => {
        props.onDateChange(e.value);
        onMenuClose();
      }}
      closeMenuOnSelect
      onMenuOpen={onMenuOpen}
      onMenuClose={onMenuClose}
      options={dateList}
      placeholder={
        <>
          <span className="left-column">
            <span className="combobox-label">
              {intl.formatMessage({ id: 'day', defaultMessage: 'day' })}
            </span>
            <span className="selected-value">{selectedDate.textLabel}</span>
          </span>
          <div>
            <Icon id="route-schedule-date-icon" img="icon_calendar" />
          </div>
        </>
      }
      value={selectedDate.value}
    />
  );
}
DateSelect.propTypes = {
  startDate: PropTypes.string.isRequired,
  selectedDate: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};
DateSelect.displayName = 'DateSelect';

export default DateSelect;
