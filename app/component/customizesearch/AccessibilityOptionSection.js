import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import Toggle from '../Toggle';
import { replaceQueryParams } from '../../util/queryUtils';

// eslint-disable-next-line react/prefer-stateless-function
class AccessibilityOptionSection extends React.Component {
  render() {
    const { currentSettings, router, match } = this.props;
    return (
      <React.Fragment>
        <FormattedMessage
          id="accessibility-header"
          defaultMessage="Accessibility"
        />
        <div
          className="mode-option-container toggle-container"
          style={{
            padding: '0 0 0 1em',
            height: '3.5em',
          }}
        >
          <FormattedMessage
            id="accessibility-label"
            defaultMessage="Wheelchair"
          />
          <Toggle
            toggled={!!currentSettings.usingWheelchair}
            title="accessibility"
            onToggle={(event, isInputChecked) => {
              replaceQueryParams(router, match, {
                usingWheelchair: isInputChecked ? 1 : 0,
              });
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

AccessibilityOptionSection.propTypes = {
  currentSettings: PropTypes.object.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default AccessibilityOptionSection;
