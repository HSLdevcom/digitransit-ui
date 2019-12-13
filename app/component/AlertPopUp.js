import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import FullscreenDialog from './FullscreenDialog';
import Icon from './Icon';

const AlertPopUp = props => (
  <FullscreenDialog
    className={props.className}
    renderContent={() => (
      <React.Fragment>
        {props.icon && (
          <div className="popup-icon">
            <Icon className={props.icon} img={`icon-icon_${props.icon}`} />
          </div>
        )}
        <div className="popup-text">
          <FormattedMessage id={props.textId} defaultMessage={props.textId} />
        </div>
      </React.Fragment>
    )}
    isOpen={props.isPopUpOpen}
    toggle={props.togglePopUp}
  />
);

AlertPopUp.propTypes = {
  className: PropTypes.string,
  isPopUpOpen: PropTypes.bool,
  textId: PropTypes.string,
  icon: PropTypes.string,
  togglePopUp: PropTypes.func,
};

export default AlertPopUp;
