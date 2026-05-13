import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import { connectToStores } from 'fluxible-addons-react';
import { useRouter } from 'found';
import { configShape } from '../util/shapes';
import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';
import MainMenuLinks from './MainMenuLinks';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { updateCountries } from '../action/CountryActions';
import Toggle from './Toggle';
import searchContext from '../util/searchContext';
import intializeSearchContext from '../util/DTSearchContextInitializer';
import { TRAFFICNOW } from '../util/path';

function MainMenu(props, { config, executeAction }) {
  const intl = useIntl();
  const { router } = useRouter();
  const [countries, setCountries] = useState(props.countries);
  const appBarLink =
    config.appBarLink?.altLink?.[props.currentLanguage] || config.appBarLink;
  return (
    <div className="main-menu no-select" tabIndex={-1}>
      <div className="main-menu-top-section">
        <button
          type="button"
          onClick={props.closeMenu}
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
            {props.homeUrl !== undefined && (
              <Link
                id="frontpage"
                to={props.homeUrl}
                onClick={() => {
                  addAnalyticsEvent({
                    category: 'Navigation',
                    action: 'Home',
                    name: null,
                  });
                  props.closeMenu();
                }}
              >
                <FormattedMessage id="frontpage" defaultMessage="Frontpage" />
              </Link>
            )}
          </div>
        )}
        {config.mainMenu.showDisruptions && (
          <div className="offcanvas-section">
            <DisruptionInfoButtonContainer
              onClick={
                config.trafficNowTest
                  ? () => {
                      router.push(`/${TRAFFICNOW}`);
                      props.closeMenu();
                    }
                  : () => props.setDisruptionInfoOpen(true)
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
              onClick={props.closeMenu}
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
                    setCountries({
                      ...countries,
                      [country]: !countries[country],
                    });
                    executeAction(updateCountries, {
                      ...countries,
                      [country]: !countries[country],
                    });
                    // Update searchContext to reflect changes in config
                    intializeSearchContext({ config }, searchContext);
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
          closeMenu={props.closeMenu}
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
  countries: PropTypes.objectOf(PropTypes.bool),
  currentLanguage: PropTypes.string,
};

MainMenu.defaultProps = {
  currentLanguage: 'fi',
  countries: undefined,
};

MainMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: configShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

const connectedComponent = connectToStores(
  MainMenu,
  ['CountryStore', 'PreferencesStore'],
  ({ getStore }) => ({
    countries: getStore('CountryStore').getCountries(),
    currentLanguage: getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, MainMenu as Component };
