import cx from 'classnames';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import withOutsideClick from 'react-click-outside';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';

import Icon from './Icon';
import { isKeyboardSelectionEvent, isBrowser } from '../util/browser';
import withBreakpoint from '../util/withBreakpoint';

class BubbleDialog extends React.Component {
  constructor(props, context) {
    super(props);

    this.dialogContentRef = React.createRef();
    this.toggleDialogRef = React.createRef();
    this.state = {
      isOpen: this.getDialogState(context),
    };
  }

  getDialogState = context => {
    const { router } = context;
    const location = router.getCurrentLocation();
    return location.state && location.state[this.props.id] === true;
  };

  setDialogState = (isOpen, callback) => {
    this.setState({ isOpen }, () => {
      const { router } = this.context;
      const location = router.getCurrentLocation();
      router.replace({
        ...location,
        state: {
          ...location.state,
          [this.props.id]: isOpen,
        },
      });
      callback();
    });
  };

  handleClickOutside() {
    this.closeDialog();
  }

  openDialog = (applyFocus = false) => {
    this.setDialogState(true, () => {
      if (isFunction(this.props.onDialogOpen)) {
        this.props.onDialogOpen(applyFocus);
      } else if (applyFocus && this.dialogContentRef.current) {
        this.dialogContentRef.current.focus();
      }
    });
  };

  closeDialog = (applyFocus = false) => {
    this.setDialogState(false, () => {
      if (applyFocus && this.toggleDialogRef.current) {
        this.toggleDialogRef.current.focus();
      }
    });
  };

  render = () => {
    if (!isBrowser) {
      return null;
    }

    const {
      breakpoint,
      children,
      contentClassName,
      isFullscreenOnMobile,
      header,
    } = this.props;
    const { intl } = this.context;
    const isOpen = this.state.isOpen || this.props.isOpen;
    const isLarge = breakpoint === 'large';
    const isFullscreen =
      isOpen && isFullscreenOnMobile && breakpoint === 'small';

    return (
      <div
        className={cx('bubble-dialog-component-container', {
          'bubble-dialog-component-container--fullscreen': isFullscreen,
        })}
      >
        {isOpen && (
          <div className="bubble-dialog-container">
            <div
              className={cx('bubble-dialog', {
                'bp-large': isLarge,
                'bubble-dialog--fullscreen': isFullscreen,
              })}
            >
              <div
                className={cx('bubble-dialog-header-container', {
                  'bubble-dialog-header-container--fullscreen': isFullscreen,
                })}
              >
                <span
                  className={cx('bubble-dialog-header', {
                    'bubble-dialog-header--fullscreen': isFullscreen,
                  })}
                >
                  {intl.formatMessage({
                    id: header,
                    defaultMessage: 'Bubble Dialog Header',
                  })}
                </span>
                <button
                  className={cx('bubble-dialog-close', {
                    'bubble-dialog-close--fullscreen': isFullscreen,
                  })}
                  onClick={() => this.closeDialog()}
                  onKeyDown={e =>
                    isKeyboardSelectionEvent(e) && this.closeDialog(true)
                  }
                >
                  <Icon img="icon-icon_close" />
                </button>
              </div>
              <div
                className={cx('bubble-dialog-content', contentClassName, {
                  'bp-large': isLarge,
                  'bubble-dialog-content--fullscreen': isFullscreen,
                })}
                ref={this.dialogContentRef}
                tabIndex="-1"
              >
                {children}
              </div>
              <div
                className={cx('bubble-dialog-buttons', {
                  collapsed: !isFullscreen,
                })}
              >
                <button
                  className="standalone-btn"
                  onClick={() => this.closeDialog()}
                  onKeyDown={e =>
                    isKeyboardSelectionEvent(e) && this.closeDialog(true)
                  }
                >
                  Takaisin karttaan
                </button>
              </div>
            </div>
            <div
              className={cx('bubble-dialog-tip-container', {
                collapsed: isFullscreen,
              })}
            >
              <div className="bubble-dialog-tip" />
            </div>
          </div>
        )}
        <div
          className={cx('bubble-dialog-toggle', {
            collapsed: isFullscreen,
          })}
          onClick={() => (isOpen ? this.closeDialog() : this.openDialog())}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) &&
            (isOpen ? this.closeDialog(true) : this.openDialog(true))
          }
          ref={this.toggleDialogRef}
          role="button"
          tabIndex="0"
        >
          <Icon img={`icon-icon_${this.props.icon}`} />
        </div>
      </div>
    );
  };
}

BubbleDialog.propTypes = {
  breakpoint: PropTypes.oneOf(['small', 'medium', 'large']),
  children: PropTypes.node,
  contentClassName: PropTypes.string,
  header: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  isFullscreenOnMobile: PropTypes.bool,
  isOpen: PropTypes.bool,
  onDialogOpen: PropTypes.func,
};

BubbleDialog.defaultProps = {
  breakpoint: 'small',
  children: null,
  contentClassName: undefined,
  isFullscreenOnMobile: false,
  isOpen: false,
  onDialogOpen: undefined,
};

BubbleDialog.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};

export default withOutsideClick(
  withBreakpoint(BubbleDialog, { forwardRef: true }),
);
