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

    const { breakpoint, children, header } = this.props;
    const { intl } = this.context;
    const isOpen = this.state.isOpen || this.props.isOpen;
    const isLarge = breakpoint === 'large';

    return (
      <div className="bubble-dialog-component-container">
        {isOpen && (
          <div className="bubble-dialog-container">
            <div
              className={cx('bubble-dialog', {
                'bp-large': isLarge,
              })}
            >
              <div className="bubble-dialog-header-container">
                <span className="bubble-dialog-header h4">
                  {intl.formatMessage({
                    id: header,
                    defaultMessage: 'Bubble Dialog Header',
                  })}
                </span>
                <button
                  className="bubble-dialog-close"
                  onClick={() => this.closeDialog()}
                  onKeyDown={e =>
                    isKeyboardSelectionEvent(e) && this.closeDialog(true)
                  }
                >
                  <Icon img="icon-icon_close" />
                </button>
              </div>
              <div
                className={cx('bubble-dialog-content', {
                  'bp-large': isLarge,
                })}
                ref={this.dialogContentRef}
                tabIndex="-1"
              >
                {children}
              </div>
            </div>
            <div className="bubble-dialog-tip-container">
              <div className="bubble-dialog-tip" />
            </div>
          </div>
        )}
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
          <Icon img={`icon-icon_${this.props.icon}`} />
        </div>
      </div>
    );
  };
}

BubbleDialog.propTypes = {
  breakpoint: PropTypes.oneOf(['small', 'medium', 'large']),
  children: PropTypes.node,
  header: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onDialogOpen: PropTypes.func,
};

BubbleDialog.defaultProps = {
  breakpoint: 'small',
  children: null,
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
