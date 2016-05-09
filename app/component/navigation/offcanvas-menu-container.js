import React from 'react';
import config from '../../config';
import Icon from '../icon/icon';
import OffcanvasMenu from './offcanvas-menu';
import Drawer from 'material-ui/Drawer';
import FeedbackActions from '../../action/feedback-action';

import { supportsHistory } from 'history/lib/DOMUtils';

class OffcanvasMenuContainer extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired,
    children: React.PropTypes.node.isRequired,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    piwik: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = { offcanvasVisible: false };
  }

  onRequestChange = (newState) => this.internalSetOffcanvas(newState);

  getOffcanvasState = () => {
    if (typeof window !== 'undefined' && supportsHistory() &&
          this.context.location.state != null &&
          this.context.location.state.offcanvasVisible != null) {
      return this.context.location.state.offcanvasVisible;
    }
    return this.state.offcanvasVisible;
  }

  toggleOffcanvas = () => this.internalSetOffcanvas(!this.getOffcanvasState());

  internalSetOffcanvas = (newState) => {
    this.setState({ offcanvasVisible: newState });

    if (this.context.piwik != null) {
      this.context.piwik.trackEvent('Offcanvas', 'Index', newState ? 'open' : 'close');
    }

    if (supportsHistory()) {
      if (newState) {
        this.context.router.push({
          state: { offcanvasVisible: newState },
          pathname: this.context.location.pathname + (
            (this.context.location.search != null ?
              this.context.location.search.indexOf('mock') : void 0) > -1 ? '?mock' : ''),
        });
      } else {
        this.context.router.goBack();
      }
    }
  }

  openFeedback = () => {
    this.context.executeAction(FeedbackActions.openFeedbackModal);
    this.toggleOffcanvas();
  }

  render() {
    return (
      <div className={this.props.className}>
        <Drawer
          className="offcanvas"
          disableSwipeToOpen
          ref="leftNav"
          docked={false}
          open={this.getOffcanvasState()}
          openSecondary
          onRequestChange={this.onRequestChange}
        >
          <OffcanvasMenu openFeedback={this.openFeedback} />
        </Drawer>
        {config.leftMenu.show ?
          <div
            onClick={this.toggleOffcanvas}
            className="icon-holder cursor-pointer main-menu-toggle"
          >
            <Icon img={'icon-icon_menu'} className="icon" />
          </div> :
          null}
      </div>);
  }
}

export default OffcanvasMenuContainer;
