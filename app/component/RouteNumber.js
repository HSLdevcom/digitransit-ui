import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import IconWithBigCaution from './IconWithBigCaution';
import IconWithIcon from './IconWithIcon';
import ComponentUsageExample from './ComponentUsageExample';
import { realtimeDeparture as exampleRealtimeDeparture } from './ExampleData';
import { isMobile } from '../util/browser';

const LONG_ROUTE_NUMBER_LENGTH = 5;

function RouteNumber(props, context) {
  let mode = props.mode.toLowerCase();
  const routeName =
    mode === 'bus' && props.gtfsId && context.config.getRoutePrefix
      ? context.config.getRoutePrefix(props.gtfsId).concat(props.text)
      : props.text;
  const { alertSeverityLevel, color } = props;

  if (mode === 'bicycle' || mode === 'car') {
    mode += '-withoutBox';
  }

  const longText = routeName && routeName.length >= LONG_ROUTE_NUMBER_LENGTH;
  // Checks if route only has letters without identifying numbers and
  // length doesn't fit in the tab view
  const hasNoShortName =
    routeName &&
    new RegExp(/^([^0-9]*)$/).test(routeName) &&
    routeName.length > 3;

  const getIcon = (icon, isCallAgency, hasDisruption, badgeFill, badgeText) => {
    if (isCallAgency) {
      return (
        <IconWithIcon
          color={color}
          className={`${mode} call`}
          img={icon || `icon-icon_${mode}`}
          subIcon="icon-icon_call"
        />
      );
    }

    if (hasDisruption || !!alertSeverityLevel) {
      return (
        <IconWithBigCaution
          alertSeverityLevel={alertSeverityLevel}
          color={color}
          className={mode}
          img={icon || `icon-icon_${mode}`}
        />
      );
    }

    return (
      <IconWithIcon
        badgeFill={badgeFill}
        badgeText={badgeText}
        color={color}
        className={mode}
        img={icon || `icon-icon_${mode}`}
        subIcon=""
      />
    );
  };

  // props.vertical is FALSE in Near you view
  // props.vertical is TRUE in itinerary view
  return (
    <span
      style={{ display: longText && isMobile ? 'block' : null }}
      className={cx('route-number', {
        'overflow-fade': longText && props.fadeLong,
        vertical: props.vertical,
        hasNoShortName: hasNoShortName && longText && !props.vertical,
      })}
    >
      <span
        className={cx('vcenter-children', props.className)}
        aria-label={context.intl.formatMessage({
          id: mode,
          defaultMessage: 'Vehicle',
        })}
        role="img"
      >
        {props.vertical === true ? (
          <div className={`special-icon ${mode}`}>
            {getIcon(
              props.icon,
              props.isCallAgency,
              props.hasDisruption,
              props.badgeFill,
              props.badgeText,
            )}
          </div>
        ) : (
          getIcon(props.icon, props.isCallAgency, props.hasDisruption)
        )}
        {props.withBar && (
          <div className="bar-container">
            <div
              style={{
                color: mode === 'call' ? 'white' : color || 'currentColor',
              }}
              className={cx('bar', mode)}
            >
              <div className="bar-inner" />
            </div>
          </div>
        )}
      </span>
      {routeName &&
        (props.vertical === false ? (
          <span
            style={{
              color: props.color ? props.color : null,
              fontSize: longText && isMobile ? '17px' : null,
            }}
            className={cx('vehicle-number', mode, {
              'overflow-fade': longText && props.fadeLong,
              long: longText,
              hasNoShortName: hasNoShortName && longText && props.isRouteView,
            })}
          >
            {routeName}
          </span>
        ) : (
          <div className="vehicle-number-container-v">
            <span
              style={{ color: props.color ? props.color : null }}
              className={cx('vehicle-number', mode, {
                'overflow-fade': longText && props.fadeLong,
                long: longText,
              })}
            >
              {routeName}
            </span>
          </div>
        ))}
    </span>
  );
}

RouteNumber.description = () => (
  <div>
    <p>Display mode icon and route number with mode color</p>
    <ComponentUsageExample>
      <RouteNumber
        mode={exampleRealtimeDeparture.pattern.route.mode}
        text={exampleRealtimeDeparture.pattern.route.shortName}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with disruption">
      <div style={{ paddingLeft: '5px' }}>
        <RouteNumber
          mode={exampleRealtimeDeparture.pattern.route.mode}
          text={exampleRealtimeDeparture.pattern.route.shortName}
          hasDisruption
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="with callAgency">
      <div style={{ paddingLeft: '5px' }}>
        <RouteNumber
          mode={exampleRealtimeDeparture.pattern.route.mode}
          text={exampleRealtimeDeparture.pattern.route.shortName}
          isCallAgency
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="in vertical configuration">
      <RouteNumber
        mode={exampleRealtimeDeparture.pattern.route.mode}
        text={exampleRealtimeDeparture.pattern.route.shortName}
        vertical
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="in vertical configuration with disruption">
      <div style={{ paddingLeft: '5px' }}>
        <RouteNumber
          mode={exampleRealtimeDeparture.pattern.route.mode}
          text={exampleRealtimeDeparture.pattern.route.shortName}
          hasDisruption
          vertical
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="in vertical configuration with callAgency">
      <div style={{ paddingLeft: '5px' }}>
        <RouteNumber
          mode={exampleRealtimeDeparture.pattern.route.mode}
          text={exampleRealtimeDeparture.pattern.route.shortName}
          isCallAgency
          vertical
        />
      </div>
    </ComponentUsageExample>
  </div>
);

RouteNumber.propTypes = {
  alertSeverityLevel: PropTypes.string,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  text: PropTypes.node,
  vertical: PropTypes.bool,
  className: PropTypes.string,
  hasDisruption: PropTypes.bool,
  fadeLong: PropTypes.bool,
  withBar: PropTypes.bool,
  isCallAgency: PropTypes.bool,
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  isRouteView: PropTypes.bool,
  gtfsId: PropTypes.string,
};

RouteNumber.defaultProps = {
  alertSeverityLevel: undefined,
  badgeFill: undefined,
  badgeText: undefined,
  className: '',
  vertical: false,
  hasDisruption: false,
  fadeLong: false,
  text: '',
  withBar: false,
  isCallAgency: false,
  isRouteView: false,
  icon: undefined,
  gtfsId: undefined,
};

RouteNumber.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object,
};

RouteNumber.displayName = 'RouteNumber';
export default RouteNumber;
