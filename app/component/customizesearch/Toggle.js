import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

const Toggle = ({ toggled, title, onToggle, id }) => {
  const useId = id || uniqueId('input-');
  return (
    <div className="option-toggle-container" title={title}>
      <div className="toggle">
        <input
          type="checkbox"
          id={useId}
          checked={toggled}
          onKeyDown={e => {
            if (e.code === 'Enter' || e.nativeEvent.code === 'Enter') {
              // spacebar is handled by default with onChange
              onToggle();
            }
          }}
          onChange={() => onToggle()}
        />
        <span className="slider round" />
      </div>
    </div>
  );
};

Toggle.propTypes = {
  toggled: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  title: PropTypes.string,
  id: PropTypes.string,
};

Toggle.defaultProps = {
  toggled: true,
  title: undefined,
  id: null,
};

Toggle.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default Toggle;
