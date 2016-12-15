import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import config from '../config';
import DisruptionInfoButtonContainer from './DisruptionInfoButtonContainer';
import Icon from './Icon';
import LangSelect from './LangSelect';

function MainMenu(props) {
  const inquiry = (
    <p style={{ fontSize: '20px', backgroundColor: '#888888', padding: '20px' }} >
      <span onClick={props.openFeedback}>
        <FormattedMessage id="inquiry" defaultMessage="Give feedback" />
        <Icon img="icon-icon_arrow-right" className="small" />
      </span>
    </p>);

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
        <Link id="frontpage" to="/">
          <FormattedMessage id="frontpage" defaultMessage="Front page" />
        </Link>
      </div>
      <div className="offcanvas-section">
        <Link id="about" to="/tietoja-palvelusta">
          <FormattedMessage id="about-this-service" defaultMessage="About this service" />
        </Link>
      </div>
      <div className="offcanvas-section">
        {config.mainMenu.showDisruptions && props.showDisruptionInfo &&
          <DisruptionInfoButtonContainer />}
      </div>
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
};


export default MainMenu;
