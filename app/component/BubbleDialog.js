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
  openDialog = () => this.setState({ isOpen: true });

  render = () => {
    const { children, header } = this.props;
    const { intl } = this.context;
    const { isOpen } = this.state;

    return (
      <div className="street-mode-selector-popup-container">
        {isOpen && (
          <div className="street-mode-selector-popup">
            <div className="street-mode-selector-popup-options">
              <div className="street-mode-selector-popup-header">
                <span className="h4">
                  {intl.formatMessage({
                    id: header,
                    defaultMessage: 'Bubble Dialog Header',
                  })}
                </span>
                <button
                  className="clear-input"
                  onClick={() => this.closeDialog()}
                  onKeyDown={e =>
                    isKeyboardSelectionEvent(e) && this.closeDialog(true)
                  }
                >
                  <Icon img="icon-icon_close" />
                </button>
              </div>
              <div className="street-mode-selector-popup-buttons">
                {children}
              </div>
            </div>
            <div className="street-mode-selector-popup-tip-container">
              <div className="street-mode-selector-popup-tip" />
            </div>
          </div>
        )}
        <div
          className="street-mode-selector-popup-toggle"
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
};

BubbleDialog.defaultProps = {
  children: null,
  isOpen: false,
};

BubbleDialog.contextTypes = {
  intl: intlShape.isRequired,
};

export default BubbleDialog;
