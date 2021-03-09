import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import { addAnalyticsEvent } from '../util/analyticsUtils';
import DisruptionInfo from './DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import ComponentUsageExample from './ComponentUsageExample';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import CanceledLegsBar from './CanceledLegsBar';
import LoginButton from './LoginButton';
import UserInfo from './UserInfo';

const AppBar = (
  { showLogo, title, homeUrl, logo, user, breakpoint, titleClicked },
  { config },
) => (
  <>
    <DisruptionInfo />
    <nav className={`top-bar ${breakpoint !== 'large' ? 'mobile' : ''}`}>
      <section className="title">
        <button
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
            <LoginButton />
          ) : (
            <UserInfo
              user={user}
              list={[
                {
                  key: 'dropdown-item-1',
                  messageId: 'logout',
                  href: '/logout',
                },
              ]}
              isMobile
            />
          ))}
        <MainMenuContainer
          homeUrl={homeUrl}
          user={user}
          breakpoint={breakpoint}
        />
      </section>
    </nav>
    <MessageBar />
    <CanceledLegsBar />
  </>
);

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
};

export default AppBar;
