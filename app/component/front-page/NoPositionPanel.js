import React from 'react';
import { FormattedMessage } from 'react-intl';

import { findLocation } from '../../action/PositionActions';
import Icon from '../icon/icon';

class NoPositionPanel extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  locateUser() {
    this.context.executeAction(findLocation);
  }

  render() {
    return (
      <div className="gray text-center">
        <p>
          <FormattedMessage
            id="no-position-no-stops"
            defaultMessage="Nearest stops cannot be shown because your position is not known."
          />
        </p>

        <p className="locate-yourself large-text cursor-pointer" onClick={this.locateUser}>
          <Icon img="icon-icon_position" />
          <a className="dashed-underline">
            <FormattedMessage id="geolocate-yourself" defaultMessage="Locate yourself" />
          </a>
        </p>

        <p className="separator"><FormattedMessage id="or" defaultMessage="Or" /></p>

        <p>
          <FormattedMessage
            id="give-position"
            defaultMessage="Write your position or origin into the search field."
          />
        </p>

        <p className="separator"><FormattedMessage id="or" defaultMessage="Or" /></p>

        <p>
          <FormattedMessage
            id="select-position"
            defaultMessage="Select your position from previous searches"
          />
          :
        </p>
      </div>
    );
  }
}

export default NoPositionPanel;
