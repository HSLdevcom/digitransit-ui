import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';
import MainMenuLinks from './MainMenuLinks';

function MainMenu(props, context) {
  const inquiry = (
    <p style={{ fontSize: '20px', backgroundColor: '#888888', padding: '20px' }} >
      <span onClick={props.openFeedback}>
        <FormattedMessage id="inquiry" defaultMessage="Give feedback" />
        <Icon img="icon-icon_arrow-right" className="small" />
      </span>
    </p>);

  const config = context.config;

  return (
    <div aria-hidden={!props.visible} className="main-menu no-select">
      <div onClick={props.toggleVisibility} className="close-button cursor-pointer">
        <Icon img="icon-icon_close" className="medium" />
      </div>
      <header className="offcanvas-section">
        <LangSelect />
        {config.mainMenu.showInquiry && inquiry}
      </header>
      <div className="offcanvas-section">
        {config.mainMenu.showDisruptions && props.showDisruptionInfo &&
          <DisruptionInfoButtonContainer />}
      </div>
      <div className="offcanvas-section">
        <Link id="frontpage" to="/">
          <FormattedMessage id="frontpage" defaultMessage="Front page" />
        </Link>
      </div>
      <MainMenuLinks
        content={([config.appBarLink].concat(config.footer && config.footer.content) || [])
        .filter((item => item.href || item.route))}
      />
    </div>);
}

MainMenu.propTypes = {
  openFeedback: PropTypes.func.isRequired,
  showDisruptionInfo: PropTypes.bool,
  toggleVisibility: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

MainMenu.defaultProps = {
  visible: true,
};

MainMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
};


export default MainMenu;
