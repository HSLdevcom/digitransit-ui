import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import Toggle from 'material-ui/Toggle';
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
        <Toggle
          toggled={!!currentSettings.usingWheelchair}
          title="accessibility"
          label="Wheelchair"
          labelStyle={{ color: '#707070' }}
          onToggle={(event, isInputChecked) => {
            replaceQueryParams(router, match, {
              usingWheelchair: isInputChecked ? 1 : 0,
            });
          }}
        />
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
