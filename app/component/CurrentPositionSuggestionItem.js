import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import pure from 'recompose/pure';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';


const Locate = () => (
  <span className="use-own-position">
    &nbsp;-&nbsp;
    <span className="search-position">
      <FormattedMessage id="search-position" defaultMessage="Detect location" />
    </span>
  </span>
);

const CurrentPositionSuggestionItemComponent = pure(
  ({ item, havePosition }) => (
    <div className={cx('search-result', item.type)}>
      <span className="autosuggestIcon">
        <Icon img="icon-icon_position" className="havePosition" />
      </span>
      <FormattedMessage
        id="use-own-position"
        defaultMessage="Use current location"
      >
        {message => <span className="use-own-position">{message}</span>}
      </FormattedMessage>
      {!havePosition && <Locate />}
    </div>
  ),
);

const CurrentPositionSuggestionItem = connectToStores(
  CurrentPositionSuggestionItemComponent,
  ['PositionStore'],
  context => ({ havePosition: context.getStore('PositionStore').getLocationState().hasLocation }),
);

CurrentPositionSuggestionItem.displayName = 'CurrentPositionSuggestionItem';

const exampleItem = {
  type: 'CurrentLocation',
  properties: { labelId: 'own-position', layer: 'currentPosition' },
};

CurrentPositionSuggestionItem.description = () =>
  <div>
    <ComponentUsageExample description="With position">
      <CurrentPositionSuggestionItemComponent havePosition item={exampleItem} />
    </ComponentUsageExample>
    <ComponentUsageExample description="No position">
      <CurrentPositionSuggestionItemComponent item={exampleItem} />
    </ComponentUsageExample>
  </div>;

export default CurrentPositionSuggestionItem;
