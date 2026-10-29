import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import { alertShape } from '../../utils/client/shapes';
import { useConfigContext } from '../client/ConfigContext';
import Icon from './Icon';
import TruncatedMessage from './TruncatedMessage';
import { mapAlertSource } from '../../utils/client/alertUtils';

const DisruptionBannerAlert = ({
  alert,
  openAllAlerts = () => {},
  truncate = false,
  onClose,
}) => {
  const intl = useIntl();
  const config = useConfigContext();
  const { language } = config;

  let header = alert.alertHeaderText;
  let message = alert.alertDescriptionText;
  const useHeader =
    config.showAlertHeader &&
    header &&
    header.length <= 120 &&
    !message.includes(header);
  if (useHeader) {
    header = <h3 className="disruption-info-header">{header}</h3>;
    message = (
      <>
        {header}
        {message}
      </>
    );
  }
  return (
    <div className="disruption-container">
      <div className="disruption-icon-container">
        <Icon img="icon_disruption-banner-alert" />
      </div>
      <div className="disruption-info-container">
        <div className="disruption-source-label">
          {mapAlertSource(config, language, alert.feed)}
        </div>
        <div className="disruption-message-font">
          <TruncatedMessage
            className="disruption-show-more"
            lines={3}
            message={message}
            truncate={truncate}
            onShowMore={openAllAlerts}
          />
        </div>
      </div>
      <button
        title={intl.formatMessage({
          id: 'messagebar-label-close-message-bar',
          defaultMessage: 'Close banner',
        })}
        onClick={() => onClose()}
        className={cx('noborder', 'disruption-close-button', 'cursor-pointer')}
        type="button"
      >
        <Icon img="icon_close" className="close" color="#fff" />
      </button>
    </div>
  );
};

DisruptionBannerAlert.propTypes = {
  alert: alertShape.isRequired,
  truncate: PropTypes.bool,
  openAllAlerts: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default DisruptionBannerAlert;
