import React from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from './Modal';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

class NoRoutePopup extends React.Component {
  static description = () =>
    <div>
      <p>Popup informing the user that no route was found.</p>
      <ComponentUsageExample><NoRoutePopup /></ComponentUsageExample>
    </div>

  state = {
    open: true,
  };

  toggle = (state) => {
    let newState;

    if (state === true || state === false) {
      newState = state;
    } else {
      newState = !this.state.open;
    }

    this.setState({
      open: newState,
    }, () => this.forceUpdate());
  }

  render() {
    return (
      <Modal allowClicks open={this.state.open} title="" toggleVisibility={this.toggle}>
        <div className="no-route-found">
          <Icon className="no-route-found-icon" img="icon-icon_no_route_found" />
          <p>
            <FormattedMessage
              id="no-route-msg"
              defaultMessage={'Unfortunately no route was found between the locations you gave. ' +
                'Please change origin and/or destination address.'}
            />
          </p>
          <p><a><FormattedMessage id="close" defaultMessage="Close" /></a></p>
        </div>
      </Modal>
    );
  }
}

export default NoRoutePopup;
