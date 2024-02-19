import PropTypes from 'prop-types';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withBreakpoint from '../util/withBreakpoint';

const AppBar = lazy(() => import('./AppBar'));
const AppBarHsl = lazy(() => import('./AppBarHsl'));
const MessageBar = lazy(() => import('./MessageBar'));

const AppBarContainer = ({
  router,
  match,
  homeUrl,
  logo,
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

  if (!isClient) {
    return null;
  }
  return (
    <>
      <a
        href="#mainContent"
        id="skip-to-content-link"
        style={{ display: 'block sr-only' }}
      >
        <FormattedMessage
          id="skip-to-content"
          defaultMessage="Skip to content"
        />
      </a>
      {style === 'hsl' ? (
        <div className="hsl-header-container" style={{ display: 'block' }}>
          <Suspense fallback="">
            <AppBarHsl user={user} lang={lang} favourites={favourites} />
            <MessageBar breakpoint={breakpoint} />
          </Suspense>
        </div>
      ) : (
        <Suspense fallback="">
          <AppBar
            {...args}
            showLogo
            logo={logo}
            homeUrl={homeUrl}
            user={user}
            breakpoint={breakpoint}
            titleClicked={() =>
              router.push({
                ...match.location,
                pathname: homeUrl,
                state: {
                  ...match.location.state,
                  errorBoundaryKey:
                    match.location.state &&
                    match.location.state.errorBoundaryKey
                      ? match.location.state.errorBoundaryKey + 1
                      : 1,
                },
              })
            }
          />
        </Suspense>
      )}
    </>
  );
};

AppBarContainer.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  user: PropTypes.object,
  favourites: PropTypes.arrayOf(PropTypes.object),
  style: PropTypes.string.isRequired,
  lang: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
};

const AppBarContainerWithBreakpoint = withBreakpoint(AppBarContainer);

const WithContext = connectToStores(
  getContext({
    match: matchShape.isRequired,
    router: routerShape.isRequired,
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
