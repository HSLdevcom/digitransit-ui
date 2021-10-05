import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';

import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';
import MainMenuLinks from './MainMenuLinks';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';

function MainMenu(props, { config, intl, executeAction }) {
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div aria-hidden={!props.visible} className="main-menu no-select">
      <div className="main-menu-top-section">
        <button
          ref={input => input && input.focus()}
          onClick={props.toggleVisibility}
          className="close-button cursor-pointer"
          aria-label={intl.formatMessage({
            id: 'main-menu-label-close',
            defaultMessage: 'Close the main menu',
          })}
        >
          <Icon img="icon-icon_close" className="medium" />
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
                  executeAction(storeOrigin, {});
                  executeAction(storeDestination, {});
                  addAnalyticsEvent({
                    category: 'Navigation',
                    action: 'Home',
                    name: null,
                  });
                }}
              >
                <FormattedMessage id="frontpage" defaultMessage="Frontpage" />
              </Link>
            )}
          </div>
        )}
        {config.mainMenu.showDisruptions && props.showDisruptionInfo && (
          <div className="offcanvas-section">
            <DisruptionInfoButtonContainer />
          </div>
        )}
        {config.appBarLink && config.appBarLink.name && config.appBarLink.href && (
          <div className="offcanvas-section">
            <a
              id="appBarLink"
              href={config.appBarLink.href}
              onClick={() => {
                addAnalyticsEvent({
                  category: 'Navigation',
                  action: 'appBarLink',
                  name: null,
                });
              }}
            >
              {config.appBarLink.name}
            </a>
          </div>
        )}
      </section>
      <section className="menu-section secondary-links">
        <MainMenuLinks
          content={((config.menu && config.menu.content) || []).filter(
            item => item.href || item.route,
          )}
        />
      </section>
      {config.menu?.copyright && (
        <div className="copyright">{config.menu.copyright.label}</div>
      )}
    </div>
  );
}

MainMenu.propTypes = {
  showDisruptionInfo: PropTypes.bool,
  toggleVisibility: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  homeUrl: PropTypes.string.isRequired,
};

MainMenu.defaultProps = {
  visible: true,
};

MainMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  executeAction: PropTypes.func,
};

export default MainMenu;
