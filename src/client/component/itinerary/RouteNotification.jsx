import cx from 'classnames';
import { useIntl } from 'react-intl';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../shared/utils/constants';
import { routeNotificationShape } from '../../utils/shapes';

export default function RouteNotification({ notification }) {
  const { locale } = useIntl();
  return (
    <>
      <div className="disruption-icon notification-icon">
        <ServiceAlertIcon className="inline-icon" severityLevel={AlertSeverityLevelType.Info} />
      </div>
      <div className={cx('info-notification', { 'no-header': !notification.header })}>
        {notification.header && <h3 className="info-header">{notification.header[locale]}</h3>}
        <div className={cx('info-content', { 'no-header': !notification.header })}>
          {notification.content[locale].join(' ')}
        </div>
      </div>
    </>
  );
}

RouteNotification.propTypes = { notification: routeNotificationShape.isRequired };
