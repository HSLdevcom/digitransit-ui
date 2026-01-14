import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';

const StartNavi = ({ startNavigation }, context) => {
  const { config, intl } = context;

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

StartNavi.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default StartNavi;
