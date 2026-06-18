import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

const Toggle = forwardRef(function Toggle(
  { toggled = true, title, onToggle, id },
  ref,
) {
  return (
    <div className="option-toggle-container" title={title}>
      <div className="toggle">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={toggled}
          onKeyDown={e => {
            if (e.code === 'Enter' || e.nativeEvent.code === 'Enter') {
              // spacebar is handled by default with onChange
              onToggle();
            }
          }}
          onChange={onToggle}
        />
        <span className="slider round" />
      </div>
    </div>
  );
});

Toggle.propTypes = {
  toggled: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
};

export default Toggle;
