import PropTypes from 'prop-types';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'found';
import Icon from './Icon';
import { addAnalyticsEvent } from '../../utils/shared/analyticsUtils';
import MainMenuContainer from './MainMenuContainer';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import LoginButton from './LoginButton';
import UserMenu from './UserMenu';
import { useConfigContext } from '../hooks/ConfigContext';
import { getLoginPath, getLogoutPath } from '../../utils/shared/path';

export default function AppBar({
  showLogo = false,
  homeUrl,
  logo,
  breakpoint,
  titleClicked,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { user } = config;
  const { router, match } = useRouter();
  const returnTo = router.createHref(match.location);
  const [menuOpen, setMenuOpen] = useState(
    window.sessionStorage.menuOpen === 'true',
  );

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
      <MessageBar breakpoint={breakpoint} />
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
            <LogoSmall showLogo={showLogo} logo={logo} />
          </button>
        </section>
        <section className="controls">
          {config.allowLogin &&
            (!user.name ? (
              <LoginButton loginUrl={getLoginPath(returnTo)} />
            ) : (
              <UserMenu
                user={user}
                menuItems={[
                  {
                    key: 'dropdown-item-1',
                    messageId: 'logout',
                    href: getLogoutPath(returnTo),
                    onClick: event => {
                      event.preventDefault();
                      window.location.href = getLogoutPath(returnTo);
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
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
  titleClicked: PropTypes.func.isRequired,
};
