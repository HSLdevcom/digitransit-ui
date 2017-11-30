import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';
import MainMenuLinks from './MainMenuLinks';

function MainMenu(props, context) {
  const config = context.config;

  return (
    <div aria-hidden={!props.visible} className="main-menu no-select">
      <div
        onClick={props.toggleVisibility}
        className="close-button cursor-pointer"
      >
        <Icon img="icon-icon_close" className="medium" />
      </div>
      <header className="offcanvas-section">
        <LangSelect />
      </header>
      <div className="offcanvas-section">
        <Link id="frontpage" to={props.homeUrl}>
          <FormattedMessage id="frontpage" defaultMessage="Frontpage" />
        </Link>
      </div>
      <div className="offcanvas-section">
        {config.mainMenu.showDisruptions &&
          props.showDisruptionInfo && <DisruptionInfoButtonContainer />}
      </div>
      <MainMenuLinks
        content={([config.appBarLink].concat(
          config.footer && config.footer.content,
        ) || []
        ).filter(item => item.href || item.route)}
      />
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
};

export default MainMenu;
