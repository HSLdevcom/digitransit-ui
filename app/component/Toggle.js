import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import Message from './Message';

import { isKeyboardSelectionEvent } from '../util/browser';

const Toggle = ({ toggled, title, label, onToggle }) => {
  const id = uniqueId('input-');
  return (
    <div className="option-toggle-container" title={title}>
      {label && <Message defaultMessage={label} />}
      <label className="toggle" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          checked={toggled}
          onKeyPress={e =>
            isKeyboardSelectionEvent(e) &&
            onToggle({ target: { toggled: !toggled } })
          }
          onChange={e => onToggle(e)}
        />
        <span className="slider round" />
      </label>
    </div>
  );
};

Toggle.propTypes = {
  toggled: PropTypes.bool,
  label: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  title: PropTypes.string,
};

Toggle.defaultProps = {
  toggled: true,
  label: '',
  title: undefined,
};

Toggle.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default Toggle;
