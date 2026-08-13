import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import { transitIconName, modeToTranslationId } from '../util/modeUtils';
import IconWithBigCaution from './IconWithBigCaution';
import IconWithIcon from './IconWithIcon';
import Icon from './Icon';
import { TransportMode } from '../constants';
import { useConfigContext } from '../configurations/ConfigContext';

const LONG_ROUTE_NUMBER_LENGTH = 6;

export default function RouteNumber({
  alertSeverityLevel,
  badgeFill,
  badgeText,
  badgeTextFill,
  appendClass,
  className = '',
  vertical = false,
  card = false,
  hasDisruption = false,
  text = '',
  withBar = false,
  isCallAgency = false,
  icon,
  isTransitLeg = false,
  renderModeIcons = false,
  withBicycle = false,
  withCar = false,
  color,
  duration,
  occupancyStatus,
  shortenLongText = false,
  mode: originalMode,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const mode = originalMode.toLowerCase();
  const isScooter = mode === TransportMode.Scooter.toLowerCase();
  const isTaxi = mode === TransportMode.Taxi.toLowerCase();

  // Perform text-related processing
  let filteredText = text;
  if (
    (shortenLongText &&
      config.disabledLegTextModes?.includes(mode) &&
      className.includes('line')) ||
    isTaxi
  ) {
    filteredText = '';
  }
  const textFieldIsText = typeof filteredText === 'string'; // can be also react node
  if (
    shortenLongText &&
    config.shortenLongTextThreshold &&
    filteredText &&
    textFieldIsText &&
    filteredText.length > config.shortenLongTextThreshold
  ) {
    filteredText = `${filteredText.substring(
      0,
      config.shortenLongTextThreshold - 3,
    )}...`;
  }

  const longText =
    filteredText &&
    textFieldIsText &&
    filteredText.length >= LONG_ROUTE_NUMBER_LENGTH;
  // Checks if route only has letters without identifying numbers and
  // length doesn't fit in the tab view
  const hasNoShortName =
    filteredText &&
    textFieldIsText &&
    /^([^0-9]*)$/.test(filteredText) &&
    filteredText.length > 3;

  const getColor = () => color || (isTransitLeg ? 'currentColor' : null);

  const getIcon = () => {
    const iconName = icon || transitIconName(mode, false);

    if (hasDisruption || !!alertSeverityLevel) {
      return (
        <React.Fragment>
          <IconWithBigCaution
            alertSeverityLevel={alertSeverityLevel}
            color={color}
            className={mode}
            img={iconName}
            omitViewBox
          />
          {withBicycle && (
            <Icon
              img="icon_bicycle_walk"
              className="itinerary-icon_with-bicycle"
            />
          )}
          {withCar && (
            <Icon img="icon_car" className="itinerary-icon_with-car" />
          )}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <IconWithIcon
          badgeFill={badgeFill}
          badgeText={badgeText}
          badgeTextFill={badgeTextFill}
          color={color}
          className={cx(
            mode,
            {
              [['secondary']]:
                mode === 'citybike' && icon?.includes('secondary'), // Vantaa citybike station
            },
            appendClass,
          )}
          img={iconName}
          subIcon=""
          mode={mode}
          omitViewBox={!isCallAgency}
          backgroundShape={isCallAgency ? 'square' : undefined}
        />
        {withBicycle && (
          <Icon
            img="icon_bicycle_walk"
            className="itinerary-icon_with-bicycle"
          />
        )}
        {withCar && <Icon img="icon_car" className="itinerary-icon_with-car" />}
      </React.Fragment>
    );
  };

  const rNumber = (
    <span
      className={cx('route-number', {
        vertical,
      })}
    >
      <span
        className={cx('vcenter-children', className)}
        aria-label={intl.formatMessage({
          id: modeToTranslationId(mode, config),
          defaultMessage: 'Vehicle',
        })}
        role="img"
      >
        {((!isTransitLeg && !renderModeIcons) || appendClass === 'scooter') && (
          <div className={cx('empty', appendClass)} />
        )}
        {isTransitLeg === true ? (
          <div className={`special-icon ${mode}`}>{getIcon()}</div>
        ) : (
          <div className={`icon ${mode}`}>{getIcon()}</div>
        )}
        {filteredText && (
          <div
            className={cx(
              'vehicle-number-container-v'.concat(card ? '-map' : ''),
              {
                long: hasNoShortName,
              },
            )}
          >
            <span
              aria-hidden="true"
              className={cx('vehicle-number'.concat(card ? '-map' : ''), mode, {
                long: longText,
              })}
              style={{ color: !withBar ? getColor() : null }}
            >
              {filteredText}
            </span>
            {textFieldIsText && (
              <span className="sr-only">{filteredText?.toLowerCase()}</span>
            )}
          </div>
        )}
        {((!config.hideWalkLegDurationSummary && isTransitLeg === false) ||
          isTaxi) &&
          duration > 0 && (
            <div className={`leg-duration-container ${mode} `}>
              <span className="leg-duration">{duration}</span>
            </div>
          )}
        {isScooter && !vertical && (
          <Icon img="icon_smartphone" className="phone-icon" />
        )}
      </span>
      {occupancyStatus && (
        <span className="occupancy-icon-container">
          <Icon
            img={`icon_${occupancyStatus}`}
            height={1.5}
            width={1.5}
            color="white"
          />
        </span>
      )}
    </span>
  );

  return withBar ? (
    <div className={cx('bar-container', { long: hasNoShortName })}>
      <div
        className={cx('bar', mode, appendClass)}
        style={{ backgroundColor: getColor() }}
      >
        {rNumber}
      </div>
    </div>
  ) : (
    rNumber
  );
}

RouteNumber.propTypes = {
  alertSeverityLevel: PropTypes.string,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  text: PropTypes.node,
  vertical: PropTypes.bool,
  className: PropTypes.string,
  hasDisruption: PropTypes.bool,
  withBar: PropTypes.bool,
  isCallAgency: PropTypes.bool,
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badgeTextFill: PropTypes.string,
  icon: PropTypes.string,
  renderModeIcons: PropTypes.bool,
  duration: PropTypes.number,
  isTransitLeg: PropTypes.bool,
  withBicycle: PropTypes.bool,
  withCar: PropTypes.bool,
  card: PropTypes.bool,
  appendClass: PropTypes.string,
  occupancyStatus: PropTypes.string,
  shortenLongText: PropTypes.bool,
};
