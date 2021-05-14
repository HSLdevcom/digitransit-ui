import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';

import { addAnalyticsEvent } from '../util/analyticsUtils';
import DisruptionInfo from './DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import ComponentUsageExample from './ComponentUsageExample';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import CanceledLegsBar from './CanceledLegsBar';
import LoginButton from './LoginButton';
import UserMenu from './UserMenu';

const AppBar = (
  { showLogo, title, homeUrl, logo, user, breakpoint, titleClicked },
  { config, intl, match },
) => {
  const { location } = match;
  const url = encodeURI(`${window.location?.origin || ''}${location.pathname}`);
  const params = location.search && location.search.substring(1);

  return (
    <>
      <DisruptionInfo />
      <MessageBar breakpoint={breakpoint} />
      <CanceledLegsBar />
      <nav className={`top-bar ${breakpoint !== 'large' ? 'mobile' : ''}`}>
        <section className="title">
          <button
            aria-label={intl.formatMessage({
              id: 'to-frontpage',
              defaultMessage: 'To frontpage',
            })}
            type="button"
            onClick={e => {
              titleClicked(e);
              addAnalyticsEvent({
                category: 'Navigation',
                action: 'Home',
                name: null,
              });
            }}
          >
            <LogoSmall showLogo={showLogo} logo={logo} title={title} />
          </button>
        </section>
        <section className="controls">
          {config.allowLogin &&
            (!user.name ? (
              <LoginButton loginUrl={`/login?url=${url}&${params}`} />
            ) : (
              <UserMenu
                user={user}
                menuItems={[
                  {
                    key: 'dropdown-item-1',
                    messageId: 'logout',
                    href: '/logout',
                    onClick: event => {
                      event.preventDefault();
                      window.location.href = '/logout';
                    },
                  },
                ]}
                isMobile
              />
            ))}
          <MainMenuContainer homeUrl={homeUrl} breakpoint={breakpoint} />
        </section>
      </nav>
    </>
  );
};

AppBar.displayName = 'AppBar';

AppBar.description = () => (
  <div>
    <p>AppBar of application for small display</p>
    <ComponentUsageExample description="">
      <AppBar title="Reittiopas.hsl.fi" className="fullscreen" />
    </ComponentUsageExample>
    <ComponentUsageExample description="no back button">
      <AppBar title="Reittiopas.hsl.fi" className="fullscreen" />
    </ComponentUsageExample>
  </div>
);

AppBar.propTypes = {
  showLogo: PropTypes.bool,
  title: PropTypes.node,
  homeUrl: PropTypes.string,
  logo: PropTypes.string,
  user: PropTypes.object,
  breakpoint: PropTypes.string,
  titleClicked: PropTypes.func,
};

AppBar.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  match: matchShape.isRequired,
};

export default AppBar;
