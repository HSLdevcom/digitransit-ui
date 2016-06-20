import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import config from '../../config';
import DisruptionInfoButtonContainer from '../disruption/DisruptionInfoButtonContainer';
import Icon from '../icon/icon';
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
    <div className="main-menu no-select">
      <div onClick={props.toggleVisibility} className="close-button cursor-pointer">
        <Icon img="icon-icon_close" className="medium" />
      </div>
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
