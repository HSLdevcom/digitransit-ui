import { useIntl } from 'react-intl';
import Icon from '../Icon';
import { useConfigContext } from '../../hooks/ConfigContext';
import { routeNotificationShape } from '../../utils/shapes';
import RouteNotification from './RouteNotification';

export default function DisruptionLink({ notification }) {
  const config = useConfigContext();
  const { locale } = useIntl();
  return (
    <a
      href={`https://www.${notification.link?.[locale]}`}
      className="disruption-link"
      target="_blank"
      rel="noreferrer"
    >
      <RouteNotification notification={notification} />
      <Icon
        img="icon_arrow-collapse--right"
        className="disruption-link-arrow"
        color={config.colors.primary}
      />
    </a>
  );
}

DisruptionLink.propTypes = { notification: routeNotificationShape.isRequired };
