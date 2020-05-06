import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';

import LazilyLoad, { importLazy } from './LazilyLoad';
import OriginDestinationBar from './OriginDestinationBar';
import QuickSettingsPanel from './QuickSettingsPanel';
import { getDrawerWidth, isBrowser } from '../util/browser';
import { parseLocation, PREFIX_ITINERARY_SUMMARY } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { setSettingsData } from '../util/queryUtils';

class SummaryNavigation extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
    }).isRequired,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
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
    router: routerShape,
    match: matchShape.isRequired,
  };

  customizeSearchModules = {
    Drawer: () => importLazy(import('material-ui/Drawer')),
    CustomizeSearch: () => importLazy(import('./CustomizeSearchNew')),
  };

  componentDidMount() {
    this.unlisten = this.context.router.addTransitionHook(location => {
      if (
        this.context.match.location.state &&
        this.context.match.location.state.customizeSearchOffcanvas &&
        (!location.state || !location.state.customizeSearchOffcanvas) &&
        !this.transitionDone &&
        location.pathname.startsWith(`/${PREFIX_ITINERARY_SUMMARY}/`)
      ) {
        this.transitionDone = true;
        const newLocation = {
          ...this.context.match.location,
          state: {
            ...this.context.match.location.state,
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
    setSettingsData(this.context.match, this.context.router);
    this.internalSetOffcanvas(newState);
  };

  getOffcanvasState = () =>
    (this.context.match.location.state &&
      this.context.match.location.state.customizeSearchOffcanvas) ||
    false;

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  internalSetOffcanvas = newState => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'ExtraSettingsPanelClick',
      name: newState ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
    });
    if (newState) {
      this.context.router.push({
        ...this.context.match.location,
        state: {
          ...this.context.match.location.state,
          customizeSearchOffcanvas: newState,
        },
      });
    } else {
      this.context.router.go(-1);
    }
  };

  render() {
    const className = cx({ 'bp-large': this.props.breakpoint === 'large' });
    const isOpen = this.getOffcanvasState();

    return (
      <div className="summary-navigation-container">
        <OriginDestinationBar
          className={className}
          origin={parseLocation(this.props.params.from)}
          destination={parseLocation(this.props.params.to)}
        />
        {isBrowser && (
          <React.Fragment>
            <QuickSettingsPanel
              timeSelectorStartTime={this.props.startTime}
              timeSelectorEndTime={this.props.endTime}
              timeSelectorServiceTimeRange={this.props.serviceTimeRange}
            />
          </React.Fragment>
        )}
        <LazilyLoad modules={this.customizeSearchModules}>
          {({ Drawer, CustomizeSearch }) => (
            <Drawer
              className="offcanvas"
              disableSwipeToOpen
              openSecondary
              docked={false}
              open={isOpen}
              onRequestChange={this.onRequestChange}
              // Needed for the closing arrow button that's left of the drawer.
              containerStyle={{
                background: 'transparent',
                boxShadow: 'none',
                overflow: 'visible',
              }}
              style={{
                // hide root element from screen reader in sync with drawer animation
                transition: 'visibility 450ms',
                visibility: isOpen ? 'visible' : 'hidden',
              }}
              width={getDrawerWidth(window)}
            >
              <CustomizeSearch
                params={this.props.params}
                onToggleClick={this.toggleCustomizeSearchOffcanvas}
              />
            </Drawer>
          )}
        </LazilyLoad>
      </div>
    );
  }
}

export default withBreakpoint(SummaryNavigation);
