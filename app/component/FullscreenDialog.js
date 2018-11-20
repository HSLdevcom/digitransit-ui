import cx from 'classnames';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

class FullscreenDialog extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    initialIsOpen: PropTypes.bool,
    isOpen: PropTypes.bool,
    renderContent: PropTypes.func.isRequired,
    showCloseButton: PropTypes.bool,
    toggle: PropTypes.func,
  };

  static defaultProps = {
    className: undefined,
    initialIsOpen: false,
    isOpen: false,
    showCloseButton: true,
    toggle: undefined,
  };

  state = {
    isOpen: this.props.initialIsOpen,
  };

  toggle = () => {
    if (isFunction(this.props.toggle)) {
      this.props.toggle();
    } else {
      this.setState({ isOpen: !this.state.isOpen });
    }
  };

  toggleWithKeyboard = e => {
    if (isKeyboardSelectionEvent(e)) {
      this.toggle();
    }
  };

  render() {
    const { className, renderContent, showCloseButton } = this.props;
    const isOpen = this.state.isOpen || this.props.isOpen;

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
