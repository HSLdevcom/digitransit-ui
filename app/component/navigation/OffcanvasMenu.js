import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import config from '../../config';
import DisruptionInfoButtonContainer from '../disruption/DisruptionInfoButtonContainer';
import Icon from '../icon/icon';
import LangSelect from './lang-select';

function OffcanvasMenu(props) {
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
        {config.leftMenu.showInquiry ? inquiry : void 0}
      </header>
      {props.showDisruptionInfo ? <DisruptionInfoButtonContainer /> : null}
    </div>);
}

OffcanvasMenu.propTypes = {
  openFeedback: PropTypes.func.isRequired,
  showDisruptionInfo: PropTypes.bool,
};

OffcanvasMenu.contextTypes = {
  getStore: PropTypes.func.isRequired,
};


export default OffcanvasMenu;
