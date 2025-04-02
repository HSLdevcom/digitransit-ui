import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { configShape } from '../../../../util/shapes';
import NavigatorIntroFeature from './NavigatorIntroFeature';
import Icon from '../../../Icon';

const NavigatorIntro = (
  { logo, onPrimaryClick, onClose, onOpenGeolocationInfo },
  context,
) => {
  const { config, intl } = context;

  const primaryColor =
    config.colors?.accessiblePrimary || config.colors?.primary || 'black';

  return (
    <>
      <div className="intro-body">
        {logo && <img src={logo} alt="navigator logo" />}
        <FormattedMessage tagName="h2" id="navi-more-guidance" />
        <div className="content">
          <NavigatorIntroFeature
            icon="icon-icon_future-route"
            iconColor={primaryColor}
            iconBackgroundColor={config.colors?.backgroundInfo}
            header="navi-support"
            body="navigation-intro-help-body"
          />
          <NavigatorIntroFeature
            icon="icon-icon_comment"
            iconColor={primaryColor}
            iconBackgroundColor={config.colors?.backgroundInfo}
            header="navi-change-info"
            body="navigation-intro-notifications-body"
          />
        </div>
      </div>
      <div className="navi-geolocation-purpose">
        <Icon img="icon-icon_info" color={primaryColor} />
        <div className="info-content">
          <FormattedMessage tagName="p" id="navi-geolocation-purpose" />
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onOpenGeolocationInfo();
            }}
            style={{ color: primaryColor }}
          >
            <FormattedMessage id="read-more" />
          </button>
        </div>
      </div>
      <div className="intro-buttons">
        <Button
          size="large"
          fullWidth
          variant="blue"
          value={intl.formatMessage({ id: 'navigation-intro-begin' })}
          onClick={onPrimaryClick || onClose}
          style={{ backgroundColor: primaryColor, border: 'none' }}
        />
        <Button
          size="large"
          fullWidth
          variant="white"
          value={intl.formatMessage({ id: 'cancel' })}
          onClick={onClose}
          style={{ borderColor: 'transparent' }}
        />
      </div>
    </>
  );
};

NavigatorIntro.propTypes = {
  logo: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onPrimaryClick: PropTypes.func,
  onOpenGeolocationInfo: PropTypes.func.isRequired,
};

NavigatorIntro.defaultProps = {
  logo: undefined,
  onPrimaryClick: undefined,
};

NavigatorIntro.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NavigatorIntro;
