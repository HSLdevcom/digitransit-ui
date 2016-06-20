import React from 'react';
import Icon from '../icon/icon';
import cx from 'classnames';
import { getLabel } from '../../util/suggestionUtils';
import config from '../../config';

function getIcon(layer, iconClass) {
  const layerIcon = new Map([
    ['favourite', 'icon-icon_star'],
    ['address', 'icon-icon_place'],
    ['stop', 'icon-icon_bus-stop'],
    ['locality', 'icon-icon_city'],
    ['station', 'icon-icon_station'],
    ['localadmin', 'icon-icon_city'],
    ['neighbourdood', 'icon-icon_city'],
    ['route-BUS', 'icon-icon_bus-withoutBox'],
    ['route-TRAM', 'icon-icon_tram-withoutBox'],
    ['route-RAIL', 'icon-icon_rail-withoutBox']]);

  const defaultIcon = 'icon-icon_place';
  return <Icon img={layerIcon.get(layer) || defaultIcon} className={iconClass || ''} />;
}

function SuggestionItem(props) {
  let icon;
  if (props.item.properties.mode && config.search.suggestions.useTransportIcons) {
    icon =
      (<Icon
        img={`icon-icon_${props.item.properties.mode}`}
        className={props.item.properties.mode}
      />);
  } else {
    icon = getIcon(props.item.properties.layer, props.item.iconClass);
  }

  const displayText = getLabel(props.item.properties);
  return (
    <span className={cx('search-result', props.item.type)}>
      <span className={props.spanClass || ''}>
        {icon}
      </span>
      {displayText}
    </span>);
}

SuggestionItem.propTypes = {
  item: React.PropTypes.object,
  spanClass: React.PropTypes.string,
};

export default SuggestionItem;
