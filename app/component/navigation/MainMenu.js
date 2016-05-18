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
      <header className="offcanvas-section">
        <LangSelect />
        {config.mainMenu.showInquiry ? inquiry : void 0}
      </header>
      {config.mainMenu.showDisruptions ? <DisruptionInfoButtonContainer /> : void 0}
    </div>);
}

MainMenu.propTypes = {
  openFeedback: PropTypes.func.isRequired,
  showDisruptionInfo: PropTypes.bool,
};

MainMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
};


export default MainMenu;
