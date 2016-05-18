import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import config from '../../config';
import DisruptionInfoButtonContainer from '../disruption/DisruptionInfoButtonContainer';
import Icon from '../icon/icon';
import LangSelect from './lang-select';

function MainMenu(props) {
  const inquiry = (
    <p style={{ fontSize: '20px', backgroundColor: '#888888', padding: '20px' }} >
      <a onClick={props.openFeedback}>
        <FormattedMessage id="inquiry" defaultMessage="Participate on inquiry" />
        <Icon img="icon-icon_arrow-right" className="small" />
      </a>
    </p>);

  return (
    <div className="main-menu">
      <a onClick={props.toggleVisibility} className="close-button cursor-pointer">
        <Icon img="icon-icon_close" className="medium" />
      </a>
      <header className="offcanvas-section">
        <LangSelect />
        {config.mainMenu.showInquiry ? inquiry : void 0}
      </header>
      <div className="offcanvas-section">
        {config.mainMenu.showDisruptions ? <DisruptionInfoButtonContainer /> : void 0}
      </div>
    </div>);
}

MainMenu.propTypes = {
  openFeedback: PropTypes.func.isRequired,
  showDisruptionInfo: PropTypes.bool,
  toggleVisibility: PropTypes.func.isRequired,
};

MainMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
};


export default MainMenu;
