import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelect } from 'downshift';
import { Link, routerShape } from 'found';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import Icon from '../Icon';
import { routePagePath } from '../../util/path';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { patternShape, routeShape } from '../../util/shapes';
import { useBreakpoint } from '../../util/withBreakpoint';

function patternOptionText(pattern) {
  if (!pattern) {
    return '';
  }
  const { stops, headsign } = pattern;
  const destination = headsign || stops[stops.length - 1].name;
  return `${stops[0].name} ➔ ${destination}`;
}

export function patternTextWithIcon(pattern) {
  if (!pattern) {
    return null;
  }
  const text = patternOptionText(pattern);
  const arrowIndex = text.indexOf('➔');
  if (arrowIndex === -1) {
    return text;
  }
  return (
    <>
      {text.slice(0, arrowIndex)}
      <Icon
        aria-hidden="true"
        className="in-text-arrow"
        img="icon_arrow-right-long"
        viewBox="0 0 17 10"
      />
      <span className="sr-only">➔</span>
      {text.slice(arrowIndex + 1)}
    </>
  );
}

/**
 * Renders an individual option in the pattern/route select dropdown, which can be either a route pattern or a similar route.
 * @param props
 * @param props.option The pattern or similar route option to render
 * @param props.optionIndexTable Lookup table for option index by code/gtfsId
 * @param props.highlightedIndex Currently highlighted index (for keyboard navigation)
 * @param props.getItemProps Downshift function to get item props
 * @param props.currentPattern Currently selected pattern (to indicate selection)
 * @returns {JSX.Element} representing the option
 */
