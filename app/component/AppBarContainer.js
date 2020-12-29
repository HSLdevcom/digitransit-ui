import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import { DesktopOrMobile } from '../util/withBreakpoint';
import AppBarHsl from './AppBarHsl'; // DT-3376
import MessageBar from './MessageBar';

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
              showLogo={match.location.pathname === homeUrl}
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
              titleClicked={() => router.push(homeUrl)}
              user={user}
            />
          );
        }}
      />
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
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
};

export default WithContext;
