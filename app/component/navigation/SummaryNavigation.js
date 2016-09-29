import React from 'react';
import Drawer from 'material-ui/Drawer';
import { supportsHistory } from 'history/lib/DOMUtils';

import CustomizeSearch from '../summary/CustomizeSearch';
import OriginDestinationBar from '../summary/OriginDestinationBar';
import TimeSelectorContainer from '../summary/TimeSelectorContainer';
import RightOffcanvasToggle from '../summary/RightOffcanvasToggle';

class SummaryNavigation extends React.Component {

  static contextTypes = {
    piwik: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  onRequestChange = (newState) => {
    this.internalSetOffcanvas(newState);
  }

  getOffcanvasState = () => {
    if (typeof window !== 'undefined' && supportsHistory()) {
      if (this.context.location != null && this.context.location.state != null) {
        return this.context.location.state.customizeSearchOffcanvas || false;
      }
    }
    return this.state ? this.state.customizeSearchOffcanvas : false;
  }

  internalSetOffcanvas = (newState) => {
    this.setState({
      customizeSearchOffcanvas: newState,
    });

    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Offcanvas',
        'Customize Search',
        newState ? 'close' : 'open'
      );
    }

    if (supportsHistory()) {
      if (newState) {
        this.context.router.push({
          state: {
            customizeSearchOffcanvas: newState,
          },
          pathname: this.context.location.pathname,
        });
      } else {
        this.context.router.goBack();
      }
    }
  }

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  }

  toggleDisruptionInfo = () => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Modal',
        'Disruption',
        this.state.disruptionVisible ? 'close' : 'open'
      );
    }

    this.setState({
      disruptionVisible: !this.state.disruptionVisible,
    });
  }

  render() {
    return (
      <section>
        <Drawer
          className="offcanvas"
          disableSwipeToOpen
          openSecondary
          docked={false}
          open={this.getOffcanvasState()}
          onRequestChange={this.onRequestChange}
        >
          <CustomizeSearch />
        </Drawer>
        <OriginDestinationBar />
        <div className="time-selector-settings-row">
          <TimeSelectorContainer />
          <RightOffcanvasToggle
            onToggleClick={this.toggleCustomizeSearchOffcanvas}
            hasChanges={!this.props.hasDefaultPreferences}
          />
        </div>
      </section>
    );
  }
}

SummaryNavigation.propTypes = {
  hasDefaultPreferences: React.PropTypes.bool.isRequired,
};

export default SummaryNavigation;
