import React from 'react';
import PropTypes from 'prop-types';
import { useSelect } from 'downshift';
import { Link, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import Icon from '../Icon';
import { routePagePath } from '../../util/path';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { configShape, patternShape } from '../../util/shapes';

function patternOptionText(pattern) {
  return pattern
    ? `${pattern.stops[0].name} ➔ ${
        pattern.headsign || pattern.stops[pattern.stops.length - 1].name
      }`
    : '';
}

export function patternTextWithIcon(pattern) {
  if (pattern) {
    const text = patternOptionText(pattern);
    const i = text.search(/➔/);
    if (i === -1) {
      return text;
    }
    return (
      <>
        {text.slice(0, i)}
        <Icon
          className="in-text-arrow"
          img="icon_arrow-right-long"
          viewBox="0 0 17 10"
        />
        <span className="sr-only">➔</span>
        {text.slice(i + 1)}
      </>
    );
  }
  return null;
}

/**
 * Renders a single option as a list item
 * @param props
 * @param props.option option to be rendered, can be a pattern or a similar route
 * @param props.optionIndexTable lookup table from option id to index
 * @param props.highlightedIndex index of the currently highlighted option
 * @param props.getItemProps returns downshift item props
 * @param currentPattern currently selected pattern
 * @returns {JSX.Element}
 */
function PatternOption(
  { option, optionIndexTable, highlightedIndex, getItemProps, currentPattern },
  { intl },
) {
  const isSelected = option.code === currentPattern.code;
  const selectedText = isSelected
    ? intl.formatMessage({ id: 'route-page.pattern-chosen' })
    : '';
  return (
    // option is a pattern
    (option.stops && (
      <li
        aria-label={`${patternOptionText(option)}, ${selectedText}`}
        className={cx(
          'suggestion',
          optionIndexTable[option.code] === highlightedIndex &&
            'suggestion--highlighted',
        )}
        {...getItemProps({
          item: option,
          index: optionIndexTable[option.code],
        })}
      >
        {patternTextWithIcon(option)}
        {isSelected && (
          <Icon
            aria-hidden="true"
            className="check"
            img="icon_check"
            viewBox="0 0 15 11"
          />
        )}
      </li>
    )) ||
    // option is a similar route
    (option.shortName && option.longName && option.mode && (
      <li
        className={cx(
          'suggestion',
          optionIndexTable[option.gtfsId] === highlightedIndex &&
            'suggestion--highlighted',
        )}
        {...getItemProps({
          item: option,
          index: optionIndexTable[option.code],
        })}
      >
        <Link
          to={routePagePath(option.gtfsId)}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <div className="similar-route">
            <Icon
              className={option.mode.toLowerCase()}
              img={`icon_${option.mode.toLowerCase()}`}
              color={option.color ? `#${option.color}` : null}
            />
            <div className="similar-route-text">
              <span className="similar-route-name">{option.shortName}</span>
              <span className="similar-route-longname">{option.longName}</span>
            </div>
            <div className="similar-route-arrow-container">
              <Icon
                className="similar-route-arrow"
                img="icon_arrow-collapse--right"
              />
            </div>
          </div>
        </Link>
      </li>
    )) ||
    null
  );
}

PatternOption.propTypes = {
  option: patternShape.isRequired,
  optionIndexTable: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
  highlightedIndex: PropTypes.number.isRequired,
  getItemProps: PropTypes.func.isRequired,
  currentPattern: patternShape.isRequired,
};

PatternOption.contextTypes = {
  intl: intlShape.isRequired,
};

export default function RoutePatternSelect(
  { currentPattern, optionArray, onSelectChange, className },
  { config, router },
) {
  if (!currentPattern) {
    return null;
  }

  // flatten optionArray to an ungrouped 1-D array
  const flattenedOptions = optionArray.reduce(
    (options, group) => options.concat(group.options),
    [],
  );
  // lookup table for getting the index of an option, used for highlighting
  const optionIndexTable = flattenedOptions.reduce(
    (map, { code, gtfsId }, index) => {
      // eslint-disable-next-line no-param-reassign
      map[code || gtfsId] = index;
      return map;
    },
    {},
  );

  // refer to useSelect hook in downshift.js documentation
  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    getLabelProps,
  } = useSelect({
    selectedItem: currentPattern,
    items: flattenedOptions,
    onSelectedItemChange: ({ selectedItem }) =>
      // if selected item is a similar route, redirect to route page
      (selectedItem.gtfsId &&
        router.push(routePagePath(selectedItem.gtfsId))) ||
      onSelectChange(selectedItem.code),
    onIsOpenChange: changes =>
      changes.isOpen &&
      addAnalyticsEvent({
        category: 'Route',
        action: 'OpenDirectionMenu',
        name: null,
      }),
    labelId: 'route-pattern-select-label',
    menuId: 'route-pattern-select-menu',
    toggleButtonId: 'route-pattern-select-toggle',
  });

  const sectionTitleFontWeight = config.appBarStyle === 'hsl' ? 500 : 600;
  return (
    <div
      className={cx('route-pattern-select', className)}
      aria-atomic="true"
      style={{
        '--sectionTitleFontWeight': `${sectionTitleFontWeight}`,
      }}
    >
      <div
        className={cx(
          'pattern-select-container',
          isOpen && 'pattern-select-container--open',
        )}
      >
        <div>
          <label {...getLabelProps()}>
            <span tabIndex={-1} className="sr-only">
              {patternOptionText(currentPattern)}
            </span>
            <span className="sr-only">
              <FormattedMessage id="route-page.pattern-select-title" />
            </span>
          </label>
          <div {...getToggleButtonProps()}>
            <span>
              <div className="input-display" aria-hidden="true">
                {patternTextWithIcon(currentPattern)}
                <Icon className="dropdown-arrow" img="icon_arrow-collapse" />
              </div>
            </span>
          </div>
        </div>

        <div
          className={cx(
            'suggestions-container',
            isOpen && 'suggestions-container--open',
          )}
          hidden={!isOpen}
          {...getMenuProps({})}
        >
          {optionArray.map((section, sectionIndex) => {
            return (
              <div
                key={`section-${section.name}`}
                className="section-container"
              >
                <ul aria-labelledby={`section-${sectionIndex}`} role="group">
                  <label
                    id={`section-${sectionIndex}`}
                    className={cx([
                      'section-title',
                      section.name ? '' : 'sr-only',
                    ])}
                  >
                    {section.name}
                  </label>
                  {section.options.map(option => (
                    <PatternOption
                      key={option.code || option.gtfsId}
                      option={option}
                      optionIndexTable={optionIndexTable}
                      highlightedIndex={highlightedIndex}
                      getItemProps={getItemProps}
                      currentPattern={currentPattern}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

RoutePatternSelect.propTypes = {
  currentPattern: patternShape,
  optionArray: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      options: PropTypes.arrayOf(patternShape).isRequired,
    }),
  ).isRequired,
  onSelectChange: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};

RoutePatternSelect.defaultProps = {
  currentPattern: undefined,
};

RoutePatternSelect.contextTypes = {
  config: configShape.isRequired,
  router: routerShape.isRequired,
};
