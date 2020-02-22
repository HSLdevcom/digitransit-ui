import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import { DesktopOrMobile } from '../util/withBreakpoint';

const AppBarContainer = ({ router, match, homeUrl, logo, user, ...args }) => (
  <Fragment>
    <a href="#mainContent" id="skip-to-content-link">
      <FormattedMessage id="skip-to-content" defaultMessage="Skip to content" />
    </a>
    <DesktopOrMobile
      mobile={() => (
        <AppBarSmall
          {...args}
          showLogo={match.location.pathname === homeUrl}
          logo={logo}
          homeUrl={homeUrl}
          user={user}
        />
      )}
      desktop={() => (
        <AppBarLarge
          {...args}
          logo={logo}
          titleClicked={() => router.push(homeUrl)}
          user={user}
        />
      )}
    />
  </Fragment>
);

AppBarContainer.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  user: PropTypes.object,
};

const WithContext = connectToStores(
  getContext({
    match: matchShape.isRequired,
    router: routerShape.isRequired,
  })(AppBarContainer),
  ['UserStore'],
  context => ({
    user: context.getStore('UserStore').getUser(),
  }),
);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
};

export default WithContext;
