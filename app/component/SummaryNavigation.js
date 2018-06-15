import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { routerShape } from 'react-router';
import OriginDestinationBar from './OriginDestinationBar';
import TimeSelectorContainer from './TimeSelectorContainer';
// import RightOffcanvasToggle from './RightOffcanvasToggle';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { parseLocation } from '../util/path';
import Icon from './Icon';
import SecondaryButton from './SecondaryButton';
import QuickSettingsPanel from './QuickSettingsPanel';
import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import * as ModeUtils from '../util/modeUtils';
import withBreakpoint from '../util/withBreakpoint';

class SummaryNavigation extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
    }).isRequired,
    hasDefaultPreferences: PropTypes.bool.isRequired,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    isQuickSettingsOpen: PropTypes.bool.isRequired,
    toggleQuickSettings: PropTypes.func.isRequired,
    breakpoint: PropTypes.string.isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    startTime: null,
    endTime: null,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    piwik: PropTypes.object,
    router: routerShape,
    location: PropTypes.object.isRequired,
  };

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

  getInitialViaPoints = val => {
    if (val) {
      if (typeof val === 'string') {
        return [val];
      }
      return val;
    }
    return [' '];
  };

  getOffcanvasState = () =>
    (this.context.location.state &&
      this.context.location.state.customizeSearchOffcanvas) ||
    false;

  checkQuickSettingsIcon = () => {
    if (this.props.isQuickSettingsOpen) {
      return `icon-icon_close`;
    } else if (
      !this.props.isQuickSettingsOpen &&
      !this.props.hasDefaultPreferences
    ) {
      return `icon-icon_settings-adjusted`;
    }
    return `icon-icon_settings`;
  };

  customizeSearchModules = {
    Drawer: () => importLazy(import('material-ui/Drawer')),
    CustomizeSearch: () => importLazy(import('./CustomizeSearch')),
  };

  toggleQuickSettingsPanel = () => {
    this.props.toggleQuickSettings(!this.props.isQuickSettingsOpen);
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

  renderStreetModeSelector = (config, router) =>
    config.features.showStreetModeQuickSelect && (
      <div className="street-mode-selector-panel-container">
        <StreetModeSelectorPanel
          selectedStreetMode={ModeUtils.getStreetMode(router.location, config)}
          selectStreetMode={(streetMode, isExclusive) =>
            ModeUtils.setStreetMode(streetMode, config, router, isExclusive)
          }
          streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
        />
      </div>
    );

  render() {
    const { config, router } = this.context;
    const quickSettingsIcon = this.checkQuickSettingsIcon();
    const className = cx({ 'bp-large': this.props.breakpoint === 'large' });
    let drawerWidth = 291;
    if (typeof window !== 'undefined') {
      drawerWidth =
        0.5 * window.innerWidth > 291
          ? Math.min(600, 0.5 * window.innerWidth)
          : 291;
    }

    return (
      <div style={{ background: '#f4f4f5' }}>
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
              />
            </Drawer>
          )}
        </LazilyLoad>
        <OriginDestinationBar
          className={className}
          origin={parseLocation(this.props.params.from)}
          destination={parseLocation(this.props.params.to)}
          initialViaPoints={this.getInitialViaPoints(
            this.context.location.query.intermediatePlaces,
          )}
        />
        {this.renderStreetModeSelector(config, router)}
        <div
          className={cx('quicksettings-separator-line', {
            hidden: !this.props.isQuickSettingsOpen,
          })}
        />
        <div
          className={cx('time-selector-settings-row', className, {
            quickSettingsOpen: this.props.isQuickSettingsOpen,
          })}
        >
          <TimeSelectorContainer
            startTime={this.props.startTime}
            endTime={this.props.endTime}
            serviceTimeRange={this.props.serviceTimeRange}
          />
          <div className="button-container">
            <div className="icon-holder">
              {!this.props.hasDefaultPreferences &&
              !this.props.isQuickSettingsOpen ? (
                <Icon img="icon-icon_attention" className="super-icon" />
              ) : null}
            </div>
            <SecondaryButton
              ariaLabel={this.props.isQuickSettingsOpen ? `close` : `settings`}
              buttonName={this.props.isQuickSettingsOpen ? `close` : `settings`}
              buttonClickAction={this.toggleQuickSettingsPanel}
              buttonIcon={quickSettingsIcon}
            />
          </div>
        </div>
        <QuickSettingsPanel
          visible={this.props.isQuickSettingsOpen}
          hasDefaultPreferences={this.props.hasDefaultPreferences}
        />
      </div>
    );
  }
}

export default withBreakpoint(SummaryNavigation);
