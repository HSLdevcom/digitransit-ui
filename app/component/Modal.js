import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from './Icon';

class Modal extends React.Component {
  static propTypes = {
    allowClicks: PropTypes.bool,
    children: PropTypes.node,
    open: PropTypes.bool,
    title: PropTypes.node,
    toggleVisibility: PropTypes.func.isRequired,
  };

  stopClickPropagation = e => {
    if (this.props.allowClicks !== true) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  render() {
    const isActive = {
      'is-active': this.props.open,
    };

    const modalClasses = {
      modal: true,
      'small-11': true,
      column: true,
    };

    const overlayStyle = {
      zIndex: 1400,
    };

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
    return (
      <div
        className={cx('modal-overlay', 'cursor-pointer', isActive)}
        style={overlayStyle}
        onClick={this.props.toggleVisibility}
      >
        <div
          data-closable
          className={cx(modalClasses, isActive)}
          onClick={this.stopClickPropagation}
        >
          <div className="row">
            <h2 className="left">{this.props.title}</h2>
            <div className="small-1 columns right text-right modal-top-nav">
              <a
                onClick={this.props.toggleVisibility}
                className="close-button cursor-pointer"
              >
                <Icon img="icon-icon_close" />
              </a>
            </div>
          </div>
          <div className="modal-wrapper">
            <div className="modal-content momentum-scroll">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
