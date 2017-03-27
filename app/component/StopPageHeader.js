import React from 'react';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';
// import { FormattedMessage } from 'react-intl';

import StopCardHeaderContainer from './StopCardHeaderContainer';
// import { addFavouriteStop } from '../action/FavouriteActions';
import ComponentUsageExample from './ComponentUsageExample';
// import Labeled from './Labeled';
// import InfoIcon from './InfoIcon';
// import Favourite from './Favourite';

const StopPageHeader = compose(
  getContext({ executeAction: React.PropTypes.func.isRequired,
    breakpoint: React.PropTypes.string.isRequired }),
  mapProps(props => ({
    stop: props.stop,
    className: 'stop-page header',
    headingStyle: 'h3',
    icons: [
      // TODO: Re-add when done
      /* <Labeled
        label={<FormattedMessage id="extra-info" defaultMessage="Further information" />}
        showLabel={props.breakpoint === 'large'}
      >
        <InfoIcon stop={props.stop} />
      </Labeled>,
      <Favourite
        favourite={props.favourite}
        addFavourite={(e) => {
          e.stopPropagation();
          props.executeAction(addFavouriteStop, props.params.stopId);
        }}
      />, */
    ],
  })),
)(StopCardHeaderContainer);

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

StopPageHeader.displayName = 'StopPageHeader';

StopPageHeader.description = () =>
  <div>
    <ComponentUsageExample description="basic">
      <StopPageHeader stop={exampleStop} params={{ stopId: 123 }} />
    </ComponentUsageExample>
  </div>;

export default StopPageHeader;
