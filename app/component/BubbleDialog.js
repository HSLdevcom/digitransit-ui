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
    if (this.props.setOpen) {
      this.props.setOpen(true);
    }
    this.setDialogState(true, () => {
      if (isFunction(this.props.onDialogOpen)) {
        this.props.onDialogOpen(applyFocus);
      } else if (applyFocus && this.dialogContentRef.current) {
        this.dialogContentRef.current.focus();
      }
    });
  };

  closeDialog = (applyFocus = false) => {
    if (this.props.setOpen) {
      this.props.setOpen(false);
    }
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

  renderContainer() {
    // TODO: fix mismatch with props.isOpen and state isOpen, if you want to enable toggle open/close from button
    const { isOpen } = this.props;
    return (
      <div className="bubble-dialog-component-container">
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
  icon: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isFullscreenOnMobile: PropTypes.bool,
  onDialogOpen: PropTypes.func,
  tooltip: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

BubbleDialog.defaultProps = {
  breakpoint: 'small',
  isFullscreenOnMobile: false,
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
