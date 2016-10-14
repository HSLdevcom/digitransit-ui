import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';
import { FormattedMessage } from 'react-intl';

import StopCardHeader from '../stop-cards/StopCardHeader';
import { addFavouriteStop } from '../../action/FavouriteActions';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Labeled from '../util/Labeled';
import Centered from '../util/Centered';
import InfoIcon from '../icon/InfoIcon';
import Favourite from '../favourites/Favourite';

const PureStopPageHeader = compose(
  getContext({ executeAction: React.PropTypes.func.isRequired,
               breakpoint: React.PropTypes.string.isRequired }),
  mapProps((props) => ({
    stop: props.stop,
    className: 'stop-page header',
    headingStyle: 'h3',
    icons: [
      <Labeled
        label={<FormattedMessage id="extra-info" defaultMessage="More info" />}
        showLabel={props.breakpoint === 'large'}
      >
        <InfoIcon
          key="stop"
          stop={props.stop}
        />
      </Labeled>,
      <Centered>
        <Favourite
          favourite={props.favourite}
          addFavourite={e => {
            e.stopPropagation();
            props.executeAction(addFavouriteStop, props.params.stopId);
          }}
        />
      </Centered>,
    ],
  }))
)(StopCardHeader);

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

PureStopPageHeader.displayName = 'PureStopPageHeader';

PureStopPageHeader.description = (
  <div>
    <ComponentUsageExample description="basic">
      <PureStopPageHeader stop={exampleStop} params={{ stopId: 123 }} />
    </ComponentUsageExample>
  </div>
);

const StopPageHeaderContainer = Relay.createContainer(PureStopPageHeader, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        ${StopCardHeader.getFragment('stop')}
      }
    `,
  },
});

export { PureStopPageHeader };

export default connectToStores(StopPageHeaderContainer, ['FavouriteStopsStore'],
  ({ getStore }, { params }) => ({
    favourite: getStore('FavouriteStopsStore').isFavourite(params.stopId),
  })
);
