import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../Toggle';
import { setCustomizedSettings } from '../../store/localStorage';
import Icon from '../Icon';

class AccessibilityOptionSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { usingWheelchair: props.currentSettings.usingWheelchair };
  }

  render() {
    return (
      <React.Fragment>
        <FormattedMessage id="accessibility" defaultMessage="Accessibility" />
        <div
          className="mode-option-container toggle-container"
          style={{
            padding: '0 0 0 1em',
            height: '3.5em',
          }}
        >
          <Icon
            className="wheelchair-icon"
            img="icon-icon_wheelchair"
            height={2}
            width={2}
          />
          <FormattedMessage
            id="accessibility-limited"
            defaultMessage="Wheelchair"
          />
          <Toggle
            toggled={!!this.state.usingWheelchair}
            title="accessibility"
            onToggle={e => {
              this.setState(
                {
                  usingWheelchair: e.target.checked ? 1 : 0,
                },
                setCustomizedSettings({
                  usingWheelchair: e.target.checked ? 1 : 0,
                }),
              );
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

AccessibilityOptionSection.propTypes = {
  currentSettings: PropTypes.object.isRequired,
};

export default AccessibilityOptionSection;
