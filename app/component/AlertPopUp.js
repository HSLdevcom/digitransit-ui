import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

const AlertPopUp = props => (
  <div
    role="button"
    tabIndex={0}
    onClick={props.togglePopUp}
    onKeyPress={e => isKeyboardSelectionEvent(e) && props.togglePopUp}
    className={`${props.textId} popup-dark-overlay`}
    style={{ display: props.isPopUpOpen ? 'block' : 'none' }}
  >
    <div
      className={`${props.textId} popup-container`}
      role="button"
      tabIndex={0}
      onClick={e => e.stopPropagation()}
      onKeyPress={e => isKeyboardSelectionEvent(e) && props.togglePopUp}
    >
      <div className="close-popup">
        <button onClick={props.togglePopUp}>
          <Icon className="close" img="icon-icon_close" />
        </button>
      </div>
      {props.icon && (
        <div className="popup-icon">
          <Icon className={props.icon} img={`icon-icon_${props.icon}`} />
        </div>
      )}
      <div className="popup-text">
        <FormattedMessage id={props.textId} defaultMessage={props.textId} />
      </div>
    </div>
  </div>
);

AlertPopUp.propTypes = {
  isPopUpOpen: PropTypes.bool,
  textId: PropTypes.string,
  icon: PropTypes.string,
  togglePopUp: PropTypes.func,
};

export default AlertPopUp;
