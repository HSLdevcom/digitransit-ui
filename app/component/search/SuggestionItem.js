import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';

import Icon from '../icon/Icon';
import { getLabel, getIcon } from '../../util/suggestionUtils';
import config from '../../config';

const SuggestionItem = pure((props) => {
  let icon;
  if (props.item.properties.mode && config.search.suggestions.useTransportIcons) {
    icon = (
      <Icon
        img={`icon-icon_${props.item.properties.mode}`}
        className={props.item.properties.mode}
      />
    );
  } else {
    icon = (
      <Icon
        img={getIcon(props.item.properties.layer)}
        className={props.item.iconClass || ''}
      />
    );
  }

  const label = getLabel(props.item.properties);

  return (
    <div
      className={cx(
        'search-result',
        props.item.type,
        { favourite: props.item.type.startsWith('Favourite') }
      )}
    >
      <span className={props.spanClass || ''}>
        {icon}
      </span>
      <div>
        <p className="suggestion-name" >{label[0]}</p>
        <p className="suggestion-label" >{label[1]}</p>
      </div>
    </div>);
});

SuggestionItem.propTypes = {
  item: React.PropTypes.object,
  spanClass: React.PropTypes.string,
};

export default SuggestionItem;
