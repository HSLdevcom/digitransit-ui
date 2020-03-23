import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import { DesktopOrMobile } from '../util/withBreakpoint';

// DT-3375: added style
const AppBarContainer = ({
  router,
  match,
  homeUrl,
  logo,
  user,
  style,
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
            <div className="top-bar">
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  padding: 10,
                  paddingTop: 2,
                  paddingBottom: 2,
                }}
              >
                HSL navi - small
              </span>
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
            <div className="top-bar">
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '2rem',
                  padding: 60,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                HSL navi - large
              </span>
            </div>
          );
        }
        return (
          <AppBarLarge
            {...args}
            logo={logo}
            titleClicked={() => router.push(homeUrl)}
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
