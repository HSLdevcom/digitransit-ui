import cx from 'classnames';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Select, SelectOption } from '@hsl-fi/form';
import { truncateLabel } from '../../../../utils/client/stringUtils';

/**
 * Generic dropdown used on the schedule page for stop selection.
 */
function ScheduleDropdown({
  alignRight = false,
  id,
  list,
  onSelectChange,
  title = 'No title',
  value,
}) {
  const intl = useIntl();
  const selectedOption = list.find(opt => opt.value === value);
  const inputId = `aria-input-${id}`;

  // The design system select only handles string values
  const onChange = selected =>
    onSelectChange?.(list.find(opt => String(opt.value) === selected).value);

  return (
    <div className="dd-container withLabel" aria-live="off">
      <label
        className={cx('dd-header-title', { 'align-right': alignRight })}
        htmlFor={inputId}
      >
        {intl.formatMessage({ id })}
      </label>
      <div className={cx('dd-select', { 'align-right': alignRight })}>
        <Select
          id={inputId}
          triggerVariant="input"
          value={selectedOption ? String(selectedOption.value) : ''}
          valueLabel={truncateLabel(selectedOption?.label ?? title)}
          placeholder={truncateLabel(title)}
          onChange={onChange}
        >
          {list.map(option => (
            <SelectOption
              key={option.value}
              value={String(option.value)}
              label={option.label}
            />
          ))}
        </Select>
      </div>
    </div>
  );
}

ScheduleDropdown.propTypes = {
  alignRight: PropTypes.bool,
  id: PropTypes.string.isRequired,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  onSelectChange: PropTypes.func,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ScheduleDropdown.displayName = 'ScheduleDropdown';

export default ScheduleDropdown;
