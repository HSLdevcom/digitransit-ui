import cx from 'classnames';
import { routeNotificationShape } from '../../utils/shapes';
import DisruptionLink from './DisruptionLink';
import RouteNotification from './RouteNotification';

export default function LegNotification({ notification }) {
  return (
    <div
      className={cx('disruption', {
        'no-header': !notification.header,
        'no-link': !notification.link,
      })}
    >
      {notification.link ? (
        <DisruptionLink notification={notification} />
      ) : (
        <RouteNotification notification={notification} />
      )}
    </div>
  );
}

LegNotification.propTypes = { notification: routeNotificationShape.isRequired };
