/* eslint-disable react/no-unstable-nested-components */
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useRef } from 'react';
import some from 'lodash/some';
import { matchShape } from '../../utils/client/shapes';
import {
  getHomeUrl,
  PREFIX_STOPS,
  PREFIX_ROUTES,
  PREFIX_TERMINALS,
  PREFIX_BIKESTATIONS,
} from '../../utils/shared/path';
import getAssetUrl from '../assets/assetUrl';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import ErrorBoundary from './ErrorBoundary';
import { DesktopOrMobile } from '../../utils/client/withBreakpoint';
import {
  addAnalyticsEvent,
  handleUserAnalytics,
} from '../../utils/shared/analyticsUtils';
import { useOrigin } from '../hooks/ItineraryLocationContext';
import { useConfigContext } from '../client/ConfigContext';

export default function TopLevel({
  children,
  header,
  map,
  content,
  title,
  meta,
  match,
}) {
  const origin = useOrigin();
  const config = useConfigContext();
  const prevMatchRef = useRef(match);

  useEffect(() => {
    const prevMatch = prevMatchRef.current;
    prevMatchRef.current = match;
    if (prevMatch === match) {
      return;
    }

    // send tracking calls when url changes
    // listen for this here instead of in router directly to get access to old location as well
    const oldLocation = prevMatch.location.pathname;
    const newLocation = match.location.pathname;
    if (oldLocation && newLocation && oldLocation !== newLocation) {
      handleUserAnalytics(config);
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
          (prevMatch.params.routeId &&
            match.params.routeId &&
            prevMatch.params.routeId !== match.params.routeId)
        ) {
          addAnalyticsEvent({
            category: 'Route',
            action: 'OpenRoute',
            name: match.params.routeId,
          });
        }
        break;

      case PREFIX_STOPS:
      case PREFIX_TERMINALS:
      case PREFIX_BIKESTATIONS:
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevMatch.params.stopId &&
            match.params.stopId &&
            prevMatch.params.stopId !== match.params.stopId) ||
          (prevMatch.params.terminalId &&
            match.params.terminalId &&
            prevMatch.params.terminalId !== match.params.terminalId) ||
          (prevMatch.params.id &&
            match.params.id &&
            prevMatch.params.id !== match.params.id)
        ) {
          addAnalyticsEvent({
            category: 'Stop',
            action: 'OpenStop',
            name:
              match.params.stopId || match.params.terminalId || match.params.id,
          });
        }
        break;
      default:
        break;
    }
  }, [match]);

  const topBarOptions = Object.assign(
    {},
    ...match.routes.map(route => route.topBarOptions),
  );
  const disableMapOnMobile = some(
    match.routes,
    route => route.disableMapOnMobile,
  );

  let renderedContent;

  const homeUrl = getHomeUrl(origin, config.indexPath);
  if (children || !(map || header)) {
    renderedContent = children || content;
  } else {
    renderedContent = (
      <DesktopOrMobile
        mobile={() => (
          <MobileView
            map={disableMapOnMobile ? null : map}
            content={content}
            header={header}
          />
        )}
        desktop={() => (
          <DesktopView
            title={title}
            map={map}
            content={content}
            header={header}
            bckBtnVisible={false}
          />
        )}
      />
    );
  }

  return (
    <Fragment>
      {!topBarOptions.hidden && (
        <AppBarContainer
          {...topBarOptions}
          logo={getAssetUrl(config.logo)}
          homeUrl={homeUrl}
          style={config.appBarStyle}
        />
      )}
      <section id="mainContent" className="content">
        {meta}
        <noscript>This page requires JavaScript to run.</noscript>
        {renderedContent && (
          <ErrorBoundary
            key={
              match.location.state && match.location.state.errorBoundaryKey
                ? match.location.state.errorBoundaryKey
                : 0
            }
          >
            {renderedContent}
          </ErrorBoundary>
        )}
      </section>
    </Fragment>
  );
}

TopLevel.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  map: PropTypes.node,
  content: PropTypes.node,
  title: PropTypes.node,
  meta: PropTypes.node,
  match: matchShape.isRequired,
};
