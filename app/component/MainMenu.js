import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import { useRouter } from 'found';
import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';
import MainMenuLinks from './MainMenuLinks';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import Toggle from './Toggle';
import { getCountries, setCountries } from '../store/localStorage';
import { TRAFFICNOW } from '../util/path';
import { useConfigContext } from '../configurations/ConfigContext';

export default function MainMenu({
  setDisruptionInfoOpen,
  closeMenu,
  homeUrl,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { router } = useRouter();
  const countries = getCountries();
  const appBarLink =
    config.appBarLink?.altLink?.[config.language] || config.appBarLink;

  return (
    <div className="main-menu no-select" tabIndex={-1}>
      <div className="main-menu-top-section">
        <button
          type="button"
          onClick={closeMenu}
          className="close-button cursor-pointer"
          aria-label={intl.formatMessage({
            id: 'main-menu-label-close',
            defaultMessage: 'Close the main menu',
          })}
        >
          <Icon img="icon_close" className="medium" />
        </button>
      </div>
      <section className="menu-section">
        <LangSelect />
      </section>
      <section className="menu-section main-links">
        {config.mainMenu.showFrontPageLink && (
          <div className="offcanvas-section">
            <Link
              id="frontpage"
              to={homeUrl}
              onClick={() => {
                addAnalyticsEvent({
                  category: 'Navigation',
                  action: 'Home',
                  name: null,
                });
                closeMenu();
              }}
            >
              <FormattedMessage id="frontpage" defaultMessage="Frontpage" />
            </Link>
          </div>
        )}
        {config.mainMenu.showDisruptions && (
          <div className="offcanvas-section">
            <DisruptionInfoButtonContainer
              onClick={
                config.trafficNowTest
                  ? () => {
                      router.push(`/${TRAFFICNOW}`);
                      closeMenu();
                    }
                  : () => setDisruptionInfoOpen(true)
              }
            />
          </div>
        )}
        {config.mainMenu.stopMonitor.show && (
          <div className="offcanvas-section">
            <a
              href={config.mainMenu.stopMonitor.url}
              target="_blank"
              rel="noreferrer"
            >
              <FormattedMessage id="create-stop-monitor" />
            </a>
          </div>
        )}
        {config.mainMenu.showEmbeddedSearch && (
          <div className="offcanvas-section">
            <Link
              to={`${config.URL.EMBEDDED_SEARCH_GENERATION}`}
              onClick={closeMenu}
            >
              <FormattedMessage
                id="create-embedded-search"
                defaultMessage="Create a route search element"
              />
            </Link>
          </div>
        )}
        {config.mainMenu.countrySelection?.map(country => (
          <div key={country} className="offcanvas-section">
            <FormattedMessage
              id={`include-${country}`}
              defaultMessage={`include-${country}`}
            />
            <div style={{ float: 'right', display: 'inline-block' }}>
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label key={country} htmlFor={`toggle-${country}`}>
                <Toggle
                  id={`toggle-${country}`}
                  toggled={!!countries[country]}
                  onToggle={() => {
                    const newCountries = {
                      ...countries,
                      [country]: !countries[country],
                    };
                    setCountries(newCountries); // update localStorage
                    // On changing country filters, set sessionStorage menuOpen to true. This item is used in AppBar.js to initially open the menu after refresh for visual confirmation.
                    window.sessionStorage.setItem('menuOpen', true);
                    window.location.reload();
                  }}
                />
              </label>
            </div>
          </div>
        ))}
        {appBarLink?.name && appBarLink?.href && (
          <div className="offcanvas-section">
            <a
              id="appBarLink"
              href={appBarLink.href}
              target="_blank"
              onClick={() => {
                addAnalyticsEvent({
                  category: 'Navigation',
                  action: 'appBarLink',
                  name: null,
                });
              }}
              rel="noreferrer"
            >
              {appBarLink.name}
            </a>
          </div>
        )}
      </section>
      <section className="menu-section secondary-links">
        <MainMenuLinks
          content={((config.menu && config.menu.content) || []).filter(
            item => item.href || item.route,
          )}
          closeMenu={closeMenu}
        />
      </section>
      {config.menu?.copyright && (
        <div className="copyright">{config.menu.copyright.label}</div>
      )}
    </div>
  );
}

MainMenu.propTypes = {
  setDisruptionInfoOpen: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
  homeUrl: PropTypes.string.isRequired,
};
