import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import cx from 'classnames';
import some from 'lodash/some';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape } from 'found';
import getContext from 'recompose/getContext';
import Modal from '@hsl-fi/modal';
import {
  getHomeUrl,
  PREFIX_STOPS,
  PREFIX_ROUTES,
  PREFIX_TERMINALS,
  LOCAL_STORAGE_EMITTER_PATH,
} from '../util/path';
import { dtLocationShape } from '../util/shapes';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import ErrorBoundary from './ErrorBoundary';
import withBreakpoint, { DesktopOrMobile } from '../util/withBreakpoint';
import { getUser } from '../util/apiUtils';
import setUser from '../action/userActions';
import { setSettingsOpen } from '../action/userPreferencesActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import MapLayersDialogContent from './MapLayersDialogContent';
import PreferencesStore from '../store/PreferencesStore';
import { hasSeenPopup, markPopupAsSeen } from '../store/localStorage';

class TopLevel extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    header: PropTypes.node,
    map: PropTypes.any,
    content: PropTypes.node,
    title: PropTypes.node,
    meta: PropTypes.node,
    match: matchShape.isRequired,
    origin: dtLocationShape,
    user: PropTypes.object,
    settingsOpen: PropTypes.bool,
    router: routerShape,
    selectFromMapHeader: PropTypes.node,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    headers: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    origin: {},
  };

  static childContextTypes = {
    router: routerShape,
    match: matchShape,
  };

  getChildContext() {
    return {
      match: this.props.match,
      router: this.props.router,
    };
  }

  isMobile() {
    return this.props.breakpoint !== 'large';
  }

  // eslint-disable-next-line class-methods-use-this
  MapLayersDialogContainer({ children, settingsOpen, isMobile }) {
    return (
      <div
        className={cx(
          'offcanvas-layers',
          isMobile && 'mobile',
          'menu-content',
          settingsOpen ? 'menu-content-open' : 'menu-content-close',
        )}
      >
        {children}
      </div>
    );
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      showPopup: !hasSeenPopup(),
    };
    if (
      this.context.config.allowLogin &&
      !this.props.user.name &&
      this.props.match.location.pathname !== LOCAL_STORAGE_EMITTER_PATH
    ) {
      getUser()
        .then(user => {
          this.context.executeAction(setUser, {
            ...user,
          });
        })
        .catch(() => {
          this.context.executeAction(setUser, { notLogged: true });
        });
    }
  }

  componentDidMount() {
    import(
      /* webpackChunkName: "main" */ `../configurations/images/${this.context.config.logo}`
    ).then(logo => {
      this.setState({ logo: logo.default });
    });
  }

  componentDidUpdate(prevProps) {
    // send tracking calls when url changes
    // listen for this here instead of in router directly to get access to old location as well
    const oldLocation = prevProps.match.location.pathname;
    const newLocation = this.props.match.location.pathname;
    if (oldLocation && newLocation && oldLocation !== newLocation) {
      addAnalyticsEvent({
        event: 'Pageview',
        url: newLocation,
      });
    }

    // send tracking calls when visiting a new stop or route
    const newContext = newLocation.slice(1, newLocation.indexOf('/', 1));
    switch (newContext) {
      case PREFIX_ROUTES:
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevProps.match.params.routeId &&
            this.props.match.params.routeId &&
            prevProps.match.params.routeId !== this.props.match.params.routeId)
        ) {
          addAnalyticsEvent({
            category: 'Route',
            action: 'OpenRoute',
            name: this.props.match.params.routeId,
          });
        }
        break;
      case PREFIX_STOPS:
      case PREFIX_TERMINALS:
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevProps.match.params.stopId &&
            this.props.match.params.stopId &&
            prevProps.match.params.stopId !== this.props.match.params.stopId) ||
          (prevProps.match.params.terminalId &&
            this.props.match.params.terminalId &&
            prevProps.match.params.terminalId !==
              this.props.match.params.terminalId)
        ) {
          addAnalyticsEvent({
            category: 'Stop',
            action: 'OpenStop',
            name:
              this.props.match.params.stopId ||
              this.props.match.params.terminalId,
          });
        }
        break;
      default:
        break;
    }
  }

  render() {
    this.topBarOptions = Object.assign(
      {},
      ...this.props.match.routes.map(route => route.topBarOptions),
    );
    this.disableMapOnMobile = some(
      this.props.match.routes,
      route => route.disableMapOnMobile,
    );

    let content;

    let popup = [];
    const { welcomePopup } = this.context.config;
    if (this.state.showPopup && welcomePopup.enabled) {
      popup = (
        <Modal
          appElement="#app"
          contentLabel=""
          closeButtonLabel="close"
          isOpen={this.state.showPopup}
          onCrossClick={() => {
            this.setState({ showPopup: false });
            markPopupAsSeen();
          }}
          className="welcome-modal"
          overlayClassName="map-routing-modal-overlay"
        >
          <h2 className="welcome-modal-header">{welcomePopup.heading}</h2>
          <div>
            {welcomePopup.paragraphs.map(p => (
              <p key="123">{p}</p>
            ))}
          </div>
        </Modal>
      );
    }

    const homeUrl = getHomeUrl(
      this.props.origin,
      this.context.config.indexPath,
    );
    if (this.props.children || !(this.props.map || this.props.header)) {
      content = this.props.children || this.props.content;
    } else {
      content = (
        <DesktopOrMobile
          mobile={() => (
            <MobileView
              map={this.disableMapOnMobile ? null : this.props.map}
              content={this.props.content}
              header={this.props.header}
              selectFromMapHeader={this.props.selectFromMapHeader}
            />
          )}
          desktop={() => (
            <DesktopView
              title={this.props.title}
              map={this.props.map}
              content={this.props.content}
              header={this.props.header}
              bckBtnVisible={false}
            />
          )}
        />
      );
    }

    return (
      <Fragment>
        {!this.topBarOptions.hidden && (
          // DT-3375: added style
          <AppBarContainer
            title={this.context.config.title}
            {...this.topBarOptions}
            {...this.state}
            homeUrl={homeUrl}
            style={this.context.config.appBarStyle}
          />
        )}
        <section
          id="mainContent"
          className={cx('content', this.isMobile() && 'mobile')}
        >
          {this.props.meta}
          <noscript>This page requires JavaScript to run.</noscript>
          <ErrorBoundary
            key={
              this.props.match.location.state &&
              this.props.match.location.state.errorBoundaryKey
                ? this.props.match.location.state.errorBoundaryKey
                : 0
            }
          >
            {this.context.config.map.showLayerSelector &&
              this.props.settingsOpen !== null && (
                <this.MapLayersDialogContainer
                  settingsOpen={this.props.settingsOpen}
                  isMobile={this.isMobile()}
                >
                  <MapLayersDialogContent
                    open={this.props.settingsOpen}
                    setOpen={open =>
                      this.context.executeAction(setSettingsOpen, open)
                    }
                  />
                </this.MapLayersDialogContainer>
              )}
            {content}
          </ErrorBoundary>
        </section>
        {popup}
      </Fragment>
    );
  }
}

export default withBreakpoint(
  connectToStores(
    getContext({ config: PropTypes.object })(TopLevel),
    ['OriginStore', 'UserStore', PreferencesStore],
    ({ getStore }) => ({
      origin: getStore('OriginStore').getOrigin(),
      user: getStore('UserStore').getUser(),
      settingsOpen: getStore(PreferencesStore).getSettingsOpen(),
    }),
  ),
);
