import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Icon from '../Icon';
import { useConfigContext } from '../../client/ConfigContext';

const StartNavi = ({ startNavigation }) => {
  const config = useConfigContext();
  const intl = useIntl();

  return (
    <div className="navi-start-container">
      <button type="button" onClick={startNavigation}>
        <Icon
          className="navigation-icon"
          img="icon_navigation"
          color={config.colors.accessiblePrimary}
          omitViewBox
        />
        <div className="content">
          <FormattedMessage tagName="div" id="new-route" />
          <FormattedMessage tagName="h3" id="navigation-description" />
        </div>
        <Icon
          img="icon_arrow-collapse--right"
          title={intl.formatMessage({ id: 'continue' })}
          color={config.colors.accessiblePrimary}
          height={1}
          width={1}
        />
      </button>
    </div>
  );
};

StartNavi.propTypes = {
  startNavigation: PropTypes.func.isRequired,
};

export default StartNavi;
