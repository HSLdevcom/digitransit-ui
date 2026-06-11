import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'found';
import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import MainMenuContainer from './MainMenuContainer';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import LoginButton from './LoginButton';
import UserMenu from './UserMenu';
import { useConfigContext } from '../configurations/ConfigContext';

export default function AppBar(
  { showLogo = false, title, homeUrl, logo, breakpoint, titleClicked },
  { getStore },
) {
  const intl = useIntl();
  const config = useConfigContext();
  const { user } = config;
  const { match } = useRouter();
  const { location } = match;
  const [menuOpen, setMenuOpen] = useState(
    window.sessionStorage.menuOpen === 'true',
  );
  const url = encodeURI(`${window.location?.origin || ''}${location.pathname}`);
  const params = location.search && location.search.substring(1);

  const setMenuOpenWithAnalytics = newState => {
    addAnalyticsEvent({
      category: 'Navigation',
      action: newState ? 'OpenMenu' : 'CloseMenu',
      name: null,
    });
    // Set sessionStorage menuOpen to false on closing the menu so it doesn't pop up opened on later refreshes.
    window.sessionStorage.setItem('menuOpen', false);
    setMenuOpen(newState);
  };

  return (
    <>
      {process.env.NODE_ENV !== 'test' && (
        <MessageBar breakpoint={breakpoint} />
      )}
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
                      getStore('FavouriteStore').storeFavourites();
                      window.location.href = '/logout';
                    },
                  },
                ]}
                isMobile
              />
            ))}
          {menuOpen && (
            <MainMenuContainer
              homeUrl={homeUrl}
              closeMenu={() => setMenuOpenWithAnalytics(false)}
              breakpoint={breakpoint}
            />
          )}
          {config.mainMenu.show ? (
            <div className="icon-holder cursor-pointer main-menu-toggle">
              <button
                type="button"
                id="openMenuButton"
                aria-label={intl.formatMessage({
                  id: 'main-menu-label-open',
                  defaultMessage: 'Open the main menu',
                })}
                onClick={() => setMenuOpenWithAnalytics(true)}
                className="noborder cursor-pointer"
              >
                <Icon img="icon_menu" className="icon" />
              </button>
            </div>
          ) : null}
        </section>
      </nav>
    </>
  );
}

AppBar.propTypes = {
  showLogo: PropTypes.bool,
  title: PropTypes.node,
  homeUrl: PropTypes.string,
  logo: PropTypes.string,
  breakpoint: PropTypes.string,
  titleClicked: PropTypes.func.isRequired,
};

AppBar.contextTypes = {
  getStore: PropTypes.func.isRequired,
};
