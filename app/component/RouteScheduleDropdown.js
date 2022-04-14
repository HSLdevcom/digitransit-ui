import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Select from 'react-select';
import Icon from '@digitransit-component/digitransit-component-icon';
import { intlShape } from 'react-intl';
import isEmpty from 'lodash/isEmpty';

export default function RouteScheduleDropdown(props, context) {
  const { alignRight, id, labelId, list, onSelectChange, title } = props;
  const { intl } = context;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState([]);

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const handleChange = selectedOption => {
    if (!id) {
      setSelectedValue(title);
    } else {
      const option = {
        ...selectedOption,
        label: selectedOption.titleLabel,
      };
      setSelectedValue(option);
    }
    if (onSelectChange) {
      onSelectChange(selectedOption.value);
    }
  };

  const optionList = !id
    ? list
    : list.map(option => {
        const titleLabel =
          option.label.length <= 17
            ? option.label
            : `${option.label.substring(0, 15)}...`;
        return {
          value: option.value,
          fullLabel: option.label,
          label: (
            <>
              <span>{option.label}</span>
              {option.label === title && (
                <Icon img="check" height={1.1525} width={0.904375} />
              )}
            </>
          ),
          titleLabel,
        };
      });

  let classNamePrefix = 'dd';
  if (alignRight) {
    classNamePrefix = id !== 'other-dates' ? 'dd-right' : 'dd-timerange';
  }

  return (
    <div
      className={cx('dd-container', labelId ? 'withLabel' : '')}
      aria-live="off"
    >
      {labelId && (
        <label
          className={cx('dd-header-title', alignRight ? 'alignRight' : '')}
          id={`aria-label-${id}`}
          htmlFor={`aria-input-${id}`}
        >
          {intl.formatMessage({ id: labelId })}
        </label>
      )}
      {!labelId && (
        <label
          style={{ display: 'none' }}
          id={`aria-label-${id}`}
          htmlFor={`aria-input-${id}`}
        >
          {title}
        </label>
      )}
      <Select
        aria-labelledby={`aria-label-${id}`}
        ariaLiveMessages={{
          guidance: () => '.', // this can't be empty for some reason
          onChange: ({ value }) =>
            `${intl.formatMessage({ id: 'route-page.pattern-chosen' })} ${
              value.fullLabel
            }`,
          onFilter: () => '',
          onFocus: ({ context: itemContext, focused }) => {
            if (itemContext === 'menu') {
              return focused.fullLabel;
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
        aria-label={
          (isEmpty(selectedValue) &&
            `${
              labelId &&
              intl.formatMessage({
                id: 'route-page.pattern-chosen',
              })
            } ${title}`) ||
          ''
        }
        isSearchable={false}
        name={id}
        menuIsOpen={isMenuOpen}
        onChange={handleChange}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        options={optionList}
        placeholder={
          title && (
            <>
              <span>
                {title.length <= 17 ? title : `${title.substring(0, 15)}...`}
              </span>
              <Icon
                img="arrow-dropdown"
                height={0.625}
                width={0.625}
                color={context.config.colors.primary}
              />
            </>
          )
        }
        value={
          !title && (
            <>
              <span>
                {selectedValue.length <= 17
                  ? selectedValue
                  : `${selectedValue.substring(0, 15)}...`}
              </span>
              <Icon
                img="arrow-dropdown"
                height={0.625}
                width={0.625}
                color={context.config.colors.primary}
              />
            </>
          )
        }
      />
    </div>
  );
}

RouteScheduleDropdown.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

RouteScheduleDropdown.propTypes = {
  alignRight: PropTypes.bool,
  id: PropTypes.string.isRequired,
  labelId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  list: PropTypes.array.isRequired,
  onSelectChange: PropTypes.func,
  title: PropTypes.string,
};

RouteScheduleDropdown.defaultProps = {
  alignRight: false,
  labelId: undefined,
  onSelectChange: undefined,
  title: 'No title',
};
