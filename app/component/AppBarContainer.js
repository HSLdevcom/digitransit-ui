import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import { DesktopOrMobile } from '../util/withBreakpoint';
import AppBarHsl from './AppBarHsl'; // DT-3376
import MessageBar from './MessageBar';

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
  homeUrl,
  logo,
  user,
  style,
  lang,
  ...args
}) => (
  <Fragment>
    <a href="#mainContent" id="skip-to-content-link">
      <FormattedMessage id="skip-to-content" defaultMessage="Skip to content" />
    </a>
    <DesktopOrMobile
      mobile={() => {
        if (style === 'hsl') {
          return (
            <div>
              {' '}
              <AppBarHsl user={user} lang={lang} />
              <MessageBar mobile />{' '}
            </div>
          );
        }
        return (
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
        if (style === 'hsl') {
          return (
            <div>
              {' '}
              <AppBarHsl user={user} lang={lang} />
              <MessageBar />{' '}
            </div>
          );
        }
        return (
          <AppBarLarge
            {...args}
            logo={logo}
            titleClicked={() => titleClicked(router, homeUrl, match)}
            user={user}
          />
        );
      }}
    />
  </Fragment>
);

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
