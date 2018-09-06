import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

class BubbleDialog extends React.Component {
  constructor(props) {
    super(props);

    this.toggleDialogRef = React.createRef();
    this.state = {
      isOpen: this.props.isOpen,
    };
  }

  closeDialog = () => this.setState({ isOpen: false });
  openDialog = () =>
    this.setState(
      { isOpen: true },
      () => this.props.onDialogOpened && this.props.onDialogOpened(),
    );

  render = () => {
    const { children, header } = this.props;
    const { intl } = this.context;
    const { isOpen } = this.state;

    return (
      <div className="bubble-dialog-component-container">
        {isOpen && (
          <div className="bubble-dialog-container">
            <div className="bubble-dialog">
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
              <div className="bubble-dialog-content">{children}</div>
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
  children: PropTypes.node,
  header: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onDialogOpened: PropTypes.func,
};

BubbleDialog.defaultProps = {
  children: null,
  isOpen: false,
  onDialogOpened: undefined,
};

BubbleDialog.contextTypes = {
  intl: intlShape.isRequired,
};

export default BubbleDialog;
