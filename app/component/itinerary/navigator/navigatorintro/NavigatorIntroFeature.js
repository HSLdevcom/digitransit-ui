import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../../../Icon';

const NavigatorIntroFeature = ({
  icon,
  iconColor,
  iconBackgroundColor,
  header,
  body,
}) => {
  return (
    <div className="feature" role="group">
      {icon && (
        <Icon
          img={icon}
          backgroundColor={iconBackgroundColor}
          backgroundShape="circle"
          color={iconColor}
          height={2}
          width={2}
          aria-hidden="true"
        />
      )}
      <div className="right-column">
        <FormattedMessage id={header}>
          {msg => <h3 role="presentation">{msg}</h3>}
        </FormattedMessage>
        <FormattedMessage tagName="p" id={body} />
      </div>
    </div>
  );
};

NavigatorIntroFeature.propTypes = {
  header: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  iconBackgroundColor: PropTypes.string,
};

NavigatorIntroFeature.defaultProps = {
  icon: undefined,
  iconColor: 'black',
  iconBackgroundColor: 'transparent',
};

export default NavigatorIntroFeature;
