import React from 'react';
import Drawer from 'material-ui/Drawer';
import cx from 'classnames';

import CustomizeSearch from '../summary/CustomizeSearch';
import OriginDestinationBar from '../summary/OriginDestinationBar';
import TimeSelectorContainer from '../summary/TimeSelectorContainer';
import RightOffcanvasToggle from '../summary/RightOffcanvasToggle';

class SummaryNavigation extends React.Component {
  static propTypes = {
    params: React.PropTypes.shape({
      from: React.PropTypes.string,
      to: React.PropTypes.string,
    }).isRequired,
  };

  static contextTypes = {
    piwik: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    breakpoint: React.PropTypes.string,
  };

  componentDidMount() {
    this.unlisten = this.context.router.listen(location => {
      if (this.context.location.state && this.context.location.state.customizeSearchOffcanvas &&
        (!location.state || !location.state.customizeSearchOffcanvas)
        && !this.transitionDone && location.pathname.startsWith('/reitti/')) {
        this.transitionDone = true;
        this.context.router.replace({ ...location,
          pathname: this.context.location.pathname,
          query: this.context.location.query,
        });
      } else {
        this.transitionDone = false;
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  onRequestChange = (newState) => {
    this.internalSetOffcanvas(newState);
  }

  getOffcanvasState = () =>
    this.context.location.state && this.context.location.state.customizeSearchOffcanvas;

  internalSetOffcanvas = (newState) => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Offcanvas',
        'Customize Search',
        newState ? 'close' : 'open'
      );
    }

    if (newState) {
      this.context.router.push({
        ...this.context.location,
        state: {
          ...this.context.location.state,
          customizeSearchOffcanvas: newState,
        },
      });
    } else {
      this.context.router.goBack();
    }
  }

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  }

  render() {
    const className = cx({ 'bp-large': this.context.breakpoint === 'large' });

    return (
      <section>
        <Drawer
          className="offcanvas"
          disableSwipeToOpen
          openSecondary
          docked={false}
          open={this.getOffcanvasState()}
          onRequestChange={this.onRequestChange}
          // Needed for the closing arrow button that's left of the drawer.
          containerStyle={{ background: 'transparent', boxShadow: 'none' }}
          width={291}
        >
          <CustomizeSearch
            params={this.props.params}
            onToggleClick={this.toggleCustomizeSearchOffcanvas}
          />
        </Drawer>
        <OriginDestinationBar className={className} />
        <div className={cx('time-selector-settings-row', className)}>
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
