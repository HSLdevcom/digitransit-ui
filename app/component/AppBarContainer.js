import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import { DesktopOrMobile } from '../util/withBreakpoint';

const AppBarContainer = ({
  router,
  location,
  homeUrl,
  logo,
  loggedIn,
  logIn,
  ...args
}) => (
  <Fragment>
    <a href="#mainContent" id="skip-to-content-link">
      <FormattedMessage id="skip-to-content" defaultMessage="Skip to content" />
    </a>
    <DesktopOrMobile
      mobile={() => (
        <AppBarSmall
          {...args}
          showLogo
          logo={logo}
          homeUrl={homeUrl}
          loggedIn={loggedIn}
          logIn={() => logIn()}
        />
      )}
      desktop={() => (
        <AppBarLarge
          {...args}
          logo={logo}
          titleClicked={() => router.push(homeUrl)}
          loggedIn={loggedIn}
          logIn={() => logIn()}
        />
      )}
    />
  </Fragment>
);

AppBarContainer.propTypes = {
  location: locationShape.isRequired,
  router: routerShape.isRequired,
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  loggedIn: PropTypes.bool,
  logIn: PropTypes.func,
};

AppBarContainer.defaultProps = {
  loggedIn: false,
  logIn: () => {},
};

const WithContext = getContext({
  location: locationShape.isRequired,
  router: routerShape.isRequired,
})(AppBarContainer);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
};

export default WithContext;
