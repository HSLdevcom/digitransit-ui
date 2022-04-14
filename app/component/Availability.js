import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

function Availability({
  total,
  available,
  fewAvailableCount,
  fewerAvailableCount,
  text,
  showStatusBar,
}) {
  let availablepct = (available / total) * 100;
  if (availablepct > 100) {
    // overloading is possible
    availablepct = 100;
  }
  let availableClass;

  if (availablepct === 0) {
    availableClass = 'available-none';
  } else if (available <= fewerAvailableCount) {
    availableClass = 'available-fewer';
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
      {showStatusBar && (
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
      )}
    </div>
  );
}

Availability.displayName = 'Availability';

Availability.propTypes = {
  available: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  fewAvailableCount: PropTypes.number.isRequired,
  fewerAvailableCount: PropTypes.number.isRequired,
  text: PropTypes.node.isRequired,
  showStatusBar: PropTypes.bool.isRequired,
};

export default Availability;
