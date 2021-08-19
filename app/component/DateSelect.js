import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';

import Select from 'react-select';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

function DateSelect(props, context) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const dates = [];
  const date = moment(props.startDate, props.dateFormat);

  dates.push({
    label: context.intl.formatMessage({ id: 'today', defaultMessage: 'Today' }),
    value: date.format(props.dateFormat),
  });

  dates.push({
    label: context.intl.formatMessage({
      id: 'tomorrow',
      defaultMessage: 'Tomorrow',
    }),
    value: date.add(1, 'd').format(props.dateFormat),
  });

  for (let i = 0; i < 28; i++) {
    dates.push({
      value: date.add(1, 'd').format(props.dateFormat),
      label: date.format('dd D.M.'),
    });
  }
  const dateList = dates.map(option => {
    return {
      value: option.value,
      textLabel: option.label,
      label: (
        <>
          <span>{option.label}</span>
          {option.value === props.selectedDate && (
            <Icon img="icon-icon_check" height={1.1525} width={0.904375} />
          )}
        </>
      ),
    };
  });
  const selectedDate = dateList.find(d => d.value === props.selectedDate);
  const id = 'route-schedule-datepicker';
  const classNamePrefix = 'dd';

  return (
    <label
      className="route-schedule-date combobox-container"
      htmlFor={`aria-input-${id}`}
      id={`aria-label-${id}`}
    >
      <span className="left-column">
        <span className="combobox-label">
          {context.intl.formatMessage({ id: 'day', defaultMessage: 'day' })}
        </span>
        <Select
          aria-labelledby={`aria-label-${id}`}
          ariaLiveMessages={{
            guidance: () => '.', // this can't be empty for some reason
            onChange: ({ value }) =>
              `${context.intl.formatMessage({
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
          className="dd-select"
          classNamePrefix={classNamePrefix}
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
          }}
          inputId={`aria-input-${id}`}
          aria-label={selectedDate.textLabel}
          isSearchable={false}
          name={id}
          menuIsOpen={isMenuOpen}
          onChange={e => {
            props.onDateChange(e.value);
          }}
          openMenuOnFocus
          closeMenuOnSelect
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          options={dateList}
          placeholder={selectedDate.textLabel}
          value={selectedDate.value}
        />
      </span>
      <div>
        <Icon id="route-schedule-date-icon" img="icon-icon_calendar" />
      </div>
    </label>
  );
}
DateSelect.propTypes = {
  startDate: PropTypes.string.isRequired,
  selectedDate: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};
DateSelect.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};
DateSelect.displayName = 'DateSelect';

DateSelect.description = () => (
  <div>
    <p>Display a date selection using react components</p>
    <ComponentUsageExample>
      <DateSelect
        startDate="19700101"
        selectedDate="19700101"
        dateFormat="YYYYMMDD"
        onDateChange={event => event.target.value}
      />
    </ComponentUsageExample>
  </div>
);

export default DateSelect;
