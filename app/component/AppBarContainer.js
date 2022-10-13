import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withBreakpoint from '../util/withBreakpoint';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';

import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  AppBar: () => importLazy(import('./AppBar')),
  AppBarSmall: () => importLazy(import('./AppBarSmall')),
  AppBarHsl: () => importLazy(import('./AppBarHsl')),
  MessageBar: () => importLazy(import('./MessageBar')),
};

// eslint-disable-next-line no-unused-vars
const titleClicked = (router, homeUrl, match) => {
  const mode = match.location.query.mapMode;
  if (mode) {
    router.push(`${homeUrl}?mapMode=${match.location.query.mapMode}`);
  } else {
    router.push(homeUrl);
  }
};

// DT-3375: added style
const AppBarContainer = ({
  router,
  match,
  executeAction,
  homeUrl,
  logo,
  logoSmall,
  user,
  favourites,
  style,
  lang,
  breakpoint,
  ...args
}) => {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  return (
    <>
      <a
        href="#mainContent"
        id="skip-to-content-link"
        style={{ display: isClient ? 'block sr-only' : 'none' }}
      >
        <FormattedMessage
          id="skip-to-content"
          defaultMessage="Skip to content"
        />
      </a>
      <LazilyLoad modules={modules}>
        {/* eslint-disable no-nested-ternary */}
        {({ AppBar, AppBarSmall, AppBarHsl, MessageBar }) =>
          style === 'hsl' ? (
            <div
              className="hsl-header-container"
              style={{ display: isClient ? 'block' : 'none' }}
            >
              <AppBarHsl user={user} lang={lang} favourites={favourites} />
              <MessageBar breakpoint={breakpoint} />{' '}
            </div>
          ) : navigator?.userAgent?.endsWith('smart-village-app') &&
            breakpoint !== 'large' ? (
            <AppBarSmall
              {...args}
              showLogo
              logo={logoSmall}
              breakpoint={breakpoint}
              titleClicked={() => {
                executeAction(storeOrigin, {});
                executeAction(storeDestination, {});
                router.push(homeUrl);
              }}
            />
          ) : (
            <AppBar
              {...args}
              showLogo
              logo={logo}
              homeUrl={homeUrl}
              user={user}
              breakpoint={breakpoint}
              titleClicked={() => {
                executeAction(storeOrigin, {});
                executeAction(storeDestination, {});
                router.push(homeUrl);
              }}
            />
          )
        }
        {/* eslint-enable no-nested-ternary */}
      </LazilyLoad>
    </>
  );
};

AppBarContainer.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  executeAction: PropTypes.func,
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  logoSmall: PropTypes.string,
  user: PropTypes.object,
  favourites: PropTypes.array,
  style: PropTypes.string.isRequired,
  lang: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
};

const AppBarContainerWithBreakpoint = withBreakpoint(AppBarContainer);

const WithContext = connectToStores(
  getContext({
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    executeAction: PropTypes.func,
  })(AppBarContainerWithBreakpoint),
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  context => ({
    user: context.getStore('UserStore').getUser(),
    lang: context.getStore('PreferencesStore').getLanguage(),
    favourites: context.getStore('FavouriteStore').getFavourites(),
  }),
);

WithContext.propTypes = {
  title: PropTypes.node,
};

export default WithContext;
