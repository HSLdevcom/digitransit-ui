import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import pure from 'recompose/pure';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';

import Icon from '../icon/icon';


const Locate = (
  <span> - <span className="search-position">
    <FormattedMessage id="search-position" defaultMessage="Locate" />
  </span></span>
);

const CurrentPositionSuggestionItem = pure(
  ({ item, havePosition }) => {
    let locate;
    if (!havePosition) {
      locate = <Locate />;
    }
    return (
      <span className={cx('search-result', item.type)}>
        <span>
          <span className="autosuggestIcon">
            <Icon img="icon-icon_position" className={cx('havePosition')} />
          </span>
          <FormattedMessage
            id="use-own-position"
            defaultMessage="Use Your current location"
          />
          {locate}
        </span>
      </span>
    );
  }
);

export default connectToStores(CurrentPositionSuggestionItem, ['PositionStore'], (context) =>
  ({
    havePosition: context.getStore('PositionStore').getLocationState().hasLocation,
  })
);
