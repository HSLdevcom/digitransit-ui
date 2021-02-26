import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { DesktopOrMobile } from '../util/withBreakpoint';

import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  AppBarSmall: () => importLazy(import('./AppBarSmall')),
  AppBarLarge: () => importLazy(import('./AppBarLarge')),
  AppBarHsl: () => importLazy(import('./AppBarHsl')),
  MessageBar: () => importLazy(import('./MessageBar')),
};

// DT-3375: added style
const AppBarContainer = ({
  router,
  match,
  homeUrl,
  logo,
  user,
  style,
  lang,
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
        style={{ display: isClient ? 'block' : 'none' }}
      >
        <FormattedMessage
          id="skip-to-content"
          defaultMessage="Skip to content"
        />
      </a>
      <LazilyLoad modules={modules}>
        {({ AppBarSmall, AppBarLarge, AppBarHsl, MessageBar }) => (
          <DesktopOrMobile
            mobile={() => {
              return style === 'hsl' ? (
                <div style={{ display: isClient ? 'block' : 'none' }}>
                  <AppBarHsl user={user} lang={lang} />
                  <MessageBar mobile />{' '}
                </div>
              ) : (
                <AppBarSmall
                  {...args}
                  showLogo
                  logo={logo}
                  homeUrl={homeUrl}
                  user={user}
                />
              );
            }}
            desktop={() => {
              return style === 'hsl' ? (
                <div style={{ display: isClient ? 'block' : 'none' }}>
                  <AppBarHsl user={user} lang={lang} />
                  <MessageBar />{' '}
                </div>
              ) : (
                <AppBarLarge
                  {...args}
                  logo={logo}
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
                  user={user}
                />
              );
            }}
          />
        )}
      </LazilyLoad>
    </>
  );
};

AppBarContainer.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  user: PropTypes.object,
  style: PropTypes.string.isRequired, // DT-3375
  lang: PropTypes.string, // DT-3376
};

const WithContext = connectToStores(
  getContext({
    match: matchShape.isRequired,
    router: routerShape.isRequired,
  })(AppBarContainer),
  ['UserStore', 'PreferencesStore'],
  context => ({
    user: context.getStore('UserStore').getUser(),
    lang: context.getStore('PreferencesStore').getLanguage(), // DT-3376
  }),
);

WithContext.propTypes = {
  title: PropTypes.node,
};

export default WithContext;
