import Icon from '../Icon';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function LegArrowIcon() {
  const { colors } = useConfigContext();
  return (
    <Icon
      img="icon_arrow-collapse--right"
      className="itinerary-arrow-icon"
      color={colors.primary}
    />
  );
}
