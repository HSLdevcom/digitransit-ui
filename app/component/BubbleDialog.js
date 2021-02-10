import cx from 'classnames';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import withOutsideClick from 'react-click-outside';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

import Icon from './Icon';
import { getDialogState, setDialogState } from '../store/localStorage';
import {
  getIsBrowser,
  isBrowser,
  isKeyboardSelectionEvent,
} from '../util/browser';
import withBreakpoint from '../util/withBreakpoint';

class BubbleDialog extends React.Component {
  constructor(props, context) {
    super(props);

    this.dialogContentRef = React.createRef();
    this.toggleDialogRef = React.createRef();

    const { id } = this.props;
    const isDialogOpen = this.getDialogState(context);
    this.state = {
      isOpen: isDialogOpen,
      isTooltipOpen: !isDialogOpen && !getDialogState(`${id}_tooltip`),
    };
  }

  getDialogState = context => {
    const { location } = context.match;
    return location.state && location.state[this.props.id] === true;
  };

  setDialogState = (isOpen, callback) => {
    if (this.state.isOpen === isOpen) {
      return;
    }
    this.setState({ isOpen }, () => {
      const { match, router } = this.context;
      const { location } = match;
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

  openDialog = (applyFocus = false) => {
    this.closeTooltip(applyFocus);
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

  closeTooltip = (applyFocus = false, persist = false) => {
    if (persist) {
      const { id } = this.props;
      setDialogState(`${id}_tooltip`);
    }
    this.setState({ isTooltipOpen: false }, () => {
      if (applyFocus && this.toggleDialogRef.current) {
        this.toggleDialogRef.current.focus();
      }
    });
  };

  handleClickOutside() {
    this.closeTooltip();
    this.closeDialog();
  }

  renderTooltip() {
    const { tooltip } = this.props;
    const { isTooltipOpen } = this.state;
    if (!tooltip || !isTooltipOpen) {
      return null;
    }
    return (
      <div className="bubble-dialog-container">
        <div className="bubble-dialog bubble-dialog--tooltip">
          <div className="bubble-dialog-content">{tooltip}</div>
          <button
            className="bubble-dialog-close"
            onClick={() => this.closeTooltip(false, true)}
            onKeyDown={e =>
              isKeyboardSelectionEvent(e) && this.closeTooltip(true, true)
            }
            type="button"
          >
            <Icon img="icon-icon_close" />
          </button>
        </div>
        <div className="bubble-dialog-tip-container">
          <div className="bubble-dialog-tip" />
        </div>
      </div>
    );
  }

  renderContent(isFullscreen) {
    const { breakpoint, children, contentClassName, header } = this.props;
    const { intl } = this.context;
    const isLarge = breakpoint === 'large';
    return (
      <div
        className={cx('bubble-dialog-container', {
          'bubble-dialog-container--fullscreen': isFullscreen,
        })}
      >
        <div
          className={cx('bubble-dialog', {
            'bubble-dialog--fullscreen': isFullscreen,
            'bubble-dialog--large': isLarge,
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
              type="button"
            >
              <Icon img="icon-icon_close" />
            </button>
          </div>
          <div
            className={cx('bubble-dialog-content', contentClassName, {
              'bubble-dialog-content--fullscreen': isFullscreen,
              'bubble-dialog-content--large': isLarge,
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
              type="button"
            >
              {intl.formatMessage({
                id: 'dialog-return-to-map',
                defaultMessage: 'Return to map',
              })}
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
    );
  }

  renderContainer() {
    const isOpen = this.state.isOpen || this.props.isOpen;
    return (
      <div className="bubble-dialog-component-container">
        {isOpen && this.renderContent(false)}
        {this.renderTooltip()}
        <div
          className="bubble-dialog-toggle"
          onClick={() => (isOpen ? this.closeDialog() : this.openDialog())}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) &&
            (isOpen ? this.closeDialog(true) : this.openDialog(true))
          }
          ref={this.toggleDialogRef}
          role="button"
          tabIndex="0"
        >
          <Icon img={`icon-icon_${this.props.icon}`} viewBox="0 0 25 25" />
        </div>
      </div>
    );
  }

  render = () => {
    if (!isBrowser && !getIsBrowser()) {
      return null;
    }
    const { breakpoint, isFullscreenOnMobile } = this.props;
    const isFullscreen = breakpoint !== 'large' && isFullscreenOnMobile;
    return this.renderContainer(isFullscreen);
  };
}

BubbleDialog.propTypes = {
  breakpoint: PropTypes.oneOf(['small', 'medium', 'large']),
  children: PropTypes.node,
  contentClassName: PropTypes.string,
  header: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isFullscreenOnMobile: PropTypes.bool,
  isOpen: PropTypes.bool,
  onDialogOpen: PropTypes.func,
  tooltip: PropTypes.string,
};

BubbleDialog.defaultProps = {
  breakpoint: 'small',
  children: null,
  contentClassName: undefined,
  isFullscreenOnMobile: false,
  isOpen: false,
  onDialogOpen: undefined,
  tooltip: undefined,
};

BubbleDialog.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const enhancedComponent = withOutsideClick(
  withBreakpoint(BubbleDialog, { forwardRef: true }),
);

export { enhancedComponent as default, BubbleDialog as Component };
