import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import OriginDestinationBar from './OriginDestinationBar';
import TimeSelectorContainer from './TimeSelectorContainer';
import RightOffcanvasToggle from './RightOffcanvasToggle';
import ViaPointSearchModal from './ViaPointSearchModal';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { otpToLocation } from '../util/otpStrings';

class SummaryNavigation extends React.Component {
  static propTypes = {
    params: React.PropTypes.shape({
      from: React.PropTypes.string,
      to: React.PropTypes.string,
    }).isRequired,
    hasDefaultPreferences: React.PropTypes.bool.isRequired,
  };

  static contextTypes = {
    piwik: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    breakpoint: React.PropTypes.string,
  };

  componentDidMount() {
    this.unlisten = this.context.router.listen((location) => {
      if (this.context.location.state && this.context.location.state.customizeSearchOffcanvas &&
        (!location.state || !location.state.customizeSearchOffcanvas)
        && !this.transitionDone && location.pathname.startsWith('/reitti/')) {
        this.transitionDone = true;
        const newLocation = { ...this.context.location,
          state: { ...this.context.location.state, customizeSearchOffcanvas: false },
        };
        setTimeout(() => this.context.router.replace(newLocation), 0);
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
    (this.context.location.state && this.context.location.state.customizeSearchOffcanvas) || false;

  internalSetOffcanvas = (newState) => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Offcanvas',
        'Customize Search',
        newState ? 'close' : 'open',
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

  customizeSearchModules = {
    Drawer: () => importLazy(System.import('material-ui/Drawer')),
    CustomizeSearch: () => importLazy(System.import('./CustomizeSearch')),
  }

  render() {
    const className = cx({ 'bp-large': this.context.breakpoint === 'large' });
    let drawerWidth = 291;
    if (typeof window !== 'undefined') {
      drawerWidth = 0.5 * window.innerWidth > 291 ? Math.min(600, 0.5 * window.innerWidth) : 291;
    }

    return (
      <div>
        <LazilyLoad modules={this.customizeSearchModules} >
          {({ Drawer, CustomizeSearch }) => (
            <Drawer
              className="offcanvas"
              disableSwipeToOpen
              openSecondary
              docked={false}
              open={this.getOffcanvasState()}
              onRequestChange={this.onRequestChange}
              // Needed for the closing arrow button that's left of the drawer.
              containerStyle={{ background: 'transparent', boxShadow: 'none' }}
              width={drawerWidth}
            >
              <CustomizeSearch
                isOpen={this.getOffcanvasState()}
                params={this.props.params}
                onToggleClick={this.toggleCustomizeSearchOffcanvas}
              />
            </Drawer>
          )}
        </LazilyLoad>
        <OriginDestinationBar
          className={className}
          origin={otpToLocation(this.props.params.from)}
          destination={otpToLocation(this.props.params.to)}
        />
        <div className={cx('via-point-bar', className)}>
          { this.context.location.query && this.context.location.query.intermediatePlaces && (
            <div className="via-point">
              <FormattedMessage
                id="via-point"
                defaultMessage="Via point"
                className="via-point-header"
              />
              <button className="noborder link-name" onClick={this.openSearchModal}>
                <span>
                  {otpToLocation(this.context.location.query.intermediatePlaces).address}
                </span>
              </button>
              <button className="noborder icon-button" onClick={this.removeViaPoint}>
                <Icon img="icon-icon_close" />
              </button>
            </div>
          )}
          <ViaPointSearchModal />
        </div>
        <div className={cx('time-selector-settings-row', className)}>
          <TimeSelectorContainer />
          <RightOffcanvasToggle
            onToggleClick={this.toggleCustomizeSearchOffcanvas}
            hasChanges={!this.props.hasDefaultPreferences}
          />
        </div>
      </div>
    );
  }
}

export default SummaryNavigation;
