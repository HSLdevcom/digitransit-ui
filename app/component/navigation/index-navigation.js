import React from 'react';
import IndexTopNavigation from './index-top-navigation';
import OffcanvasMenu from './offcanvas-menu';
import NotImplemented from '../util/not-implemented';
import Drawer from 'material-ui/Drawer';
import FeedbackActions from '../../action/feedback-action';

import { supportsHistory } from 'history/lib/DOMUtils';

class IndexNavigation extends React.Component {
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

  onRequestChange = (newState) => this.internalSetOffcanvas(newState);

  getOffcanvasState = () => {
    if (typeof window !== 'undefined' && supportsHistory()) {
      return (this.context.location != null && this.context.location.state != null ?
                this.context.location.state.offcanvasVisible : false);
    }
    return this.state != null ? this.state.offcanvasVisible : void 0;
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
        <NotImplemented />
        <Drawer
          className="offcanvas"
          disableSwipeToOpen
          ref="leftNav"
          docked={false}
          open={this.getOffcanvasState()}
          onRequestChange={this.onRequestChange}
        >
          <OffcanvasMenu openFeedback={this.openFeedback} />
        </Drawer>
        <div className="grid-frame fullscreen">
          <IndexTopNavigation
            toggleOffcanvas={this.toggleOffcanvas}
          />
          <section ref="content" className="content fullscreen">{this.props.children}</section>
        </div>
      </div>);
  }
}

export default IndexNavigation;
