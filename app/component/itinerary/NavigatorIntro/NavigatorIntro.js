import { Button } from '@hsl-fi/design-system-core';
import { Icon, Idea, Route } from '@hsl-fi/icons';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { configShape } from '../../../util/shapes';

const NavigatorIntroContentBox = ({ icon, header, body }) => {
  return (
    <div className="content-box">
      {icon && (
        <span className="icon-container">
          <Icon icon={icon} size="l" fixed />
        </span>
      )}
      <div className="right-column">
        <FormattedMessage tagName="h3" id={header} />
        <FormattedMessage tagName="p" id={body} />
      </div>
    </div>
  );
};

NavigatorIntroContentBox.propTypes = {
  header: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

NavigatorIntroContentBox.defaultProps = {
  icon: undefined,
};

const NavigatorIntro = (
  { logo, onPrimaryClick, onClose, isLoggedIn },
  context,
) => {
  const { config } = context;

  const primaryColor = config.colors.accessiblePrimary || config.colors.primary;
  const primaryButtonStyle = {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  };

  return (
    <div className="navigator-intro-modal-content">
      <div className="body">
        {logo && <img src={logo} alt="navigator logo" />}
        <FormattedMessage tagName="h2" id="navigation-intro-header" />
        <div className="navigation-intro-body">
          <NavigatorIntroContentBox
            icon={Route}
            iconColor={primaryColor}
            header="navigation-intro-help-header"
            body="navigation-intro-help-body"
          />
          <NavigatorIntroContentBox
            icon={Route}
            iconColor={primaryColor}
            header="navigation-intro-notifications-header"
            body="navigation-intro-notifications-body"
          />
        </div>

        {!isLoggedIn && (
          <div className="login-tip">
            <Icon icon={Idea} color="default" size="m" fixed />
            <FormattedMessage tagName="p" id="navigation-intro-login-prompt" />
          </div>
        )}
      </div>
      <div className="buttons">
        <Button
          size="l"
          expandOnMobile
          style={primaryButtonStyle}
          onClick={onPrimaryClick || onClose}
        >
          <FormattedMessage id="navigation-intro-begin" />
        </Button>
        <Button size="l" expandOnMobile variant="plain" onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      </div>
    </div>
  );
};

NavigatorIntro.propTypes = {
  logo: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onPrimaryClick: PropTypes.func,
  isLoggedIn: PropTypes.bool,
};

NavigatorIntro.defaultProps = {
  logo: undefined,
  onPrimaryClick: undefined,
  isLoggedIn: false,
};

NavigatorIntro.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NavigatorIntro;
