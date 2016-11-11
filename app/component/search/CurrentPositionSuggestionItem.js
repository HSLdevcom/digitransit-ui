import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import pure from 'recompose/pure';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';

import Icon from '../icon/Icon';


const Locate = () => (
  <span className="use-own-position">
    &nbsp;-&nbsp;
    <span className="search-position">
      <FormattedMessage id="search-position" defaultMessage="Locate" />
    </span>
  </span>
);

const CurrentPositionSuggestionItem = pure(
  ({ item, havePosition }) => (
    <div className={cx('search-result', item.type)}>
      <span className="autosuggestIcon">
        <Icon img="icon-icon_position" className={cx('havePosition')} />
      </span>
      <FormattedMessage
        id="use-own-position"
        defaultMessage="Use Your current location"
      >
        {message => <span className="use-own-position">{message}</span>}
      </FormattedMessage>
      {!havePosition && <Locate />}
    </div>
  )
);

export default connectToStores(CurrentPositionSuggestionItem, ['PositionStore'], context =>
  ({
    havePosition: context.getStore('PositionStore').getLocationState().hasLocation,
  })
);