function PatternOption({
  option,
  optionIndexTable,
  highlightedIndex,
  getItemProps,
  currentPattern,
}) {
  const intl = useIntl();

  if (option.stops) {
    // Option is a pattern
    const isSelected = option.code === currentPattern.code;
    const selectedText = isSelected
      ? intl.formatMessage({ id: 'route-page.pattern-chosen' })
      : '';
    return (
      <li
        aria-label={
          selectedText
            ? `${patternOptionText(option)}, ${selectedText}`
            : patternOptionText(option)
        }
        className={cx('suggestion', {
          'suggestion--highlighted':
            optionIndexTable[option.code] === highlightedIndex,
        })}
        {...getItemProps({
          item: option,
          index: optionIndexTable[option.code],
        })}
      >
        <span className="pattern-check">
          {isSelected ? (
            <Icon
              aria-hidden="true"
              className="check"
              img="icon_check"
              viewBox="0 0 15 11"
            />
          ) : (
            <span className="check-placeholder" />
          )}
        </span>
        <span className="pattern-label">{patternTextWithIcon(option)}</span>
      </li>
    );
  }

  if (option.shortName && option.longName && option.mode) {
    // Option is a similar route
    return (
      <li
        className={cx('suggestion', {
          'suggestion--highlighted':
            optionIndexTable[option.gtfsId] === highlightedIndex,
        })}
        {...getItemProps({
          item: option,
          index: optionIndexTable[option.gtfsId],
        })}
      >
        <Link
          to={routePagePath(option.gtfsId)}
          onClick={e => e.stopPropagation()}
        >
          <div className="similar-route">
            <div className="icon-container">
              <Icon
                className={option.mode.toLowerCase()}
                img={`icon_${option.mode.toLowerCase()}`}
                color={option.color ? `#${option.color}` : null}
              />
            </div>
            <div className="similar-route-text">
              <span className="similar-route-name">{option.shortName}</span>
              <span className="similar-route-longname">{option.longName}</span>
            </div>
            <div className="icon-container">
              <Icon
                className="similar-route-arrow"
                img="icon_arrow-collapse--right"
              />
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return null;
}

PatternOption.propTypes = {
  option: PropTypes.oneOfType([patternShape, routeShape]).isRequired,
  optionIndexTable: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
  highlightedIndex: PropTypes.number.isRequired,
  getItemProps: PropTypes.func.isRequired,
  currentPattern: patternShape.isRequired,
};

/**
 * Renders a single selectable option in the mobile bottom-sheet modal.
 * No downshift integration — selection is handled via a plain onClick.
 */
function MobilePatternOption({ option, currentPattern, onSelect }) {
  if (option.stops) {
    const isSelected = option.code === currentPattern.code;
    return (
      <li
        className="suggestion"
        role="option"
        aria-selected={isSelected}
        onClick={onSelect}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        tabIndex={0}
      >
        <span className="pattern-check">
          {isSelected ? (
            <Icon
              aria-hidden="true"
              className="check"
              img="icon_check"
              viewBox="0 0 15 11"
            />
          ) : (
            <span className="check-placeholder" />
          )}
        </span>
        <span className="pattern-label">{patternTextWithIcon(option)}</span>
      </li>
    );
  }

  if (option.shortName && option.longName && option.mode) {
    return (
      <li
        className="suggestion"
        role="option"
        aria-selected={false}
        onClick={onSelect}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        tabIndex={0}
      >
        <div className="similar-route">
          <div className="icon-container">
            <Icon
              className={option.mode.toLowerCase()}
              img={`icon_${option.mode.toLowerCase()}`}
              color={option.color ? `#${option.color}` : null}
            />
          </div>
          <div className="similar-route-text">
            <span className="similar-route-name">{option.shortName}</span>
            <span className="similar-route-longname">{option.longName}</span>
          </div>
          <div className="icon-container">
            <Icon
              className="similar-route-arrow"
              img="icon_arrow-collapse--right"
            />
          </div>
        </div>
      </li>
    );
  }

  return null;
}

MobilePatternOption.propTypes = {
  option: PropTypes.oneOfType([patternShape, routeShape]).isRequired,
  currentPattern: patternShape.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default function RoutePatternSelect({
  currentPattern = undefined,
  optionArray,
  onSelectChange,
  className,
  router,
  backgroundColor = null,
}) {
  const intl = useIntl();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint !== 'large';
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  useEffect(() => {
    if (!mobileModalOpen) {
      return undefined;
    }
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setMobileModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileModalOpen]);

  if (!currentPattern) {
    return null;
  }

  // Flatten option groups into a single ordered list (used by downshift for item indices)
  const flatOptions = optionArray.flatMap(group => group.options);
  const optionCount = flatOptions.length;
  // Lookup table: option identifier → flat index (for highlight tracking)
  const optionIndexTable = Object.fromEntries(
    flatOptions.map(({ code, gtfsId }, index) => [code || gtfsId, index]),
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
    items: flatOptions,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem.code) {
        onSelectChange(selectedItem.code);
      } else {
        // Similar route selected — navigate to its route page
        router.push(routePagePath(selectedItem.gtfsId));
      }
    },
    onIsOpenChange: changes => {
      if (changes.isOpen) {
        addAnalyticsEvent({
          category: 'Route',
          action: 'OpenDirectionMenu',
          name: null,
        });
      }
    },
    labelId: 'route-pattern-select-label',
    menuId: 'route-pattern-select-menu',
    toggleButtonId: 'route-pattern-select-toggle',
  });

  const handleMobileOpen = () => {
    setMobileModalOpen(true);
    addAnalyticsEvent({
      category: 'Route',
      action: 'OpenDirectionMenu',
      name: null,
    });
  };

  const handleMobileSelect = item => {
    if (item.code) {
      onSelectChange(item.code);
    } else {
      router.push(routePagePath(item.gtfsId));
    }
    setMobileModalOpen(false);
  };

  return (
    <div className={`route-pattern-select ${className}`} aria-atomic="true">
      <div
        className={cx(
          'pattern-select-container',
          'pattern-select-container--colored',
          {
            'pattern-select-container--open': isOpen,
          },
        )}
        style={
          backgroundColor
            ? {
                background: `linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.15)), ${backgroundColor}`,
                '--mode-color': backgroundColor,
              }
            : undefined
        }
      >
        <label {...getLabelProps()}>
          <span className="sr-only">
            <FormattedMessage id="route-page.pattern-select-title" />
          </span>
          <span className="sr-only">{patternOptionText(currentPattern)}</span>
        </label>
        {isMobile ? (
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            title={intl.formatMessage({ id: 'route-pattern-select-tooltip' })}
            onClick={handleMobileOpen}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMobileOpen();
              }
            }}
          >
            <div className="input-display" aria-hidden="true">
              <span
                className="option-count-pill"
                style={
                  backgroundColor ? { background: backgroundColor } : undefined
                }
              >
                +{optionCount}
              </span>
              <span className="toggle-label">
                <FormattedMessage id="route-page.alternative-routes" />
              </span>
              <Icon className="dropdown-arrow" img="icon_arrow-collapse" />
            </div>
          </div>
        ) : (
          <div
            {...getToggleButtonProps()}
            title={intl.formatMessage({ id: 'route-pattern-select-tooltip' })}
          >
            <div className="input-display" aria-hidden="true">
              <span
                className="option-count-pill"
                style={
                  backgroundColor ? { background: backgroundColor } : undefined
                }
              >
                +{optionCount}
              </span>
              <span className="toggle-label">
                <FormattedMessage id="route-page.alternative-routes" />
              </span>
              <Icon className="dropdown-arrow" img="icon_arrow-collapse" />
            </div>
          </div>
        )}

        {/* Desktop dropdown — hidden on mobile */}
        <div
          className={cx('suggestions-container', {
            'suggestions-container--open': isOpen,
          })}
          hidden={!isOpen}
          {...getMenuProps({})}
        >
          {optionArray.map((section, sectionIndex) => (
            <div key={`section-${section.name}`} className="section-container">
              <ul aria-labelledby={`section-${sectionIndex}`} role="group">
                <label
                  id={`section-${sectionIndex}`}
                  className={cx('section-title', { 'sr-only': !section.name })}
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
          ))}
        </div>
      </div>

      {/* Mobile bottom-sheet */}
      {isMobile && mobileModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="pattern-select-sheet-backdrop"
            aria-hidden="true"
            onClick={() => setMobileModalOpen(false)}
          />
          {/* Sheet panel */}
          <div
            className="pattern-select-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={intl.formatMessage({
              id: 'route-page.pattern-select-title',
            })}
            style={
              backgroundColor ? { '--mode-color': backgroundColor } : undefined
            }
          >
            <div className="pattern-select-sheet-header">
              <button
                type="button"
                className="pattern-select-sheet-close"
                aria-label={intl.formatMessage({ id: 'close' })}
                onClick={() => setMobileModalOpen(false)}
              >
                <Icon img="icon_close" />
              </button>
            </div>
            <div className="route-pattern-select">
              {optionArray.map((section, sectionIndex) => (
                <div
                  key={`mobile-section-${section.name || sectionIndex}`}
                  className="section-container"
                >
                  <ul
                    aria-labelledby={`mobile-section-${sectionIndex}`}
                    role="listbox"
                  >
                    {section.name && (
                      <li
                        id={`mobile-section-${sectionIndex}`}
                        className="section-title"
                        role="presentation"
                      >
                        {section.name}
                      </li>
                    )}
                    {section.options.map(option => (
                      <MobilePatternOption
                        key={option.code || option.gtfsId}
                        option={option}
                        currentPattern={currentPattern}
                        onSelect={() => handleMobileSelect(option)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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
  router: routerShape.isRequired,
  backgroundColor: PropTypes.string,
};
