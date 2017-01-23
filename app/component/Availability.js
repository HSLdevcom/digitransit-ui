import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

function Availability({ total, available, fewAvailableCount, text }) {
  let availablepct = (available / total) * 100;

  let availableClass;

  if (availablepct === 0) {
    availableClass = 'available-none';
  } else if (available <= fewAvailableCount) {
    availableClass = 'available-few';
  } else {
    availableClass = 'available-more';
  }

  const totalClass = availablepct === 100 ? 'available-more' : 'available-none';

  const separator = availablepct > 0 && availablepct < 100 ? 'separate' : false;

  if (availablepct < 5) {
    availablepct = 5;
  }

  if (availablepct > 95) {
    availablepct = 95;
  }

  return (
    <div className="availability-container">
      {text}
      <div className="row">
        <div
          className={cx('availability-column', availableClass, separator)}
          style={{ width: `${availablepct}%` }}
        />
        <div
          className={cx('availability-column', totalClass, separator)}
          style={{ width: `${100 - availablepct}%` }}
        />
      </div>
    </div>
  );
}

Availability.displayName = 'Availability';

Availability.description = () =>
  <div>
    <p>Renders information about availability</p>
    <ComponentUsageExample description="">
      <Availability available={1} total={3} fewAvailableCount={3} text="Bikes available" />
    </ComponentUsageExample>
  </div>;

Availability.propTypes = {
  available: React.PropTypes.number.isRequired,
  total: React.PropTypes.number.isRequired,
  fewAvailableCount: React.PropTypes.number.isRequired,
  text: React.PropTypes.node.isRequired,
};

export default Availability;
