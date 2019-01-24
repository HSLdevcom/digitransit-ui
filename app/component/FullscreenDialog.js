import cx from 'classnames';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';
import { getDialogState, setDialogState } from '../store/localStorage';
import { isKeyboardSelectionEvent } from '../util/browser';

class FullscreenDialog extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    initialIsOpen: PropTypes.bool,
    isOpen: PropTypes.bool,
    renderContent: PropTypes.func.isRequired,
    showCloseButton: PropTypes.bool,
    showOnce: PropTypes.bool,
    toggle: PropTypes.func,
  };

  static defaultProps = {
    className: undefined,
    id: undefined,
    initialIsOpen: false,
    isOpen: false,
    showCloseButton: true,
    showOnce: false,
    toggle: undefined,
  };

  state = {
    isOpen:
      this.props.initialIsOpen &&
      (!this.props.showOnce || !getDialogState(this.props.id)),
  };

  toggle = () => {
    if (isFunction(this.props.toggle)) {
      this.props.toggle();
    } else {
      this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }
  };

  toggleWithKeyboard = e => {
    if (isKeyboardSelectionEvent(e)) {
      this.toggle();
    }
  };

  render() {
    const { className, id, renderContent, showCloseButton } = this.props;
    const isOpen = this.state.isOpen || this.props.isOpen;
    if (isOpen) {
      setDialogState(id);
    }

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={this.toggle}
        onKeyPress={this.toggleWithKeyboard}
        className="popup-dark-overlay"
        style={{
          display: isOpen ? 'block' : 'none',
        }}
      >
        <div
          className={cx('popup-container', className)}
          role="button"
          tabIndex={0}
          onClick={e => e.stopPropagation()}
          onKeyPress={this.toggleWithKeyboard}
        >
          {showCloseButton && (
            <div className="close-popup">
              <button onClick={this.toggle}>
                <Icon className="close" img="icon-icon_close" />
              </button>
            </div>
          )}
          {renderContent(this)}
        </div>
      </div>
    );
  }
}

export default FullscreenDialog;
