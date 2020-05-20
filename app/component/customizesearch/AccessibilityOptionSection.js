import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import Toggle from '../Toggle';
import { replaceQueryParams } from '../../util/queryUtils';
import Icon from '../Icon';

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
          <Icon
            className="wheelchair-icon"
            img="icon-icon_wheelchair"
            height={2}
            width={2}
          />
          <FormattedMessage
            id="accessibility-label"
            defaultMessage="Wheelchair"
          />
          <Toggle
            toggled={!!currentSettings.usingWheelchair}
            title="accessibility"
            onToggle={e => {
              replaceQueryParams(router, match, {
                usingWheelchair: e.target.checked ? 1 : 0,
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
