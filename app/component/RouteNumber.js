import React from 'react';
import cx from 'classnames';
import Icon from './Icon';
import IconWithBigCaution from './IconWithBigCaution';
import ComponentUsageExample from './ComponentUsageExample';
import { realtimeDeparture as exampleRealtimeDeparture } from './ExampleData';

const LONG_ROUTE_NUMBER_LENGTH = 6;

function RouteNumber(props) {
  let mode = props.mode.toLowerCase();

  if (mode === 'bicycle' || mode === 'car') {
    mode += '-withoutBox';
  }

  const longText = props.text && props.text.length >= LONG_ROUTE_NUMBER_LENGTH;

  const largeClass = props.large ? 'large' : '';
  return (
    <span className="route-number">
      <span className={cx('vcenter-children', props.className, { vertical: props.vertical })}>
        {props.hasDisruption ?
          <IconWithBigCaution
            className={mode}
            img={`icon-icon_${mode}`}
          /> :
          <Icon
            className={mode}
            img={`icon-icon_${mode}`}
          />
      }
        {props.withBar && <div className="bar-container"><div className={cx('bar', mode, largeClass)} ><div className="bar-inner" /></div></div>}

        {props.vertical ? <br /> : null}

      </span>
      <span className={cx('vehicle-number', mode, { 'overflow-fade': longText && props.fadeLong, long: longText })}>
        {props.text}
      </span>
    </span>
  );
}

RouteNumber.description = () =>
  <div>
    <p>Display mode icon and route number with mode color</p>
    <ComponentUsageExample>
      <RouteNumber
        mode={exampleRealtimeDeparture.pattern.route.mode}
        text={exampleRealtimeDeparture.pattern.route.shortName}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="in vertical configuration">
      <RouteNumber
        mode={exampleRealtimeDeparture.pattern.route.mode}
        text={exampleRealtimeDeparture.pattern.route.shortName}
        vertical
      />
    </ComponentUsageExample>
  </div>;

RouteNumber.propTypes = {
  mode: React.PropTypes.string.isRequired,
  text: React.PropTypes.node,
  large: React.PropTypes.bool,
  vertical: React.PropTypes.bool,
  className: React.PropTypes.string,
  hasDisruption: React.PropTypes.bool,
  fadeLong: React.PropTypes.bool,
  withBar: React.PropTypes.bool.isRequired,
};

RouteNumber.defaultProps = {
  withBar: false,
};

RouteNumber.displayName = 'RouteNumber';
export default RouteNumber;
