import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';

import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import DisruptionInfo from './DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import CanceledLegsBar from './CanceledLegsBar';
import LoginButton from './LoginButton';
import UserMenu from './UserMenu';

const AppBar = (
  { showLogo, title, homeUrl, logo, user, breakpoint, titleClicked },
  { config, intl, match, getStore },
) => {
  const { location } = match;
  const [disruptionInfoOpen, setDisruptionInfoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const url = encodeURI(`${window.location?.origin || ''}${location.pathname}`);
  const params = location.search && location.search.substring(1);

  const setMenuOpenWithAnalytics = newState => {
    addAnalyticsEvent({
      category: 'Navigation',
      action: newState ? 'OpenMenu' : 'CloseMenu',
      name: null,
    });
    setMenuOpen(newState);
  };

  return (
    <>
      {disruptionInfoOpen && <DisruptionInfo setOpen={setDisruptionInfoOpen} />}
      {config.NODE_ENV !== 'test' && <MessageBar breakpoint={breakpoint} />}
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
            <LogoSmall
              showLogo={showLogo}
              showTitles={config.showTitles}
              logo={logo}
              title={title}
            />
            {!!config.appBarTitle && (
              <span className="logo community">{config.appBarTitle}</span>
            )}
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
          {!disruptionInfoOpen && menuOpen && (
            <MainMenuContainer
              homeUrl={homeUrl}
              closeMenu={() => setMenuOpenWithAnalytics(false)}
              breakpoint={breakpoint}
              setDisruptionInfoOpen={setDisruptionInfoOpen}
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
                <Icon img="icon-icon_menu" className="icon" />
              </button>
            </div>
          ) : null}
        </section>
      </nav>
    </>
  );
};

AppBar.displayName = 'AppBar';

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
