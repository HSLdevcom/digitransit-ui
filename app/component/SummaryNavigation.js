import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import { routerShape } from 'react-router';
import OriginDestinationBar from './OriginDestinationBar';
import TimeSelectorContainer from './TimeSelectorContainer';
// import RightOffcanvasToggle from './RightOffcanvasToggle';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { parseLocation } from '../util/path';

import SecondaryButton from './SecondaryButton';
import QuickSettingsPanel from './QuickSettingsPanel';

class SummaryNavigation extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
    }).isRequired,
    hasDefaultPreferences: PropTypes.bool.isRequired,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
  };

  static defaultProps = {
    startTime: null,
    endTime: null,
  };

  static contextTypes = {
    piwik: PropTypes.object,
    router: routerShape,
    location: PropTypes.object.isRequired,
    breakpoint: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      quickSettingsPanelVisible: false,
      optimizedRouteParams: undefined,
      optimizedRouteName: undefined,
    };
  }

  componentDidMount() {
    this.unlisten = this.context.router.listen(location => {
      if (
        this.context.location.state &&
        this.context.location.state.customizeSearchOffcanvas &&
        (!location.state || !location.state.customizeSearchOffcanvas) &&
        !this.transitionDone &&
        location.pathname.startsWith('/reitti/')
      ) {
        this.transitionDone = true;
        const newLocation = {
          ...this.context.location,
          state: {
            ...this.context.location.state,
            customizeSearchOffcanvas: false,
          },
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

  onRequestChange = newState => {
    this.internalSetOffcanvas(newState);
  };

  getOffcanvasState = () =>
    (this.context.location.state &&
      this.context.location.state.customizeSearchOffcanvas) ||
    false;

  setOptimizedRouteName = val => {
    this.setState({ optimizedRouteName: val });
  };

  setOptimizedRoute = modeName => {
    this.setState({ optimizedRouteParams: modeName });
  };

  customizeSearchModules = {
    Drawer: () => importLazy(import('material-ui/Drawer')),
    CustomizeSearch: () => importLazy(import('./CustomizeSearch')),
  };

  toggleQuickSettingsPanel = () => {
    this.setState({
      quickSettingsPanelVisible: !this.state.quickSettingsPanelVisible,
    });
  };

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  internalSetOffcanvas = newState => {
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
  };

  unsetOptimizedRouteParams = () => {
    this.setState({ optimizedRouteParams: undefined });
  };

  renderTimeSelectorContainer = ({ done, props }) =>
    done ? (
      <TimeSelectorContainer
        {...props}
        startTime={this.props.startTime}
        endTime={this.props.endTime}
      />
    ) : (
      undefined
    );

  render() {
    const className = cx({ 'bp-large': this.context.breakpoint === 'large' });
    let drawerWidth = 291;
    if (typeof window !== 'undefined') {
      drawerWidth =
        0.5 * window.innerWidth > 291
          ? Math.min(600, 0.5 * window.innerWidth)
          : 291;
    }

    return (
      <div>
        <LazilyLoad modules={this.customizeSearchModules}>
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
                optimizedRouteParams={this.state.optimizedRouteParams}
                unsetOptimizedRouteParams={this.unsetOptimizedRouteParams}
                optimizedRouteName={this.state.optimizedRouteName}
              />
            </Drawer>
          )}
        </LazilyLoad>
        <OriginDestinationBar
          className={className}
          origin={parseLocation(this.props.params.from)}
          destination={parseLocation(this.props.params.to)}
        />
        <div
          className={cx('time-selector-settings-row', className, {
            quickSettingsOpen: this.state.quickSettingsPanelVisible,
          })}
        >
          <Relay.Renderer
            Container={TimeSelectorContainer}
            queryConfig={{
              params: {},
              name: 'ServiceTimeRangRoute',
              queries: {
                serviceTimeRange: () => Relay.QL`query { serviceTimeRange }`,
              },
            }}
            environment={Relay.Store}
            render={this.renderTimeSelectorContainer}
          />
          <SecondaryButton
            ariaLabel={
              this.state.quickSettingsPanelVisible ? `close` : `settings`
            }
            buttonName={
              this.state.quickSettingsPanelVisible ? `close` : `settings`
            }
            buttonClickAction={this.toggleQuickSettingsPanel}
            buttonIcon={
              this.state.quickSettingsPanelVisible
                ? `icon-icon_close`
                : `icon-icon_settings`
            }
          />
        </div>
        <QuickSettingsPanel
          visible={this.state.quickSettingsPanelVisible}
          hasDefaultPreferences={this.props.hasDefaultPreferences}
          optimizedRouteParams={this.setOptimizedRoute}
          setOptimizedRouteName={this.setOptimizedRouteName}
        />
      </div>
    );
  }
}

export default SummaryNavigation;
